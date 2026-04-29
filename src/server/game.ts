import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { getDb, User, Room, Match, Transaction, AdminStat } from './db.ts';

interface Pawn {
  id: number;
  position: number; // -1 for home, 0-51 for board, 100-105 for finish
  isFinished: boolean;
}

interface Player {
  id: string;
  username: string;
  color: string;
  pawns: Pawn[];
  homeStart: number;
  isReady: boolean;
  socketId: string;
}

interface GameState {
  roomId: string;
  players: Player[];
  turn: number; // index of player
  diceValue: number;
  lastMoveAt: number;
  status: 'waiting' | 'playing' | 'finished';
  winner?: string;
  entryFee: number;
}

const activeGames: Map<string, GameState> = new Map();
const TURN_TIMEOUT = 30000; // 30 seconds

export function setupLudoEngine(io: Server) {
  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    if (!user) return;

    socket.on('lobby:list', async () => {
      await getDb();
      const rooms = await Room.find({ status: 'waiting', is_private: 0 }).lean();
      socket.emit('lobby:update', rooms);
    });

    socket.on('room:create', async (data: { entryFee: number, playerLimit: number, isPrivate?: boolean, password?: string }) => {
      await getDb();
      const roomId = uuidv4();
      
      const userData = await User.findOne({ id: user.id });
      if (!userData || userData.balance < data.entryFee) {
        return socket.emit('error', { message: 'Insufficient balance to create room' });
      }

      await Room.create({
        id: roomId,
        creator_id: user.id,
        entry_fee: data.entryFee,
        player_limit: data.playerLimit,
        is_private: data.isPrivate ? 1 : 0,
        password: data.password || null,
        current_players: 1,
        members: [user.id]
      });

      await User.updateOne({ id: user.id }, { $inc: { balance: -data.entryFee } });

      socket.join(roomId);
      
      const colors = ['red', 'blue', 'yellow', 'green'];
      const initialState: GameState = {
        roomId,
        players: [{
          id: user.id,
          username: user.username,
          color: colors[0],
          pawns: [{ id: 1, position: -1, isFinished: false }, { id: 2, position: -1, isFinished: false }],
          homeStart: 0,
          isReady: true,
          socketId: socket.id
        }],
        turn: 0,
        diceValue: 0,
        status: 'waiting',
        entryFee: data.entryFee,
        lastMoveAt: Date.now()
      };
      activeGames.set(roomId, initialState);
      
      socket.emit('room:joined', initialState);
      io.emit('lobby:refresh');
    });

    socket.on('room:join', async (roomId: string) => {
      await getDb();
      const room = await Room.findOne({ id: roomId });
      if (!room || room.status !== 'waiting' || room.current_players >= room.player_limit) {
        return socket.emit('error', { message: 'Room unavailable' });
      }

      const userData = await User.findOne({ id: user.id });
      if (!userData || userData.balance < room.entry_fee) {
        return socket.emit('error', { message: 'Insufficient balance to join room' });
      }

      const gameState = activeGames.get(roomId);
      if (!gameState) return;

      await User.updateOne({ id: user.id }, { $inc: { balance: -room.entry_fee } });
      await Room.updateOne({ id: roomId }, { $inc: { current_players: 1 }, $push: { members: user.id } });

      const colors = ['red', 'blue', 'yellow', 'green'];
      const player: Player = {
        id: user.id,
        username: user.username,
        color: colors[gameState.players.length],
        pawns: [{ id: 1, position: -1, isFinished: false }, { id: 2, position: -1, isFinished: false }],
        homeStart: (gameState.players.length * 13) % 52,
        isReady: true,
        socketId: socket.id
      };

      gameState.players.push(player);
      socket.join(roomId);
      
      if (gameState.players.length === room.player_limit) {
        gameState.status = 'playing';
        gameState.lastMoveAt = Date.now();
        await Room.updateOne({ id: roomId }, { status: 'playing' });
      }

      io.to(roomId).emit('room:update', gameState);
      io.emit('lobby:refresh');
    });

    socket.on('room:get-state', (roomId: string) => {
      const gs = activeGames.get(roomId);
      if (gs) socket.emit('room:update', gs);
    });

    socket.on('game:roll-dice', () => {
      const roomId = Array.from(socket.rooms).find(r => activeGames.has(r));
      if (!roomId) return;
      const gs = activeGames.get(roomId)!;
      
      const currentPlayer = gs.players[gs.turn];
      if (currentPlayer.id !== user.id || gs.diceValue !== 0) return;

      gs.diceValue = Math.floor(Math.random() * 6) + 1;
      gs.lastMoveAt = Date.now();
      
      io.to(roomId).emit('game:dice-rolled', { value: gs.diceValue, turn: gs.turn });
      
      const canMove = currentPlayer.pawns.some(p => canMovePawn(p, gs.diceValue, currentPlayer));
      if (!canMove) {
        setTimeout(() => {
          if (gs.diceValue === 0) return; // Already moved?
          gs.diceValue = 0;
          gs.turn = (gs.turn + 1) % gs.players.length;
          gs.lastMoveAt = Date.now();
          io.to(roomId).emit('room:update', gs);
        }, 1500);
      }
    });

    socket.on('game:move-pawn', (pawnId: number) => {
      const roomId = Array.from(socket.rooms).find(r => activeGames.has(r));
      if (!roomId) return;
      const gs = activeGames.get(roomId)!;
      
      const playerIndex = gs.turn;
      const currentPlayer = gs.players[playerIndex];
      if (currentPlayer.id !== user.id || gs.diceValue === 0) return;

      const pawn = currentPlayer.pawns.find(p => p.id === pawnId);
      if (!pawn || !canMovePawn(pawn, gs.diceValue, currentPlayer)) return;

      const dicedValue = gs.diceValue;
      movePawn(pawn, dicedValue, currentPlayer, gs);
      
      handleCollisions(pawn, gs);

      if (currentPlayer.pawns.every(p => p.isFinished)) {
        gs.status = 'finished';
        gs.winner = currentPlayer.id;
        handleWinner(gs);
      }

      if (dicedValue !== 6) {
        gs.turn = (gs.turn + 1) % gs.players.length;
      }
      
      gs.diceValue = 0;
      gs.lastMoveAt = Date.now();
      io.to(roomId).emit('room:update', gs);
    });

    socket.on('disconnect', () => {
    });
  });

  setInterval(() => {
    activeGames.forEach((gs, roomId) => {
      if (gs.status === 'playing' && Date.now() - gs.lastMoveAt > TURN_TIMEOUT) {
        gs.diceValue = 0;
        gs.turn = (gs.turn + 1) % gs.players.length;
        gs.lastMoveAt = Date.now();
        io.to(roomId).emit('room:update', gs);
      }
    });
  }, 5000);
}

function canMovePawn(pawn: Pawn, dice: number, player: Player): boolean {
  if (pawn.isFinished) return false;
  
  if (pawn.position === -1) {
    return dice === 6;
  }

  if (pawn.position >= 100) {
    return (pawn.position + dice) <= 105;
  }

  const stepsTaken = getStepsTaken(pawn, player);
  if (stepsTaken + dice > 56) return false; 

  return true;
}

function getStepsTaken(pawn: Pawn, player: Player): number {
  if (pawn.position === -1) return 0;
  if (pawn.position >= 100) return 51 + (pawn.position - 99);
  
  let steps = (pawn.position - player.homeStart + 52) % 52;
  return steps;
}

function movePawn(pawn: Pawn, dice: number, player: Player, gs: GameState) {
  if (pawn.position === -1) {
    pawn.position = player.homeStart;
    return;
  }
  
  const stepsTakenBefore = getStepsTaken(pawn, player);
  
  if (pawn.position < 100) {
    const nextSteps = stepsTakenBefore + dice;
    if (nextSteps > 50) {
      const finishPos = 100 + (nextSteps - 51);
      if (finishPos > 105) {
        pawn.isFinished = true;
      } else {
        pawn.position = finishPos;
      }
    } else {
      pawn.position = (pawn.position + dice) % 52;
    }
  } else {
    pawn.position += dice;
    if (pawn.position > 105) {
      pawn.isFinished = true;
    }
  }

  if (pawn.position > 105) pawn.isFinished = true;
}

function handleCollisions(movedPawn: Pawn, gs: GameState) {
  if (movedPawn.position >= 100 || movedPawn.isFinished) return;

  const safeSquares = [0, 8, 13, 21, 26, 34, 39, 47];
  if (safeSquares.includes(movedPawn.position)) return;

  gs.players.forEach((p, idx) => {
    if (idx === gs.turn) return;
    p.pawns.forEach(op => {
      if (op.position === movedPawn.position) {
        op.position = -1; 
      }
    });
  });
}

async function handleWinner(gs: GameState) {
  await getDb();
  const totalPrize = gs.entryFee * gs.players.length;
  const commission = totalPrize * 0.1;
  const winnerShare = totalPrize - commission;

  await Match.create({
    id: uuidv4(),
    room_id: gs.roomId,
    winner_id: gs.winner,
    total_prize: totalPrize,
    commission: commission,
    commission_taken: commission
  });

  await User.updateOne({ id: gs.winner }, { $inc: { balance: winnerShare } });
  await Room.updateOne({ id: gs.roomId }, { status: 'finished' });
  
  await Transaction.create({
    id: uuidv4(),
    user_id: gs.winner,
    type: 'game_win',
    amount: winnerShare,
    status: 'completed',
    reference: `Match win: ${gs.roomId}`
  });

  await AdminStat.updateOne({ id: 1 }, { $inc: { total_commission: commission } });
}
