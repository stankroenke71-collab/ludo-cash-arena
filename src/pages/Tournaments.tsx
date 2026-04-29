import { motion } from 'motion/react';
import { Trophy, Timer, Users, ArrowRight, Star } from 'lucide-react';

const TOURNAMENTS = [
  { id: 1, name: 'Midnight Massacre', prize: 5000, players: 128, entry: 50, start: '2h 15m', type: 'Grand' },
  { id: 2, name: 'Daily Sprint', prize: 200, players: 32, entry: 10, start: '45m', type: 'Sprint' },
  { id: 3, name: 'Weekend Warrior', prize: 1500, players: 64, entry: 25, start: '1d 4h', type: 'Pro' },
  { id: 4, name: 'Clash of Kings', prize: 10000, players: 256, entry: 100, start: '3d 12h', type: 'Elite' },
];

export default function Tournaments() {
  return (
    <div className="space-y-12 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 text-orange-500 rounded-full text-[10px] uppercase font-black tracking-widest border border-orange-500/20">
            <Star size={12} fill="currentColor" /> Pro Circuit
          </div>
          <h1 className="text-7xl font-black italic uppercase leading-none">Tournaments</h1>
          <p className="text-white/40 max-w-md">Large scale battles with massive prize pools. Prove your skills and dominate the circuit.</p>
        </div>
        <div className="flex gap-4 p-2 bg-white/5 rounded-2xl border border-white/10">
          <button className="px-6 py-3 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl shadow-lg">Featured</button>
          <button className="px-6 py-3 text-white/40 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">Upcoming</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {TOURNAMENTS.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative overflow-hidden p-1 bg-gradient-to-br from-white/10 to-transparent rounded-[3rem] hover:from-orange-500/40 transition-all duration-500"
          >
            <div className="relative bg-[#0a0a0a] rounded-[2.9rem] p-10 h-full flex flex-col justify-between space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">{t.type} Arena</span>
                  <h3 className="text-3xl font-black italic uppercase">{t.name}</h3>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                   <div className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1">Prize Pool</div>
                   <div className="text-2xl font-black italic text-green-500">${t.prize.toLocaleString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest opacity-30 font-bold flex items-center gap-1"><Users size={12} /> Slots</div>
                  <div className="font-bold text-sm">0 / {t.players}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest opacity-30 font-bold flex items-center gap-1"><Timer size={12} /> Starts In</div>
                  <div className="font-bold text-sm">{t.start}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest opacity-30 font-bold flex items-center gap-1"><Trophy size={12} /> Entry</div>
                  <div className="font-bold text-sm text-orange-500">${t.entry}</div>
                </div>
              </div>

              <button className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 group-hover:bg-orange-500 group-hover:border-orange-500 group-hover:text-white transition-all duration-500 overflow-hidden relative">
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 opacity-10" />
                <span className="text-xs font-black uppercase tracking-widest">Register Now</span>
                <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Leaderboard Hook */}
      <section className="mt-24 p-12 bg-white text-black rounded-[4rem] relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 opacity-5">
            <Trophy size={300} />
         </div>
         <div className="relative z-10 space-y-8">
            <div className="space-y-2">
              <h2 className="text-5xl font-black italic uppercase italic">Regional Leaderboard</h2>
              <p className="opacity-60 max-w-md">The top 10 players of the month earn absolute glory and exclusive nft-badges.</p>
            </div>

            <div className="space-y-2">
               {[1, 2, 3].map(i => (
                 <div key={i} className="flex items-center justify-between p-6 border-b border-black/10 last:border-0 hover:bg-black/5 transition-colors rounded-2xl">
                    <div className="flex items-center gap-6">
                       <span className="text-2xl font-black italic opacity-20 w-8">{i}</span>
                       <div className="w-12 h-12 bg-black rounded-xl overflow-hidden border-2 border-orange-500">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=rank${i}`} alt="Avatar" />
                       </div>
                       <div>
                          <div className="font-black italic uppercase">Shadow_Slayer_{i}</div>
                          <div className="text-[10px] uppercase font-bold opacity-40">12,490 Points</div>
                       </div>
                    </div>
                    <div className="text-xl font-black italic">$2,450 Earned</div>
                 </div>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
}
