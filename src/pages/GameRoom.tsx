import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { getSocket } from '../lib/socket';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, ArrowLeft, RefreshCw, Dices, Timer, ShieldCheck, Crown } from 'lucide-react';
import LudoBoard from '../components/LudoBoard';

const TURN_TIMEOUT = 30000;

export default function GameRoom() {
  const { id } = useParams();
  const [gameState, setGameState] = useState<any>(null);
  const [lastDice, setLastDice] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isRolling, setIsRolling] = useState(false);
  const { user, token } = useAuthStore();
  const socket = getSocket(token!);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    socket.on('room:update', (data) => {
      setGameState(data);
      if (data.diceValue === 0) setLastDice(0);
      setIsRolling(false);
    });

    socket.on('game:dice-rolled', (data) => {
      setIsRolling(true);
      setTimeout(() => {
        setLastDice(data.value);
        setIsRolling(false);
      }, 600);
    });

    socket.emit('room:get-state', id);

    return () => {
      socket.off('room:update');
      socket.off('game:dice-rolled');
    };
  }, [socket, id]);

  useEffect(() => {
    if (!gameState || gameState.status !== 'playing') return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - gameState.lastMoveAt;
      const remaining = Math.max(0, Math.ceil((TURN_TIMEOUT - elapsed) / 1000));
      setTimeLeft(remaining);
    }, 100);

    return () => clearInterval(interval);
  }, [gameState]);

  const handleRollDice = () => {
    if (isRolling) return;
    socket?.emit('game:roll-dice');
  };

  const handleMovePawn = (pawnId: number) => {
    socket?.emit('game:move-pawn', pawnId);
  };

  if (!gameState) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <RefreshCw size={48} className="animate-spin text-orange-500" />
      <p className="text-white/40 uppercase tracking-widest font-bold text-sm">Synchronizing Board...</p>
    </div>
  );

  const isMyTurn = gameState.players[gameState.turn]?.id === user?.id;
  const currentPlayer = gameState.players[gameState.turn];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-12 h-screen max-h-[900px]">
      {/* Sidebar: Players */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        <button onClick={() => navigate('/lobby')} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest bg-white/5 px-4 py-2 rounded-full w-fit">
          <ArrowLeft size={14} /> Abandon Match
        </button>

        <div className="space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black italic uppercase italic tracking-tighter">Combatants</h3>
            <div className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-[10px] font-black uppercase tracking-widest border border-green-500/20">Live</div>
          </div>
          
          <div className="space-y-3">
            {gameState.players.map((p: any, i: number) => (
              <div key={p.id} className={`relative p-4 rounded-3xl transition-all overflow-hidden ${gameState.turn === i ? 'bg-white/10 ring-2 ring-orange-500 ring-offset-4 ring-offset-black scale-[1.02]' : 'bg-white/5 opacity-40'}`}>
                {gameState.turn === i && (
                  <div className="absolute top-0 right-0 p-2 text-orange-500">
                    <ShieldCheck size={16} />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full shadow-lg ${
                    p.color === 'red' ? 'bg-red-500 shadow-red-500/50' : 
                    p.color === 'blue' ? 'bg-blue-500 shadow-blue-500/50' : 
                    p.color === 'yellow' ? 'bg-yellow-500 shadow-yellow-500/50' : 
                    'bg-green-500 shadow-green-500/50'
                  }`} />
                  <div className="flex flex-col">
                    <span className="font-black uppercase text-sm italic tracking-tight">{p.username}</span>
                    <span className="text-[10px] font-bold text-white/40 uppercase">
                      {p.id === user?.id ? "You" : "Opponent"}
                    </span>
                  </div>
                  {gameState.turn === i && (
                    <div className="ml-auto flex items-center gap-1 text-orange-500">
                      <Timer size={12} className="animate-pulse" />
                      <span className="text-xs font-black italic">{timeLeft}s</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-orange-500/10 border border-orange-500/20 rounded-[2rem]">
          <div className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-2">Jackpot</div>
          <div className="text-3xl font-black italic uppercase text-white tracking-tighter">
            ${(gameState.entryFee * gameState.players.length * 0.9).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Main: Board */}
      <div className="lg:col-span-2 flex flex-col justify-center gap-8 relative">
        <LudoBoard
          players={gameState.players}
          turn={gameState.turn}
          diceValue={gameState.diceValue}
          onMovePawn={handleMovePawn}
          status={gameState.status}
        />

        <AnimatePresence>
          {gameState.status === 'playing' && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center justify-center gap-8 pt-4"
            >
              <div className="text-right">
                <div className="text-[10px] uppercase font-black tracking-widest opacity-40 mb-1">Turn Operator</div>
                <div className={`text-xl font-black italic uppercase ${isMyTurn ? "text-orange-500" : "text-white"}`}>
                  {isMyTurn ? "Your Strategy" : `${currentPlayer.username}'s Move`}
                </div>
              </div>

              <div className="relative group">
                {isMyTurn && gameState.diceValue === 0 && (
                  <div className="absolute -inset-4 bg-orange-500/20 rounded-full blur-2xl animate-pulse" />
                )}
                <button
                  onClick={handleRollDice}
                  disabled={!isMyTurn || gameState.diceValue !== 0 || isRolling}
                  className={`w-24 h-24 rounded-[2rem] flex items-center justify-center border-4 transition-all relative ${
                    isMyTurn && gameState.diceValue === 0 
                    ? 'bg-orange-500 border-white/20 text-white shadow-2xl shadow-orange-500/50 hover:scale-110 active:scale-95 cursor-pointer' 
                    : 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {isRolling ? (
                      <motion.div
                        key="rolling"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.1, ease: "linear" }}
                      >
                        <RefreshCw size={40} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key={lastDice || 'idle'}
                        initial={{ scale: 0.5, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="text-4xl font-black"
                      >
                        {lastDice > 0 ? lastDice : <Dices size={40} strokeWidth={2.5} />}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>

              <div className="w-24 h-px bg-white/10 hidden md:block" />
              
              <div className="text-sm font-black italic uppercase leading-tight max-w-[120px] opacity-60">
                {isMyTurn ? (
                  gameState.diceValue === 0 ? "Click to deploy dice roll" : "Select a pawn to advance"
                ) : (
                  "Awaiting tactical move..."
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Winner Overlay */}
        <AnimatePresence>
          {gameState.status === 'finished' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md rounded-[3rem]"
            >
              <motion.div
                initial={{ scale: 0.8, y: 40 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-orange-500 w-full max-w-md p-12 rounded-[4rem] text-center space-y-8 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-12 text-white/10 opacity-50 rotate-12">
                   <Crown size={200} />
                </div>
                
                <div className="relative z-10 space-y-6">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-2xl">
                    <Trophy size={48} className="text-orange-500" />
                  </div>
                  
                  <div>
                    <h2 className="text-6xl font-black italic uppercase leading-none tracking-tighter">Legendary <br /> Victory</h2>
                    <p className="text-white font-bold text-lg mt-4 opacity-100">
                      Combatant <span className="underline">{gameState.players.find((p: any) => p.id === gameState.winner)?.username}</span>
                    </p>
                    <div className="inline-block mt-2 px-4 py-1 bg-black text-white text-[10px] font-black uppercase rounded-full">
                      Earned ${(gameState.entryFee * gameState.players.length * 0.9).toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/lobby')}
                    className="w-full py-6 bg-black text-white rounded-[2rem] font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-2xl"
                  >
                    Return to Lobby
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sidebar: Combat Intel */}
      <div className="lg:col-span-1 hidden lg:block">
        <div className="bg-white/5 border border-white/10 rounded-[3rem] h-full p-8 flex flex-col gap-8">
          <div className="space-y-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-orange-500">Battle Intel</h3>
            <p className="text-xs text-white/40 leading-relaxed italic">Tactical data from the current engagement.</p>
          </div>

          <div className="flex-1 space-y-6">
             <div className="space-y-4">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-30 border-b border-white/5 pb-2">Arena Protocols</div>
                <div className="space-y-4">
                  {[
                    { id: '01', msg: 'A roll of 6 grants deployment permission for home-base units.' },
                    { id: '02', msg: 'Occupying an occupied grid cell causes immediate unit interception.' },
                    { id: '03', msg: 'Safe zones (Star icons) disable unit interception protocols.' },
                    { id: '04', msg: 'Total annihilation of base units requires 56 strategic steps.' }
                  ].map(rule => (
                    <div key={rule.id} className="flex gap-3 text-xs">
                      <span className="font-black text-orange-500 shrink-0">{rule.id}</span>
                      <span className="text-white/60 italic font-medium">{rule.msg}</span>
                    </div>
                  ))}
                </div>
             </div>
          </div>

          <div className="pt-6 border-t border-white/10">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase text-white/20">
                <ShieldCheck size={12} /> Encrypted Transmission
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
