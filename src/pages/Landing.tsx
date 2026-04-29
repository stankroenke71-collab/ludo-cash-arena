import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Trophy, Shield, Zap, TrendingUp } from 'lucide-react';

export default function Landing() {
  return (
    <div className="space-y-32 pb-32">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex flex-col justify-center items-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-orange-500/20 to-transparent blur-3xl -z-10" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          <span className="text-orange-500 font-mono tracking-[0.3em] uppercase text-xs">The Ultimate Battle</span>
          <h1 className="text-[15vw] leading-[0.8] font-black uppercase tracking-tighter italic">
            LUDO <br />
            <span className="text-orange-500">ARENA</span>
          </h1>
          <p className="max-w-xl mx-auto text-white/60 text-lg md:text-xl font-light">
            Real-time multiplayer skill gaming. Battle with others, climb the leaderboard, and win real cash rewards.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-12 flex gap-4"
        >
          <Link to="/register" className="px-8 py-4 bg-orange-500 text-white font-black uppercase tracking-widest text-sm rounded-full hover:bg-orange-600 transition-all hover:scale-105">
            Get Started
          </Link>
          <Link to="/lobby" className="px-8 py-4 bg-white/10 text-white font-black uppercase tracking-widest text-sm rounded-full hover:bg-white/20 transition-all">
            See Lobby
          </Link>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { icon: <Zap className="text-yellow-400" />, title: "Instant Access", desc: "Join rooms instantly and start playing. Fast deposits and withdrawals." },
          { icon: <Shield className="text-blue-400" />, title: "Fair Play", desc: "Advanced anti-cheat measures and secure escrow system." },
          { icon: <TrendingUp className="text-green-400" />, title: "Earn Bonus", desc: "Refer friends and earn extra rewards. Level up your profile." },
          { icon: <Trophy className="text-orange-400" />, title: "Tournaments", desc: "Daily tournaments with massive prize pools." }
        ].map((f, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -10 }}
            className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-4"
          >
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              {f.icon}
            </div>
            <h3 className="text-xl font-bold italic">{f.title}</h3>
            <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Social Proof / Stats */}
      <section className="py-24 bg-white text-black rounded-[4rem] flex flex-col md:flex-row items-center justify-around gap-12 px-12">
        <div className="text-center">
          <div className="text-6xl font-black italic">500K+</div>
          <div className="uppercase tracking-widest text-xs font-bold opacity-50">Active Players</div>
        </div>
        <div className="text-center">
          <div className="text-6xl font-black italic">$2M+</div>
          <div className="uppercase tracking-widest text-xs font-bold opacity-50">Total Prizes Paid</div>
        </div>
        <div className="text-center">
          <div className="text-6xl font-black italic">24/7</div>
          <div className="uppercase tracking-widest text-xs font-bold opacity-50">Live Support</div>
        </div>
      </section>
    </div>
  );
}
