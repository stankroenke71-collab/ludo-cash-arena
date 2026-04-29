import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Shield, User as UserIcon, Camera, LayoutGrid, Clock, Trophy, Star, Zap } from 'lucide-react';

export default function Profile() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      {/* Profile Header */}
      <header className="relative p-12 bg-white/5 border border-white/10 rounded-[4rem] overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="relative group">
            <div className="w-40 h-40 rounded-[3rem] border-4 border-orange-500 overflow-hidden shadow-2xl shadow-orange-500/20 transition-transform group-hover:scale-105 duration-500">
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-2 right-2 p-3 bg-white text-black rounded-2xl shadow-xl hover:bg-orange-500 hover:text-white transition-all">
              <Camera size={18} />
            </button>
          </div>

          <div className="text-center md:text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] uppercase font-black tracking-widest border border-white/10">
              Elite Member
            </div>
            <h1 className="text-5xl font-black italic uppercase leading-none">{user.username}</h1>
            <p className="text-white/40 font-medium">Joined {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} • {user.email}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="px-6 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center gap-2">
                 <Trophy size={14} className="text-orange-500" />
                 <span className="text-xs font-bold uppercase tracking-widest">1,240 XP</span>
              </div>
              <div className="px-6 py-2 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2">
                 <Star size={14} className="text-green-500" />
                 <span className="text-xs font-bold uppercase tracking-widest">Lv. 14 Knight</span>
              </div>
            </div>
          </div>

          <div className="md:ml-auto grid grid-cols-2 gap-4">
             <div className="p-6 bg-white/5 rounded-3xl text-center space-y-1">
                <div className="text-xs uppercase font-bold opacity-30 italic">Win Rate</div>
                <div className="text-2xl font-black italic">64%</div>
             </div>
             <div className="p-6 bg-white/5 rounded-3xl text-center space-y-1">
                <div className="text-xs uppercase font-bold opacity-30 italic">Matches</div>
                <div className="text-2xl font-black italic">142</div>
             </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation */}
        <aside className="col-span-1 space-y-2">
           {[
             { id: 'overview', label: 'Overview', icon: LayoutGrid },
             { id: 'security', label: 'Security', icon: Shield },
             { id: 'stats', label: 'Match Stats', icon: Trophy },
             { id: 'history', label: 'Activity', icon: Clock },
             { id: 'settings', label: 'Settings', icon: Settings },
           ].map(item => (
             <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all ${
                  activeTab === item.id ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'text-white/40 hover:bg-white/5 hover:text-white'
                }`}
             >
                <item.icon size={18} /> {item.label}
             </button>
           ))}
        </aside>

        {/* Content */}
        <main className="col-span-1 md:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-4">
                      <h3 className="text-lg font-bold italic uppercase">Biosketch</h3>
                      <textarea 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white/60 min-h-[120px] outline-none focus:border-orange-500 transition-colors resize-none"
                        placeholder="Tell the arena about yourself..."
                      />
                      <button className="px-6 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-orange-500 hover:text-white transition-all">Save Bio</button>
                   </div>
                   <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-4">
                      <h3 className="text-lg font-bold italic uppercase italic">Account Status</h3>
                      <div className="space-y-4">
                         <div className="flex justify-between items-center text-sm">
                            <span className="opacity-40 uppercase tracking-widest font-bold text-[10px]">KYC Verification</span>
                            <span className="text-green-500 font-bold italic uppercase text-[10px] bg-green-500/10 px-2 py-0.5 rounded-full">Verified</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="opacity-40 uppercase tracking-widest font-bold text-[10px]">Mobile Linked</span>
                            <span className="text-orange-500 font-bold italic uppercase text-[10px] bg-orange-500/10 px-2 py-0.5 rounded-full">Update</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="opacity-40 uppercase tracking-widest font-bold text-[10px]">2FA Status</span>
                            <span className="text-red-500 font-bold italic uppercase text-[10px] bg-red-500/10 px-2 py-0.5 rounded-full">Disabled</span>
                         </div>
                      </div>
                   </div>
                </div>

                <section className="space-y-6">
                  <h3 className="text-2xl font-black italic uppercase italic">Achievements</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {[
                       { name: 'First Kill', desc: 'Sent an opponent home', color: 'bg-red-500' },
                       { name: 'Streak', desc: 'Won 5 matches in a row', color: 'bg-orange-500' },
                       { name: 'Whale', desc: 'Held $1,000 in balance', color: 'bg-yellow-500' },
                       { name: 'Elite', desc: 'Reached rank 500+', color: 'bg-blue-500' }
                     ].map((a, i) => (
                       <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-3xl text-center space-y-3 group hover:bg-white/10 transition-all">
                          <div className={`w-12 h-12 ${a.color} rounded-2xl mx-auto flex items-center justify-center rotate-45 group-hover:rotate-0 transition-transform`}>
                             <Trophy size={18} className="-rotate-45 group-hover:rotate-0 transition-transform" />
                          </div>
                          <div>
                            <div className="text-xs font-bold uppercase italic">{a.name}</div>
                            <p className="text-[10px] opacity-30 mt-1">{a.desc}</p>
                          </div>
                       </div>
                     ))}
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 p-12 bg-white/5 border border-white/10 rounded-[3rem]"
              >
                <div className="space-y-2">
                   <h2 className="text-3xl font-black italic uppercase italic">Vault Protection</h2>
                   <p className="text-white/40 text-sm">Manage your account security and authentication methods.</p>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-6">
                         <div className="p-4 bg-orange-500/10 text-orange-500 rounded-xl"><Shield size={24} /></div>
                         <div>
                            <div className="font-bold text-lg italic uppercase">Password Update</div>
                            <div className="text-xs opacity-40">Last changed 4 months ago</div>
                         </div>
                      </div>
                      <button className="px-6 py-2 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">Change</button>
                   </div>
                   <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-6">
                         <div className="p-4 bg-blue-500/10 text-blue-500 rounded-xl"><Shield size={24} /></div>
                         <div>
                            <div className="font-bold text-lg italic uppercase">Session Lockdown</div>
                            <div className="text-xs opacity-40">Actively monitor all current logins</div>
                         </div>
                      </div>
                      <button className="px-6 py-2 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">Review</button>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
