import { motion } from 'motion/react';
import { Bell, Trophy, Wallet, Zap, ShieldCheck, Trash2, CheckCircle2 } from 'lucide-react';

const NOTIFICATIONS = [
  { id: 1, type: 'match', title: 'Match Victory!', msg: 'You won $36.00 in the Pro Arena match #42901.', time: '2m ago', read: false },
  { id: 2, type: 'wallet', title: 'Deposit Successful', msg: 'Your deposit of $100.00 via Flutterwave has been credited.', time: '1h ago', read: true },
  { id: 3, type: 'referral', title: 'New Referral!', msg: 'Apex_Player_2 joined using your code. $5.00 pending.', time: '3h ago', read: false },
  { id: 4, type: 'system', title: 'Security Alert', msg: 'A new login was detected from a new device in London.', time: '1d ago', read: true },
  { id: 5, type: 'tournament', title: 'Tournament Starting', msg: 'Midnight Massacre begins in 15 minutes. Get ready!', time: '1d ago', read: true }
];

export default function Notifications() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      <header className="flex justify-between items-end border-b border-white/5 pb-12">
        <div className="space-y-4">
          <h1 className="text-6xl font-black italic uppercase leading-none">Inbox</h1>
          <p className="text-white/40">Stay updated with your match results and account activity.</p>
        </div>
        <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
          <Trash2 size={16} /> Clear All
        </button>
      </header>

      <div className="space-y-4">
        {NOTIFICATIONS.map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`group relative p-8 rounded-[2.5rem] border transition-all duration-300 ${
              n.read ? 'bg-white/5 border-white/5' : 'bg-white/10 border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.05)]'
            }`}
          >
            <div className="flex items-start gap-8">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                n.type === 'match' ? 'bg-green-500/20 text-green-500' :
                n.type === 'wallet' ? 'bg-blue-500/20 text-blue-500' :
                n.type === 'referral' ? 'bg-orange-500/20 text-orange-500' :
                'bg-white/10 text-white/40'
              }`}>
                {n.type === 'match' ? <Trophy size={28} /> :
                 n.type === 'wallet' ? <Wallet size={28} /> :
                 n.type === 'referral' ? <Zap size={28} /> :
                 <ShieldCheck size={28} />}
              </div>

              <div className="space-y-1 pr-12">
                 <div className="flex items-center gap-3">
                    <h3 className="text-xl font-black italic uppercase italic">{n.title}</h3>
                    {!n.read && <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_10px_#f97316]" />}
                 </div>
                 <p className={`text-sm leading-relaxed ${n.read ? 'text-white/40' : 'text-white/80 font-medium'}`}>{n.msg}</p>
                 <div className="text-[10px] uppercase font-black tracking-widest opacity-30 pt-2">{n.time}</div>
              </div>

              <button className="absolute top-8 right-8 p-3 opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-white">
                 <CheckCircle2 size={20} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center py-12">
         <p className="text-xs font-black uppercase tracking-widest text-white/10">End of notifications</p>
      </div>
    </div>
  );
}
