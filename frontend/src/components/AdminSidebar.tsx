import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
  Activity,
  Lock,
  Clock
} from 'lucide-react';

interface AdminSidebarProps {
  currentTab: 'dashboard' | 'uploads' | 'system';
  onSelectTab: (tab: 'dashboard' | 'uploads' | 'system') => void;
  children: React.ReactNode;
}

export const AdminSidebarLayout: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  children,
}) => {
  const { user, logout } = useAuth();
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
      description: 'Ringkasan KPI & Storage',
      icon: LayoutDashboard,
    },
    {
      id: 'uploads' as const,
      label: 'Audit & Media Uploads',
      description: 'Manajemen Berkas YYYY/MM/DD',
      icon: HardDrive,
    },
    {
      id: 'system' as const,
      label: 'Status Sistem & Database',
      description: 'Fastify API & MySQL Info',
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
        return 'Dashboard Utama & Ringkasan KPI';
      case 'uploads':
        return 'Audit Berkas & Direktori Unggahan';
      case 'system':
        return 'Status Infrastruktur Sistem & Database';
      default:
        return 'Dashboard Admin';
    }
  };

  return (
    <div className="min-h-screen bg-[#070D1E] text-slate-100 flex relative overflow-x-hidden font-sans">
      {/* Ambient background glow matching Vibrasi AI */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(6,182,212,0.12),rgba(255,255,255,0))]" />

      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar (Desktop Persistent & Mobile Slide-over) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0B132B]/95 backdrop-blur-xl border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl shadow-cyan-950/50' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Sidebar Header with RASTA Logo */}
          <div className="h-18 px-5 py-4 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-[#070D1E]/60">
            <div className="flex items-center gap-3">
              <div className="h-10 px-3 bg-white rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.25)] border border-white/40">
                <img src="/logo-tr.png" alt="RASTA Logo" className="h-6 w-auto object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold tracking-wider text-white">RASTA IT COM</span>
                <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  PORTAL ADMINISTRATOR
                </span>
              </div>
            </div>

            {/* Close Button on Mobile */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Section */}
          <div className="p-4 space-y-6 flex-1">
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-cyan-400" />
                Navigasi Utama
              </p>

              <nav className="space-y-1.5">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-cyan-500 text-white font-bold shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/70 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20' : 'bg-slate-800/80 text-cyan-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs">{item.label}</div>
                          <div className={`text-[10px] ${isActive ? 'text-cyan-100' : 'text-slate-400'}`}>
                            {item.description}
                          </div>
                        </div>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 text-white" />}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Storage & System Live Widget in Sidebar */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0F1A36] to-[#0B132B] border border-slate-800 shadow-inner space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  Struktur Penyimpanan
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  READY
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Hirarki Berkas:</span>
                  <span className="text-cyan-300 font-bold">YYYY/MM/DD</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full w-2/3 animate-pulse"></div>
                </div>
              </div>

              {/* Connected Services */}
              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="text-slate-400 flex items-center gap-1">
                    <Database className="w-3 h-3 text-emerald-400" />
                    MySQL DB
                  </div>
                  <div className="font-bold text-emerald-400 truncate mt-0.5">rasta_it_db</div>
                </div>

                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="text-slate-400 flex items-center gap-1">
                    <Server className="w-3 h-3 text-cyan-400" />
                    Fastify API
                  </div>
                  <div className="font-bold text-cyan-400 truncate mt-0.5">Port 5000</div>
                </div>
              </div>
            </div>

            {/* Quick Security Badge */}
            <div className="px-3.5 py-2.5 rounded-xl bg-blue-950/30 border border-blue-900/40 text-[11px] text-slate-400 flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Enkripsi hashing otomatis aktif pada setiap unggahan.</span>
            </div>
          </div>

          {/* Sidebar Footer User Info & Logout */}
          <div className="p-4 border-t border-slate-800/80 bg-[#070D1E]/80 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0">
                  A
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
                  <p className="text-[10px] text-cyan-400 truncate font-mono">@{user?.username || 'admin'}</p>
                </div>
              </div>

              <button
                onClick={logout}
                title="Keluar dari sesi Admin"
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-slate-800 hover:border-red-500/30 shrink-0 flex items-center gap-1 text-xs font-semibold"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-72 w-full min-w-0 z-10">
        {/* Top Navbar Header (Unified across Desktop & Mobile) */}
        <header className="h-18 bg-[#0B132B]/85 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Logo */}
            <div className="h-8 px-2 bg-white rounded-lg flex items-center justify-center md:hidden">
              <img src="/logo-tr.png" alt="RASTA Logo" className="h-5 w-auto object-contain" />
            </div>

            {/* Desktop Breadcrumbs & Section Title */}
            <div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                <span>Portal Admin</span>
                <span>/</span>
                <span className="text-cyan-400">{currentTab.toUpperCase()}</span>
              </div>
              <h1 className="text-sm sm:text-base font-extrabold text-white tracking-wide truncate">
                {getBreadcrumbTitle()}
              </h1>
            </div>
          </div>

          {/* Right Status Indicators */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live Clock Indicator */}
            {currentTime && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-cyan-300">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{currentTime}</span>
              </div>
            )}

            {/* Database Pulse Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>MySQL: Connected</span>
            </div>

            {/* Mobile Logout Button */}
            <button
              onClick={logout}
              title="Logout"
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
