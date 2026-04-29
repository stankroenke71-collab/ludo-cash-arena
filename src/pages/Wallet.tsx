import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Clock, ShieldCheck, CreditCard, ChevronRight, Zap, Target } from 'lucide-react';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

export default function Wallet() {
  const { user, token, refreshUser } = useAuthStore();
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Flutterwave');
  const [withdrawPhone, setWithdrawPhone] = useState('');

  useEffect(() => {
    if (user) {
      fetch(`/api/wallet/history/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setHistory(data));
    }
  }, [user, token]);

  const config = {
    public_key: (import.meta as any).env.VITE_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-xxx',
    tx_ref: 'DEP-' + Date.now().toString(36).toUpperCase(),
    amount: Number(amount) || 0,
    currency: 'USD',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: user?.email || '',
      name: user?.username || '',
      phone_number: '',
    },
    customizations: {
      title: 'Ludo Cash Deposit',
      description: 'Fund your wallet',
      logo: '',
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  const handleDeposit = async () => {
    if (!amount || Number(amount) < 1) return;
    
    if (paymentMethod === 'Flutterwave') {
      handleFlutterPayment({
        callback: async (response) => {
           if (response.status === 'successful') {
             setLoading(true);
             try {
               const res = await fetch('/api/wallet/deposit', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                 body: JSON.stringify({ 
                   userId: user?.id, 
                   amount: Number(amount), 
                   method: 'Flutterwave', 
                   reference: response.transaction_id || response.tx_ref 
                 })
               });
               const data = await res.json();
               if (data.success) {
                 setAmount('');
                 const histRes = await fetch(`/api/wallet/history/${user?.id}`, {
                   headers: { Authorization: `Bearer ${token}` }
                 });
                 const histData = await histRes.json();
                 setHistory(histData);
                 refreshUser();
                 alert('Deposit successful via Flutterwave!');
               }
             } finally {
               setLoading(false);
               closePaymentModal();
             }
           } else {
             closePaymentModal();
           }
        },
        onClose: () => {
           // Closed by user
        },
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          userId: user?.id, 
          amount: Number(amount), 
          method: paymentMethod, 
          reference: 'DEP-' + Date.now().toString(36).toUpperCase() 
        })
      });
      const data = await res.json();
      if (data.success) {
        setAmount('');
        const histRes = await fetch(`/api/wallet/history/${user?.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const histData = await histRes.json();
        setHistory(histData);
        refreshUser();
        alert(`Deposit successful via ${paymentMethod}!`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || Number(amount) < 5) {
      alert('Minimum withdrawal is $5');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          userId: user?.id, 
          amount: Number(amount), 
          provider: paymentMethod, 
          phone_number: withdrawPhone || 'No phone provided',
          details: 'ID: CM-77829-QX' 
        })
      });
      const data = await res.json();
      if (data.success) {
        setAmount('');
        setWithdrawPhone('');
        alert('Withdrawal request submitted for review. Expected processing time: 2-4 hours.');
        const histRes = await fetch(`/api/wallet/history/${user?.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const histData = await histRes.json();
        setHistory(histData);
        refreshUser();
      }
    } catch(e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-12 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-white/5 pb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] uppercase font-black tracking-widest border border-green-500/20">
            <ShieldCheck size={12} /> Secure Vault
          </div>
          <h1 className="text-7xl font-black italic uppercase leading-none tracking-tighter">Finance <span className="text-orange-500">Hub</span></h1>
          <p className="text-white/40 mt-2 font-medium">Manage your funds, deposits, and withdrawals with military-grade encryption.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-4 space-y-6">
           <div className="p-10 bg-gradient-to-br from-[#111] to-[#050505] border border-white/10 rounded-[3rem] space-y-8 relative overflow-hidden group shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
              <div className="relative z-10 space-y-6">
                 <div className="flex justify-between items-start">
                    <div className="p-4 bg-orange-500 rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                       <WalletIcon size={24} />
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.3em] font-black opacity-30 mt-2 italic">Active Wallet</div>
                 </div>
                 <div className="space-y-1 text-white">
                    <div className="text-[10px] uppercase tracking-widest opacity-30 font-bold">Total Available</div>
                    <div className="text-5xl font-black italic tracking-tighter italic flex items-baseline gap-1">
                       <span className="text-2xl text-orange-500 font-bold">$</span>{user.balance.toFixed(2)}
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 pt-4 text-white">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                       <div className="text-[10px] uppercase font-bold opacity-30 italic">Ludo Bonus</div>
                       <div className="text-lg font-black italic">${user.bonus_balance.toFixed(2)}</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                       <div className="text-[10px] uppercase font-bold opacity-30 italic">Win Chips</div>
                       <div className="text-lg font-black italic">1,450</div>
                    </div>
                 </div>
              </div>
              <div className="absolute -bottom-10 -right-10 opacity-5">
                 <Zap size={200} />
              </div>
           </div>

           <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6">
             <h4 className="text-xs font-black uppercase tracking-widest italic flex items-center gap-2">
                 <ShieldCheck size={14} className="text-orange-500" /> Security Status
             </h4>
             <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                   <span className="opacity-40">Verification</span>
                   <span className="text-green-500 font-black italic uppercase">Tier 2 Verified</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                   <div className="w-2/3 h-full bg-orange-500" />
                </div>
             </div>
             <p className="text-[10px] leading-relaxed text-white/30 font-medium italic">Complete Tier 3 verification to unlock $10,000 daily withdrawals.</p>
           </div>
        </aside>

        <main className="lg:col-span-8 space-y-8">
           <div className="flex gap-4 p-2 bg-white/5 rounded-3xl border border-white/10">
              {(['deposit', 'withdraw', 'history'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-black shadow-xl' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                  {tab}
                </button>
              ))}
           </div>

           <AnimatePresence mode="wait">
              {activeTab === 'deposit' || activeTab === 'withdraw' ? (
                <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-8">
                         <h3 className="text-xl font-bold uppercase italic italic">{activeTab === 'deposit' ? 'Add Funds' : 'Withdraw Cash'}</h3>
                          <div className="space-y-6">
                            <div className="space-y-2">
                               <label className="text-[10px] uppercase font-black tracking-widest opacity-30">Amount (USD)</label>
                               <input 
                                 type="number" 
                                 value={amount}
                                 onChange={e => setAmount(e.target.value)}
                                 placeholder="0.00" 
                                 className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-4xl font-black italic outline-none focus:border-orange-500 transition-colors" 
                               />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                               {[50, 100, 500].map(val => (
                                 <button onClick={() => setAmount(val.toString())} key={val} className="py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-orange-500 transition-all">+${val}</button>
                               ))}
                            </div>
                            {activeTab === 'withdraw' && (
                              <div className="space-y-2">
                                 <label className="text-[10px] uppercase font-black tracking-widest opacity-30">Account Phone Number</label>
                                 <input 
                                   type="tel" 
                                   value={withdrawPhone}
                                   onChange={e => setWithdrawPhone(e.target.value)}
                                   placeholder="+1234567890" 
                                   className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-orange-500 transition-colors" 
                                 />
                              </div>
                            )}
                         </div>
                         <button 
                           onClick={activeTab === 'deposit' ? handleDeposit : handleWithdraw}
                           disabled={loading}
                           className="w-full py-6 bg-orange-500 text-white font-black uppercase tracking-widest text-sm rounded-full hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 disabled:opacity-50"
                         >
                            {loading ? 'Processing...' : `Initialize ${activeTab}`}
                         </button>
                      </div>

                       <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-6">
                         <h3 className="text-xl font-bold uppercase italic italic">Active Methods</h3>
                         <div className="space-y-3">
                            {['Flutterwave', 'Stripe', 'Orange Money', 'Crypto'].map((m, i) => (
                              <button 
                                key={i} 
                                onClick={() => setPaymentMethod(m)}
                                className={`w-full flex items-center justify-between p-4 border rounded-2xl group transition-all ${paymentMethod === m ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                              >
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><CreditCard size={18} /></div>
                                    <span className="text-sm font-bold uppercase italic">{m}</span>
                                 </div>
                                 <ChevronRight size={18} className={`transition-all ${paymentMethod === m ? 'opacity-100' : 'opacity-20 group-hover:opacity-100 group-hover:translate-x-1'}`} />
                              </button>
                            ))}
                         </div>
                      </div>
                   </div>
                </motion.div>
              ) : (
                <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
                   {history.length === 0 ? (
                     <div className="py-32 text-center text-white/20 font-black uppercase italic tracking-widest border-2 border-dashed border-white/5 rounded-[3rem]">No Ledger Entries</div>
                   ) : (
                     history.map((tx, i) => (
                       <div key={tx.id || i} className="flex items-center justify-between p-8 bg-white/5 border border-white/5 rounded-[2.5rem] group hover:bg-white/10 transition-all">
                          <div className="flex items-center gap-6">
                             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${tx.type === 'deposit' || tx.type === 'game_win' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                {tx.type === 'deposit' || tx.type === 'game_win' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                             </div>
                             <div>
                                <div className="text-lg font-black uppercase italic tracking-wider italic">{tx.type}</div>
                                <div className="text-[10px] uppercase font-bold opacity-30 mt-1 flex items-center gap-2">
                                   <Clock size={12} /> {new Date(tx.created_at).toLocaleDateString()} • {tx.status}
                                </div>
                             </div>
                          </div>
                          <div className="text-right">
                             <div className={`text-2xl font-black italic ${tx.type === 'deposit' || tx.type === 'game_win' ? 'text-green-500' : 'text-white'}`}>
                                {tx.type === 'deposit' || tx.type === 'game_win' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                             </div>
                             <div className="text-[10px] uppercase font-bold opacity-20 tracking-tighter">TRX: #{tx.id.toString().slice(-6)}</div>
                          </div>
                       </div>
                     ))
                   )}
                </motion.div>
              )}
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
