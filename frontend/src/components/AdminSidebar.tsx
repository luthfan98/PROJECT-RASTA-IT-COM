import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  HardDrive, 
  Menu, 
  X, 
  LogOut, 
  ShieldCheck, 
  Server,
  ChevronRight,
  Database,
  Layers,
  Sun,
  Moon,
  Clock,
  RefreshCw
} from 'lucide-react';

interface AdminSidebarProps {
  currentTab: 'dashboard' | 'uploads' | 'system';
  onSelectTab: (tab: 'dashboard' | 'uploads' | 'system') => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  children: React.ReactNode;
}

export const AdminSidebarLayout: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  onRefresh,
  isRefreshing,
  children,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB'
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard Utama',
      icon: LayoutDashboard,
    },
    {
      id: 'uploads' as const,
      label: 'Audit & Media Uploads',
      icon: HardDrive,
    },
    {
      id: 'system' as const,
      label: 'Status Sistem & DB',
      icon: Server,
    },
  ];

  const handleTabClick = (tab: 'dashboard' | 'uploads' | 'system') => {
    onSelectTab(tab);
    setIsMobileOpen(false);
  };

  const getBreadcrumbTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Dashboard Utama';
      case 'uploads':
        return 'Audit & Media Uploads';
      case 'system':
        return 'Status Sistem & Database';
      default:
        return 'Dashboard Admin';
    }
  };

  return (
    <div className={`min-h-screen flex relative font-sans transition-colors duration-200 ${
      theme === 'dark' ? 'bg-[#070D1E] text-slate-100' : 'bg-[#F1F5F9] text-slate-800'
    }`}>
      {/* Ambient background glow in dark mode */}
      {theme === 'dark' && (
        <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(6,182,212,0.12),rgba(255,255,255,0))]" />
      )}

      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Navigation (Sleek Dark Navy frame anchoring both Light & Dark modes) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 flex flex-col justify-between bg-[#0B132B] border-r border-slate-800/80 text-slate-300 shadow-xl transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Brand Header: Only logo and clean Admin badge (no redundant text!) */}
          <div className="h-16 px-5 border-b border-slate-800/80 bg-[#070D1E]/50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 px-3 bg-white rounded-xl flex items-center justify-center shadow-xs border border-white/40">
                <img src="/logo-tr.png" alt="RASTA" className="h-6 w-auto object-contain" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Admin
              </span>
            </div>

            {/* Close Button on Mobile */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-6 flex-1">
            <div>
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider mb-2 text-slate-400">
                Menu Navigasi
              </p>

              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Compact System & Storage Status Card */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs space-y-2.5 text-slate-300 shadow-inner">
              <div className="flex items-center justify-between font-semibold text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  Penyimpanan
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  READY
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Struktur:</span>
                  <span className="font-semibold text-cyan-300">YYYY/MM/DD</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-800">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full w-2/3"></div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3 text-emerald-400" />
                  MySQL: rasta_it_db
                </span>
                <span className="font-semibold text-emerald-400">Aktif</span>
              </div>
            </div>
          </div>

          {/* User Profile & Logout Footer */}
          <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/40 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">
                    {user?.name || 'Administrator'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">@{user?.username || 'admin'}</p>
                </div>
              </div>

              <button
                onClick={logout}
                title="Keluar dari sesi Admin"
                className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 w-full min-w-0 z-10">
        {/* Single Unified Header Bar */}
        <header className={`h-16 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 border-b backdrop-blur-md transition-colors ${
          theme === 'dark' 
            ? 'bg-[#0B132B]/90 border-slate-800 text-white' 
            : 'bg-white/90 border-slate-200/80 text-slate-800 shadow-xs'
        }`}>
          {/* Left: Mobile Toggle + Logo + Clean Title */}
          <div className="flex items-center gap-3">
            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className={`p-2 rounded-xl border md:hidden transition-colors ${
                theme === 'dark' 
                  ? 'bg-slate-800 border-slate-700 text-slate-200' 
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Brand Logo: only image, no redundant text */}
            <div className="h-8 px-2 bg-white rounded-lg border border-slate-200 shadow-xs flex items-center justify-center md:hidden">
              <img src="/logo-tr.png" alt="RASTA" className="h-5 w-auto object-contain" />
            </div>

            {/* Breadcrumb Title */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                <span className="hidden sm:inline">Portal Admin</span>
                <span className="hidden sm:inline">/</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold uppercase">{currentTab}</span>
              </div>
              <h1 className={`text-sm sm:text-base font-extrabold tracking-tight truncate ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                {getBreadcrumbTitle()}
              </h1>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Clock (Desktop Only) */}
            {currentTime && (
              <div className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono ${
                theme === 'dark' 
                  ? 'bg-slate-900 border-slate-800 text-cyan-300' 
                  : 'bg-slate-100/80 border-slate-200 text-slate-600'
              }`}>
                <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>{currentTime}</span>
              </div>
            )}

            {/* Database Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>MySQL: Connected</span>
            </div>

            {/* Refresh Data Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                title="Segarkan Data"
                className={`p-2 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isRefreshing ? 'Memperbarui...' : 'Segarkan'}</span>
              </button>
            )}

            {/* Theme Toggle Button (Light / Dark) */}
            <button
              onClick={toggleTheme}
              title={`Ubah ke Tema ${theme === 'dark' ? 'Light' : 'Dark'}`}
              className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 ${
                theme === 'dark'
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-300'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-bold hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            {/* Mobile Quick Logout */}
            <button
              onClick={logout}
              title="Logout"
              className={`p-2 rounded-xl border md:hidden transition-colors ${
                theme === 'dark' 
                  ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-red-400' 
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-red-600'
              }`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
