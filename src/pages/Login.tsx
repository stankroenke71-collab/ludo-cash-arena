import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'motion/react';
import { Mail, Lock, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setToken(data.token);
      setUser(data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#050505] -z-10 overflow-hidden">
        <div className="absolute top-1/3 -left-1/4 w-[600px] h-[600px] bg-orange-500/10 blur-[150px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-white/5 border border-white/10 rounded-[4rem] p-16 shadow-2xl backdrop-blur-3xl space-y-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <Lock size={160} />
        </div>

        <div className="space-y-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 text-orange-500 rounded-full text-[10px] uppercase font-black tracking-widest border border-orange-500/20 mx-auto">
            <ShieldCheck size={12} /> Combatant Portal
          </div>
          <h2 className="text-5xl font-black italic uppercase leading-none tracking-tighter">System <br /> <span className="text-orange-500">Access</span></h2>
          <p className="text-white/40 text-sm font-medium italic">Enter your credentials to engage in the arena.</p>
        </div>

        {error && <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-xl">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-orange-500 transition-colors"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-orange-500 transition-colors"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white font-black py-4 rounded-2xl hover:bg-orange-600 transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'LOG IN'}
          </button>
        </form>

        <p className="text-center text-white/40 text-sm">
          Don't have an account? <Link to="/register" className="text-white hover:text-orange-500 transition-colors">Sign Up</Link>
        </p>
      </motion.div>
    </div>
  );
}
