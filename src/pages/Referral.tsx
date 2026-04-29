import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'motion/react';
import { Users, Gift, Share2, Copy, TrendingUp, DollarSign, ArrowRight } from 'lucide-react';

export default function Referral() {
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const referralLink = `${window.location.origin}/register?ref=${user?.referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return null;

  return (
    <div className="space-y-12 pb-24">
      {/* Hero Section */}
      <section className="relative p-16 bg-gradient-to-br from-orange-500 to-orange-700 rounded-[4rem] text-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="relative z-10 space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-black/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-white">
            <Gift size={12} fill="currentColor" /> Bounty Program
          </div>
          <h1 className="text-7xl font-black italic uppercase leading-[0.9] tracking-tighter">
            INVITE FRIENDS <br />
            <span className="text-black/40">EARN REWARDS</span>
          </h1>
          <p className="max-w-xl mx-auto text-white/80 text-lg font-medium">
            Building a community is better together. For every friend who joins and plays a match, we'll deposit $5 into your wallet.
          </p>
        </motion.div>
        
        <div className="absolute -bottom-20 -left-20 opacity-20">
           <Users size={300} />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Referral Card */}
        <div className="lg:col-span-5 space-y-8">
          <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-8 h-full">
            <div className="space-y-4">
               <h3 className="text-xl font-bold italic uppercase flex items-center gap-2">
                 <Share2 size={20} className="text-orange-500" /> Share Your Link
               </h3>
               <p className="text-white/40 text-sm">Copy your unique link and send it to your squad via social media or direct message.</p>
            </div>

            <div className="space-y-4">
               <div className="p-6 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between group">
                  <div className="truncate pr-4 text-sm font-medium opacity-60 font-mono">
                    {referralLink}
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="p-3 bg-white text-black rounded-xl hover:bg-orange-500 hover:text-white transition-all active:scale-95"
                  >
                    {copied ? 'Copied' : <Copy size={18} />}
                  </button>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <button className="py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">WhatsApp</button>
                  <button className="py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Twitter/X</button>
               </div>
            </div>

            <div className="pt-8 border-t border-white/5">
                <div className="text-[10px] uppercase tracking-widest font-bold opacity-30 italic mb-4 text-center">Your Stats</div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-6 bg-white/5 rounded-3xl text-center space-y-1">
                      <div className="text-xl font-black italic">12</div>
                      <div className="text-[10px] uppercase font-bold opacity-30 tracking-widest">Invited</div>
                   </div>
                   <div className="p-6 bg-white/5 rounded-3xl text-center space-y-1 border border-orange-500/20">
                      <div className="text-xl font-black italic text-orange-500">$60.00</div>
                      <div className="text-[10px] uppercase font-bold opacity-30 tracking-widest">Earned</div>
                   </div>
                </div>
            </div>
          </div>
        </div>

        {/* History / List */}
        <div className="lg:col-span-7 space-y-8">
           <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-8">
              <div className="flex justify-between items-center">
                 <h3 className="text-xl font-bold italic uppercase flex items-center gap-2">
                   <TrendingUp size={20} className="text-orange-500" /> Recent Referrals
                 </h3>
                 <span className="text-xs font-bold text-white/40">Real-time update</span>
              </div>

              <div className="space-y-4">
                 {[1, 2, 3, 4].map(i => (
                   <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 group hover:border-white/20 transition-all">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center font-bold">P{i}</div>
                         <div>
                            <div className="font-bold text-sm italic uppercase tracking-wider">Apex_Player_{i}02</div>
                            <div className="text-[10px] uppercase font-bold opacity-30">Status: Registered & Played</div>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-xl font-black italic text-green-500">+$5.00</div>
                         <div className="text-[10px] opacity-20 uppercase font-bold tracking-tighter">Completed</div>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="text-center pt-4">
                 <button className="text-xs font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors flex items-center gap-2 mx-auto">
                   View Full Referral Ledger <ArrowRight size={14} />
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Rules Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
        {[
          { icon: <Users size={24} />, title: "Send Invite", desc: "Share your referral code or unique link with your friends through any platform." },
          { icon: <TrendingUp size={24} />, title: "They Register", desc: "Your friend signs up and verify their account using your referral link." },
          { icon: <DollarSign size={24} />, title: "Collect Bounty", desc: "Instantly receive $5 bonus balance to your wallet once they play their first cash match." }
        ].map((step, i) => (
          <div key={i} className="space-y-4 group">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-orange-500 border border-white/10 group-hover:bg-orange-500 group-hover:text-white transition-all transform group-hover:scale-110">
              {step.icon}
            </div>
            <h4 className="text-lg font-black uppercase italic italic">{i+1}. {step.title}</h4>
            <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
