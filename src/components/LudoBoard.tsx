import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Home, Star, ChevronRight } from 'lucide-react';

interface Pawn {
  id: number;
  position: number;
  isFinished: boolean;
}

interface Player {
  id: string;
  username: string;
  color: string;
  pawns: Pawn[];
}

interface LudoBoardProps {
  players: Player[];
  turn: number;
  diceValue: number;
  onMovePawn: (pawnId: number) => void;
  status: string;
}

// 15x15 Grid Coordinate Mapping
const PATH_MAP: Record<number, [number, number]> = {
  0: [6, 1], 1: [6, 2], 2: [6, 3], 3: [6, 4], 4: [6, 5],
  5: [5, 6], 6: [4, 6], 7: [3, 6], 8: [2, 6], 9: [1, 6], 10: [0, 6],
  11: [0, 7], 12: [0, 8],
  13: [1, 8], 14: [2, 8], 15: [3, 8], 16: [4, 8], 17: [5, 8],
  18: [6, 9], 19: [6, 10], 20: [6, 11], 21: [6, 12], 22: [6, 13], 23: [6, 14],
  24: [7, 14], 25: [8, 14],
  26: [8, 13], 27: [8, 12], 28: [8, 11], 29: [8, 10], 30: [8, 9],
  31: [9, 8], 32: [10, 8], 33: [11, 8], 34: [12, 8], 35: [13, 8], 36: [14, 8],
  37: [14, 7], 38: [14, 6],
  39: [13, 6], 40: [12, 6], 41: [11, 6], 42: [10, 6], 43: [9, 6],
  44: [8, 5], 45: [8, 4], 46: [8, 3], 47: [8, 2], 48: [8, 1], 49: [8, 0],
  50: [7, 0], 51: [6, 0]
};

const FINISH_LANES: Record<string, Record<number, [number, number]>> = {
  red: { 100: [1, 7], 101: [2, 7], 102: [3, 7], 103: [4, 7], 104: [5, 7], 105: [6, 7] },
  blue: { 100: [7, 1], 101: [7, 2], 102: [7, 3], 103: [7, 4], 104: [7, 5], 105: [7, 6] },
  yellow: { 100: [13, 7], 101: [12, 7], 102: [11, 7], 103: [10, 7], 104: [9, 7], 105: [8, 7] },
  green: { 100: [7, 13], 101: [7, 12], 102: [7, 11], 103: [7, 10], 104: [7, 9], 105: [7, 8] }
};

const SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47];

export default function LudoBoard({ players, turn, diceValue, onMovePawn, status }: LudoBoardProps) {
  return (
    <div className="relative aspect-square w-full max-w-[620px] mx-auto bg-[#0a0a0a] border-[12px] border-white/5 rounded-[3rem] shadow-2xl overflow-hidden p-2">
      <div className="grid grid-cols-15 grid-rows-15 w-full h-full gap-0.5 relative">
        
        {/* Render Cells Background */}
        {Array.from({ length: 15 * 15 }).map((_, i) => {
          const x = i % 15;
          const y = Math.floor(i / 15);
          return <GridCell key={`cell-${i}`} x={x} y={y} />;
        })}

        {/* Center Arena */}
        <div className="col-start-7 col-end-10 row-start-7 row-end-10 bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center relative shadow-inner">
           <div className="absolute inset-2 border-2 border-white/20 rounded-xl flex items-center justify-center p-2 text-center text-white font-black uppercase italic text-[8px] leading-tight">
             Victory <br /> Zone
           </div>
        </div>

        {/* Home Bases overlay */}
        <HomeBase color="red" x={0} y={0} players={players} />
        <HomeBase color="blue" x={9} y={0} players={players} />
        <HomeBase color="yellow" x={9} y={9} players={players} />
        <HomeBase color="green" x={0} y={9} players={players} />

        {/* Pawns */}
        <AnimatePresence>
          {players.map((player, pIdx) => (
            player.pawns.map((pawn) => (
              <PawnComponent
                key={`pawn-${player.id}-${pawn.id}`}
                pawn={pawn}
                player={player}
                isTurn={turn === pIdx && status === 'playing'}
                canMove={diceValue > 0}
                onClick={() => onMovePawn(pawn.id)}
              />
            ))
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function GridCell({ x, y }: { x: number, y: number, key?: string | number }) {
  // Is it a path cell?
  let isPath = false;
  let color = 'bg-white/5';
  let icon = null;

  // Horizontal Paths
  if (y === 6 || y === 7 || y === 8) isPath = true;
  // Vertical Paths
  if (x === 6 || x === 7 || x === 8) isPath = true;
  // Exclude bases and center
  if (x < 6 && y < 6) isPath = false;
  if (x > 8 && y < 6) isPath = false;
  if (x < 6 && y > 8) isPath = false;
  if (x > 8 && y > 8) isPath = false;
  if (x >= 6 && x <= 8 && y >= 6 && y <= 8) isPath = false;

  if (!isPath) return <div className="w-full h-full" />;

  // Special coloring
  if (y === 7) {
    if (x >= 1 && x <= 5) color = 'bg-red-500/20';
    if (x >= 9 && x <= 13) color = 'bg-yellow-500/20';
  }
  if (x === 7) {
    if (y >= 1 && y <= 5) color = 'bg-blue-500/20';
    if (y >= 9 && y <= 13) color = 'bg-green-500/20';
  }

  // Start highlights
  if (x === 6 && y === 1) color = 'bg-red-500 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]';
  if (x === 13 && y === 6) color = 'bg-blue-500 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]';
  if (x === 8 && y === 13) color = 'bg-yellow-500 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]';
  if (x === 1 && y === 8) color = 'bg-green-500 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]';

  // Safe squares
  const currentPos = Object.entries(PATH_MAP).find(([_, pos]) => pos[0] === x && pos[1] === y);
  if (currentPos && SAFE_SQUARES.includes(parseInt(currentPos[0]))) {
    icon = <Star size={10} className="text-white/20" />;
  }

  return (
    <div 
      className={`w-full h-full ${color} rounded-sm flex items-center justify-center border border-white/[0.02] shadow-inner`}
      style={{ gridColumnStart: x + 1, gridRowStart: y + 1 }}
    >
      {icon}
    </div>
  );
}

function HomeBase({ color, x, y, players }: { color: string, x: number, y: number, players: Player[] }) {
  const baseColors: Record<string, string> = {
    red: 'from-red-500/20 to-red-600/10 border-red-500/50',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/50',
    yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/50',
    green: 'from-green-500/20 to-green-600/10 border-green-500/50'
  };

  const accentColors: Record<string, string> = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500'
  };

  return (
    <div 
      className={`absolute w-[40%] h-[40%] bg-gradient-to-br ${baseColors[color]} border-4 rounded-[2.5rem] p-6 flex flex-col items-center justify-center gap-4`}
      style={{ left: `${(x / 15) * 100}%`, top: `${(y / 15) * 100}%` }}
    >
      <div className="flex gap-4">
        <div className={`w-8 h-8 rounded-full ${accentColors[color]} opacity-20 shadow-xl`} />
        <div className={`w-8 h-8 rounded-full ${accentColors[color]} opacity-20 shadow-xl`} />
      </div>
      <div className="flex gap-4">
        <div className={`w-8 h-8 rounded-full ${accentColors[color]} opacity-20 shadow-xl`} />
        <div className={`w-8 h-8 rounded-full ${accentColors[color]} opacity-20 shadow-xl`} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
         <Home size={120} />
      </div>
    </div>
  );
}

function PawnComponent({ pawn, player, isTurn, canMove, onClick }: { pawn: Pawn, player: Player, isTurn: boolean, canMove: boolean, onClick: () => void, key?: string | number }) {
  let x: number, y: number;

  if (pawn.position === -1) {
    // Positioning in Home Base
    const offsets = {
      red: [[1, 1], [4, 1]],
      blue: [[10, 1], [13, 1]],
      yellow: [[10, 10], [13, 10]],
      green: [[1, 10], [4, 10]]
    };
    const [ox, oy] = offsets[player.color as keyof typeof offsets][pawn.id - 1];
    x = ox;
    y = oy;
  } else if (pawn.position >= 100) {
    [x, y] = FINISH_LANES[player.color][pawn.position];
  } else {
    [x, y] = PATH_MAP[pawn.position];
  }

  const baseColors: Record<string, string> = {
    red: 'bg-red-500 shadow-red-500/50',
    blue: 'bg-blue-500 shadow-blue-500/50',
    green: 'bg-green-500 shadow-green-500/50',
    yellow: 'bg-yellow-500 shadow-yellow-500/50'
  };

  return (
    <motion.div
      initial={false}
      animate={{ 
        left: `${(x / 15) * 100}%`, 
        top: `${(y / 15) * 100}%`,
        scale: isTurn ? 1.2 : 1,
        zIndex: isTurn ? 50 : 20
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{ 
        position: 'absolute', 
        width: '6.66%', 
        height: '6.66%',
        padding: '2px'
      }}
    >
      <button
        onClick={onClick}
        disabled={!isTurn || !canMove}
        className={`w-full h-full rounded-full border-2 border-white shadow-xl transition-all relative group ${baseColors[player.color]} disabled:opacity-80`}
      >
        <div className="absolute inset-0 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        {isTurn && (
          <motion.div
            layoutId="ring"
            className="absolute -inset-2 border-2 border-white rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </button>
    </motion.div>
  );
}
