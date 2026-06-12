import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  History, 
  BrainCircuit, 
  Timer, 
  BookmarkCheck, 
  XOctagon, 
  Settings, 
  LogOut,
  Sun,
  Moon,
  Zap
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  // Apply/remove .dark class on <html> whenever the toggle changes
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Question Bank', path: '/questions', icon: <BookOpen size={20} /> },
    { name: 'PYQ Section', path: '/pyqs', icon: <History size={20} /> },
    { name: 'Practice Mode', path: '/practice', icon: <BrainCircuit size={20} /> },
    { name: 'Speed Round', path: '/speed-round', icon: <Zap size={20} /> },
    { name: 'Mock Tests', path: '/mocktests', icon: <Timer size={20} /> },
    { name: 'Bookmarks', path: '/bookmarks', icon: <BookmarkCheck size={20} /> },
    { name: 'Review Mistakes', path: '/mistakes', icon: <XOctagon size={20} /> },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: <Settings size={20} /> });
  }

  return (
    <div className="w-64 h-screen bg-slate-900 text-slate-300 flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="text-blue-500" />
          PrepWise
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        {/* Dark / Light Mode Toggle */}
        <div className="flex items-center justify-between px-4 py-2 mb-3">
          <span className="text-sm text-slate-400">{dark ? 'Dark Mode' : 'Light Mode'}</span>
          <button
            onClick={() => setDark(!dark)}
            className="relative w-12 h-6 rounded-full bg-slate-700 transition-colors focus:outline-none"
            aria-label="Toggle dark mode"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white flex items-center justify-center transition-transform ${
                dark ? 'translate-x-6' : 'translate-x-0'
              }`}
            >
              {dark ? <Moon size={12} className="text-slate-800" /> : <Sun size={12} className="text-amber-500" />}
            </span>
          </button>
        </div>

        <div className="px-4 py-2 mb-2">
          <p className="text-sm text-slate-400">Logged in as</p>
          <p className="font-semibold text-white truncate">{user?.username}</p>
        </div>
        <button 
          onClick={logout}
          className="flex w-full items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
