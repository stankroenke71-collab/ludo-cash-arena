import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Lobby from './pages/Lobby';
import GameRoom from './pages/GameRoom';
import Wallet from './pages/Wallet';
import Admin from './pages/Admin';
import Landing from './pages/Landing';
import Tournaments from './pages/Tournaments';
import Profile from './pages/Profile';
import Referral from './pages/Referral';
import Notifications from './pages/Notifications';
import Navbar from './components/Navbar';

export default function App() {
  const { user, token, setUser, setToken } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setToken(null);
        } else {
          setUser(data);
        }
      })
      .catch(() => setToken(null));
    }
  }, [token, user, setUser, setToken]);

  return (
    <Router>
      <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30 font-sans">
        <Navbar />
        <main className="container mx-auto px-4 py-8 lg:py-12">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/lobby" element={user ? <Lobby /> : <Navigate to="/login" />} />
            <Route path="/room/:id" element={user ? <GameRoom /> : <Navigate to="/login" />} />
            <Route path="/wallet" element={user ? <Wallet /> : <Navigate to="/login" />} />
            <Route path="/tournaments" element={user ? <Tournaments /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/referral" element={user ? <Referral /> : <Navigate to="/login" />} />
            <Route path="/notifications" element={user ? <Notifications /> : <Navigate to="/login" />} />
            <Route path="/admin" element={user ? <Admin /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
