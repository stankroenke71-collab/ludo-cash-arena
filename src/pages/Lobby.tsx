import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { getSocket } from '../lib/socket';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Users, Plus, Lock, ArrowRight, X, Shield, Star, Swords } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Lobby() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({ entryFee: 10, playerLimit: 2, isPrivate: false });
  const { user, token } = useAuthStore();
  const socket = getSocket(token!);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;
    socket.emit('lobby:list');
    socket.on('lobby:update', (data: any[]) => setRooms(data));
    socket.on('lobby:refresh', () => socket.emit('lobby:list'));
    socket.on('room:joined', (gs: any) => navigate(`/room/${gs.roomId}`));

    return () => {
      socket.off('lobby:update');
      socket.off('lobby:refresh');
      socket.off('room:joined');
    };
  }, [socket, navigate]);

  return (
    <div className="space-y-12 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-white/5 pb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-[10px] uppercase font-black tracking-widest border border-blue-500/20">
            <Swords size={12} /> Live Battlegrounds
          </div>
          <h1 className="text-7xl font-black italic uppercase leading-none tracking-tighter">Arena <span className="text-orange-500">Lobby</span></h1>
          <p className="text-white/40 mt-2 font-medium">Join a table to start competing for real cash prizes in real-time.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative flex items-center gap-4 px-10 py-5 bg-orange-500 text-white font-black uppercase tracking-widest text-sm rounded-full overflow-hidden transition-all hover:scale-105 shadow-[0_20px_40px_-10px_rgba(249,115,22,0.4)]"
        >
          <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-20" />
          <Plus size={20} /> Create Battle
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {rooms.map((room, i) => (
            <motion.div
              key={room.id}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              className="relative p-1 bg-gradient-to-br from-white/10 to-transparent rounded-[3rem] hover:from-orange-500/50 transition-all duration-500 group"
            >
              <div className="relative bg-[#0a0a0a] rounded-[2.9rem] p-10 h-full flex flex-col justify-between space-y-8">
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                     <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-[10px] font-black tracking-widest uppercase text-white/40">
                        {room.is_private ? <Lock size={10} /> : <Shield size={10} />} {room.is_private ? 'Private' : 'Verified Arena'}
                     </div>
                     <div className="space-y-1">
                        <div className="text-[10px] uppercase tracking-widest opacity-30 font-bold">Stake Amount</div>
                        <div className="text-4xl font-black italic text-orange-500 tracking-tight">${room.entry_fee.toFixed(2)}</div>
                     </div>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <Users size={18} className="text-white/20" />
                    <span className="text-xs font-black italic">{room.current_players}/{room.player_limit}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Ready to start</span>
                   </div>
                   <button
                    onClick={() => socket?.emit('room:join', room.id)}
                    className="flex items-center gap-2 text-sm font-black uppercase italic text-orange-500 group-hover:gap-4 transition-all"
                  >
                    Enter Battle <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          
          {rooms.length === 0 && (
            <div className="col-span-full py-40 border-2 border-dashed border-white/5 rounded-[4rem] text-center space-y-6">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
                <Trophy size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black italic uppercase">Boutique Desolate</h3>
                <p className="text-white/40 font-medium">No one is currently in the lobby. Be the first to start a war.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-10 py-4 bg-white/5 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
              >
                Create Room
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="relative w-full max-w-xl bg-[#0a0a0a] border border-white/10 p-16 rounded-[4rem] shadow-2xl space-y-10"
            >
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-4xl font-black italic uppercase italic leading-none">Assemble Table</h3>
                  <p className="text-white/40 text-sm font-medium">Set your stakes and invite the world.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-4 bg-white/5 rounded-2xl text-white/20 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); socket?.emit('room:create', newRoom); setIsModalOpen(false); }} className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-[0.3em] font-black opacity-30 text-orange-500">Entry Amount</label>
                  <div className="grid grid-cols-4 gap-4">
                    {[10, 50, 200, 1000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setNewRoom({ ...newRoom, entryFee: val })}
                        className={`py-5 rounded-2xl border-2 transition-all font-black italic relative overflow-hidden ${newRoom.entryFee === val ? 'bg-orange-500 border-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'}`}
                      >
                        <span className="relative z-10">${val}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.3em] font-black opacity-30">Player Cap</label>
                      <div className="flex bg-white/5 p-2 rounded-2xl border border-white/5">
                        {[2, 4].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setNewRoom({ ...newRoom, playerLimit: val })}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${newRoom.playerLimit === val ? 'bg-white text-black shadow-lg' : 'text-white/40'}`}
                          >
                            {val} Slots
                          </button>
                        ))}
                      </div>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.3em] font-black opacity-30">Privacy</label>
                      <button
                        type="button"
                        onClick={() => setNewRoom({ ...newRoom, isPrivate: !newRoom.isPrivate })}
                        className={`w-full py-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest ${newRoom.isPrivate ? 'bg-blue-500/10 border-blue-500/50 text-blue-500' : 'bg-white/5 border-white/5 text-white/40'}`}
                      >
                        {newRoom.isPrivate ? <><Lock size={14} /> Private Table</> : 'Public Arena'}
                      </button>
                   </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <div className="flex justify-between items-center mb-10">
                    <div>
                       <div className="text-[10px] uppercase tracking-widest font-black opacity-30 italic">Match Yield</div>
                       <div className="text-3xl font-black italic text-green-500">${(newRoom.entryFee * newRoom.playerLimit * 0.9).toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                       <div className="text-[10px] uppercase tracking-widest font-black opacity-30 italic">Platform Fee</div>
                       <div className="text-lg font-black italic text-white/40">10%</div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-6 bg-white text-black font-black uppercase tracking-widest text-sm rounded-full hover:bg-orange-500 hover:text-white transition-all shadow-2xl hover:shadow-orange-500/30"
                  >
                    Confirm & Forge Arena
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
