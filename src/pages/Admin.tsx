import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, TrendingUp, Users, Wallet, Check, X, Info, 
  LayoutDashboard, Activity, AlertTriangle, Search, 
  MoreVertical, UserMinus, UserCheck, RefreshCw, Loader2,
  FileText, ArrowDownLeft, ArrowUpRight, Coins, Gift, Trophy
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

type Tab = 'overview' | 'users' | 'withdrawals' | 'transactions' | 'matches' | 'history' | 'fraud' | 'tournaments';

export default function Admin() {
  const { user, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [matchHistory, setMatchHistory] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAllData();
  }, [token]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [s, t, w, tx, u, m, h, f, tour] = await Promise.all([
        fetch('/api/admin/stats', { headers }).then(r => r.json()),
        fetch('/api/admin/analytics/trends', { headers }).then(r => r.json()),
        fetch('/api/admin/withdrawals', { headers }).then(r => r.json()),
        fetch('/api/admin/transactions', { headers }).then(r => r.json()),
        fetch('/api/admin/users', { headers }).then(r => r.json()),
        fetch('/api/admin/matches/live', { headers }).then(r => r.json()),
        fetch('/api/admin/matches/history', { headers }).then(r => r.json()),
        fetch('/api/admin/fraud/alerts', { headers }).then(r => r.json()),
        fetch('/api/admin/tournaments', { headers }).then(r => r.json()),
      ]);
      setStats(s);
      setTrends(t);
      setWithdrawals(w);
      setTransactions(Array.isArray(tx) ? tx : []);
      setUsers(Array.isArray(u.users) ? u.users : []);
      setLiveMatches(Array.isArray(m) ? m : []);
      setMatchHistory(Array.isArray(h) ? h : []);
      setFraudAlerts(Array.isArray(f) ? f : []);
      setTournaments(Array.isArray(tour) ? tour : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalAction = async (id: string, action: 'approve' | 'reject') => {
    const res = await fetch(`/api/admin/withdrawals/${id}/action`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ action, note: `Processed via Admin Dashboard` })
    });
    if (res.ok) fetchAllData();
  };

  const handleUserStatus = async (userId: string, newStatus: string) => {
    const res = await fetch(`/api/admin/users/${userId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) fetchAllData();
  };

  if (!user?.is_admin) return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-4 opacity-50 italic">
      <Shield size={64} className="text-red-500" />
      <div className="text-2xl font-black uppercase">Restricted Access</div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-24 min-h-[80vh]">
      {/* Sidebar Navigation */}
      <nav className="w-full lg:w-64 space-y-4">
        <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6">
          <div className="flex items-center gap-3 px-2 text-white">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white">
              <Shield size={20} />
            </div>
            <div className="font-black italic uppercase leading-none text-sm">Command<br/><span className="text-orange-500">Node v2.1</span></div>
          </div>
          
          <div className="space-y-1">
            <NavItem icon={<LayoutDashboard size={18}/>} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <NavItem icon={<Users size={18}/>} label="Personnel" active={activeTab === 'users'} onClick={() => setActiveTab('users')} count={users.length} />
            <NavItem icon={<FileText size={18}/>} label="Audit Log" active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} />
            <NavItem icon={<Trophy size={18}/>} label="Grand Slams" active={activeTab === 'tournaments'} onClick={() => setActiveTab('tournaments')} count={tournaments.length} />
            <NavItem icon={<Wallet size={18}/>} label="Payouts" active={activeTab === 'withdrawals'} onClick={() => setActiveTab('withdrawals')} count={withdrawals.length} isAlert={withdrawals.length > 0} />
            <NavItem icon={<Activity size={18}/>} label="Live Monitor" active={activeTab === 'matches'} onClick={() => setActiveTab('matches')} count={liveMatches.length} />
            <NavItem icon={<RefreshCw size={18}/>} label="Match History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} count={matchHistory.length} />
            <NavItem icon={<AlertTriangle size={18}/>} label="Security" active={activeTab === 'fraud'} onClick={() => setActiveTab('fraud')} count={fraudAlerts.length} isAlert={fraudAlerts.length > 0}/>
          </div>
        </div>

        <div className="p-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-[2.5rem] text-white space-y-4 shadow-xl shadow-orange-500/20">
          <TrendingUp />
          <div>
            <div className="text-[10px] font-black uppercase opacity-60">System Health</div>
            <div className="text-lg font-black italic">OPTIMAL (100%)</div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 space-y-8 min-w-0">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black italic uppercase leading-none tracking-tighter text-white">
              {activeTab === 'overview' && <>System <span className="text-orange-500">Intelligence</span></>}
              {activeTab === 'users' && <>Personnel <span className="text-orange-500">Registry</span></>}
              {activeTab === 'tournaments' && <>Major <span className="text-orange-500">Events</span></>}
              {activeTab === 'transactions' && <>Ledger <span className="text-orange-500">Audit</span></>}
              {activeTab === 'withdrawals' && <>Payout <span className="text-orange-500">Verification</span></>}
              {activeTab === 'matches' && <>Ludo <span className="text-orange-500">Battlefield</span></>}
              {activeTab === 'history' && <>Match <span className="text-orange-500">Archive</span></>}
              {activeTab === 'fraud' && <>Threat <span className="text-orange-500">Intelligence</span></>}
            </h1>
            <p className="text-white/40 font-medium italic">Operational control for Ludo Cash Arena enterprises.</p>
          </div>
          <button 
            onClick={fetchAllData}
            className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-white/40 hover:text-white"
          >
            {loading ? <Loader2 size={20} className="animate-spin text-orange-500" /> : <RefreshCw size={20} />}
          </button>
        </header>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {activeTab === 'overview' && stats && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                  <StatCard title="Platform Revenue" value={`$${stats.revenue.toFixed(2)}`} trend="+14.2%" icon={<TrendingUp />} color="text-green-500" />
                  <StatCard title="Escrow Ledger" value={`$${stats.escrow.toFixed(2)}`} trend="-2.1%" icon={<Shield />} color="text-white" />
                  <StatCard title="Combatant Payouts" value={`$${stats.totalWithdrawn.toFixed(2)}`} trend="+34.8%" icon={<Wallet />} color="text-orange-500" />
                  <StatCard title="Growth Capital" value={`$${(stats.revenue * 0.8).toFixed(2)}`} trend="+8.4%" icon={<Activity />} color="text-indigo-500" />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <div className="xl:col-span-2 p-10 bg-white/5 border border-white/10 rounded-[3.5rem] space-y-8 overflow-hidden backdrop-blur-xl">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Financial Velocity</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Revenue Streams & Growth Metrics (7D)</p>
                      </div>
                      <div className="flex gap-2">
                         <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 rounded-full border border-orange-500/20">
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase text-orange-500">Live</span>
                         </div>
                      </div>
                    </div>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trends}>
                          <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" axisLine={false} tickLine={false} fontSize={10} tick={{ fill: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }} />
                          <YAxis hide />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)', color: '#fff' }}
                            cursor={{ stroke: '#f97316', strokeWidth: 2 }}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="#f97316" fillOpacity={1} fill="url(#colorRev)" strokeWidth={4} />
                          <Area type="monotone" dataKey="volume" stroke="rgba(255,255,255,0.5)" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="p-10 bg-white/5 border border-white/10 rounded-[3.5rem] space-y-8 flex flex-col justify-between">
                    <div className="space-y-4">
                      <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Live Intelligence</h3>
                      <div className="space-y-4">
                         <IntelligenceRow label="Active Connections" value={stats.totalPlayers} trend={+3} />
                         <IntelligenceRow label="Market Escrow" value={`$${stats.escrow}`} trend={-12} />
                         <IntelligenceRow label="Security Load" value="Optimal" trend="Secure" isStatus />
                         <IntelligenceRow label="Avg Stake" value="$25.40" trend={+8} />
                      </div>
                    </div>
                    <button className="w-full py-5 bg-white text-black font-black uppercase text-xs rounded-3xl hover:bg-orange-500 hover:text-white transition-all italic tracking-widest shadow-xl shadow-white/5">
                      Export Report (PDF)
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-center gap-4 bg-white/5 border border-white/10 rounded-[2.5rem] px-8 py-2">
                  <Search className="text-white/20" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search personnel by username, email or ID..."
                    className="flex-1 py-4 bg-transparent border-none focus:ring-0 text-white font-medium italic"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase italic text-white/40 hover:text-white">Active Only</button>
                    <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase italic text-white/40 hover:text-white">Whales</button>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[3.5rem] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1200px]">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                          <th className="p-8 text-[10px] font-black uppercase opacity-40 text-white">Combatant Identity</th>
                          <th className="p-8 text-[10px] font-black uppercase opacity-40 text-white">Contact & Network</th>
                          <th className="p-8 text-[10px] font-black uppercase opacity-40 text-white">Wallet Performance</th>
                          <th className="p-8 text-[10px] font-black uppercase opacity-40 text-white">Engagement Bio</th>
                          <th className="p-8 text-[10px] font-black uppercase opacity-40 text-white">Management</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-white">
                        {users.filter(u => 
                          u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase())
                        ).map(u => (
                          <tr key={u.id} className="hover:bg-white/[0.03] transition-colors group">
                            <td className="p-8">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center font-black italic text-lg border border-white/10 text-orange-500 overflow-hidden">
                                  {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : u.username.substring(0, 1).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-black uppercase italic text-sm group-hover:text-orange-500 transition-colors">{u.username}</div>
                                  <div className="text-[10px] opacity-30 font-medium font-mono">{u.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-8">
                              <div className="text-xs font-bold opacity-80">{u.email}</div>
                              {u.phone && <div className="text-[10px] opacity-40 font-medium italic mt-1">{u.phone}</div>}
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-[9px] font-black uppercase text-indigo-500">Code: {u.referral_code}</span>
                                {u.referred_by && <span className="text-[9px] font-black uppercase text-white/20">Ref by: {u.referred_by.substring(0, 8)}</span>}
                              </div>
                            </td>
                            <td className="p-8">
                              <div className="space-y-1">
                                <div className="font-black italic text-base flex justify-between gap-4">
                                  <span className="opacity-40 uppercase text-[9px] tracking-widest mt-1">Wallet</span>
                                  <span>${Number(u.wallet_balance || 0).toFixed(2)}</span>
                                </div>
                                <div className="font-black italic text-xs flex justify-between gap-4 text-orange-500">
                                  <span className="opacity-40 uppercase text-[8px] tracking-widest mt-0.5">Bonus</span>
                                  <span>${Number(u.bonus_balance || 0).toFixed(2)}</span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                                  <div className="h-full bg-green-500 text-[0px]" style={{ width: `${Math.min(100, (u.total_winnings / (u.total_winnings + u.total_losses || 1)) * 100)}%` }}>-</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-8">
                              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                                <div>
                                  <div className="text-[9px] font-black uppercase opacity-30">Winnings</div>
                                  <div className="text-xs font-black text-green-500">${Number(u.total_winnings || 0).toFixed(2)}</div>
                                </div>
                                <div>
                                  <div className="text-[9px] font-black uppercase opacity-30">Losses</div>
                                  <div className="text-xs font-black text-red-500">${Number(u.total_losses || 0).toFixed(2)}</div>
                                </div>
                                <div className="col-span-2">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase italic ${u.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {u.status}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="p-8">
                              <div className="flex gap-2">
                                <button onClick={() => handleUserStatus(u.id, u.status === 'active' ? 'blocked' : 'active')} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-red-500 hover:text-white transition-all text-white/40">
                                  <MoreVertical size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-[3.5rem] overflow-hidden text-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px]">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                          <th className="p-8 text-[10px] font-black uppercase opacity-40">Transaction</th>
                          <th className="p-8 text-[10px] font-black uppercase opacity-40">Personnel</th>
                          <th className="p-8 text-[10px] font-black uppercase opacity-40">Amount</th>
                          <th className="p-8 text-[10px] font-black uppercase opacity-40">Reference</th>
                          <th className="p-8 text-[10px] font-black uppercase opacity-40">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {transactions.map(tx => (
                          <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-8">
                               <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    tx.type === 'deposit' || tx.type === 'game_win' ? 'bg-green-500/10 text-green-500' :
                                    tx.type === 'withdrawal' || tx.type === 'game_wager' ? 'bg-red-500/10 text-red-500' :
                                    'bg-indigo-500/10 text-indigo-500'
                                  }`}>
                                    {tx.type === 'deposit' && <ArrowDownLeft size={18} />}
                                    {tx.type === 'withdrawal' && <ArrowUpRight size={18} />}
                                    {tx.type === 'game_wager' && <Shield size={18} />}
                                    {tx.type === 'game_win' && <Coins size={18} />}
                                    {tx.type === 'commission' && <TrendingUp size={18} />}
                                    {tx.type === 'referral_bonus' && <Gift size={18} />}
                                  </div>
                                  <div>
                                    <div className="font-black italic uppercase text-xs">{tx.type.replace('_', ' ')}</div>
                                    <div className="text-[10px] opacity-30 font-medium italic">{new Date(tx.created_at).toLocaleString()}</div>
                                  </div>
                               </div>
                            </td>
                            <td className="p-8">
                               <div className="font-black italic uppercase text-xs">{tx.username}</div>
                               <div className="text-[10px] opacity-30 font-medium">{tx.email}</div>
                            </td>
                            <td className="p-8 italic font-black text-lg">
                               <span className={tx.amount > 0 ? 'text-green-500' : 'text-red-500'}>
                                 {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                               </span>
                            </td>
                            <td className="p-8">
                               <div className="text-[10px] font-mono opacity-40 bg-white/5 px-2 py-1 rounded inline-block">
                                 {tx.reference || tx.id.substring(0, 8)}
                               </div>
                            </td>
                            <td className="p-8">
                               <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase italic tracking-wider ${
                                 tx.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                 tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                 'bg-red-500/10 text-red-500'
                               }`}>
                                 {tx.status}
                               </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tournaments' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 text-white">
                {tournaments.length === 0 ? (
                  <div className="col-span-full p-24 text-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-30 italic">
                    No scheduled tournaments found.
                  </div>
                ) : ( tournaments.map(t => (
                    <div key={t.id} className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Trophy size={80} />
                      </div>
                      <div className="flex justify-between items-start relative z-10">
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">Tournament Event</div>
                          <div className="text-xl font-black italic">{t.name}</div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase italic ${
                          t.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400' :
                          t.status === 'ongoing' ? 'bg-green-500/10 text-green-400 animate-pulse' :
                          'bg-white/10 text-white/40'
                        }`}>
                          {t.status}
                        </div>
                      </div>

                      <div className="space-y-4 relative z-10">
                        <div className="flex justify-between text-xs font-black uppercase tracking-tight">
                          <span className="text-white/40">Prize Pool</span>
                          <span className="text-green-500">${t.prize_pool}</span>
                        </div>
                        <div className="flex justify-between text-xs font-black uppercase tracking-tight">
                          <span className="text-white/40">Entry Fee</span>
                          <span className="text-orange-500">${t.entry_fee}</span>
                        </div>
                        <div className="flex justify-between text-xs font-black uppercase tracking-tight">
                          <span className="text-white/40">Participants</span>
                          <span className="text-white">{t.participants} Joined</span>
                        </div>
                        <div className="pt-4 space-y-2">
                           <div className="text-[9px] font-black uppercase opacity-20 italic">Event Timeline</div>
                           <div className="text-[10px] font-medium text-white/40">
                             {new Date(t.start_date).toLocaleDateString()} - {new Date(t.end_date).toLocaleDateString()}
                           </div>
                        </div>
                        <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all italic tracking-tighter shadow-lg shadow-black/20">
                          Manage Tournament
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'withdrawals' && (
              <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden text-white">
                <div className="divide-y divide-white/5">
                  {withdrawals.length === 0 ? (
                    <div className="p-24 text-center space-y-4 opacity-20">
                      <Check size={64} className="mx-auto" />
                      <div className="text-sm font-black uppercase tracking-widest italic">All payout logs cleared</div>
                    </div>
                  ) : (
                    withdrawals.map(w => (
                      <div key={w.id} className="p-10 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-white/[0.02] transition-all">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 bg-gradient-to-br from-white/10 to-white/5 rounded-[1.2rem] flex items-center justify-center font-black text-lg border border-white/10 italic text-orange-500">
                             {w.username.substring(0, 1).toUpperCase()}
                           </div>
                           <div className="space-y-1">
                              <div className="font-black italic uppercase text-xl leading-none">{w.username}</div>
                              <div className="text-[10px] opacity-30 font-medium italic mb-1">Requested: {new Date(w.requested_at).toLocaleString()}</div>
                              <div className="flex items-center gap-3">
                                <span className="px-2 py-0.5 bg-white/10 text-[9px] font-black uppercase rounded italic text-white/40">{w.provider}</span>
                                <span className="text-lg font-black text-orange-500 italic px-2">${Number(w.amount || 0).toFixed(2)}</span>
                              </div>
                              <div className="text-[11px] font-medium text-white/20 font-mono italic max-w-[200px] sm:max-w-sm overflow-hidden text-ellipsis whitespace-nowrap">
                                {w.phone_number}
                              </div>
                           </div>
                        </div>
                        <div className="flex gap-4 w-full sm:w-auto">
                           <button 
                             onClick={() => handleWithdrawalAction(w.id, 'approve')}
                             className="flex-1 sm:flex-none px-8 py-4 bg-green-500 text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-green-500/20 italic"
                           >
                             Authorize
                           </button>
                           <button 
                             onClick={() => handleWithdrawalAction(w.id, 'reject')}
                             className="flex-1 sm:flex-none px-8 py-4 bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-500 hover:text-white transition-all italic border border-white/10"
                           >
                             Reject
                           </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'matches' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 text-white">
                {liveMatches.length === 0 ? (
                  <div className="col-span-full p-24 text-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-30 italic">
                    No active combat deployments detected.
                  </div>
                ) : ( liveMatches.map(m => (
                    <div key={m.id} className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity size={80} />
                      </div>
                      <div className="flex justify-between items-start relative z-10">
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">Arena Deployment</div>
                          <div className="text-xl font-black italic">CODE: {m.room_code || 'N/A'}</div>
                          <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-1">Host: {m.creator_name || 'System'}</div>
                        </div>
                        <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase italic ${m.privacy === 'private' ? 'bg-indigo-500/20 text-indigo-500' : 'bg-green-500/20 text-green-500'}`}>
                          {m.privacy}
                        </div>
                      </div>

                      <div className="space-y-4 relative z-10">
                        <div className="flex justify-between text-xs font-black uppercase tracking-tight">
                          <span className="text-white/40">Engagement Stake</span>
                          <span className="text-orange-500">${m.entry_fee}</span>
                        </div>
                        <div className="flex justify-between text-xs font-black uppercase tracking-tight">
                          <span className="text-white/40">Combatants</span>
                          <span className="text-white">{m.players || 'No active'} ({m.current_players}/{m.player_limit})</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
                          <span className="text-white/20 italic">Status</span>
                          <span className="text-white/60">{m.status}</span>
                        </div>
                        <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all italic tracking-tighter">
                          Tactical Oversee
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-[3.5rem] overflow-hidden text-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1200px]">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                          <th className="p-8 text-[10px] font-black uppercase opacity-40">Match Stats</th>
                          <th className="p-8 text-[10px] font-black uppercase opacity-40">Combatants</th>
                          <th className="p-8 text-[10px] font-black uppercase opacity-40">Dice / State</th>
                          <th className="p-8 text-[10px] font-black uppercase opacity-40">Economic Result</th>
                          <th className="p-8 text-[10px] font-black uppercase opacity-40">Timeline</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {matchHistory.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-24 text-center opacity-30 italic font-medium">No archived engagements found.</td>
                          </tr>
                        ) : (
                          matchHistory.map(m => (
                            <tr key={m.id} className="hover:bg-white/[0.02] transition-colors group">
                              <td className="p-8">
                                <div className="space-y-1">
                                  <div className="font-black italic uppercase text-sm">Match #{m.id.substring(0, 8)}</div>
                                  <div className="text-[10px] font-black uppercase text-indigo-500 tracking-tighter">Room: {m.room_code || 'N/A'}</div>
                                  <div className="flex gap-2 mt-2">
                                    <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[8px] font-black uppercase rounded italic">Winner: {m.winner || 'None'}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-8">
                                <div className="text-[10px] font-black uppercase opacity-40 mb-2 italic">Players</div>
                                <div className="flex flex-wrap gap-2">
                                  {(() => {
                                    try {
                                      const p = JSON.parse(m.players);
                                      return p.map((player: string, i: number) => (
                                        <span key={i} className="px-2 py-1 bg-white/5 rounded-lg text-[10px] font-black uppercase border border-white/5 italic">{player}</span>
                                      ));
                                    } catch (e) {
                                      return <span className="text-[10px] opacity-30 italic">No player data</span>;
                                    }
                                  })()}
                                </div>
                              </td>
                              <td className="p-8">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex flex-col items-center justify-center border border-white/10 group-hover:border-orange-500/50 transition-colors">
                                    <div className="text-[9px] font-black uppercase opacity-40 leading-none">Dice</div>
                                    <div className="text-xl font-black italic text-orange-500">{m.dice_value || '-'}</div>
                                  </div>
                                  <div>
                                    <div className="text-[9px] font-black uppercase opacity-30">Turn</div>
                                    <div className="text-xs font-black italic">{m.current_turn || 'Finished'}</div>
                                    <div className="text-[9px] font-black uppercase text-indigo-500/60 mt-1">Board Sync: Secure</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-8">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center gap-4">
                                    <span className="text-[9px] font-black uppercase opacity-30">Pot</span>
                                    <span className="text-lg font-black text-green-500 italic">${Number(m.pot_amount || 0).toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between items-center gap-4 border-t border-white/5 pt-2">
                                    <span className="text-[9px] font-black uppercase opacity-30">Tax</span>
                                    <span className="text-sm font-black text-orange-500 italic">-${Number(m.commission_taken || 0).toFixed(2)}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-8 font-medium italic text-[10px] text-white/40">
                                <div className="space-y-1">
                                  <div>Started: {m.started_at ? new Date(m.started_at).toLocaleString() : 'N/A'}</div>
                                  <div>Ended: {m.ended_at ? new Date(m.ended_at).toLocaleString() : m.created_at ? new Date(m.created_at).toLocaleString() : 'N/A'}</div>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'fraud' && (
              <div className="space-y-6 text-white">
                {fraudAlerts.map(alert => (
                  <div key={alert.id} className={`p-10 border rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8 transition-all ${alert.severity === 'high' ? 'bg-red-500/10 border-red-500/30 shadow-2xl shadow-red-500/5' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex items-center gap-8">
                       <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center border-2 ${alert.severity === 'high' ? 'bg-red-500 text-black border-red-500' : 'bg-white/10 text-orange-500 border-white/5'}`}>
                         <AlertTriangle size={32} />
                       </div>
                       <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="font-black italic uppercase text-2xl tracking-tighter leading-none">{alert.username}</span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase italic ${alert.severity === 'high' ? 'bg-red-500 text-black' : 'bg-white/10 text-white/60'}`}>{alert.severity} RISK</span>
                          </div>
                          <p className="text-white/40 text-sm font-medium italic">{alert.reason}</p>
                          <div className="text-[10px] font-black uppercase text-white/20 tracking-widest">User ID: {alert.id}</div>
                       </div>
                    </div>
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                       <button className="px-10 py-5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] hover:scale-105 transition-all italic">Isolation Mode</button>
                       <button className="px-10 py-5 bg-white/5 text-white/30 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] hover:bg-white/10 transition-all italic border border-white/5">False Positive</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, count, isAlert }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${active ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
    >
      <div className="flex items-center gap-4">
        <span className={active ? '' : 'group-hover:text-orange-500 transition-colors'}>{icon}</span>
        <span className="text-[11px] font-black uppercase italic tracking-widest">{label}</span>
      </div>
      {count !== undefined && (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isAlert ? 'bg-red-500 text-white' : active ? 'bg-white/20 text-white' : 'bg-white/10 text-white/40'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

function StatCard({ title, value, trend, icon, color }: any) {
  return (
    <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-4 hover:bg-white/[0.07] transition-all group">
       <div className="flex justify-between items-start">
          <div className={`p-3 bg-white/5 rounded-xl ${color} group-hover:scale-110 transition-transform`}>{icon}</div>
          <div className={`px-2 py-1 bg-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest ${typeof trend === 'string' ? 'text-blue-500' : trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {typeof trend === 'string' ? trend : `${trend > 0 ? '+' : ''}${trend}%`}
          </div>
       </div>
       <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-widest opacity-30 font-black italic text-white">{title}</div>
          <div className={`text-4xl font-black italic tracking-tighter ${color}`}>{value}</div>
       </div>
    </div>
  );
}

function IntelligenceRow({ label, value, trend, isStatus }: any) {
  return (
    <div className="flex justify-between items-center group/row">
       <div className="space-y-0.5">
          <div className="text-[10px] font-black uppercase opacity-20 group-hover/row:opacity-40 transition-opacity">{label}</div>
          <div className="text-sm font-black italic text-white">{value}</div>
       </div>
       <div className={`text-[10px] font-black italic ${isStatus ? 'text-indigo-500' : trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {isStatus ? trend : `${trend > 0 ? '+' : ''}${trend}%`}
       </div>
    </div>
  );
}
