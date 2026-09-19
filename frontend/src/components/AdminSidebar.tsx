import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  HardDrive, 
  Menu, 
  X, 
  LogOut, 
  ShieldCheck, 
  Server,
  ChevronRight
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

  const menuItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard Utama',
      description: 'Ringkasan & KPI Storage',
      icon: LayoutDashboard,
    },
    {
      id: 'uploads' as const,
      label: 'Audit & Media Uploads',
      description: 'Direktori YYYY/MM/DD',
      icon: HardDrive,
    },
    {
      id: 'system' as const,
      label: 'Status Sistem & DB',
      description: 'Fastify API & MySQL Info',
      icon: Server,
    },
  ];

  const handleTabClick = (tab: 'dashboard' | 'uploads' | 'system') => {
    onSelectTab(tab);
    setIsMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex">
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar (Desktop Persistent & Mobile Slide-over) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0B132B] border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Sidebar Header with RASTA Logo */}
          <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 px-2.5 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <img src="/logo-tr.png" alt="RASTA Logo" className="h-5 w-auto object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-extrabold tracking-wider text-white">RASTA IT COM</span>
                <span className="text-[10px] font-semibold text-amber-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  PORTAL ADMIN
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

          {/* System Status Pill */}
          <div className="p-4">
            <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-300 font-medium text-[11px]">Server & MySQL</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="px-3 space-y-1.5">
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Menu Navigasi
            </p>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold shadow-glow-cyan'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-xs">{item.label}</div>
                      <div className={`text-[10px] ${isActive ? 'text-cyan-100' : 'text-slate-500'}`}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-200" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User Info & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">@{user?.username}</p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Keluar dari sesi Admin"
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-slate-800 hover:border-red-500/20 shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 w-full min-w-0">
        {/* Mobile Top Navbar with Hamburger */}
        <header className="h-16 bg-[#0B132B] border-b border-slate-800 px-4 flex items-center justify-between md:hidden sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="h-8 px-2 bg-white rounded-lg flex items-center justify-center">
              <img src="/logo-tr.png" alt="RASTA Logo" className="h-5 w-auto object-contain" />
            </div>
            <span className="text-xs font-bold text-white tracking-wide">Portal Admin</span>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
