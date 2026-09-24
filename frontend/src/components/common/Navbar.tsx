import React from 'react';
import { Menu, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-white/8 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 backdrop-blur-xl bg-[#0f172a]/80">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 lg:hidden transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-400">Deterministic Engine Active</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/ai')}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition-all duration-200"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Ask AI Adviser
        </button>

        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2.5 cursor-pointer p-1.5 pr-3 rounded-xl hover:bg-white/8 transition-colors"
              title="View Profile"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-bold text-sm text-white shadow-lg">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-white leading-tight">{user.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user.riskProfile} Risk</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/login')}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/8 rounded-lg transition-colors"
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="btn-primary text-xs px-4 py-1.5"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
