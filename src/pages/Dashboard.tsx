import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'motion/react';
import { Wallet, Trophy, Users, Star, ArrowRight, TrendingUp, Zap, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="space-y-12 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-6xl font-black italic uppercase leading-none tracking-tighter">
            Control <span className="text-orange-500">Center</span>
          </h1>
          <p className="text-white/40 mt-2 font-medium">Player Protocol Alpha-7 • Welcome back, {user.username}</p>
        </div>
        
        <div className="flex gap-4 relative z-10">
          <Link to="/wallet" className="flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all hover:scale-105 group">
            <div className="p-3 bg-orange-500 rounded-2xl shadow-[0_0_15px_rgba(249,115,22,0.4)] group-hover:rotate-12 transition-transform">
              <Wallet size={24} className="text-white" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-black">Credits</div>
              <div className="text-xl font-black italic tracking-tight">${user.balance.toFixed(2)}</div>
            </div>
          </Link>
          <div className="flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-3xl group">
            <div className="p-3 bg-yellow-500 rounded-2xl shadow-[0_0_15px_rgba(234,179,8,0.4)] group-hover:scale-110 transition-transform">
              <Star size={24} className="text-black" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-black">Bonus</div>
              <div className="text-xl font-black italic tracking-tight">${user.bonus_balance.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Action Hub */}
        <motion.div
          whileHover={{ y: -5 }}
          className="lg:col-span-8 p-12 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-800 rounded-[4rem] relative overflow-hidden group shadow-[0_30px_60px_-15px_rgba(249,115,22,0.3)]"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          <div className="relative z-10 h-full flex flex-col justify-between space-y-12">
            <div className="space-y-4">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/20 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                 <Zap size={12} fill="currentColor" /> Active Arena
               </div>
               <h2 className="text-7xl font-black italic uppercase leading-[0.85] tracking-tighter italic">
                 READY FOR <br />
                 THE STAKE?
               </h2>
               <p className="opacity-90 max-w-sm text-lg font-medium leading-relaxed">Battle real opponents in high-stakes Ludo matches and claim your glory today.</p>
            </div>
            <Link to="/lobby" className="inline-flex items-center gap-4 px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-sm rounded-full hover:bg-black hover:text-white transition-all shadow-2xl">
              Launch Arena <ArrowRight size={20} />
            </Link>
          </div>
          <Trophy size={400} className="absolute -right-20 -top-20 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000" />
        </motion.div>

        {/* Quick Stats Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-8 relative overflow-hidden group">
            <div className="relative z-10 space-y-6">
              <h3 className="text-xl font-bold italic uppercase flex items-center gap-3">
                <Target size={20} className="text-orange-500" /> Reputation
              </h3>
              <div className="p-6 bg-white/5 rounded-3xl border border-dashed border-white/10 space-y-4">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Referral ID</div>
                  <div className="text-3xl font-black text-orange-500 tracking-[0.2em]">{user.referralCode}</div>
                </div>
                <div className="h-px bg-white/10" />
                <p className="text-sm text-white/40 leading-relaxed font-medium">Recruit 5 members to unlock the <span className="text-white">Veteran badge</span> and get lower commissions.</p>
              </div>
              <button className="w-full py-5 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-xl">
                Recruit Players
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="p-6 bg-white/5 border border-white/10 rounded-3xl text-center space-y-1">
                <TrendingUp size={20} className="mx-auto text-green-500 mb-2" />
                <div className="text-[10px] uppercase font-bold opacity-30">Avg Winnings</div>
                <div className="text-2xl font-black italic">$42.00</div>
             </div>
             <div className="p-6 bg-white/5 border border-white/10 rounded-3xl text-center space-y-1">
                <Users size={20} className="mx-auto text-blue-500 mb-2" />
                <div className="text-[10px] uppercase font-bold opacity-30">Global Rank</div>
                <div className="text-2xl font-black italic">#1,402</div>
             </div>
          </div>
        </div>
      </div>

      <section className="space-y-8">
        <div className="flex justify-between items-end px-4">
          <h3 className="text-3xl font-black italic uppercase italic leading-none">Combat Log</h3>
          <Link to="/profile" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-orange-500 transition-colors">See Statistics</Link>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-[3.5rem] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] font-black opacity-30">
                <th className="px-10 py-8">Arena Mode</th>
                <th className="px-10 py-8 text-center">Fighters</th>
                <th className="px-10 py-8">Entry</th>
                <th className="px-10 py-8">Result</th>
                <th className="px-10 py-8 text-right">Yield</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[1, 2, 3].map((_, i) => (
                <tr key={i} className="hover:bg-white/5 transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center font-black">L</div>
                       <div className="font-bold italic uppercase tracking-wider">High Stakes Elite</div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center font-bold opacity-60">4 Players</td>
                  <td className="px-10 py-8 opacity-40 font-mono italic font-bold">$10.00</td>
                  <td className="px-10 py-8">
                    <span className="inline-flex px-3 py-1 bg-green-500/20 text-green-500 text-[10px] font-black rounded-full uppercase italic border border-green-500/30">Cleared</span>
                  </td>
                  <td className="px-10 py-8 text-right text-orange-500 font-black italic text-xl">+$36.00</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
