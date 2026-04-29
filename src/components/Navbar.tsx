import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Wallet, Trophy, User, LogOut, LayoutDashboard, Bell, Gift, Users, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, children }: { to: string; icon: any; children: React.ReactNode }) => (
    <Link 
      to={to} 
      className={`relative flex items-center gap-2 group transition-all duration-300 ${isActive(to) ? 'text-orange-500' : 'text-white/60 hover:text-white'}`}
    >
      <Icon size={18} className={isActive(to) ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
      <span className="text-xs font-bold uppercase tracking-widest">{children}</span>
      {isActive(to) && (
        <motion.div 
          layoutId="nav-underline"
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-orange-500 shadow-[0_0_10px_#f97316]"
        />
      )}
    </Link>
  );

  return (
    <nav className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-[100]">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black tracking-tighter flex items-center gap-3">
          <div className="relative w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center rotate-45 shadow-[0_0_20px_rgba(249,115,22,0.4)]">
            <div className="w-5 h-5 bg-white rounded-full -rotate-45" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="bg-gradient-to-r from-white via-white to-orange-500 bg-clip-text text-transparent italic text-xl">LUDO CASH</span>
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-orange-500/80">Arena Elite</span>
          </div>
        </Link>

        {user && (
          <div className="hidden lg:flex items-center gap-10">
            <NavLink to="/dashboard" icon={LayoutDashboard}>Home</NavLink>
            <NavLink to="/lobby" icon={Trophy}>Battles</NavLink>
            <NavLink to="/tournaments" icon={Trophy}>Tournaments</NavLink>
            <NavLink to="/referral" icon={Users}>Referrals</NavLink>
            {user.is_admin && <NavLink to="/admin" icon={ShieldAlert}>Admin Portal</NavLink>}
          </div>
        )}

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-3 pr-4 border-r border-white/10">
                <Link to="/notifications" className={`p-2 rounded-xl transition-all ${isActive('/notifications') ? 'bg-orange-500/20 text-orange-500' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                  <Bell size={20} />
                </Link>
                <Link to="/wallet" className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group">
                  <Wallet size={18} className="text-orange-500 group-hover:rotate-12 transition-transform" />
                  <span className="font-black text-sm italic">${user.balance.toFixed(2)}</span>
                </Link>
              </div>

              <Link to="/profile" className="w-10 h-10 rounded-xl border border-white/10 overflow-hidden hover:border-orange-500 transition-colors">
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </Link>
              
              <button 
                onClick={logout}
                className="p-2 text-white/40 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-6">
              <Link to="/login" className="text-xs font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors">
                Log In
              </Link>
              <Link 
                to="/register" 
                className="px-6 py-3 bg-orange-500 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-orange-600 transition-all hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]"
              >
                Join Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
