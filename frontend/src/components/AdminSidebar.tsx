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
  Sun,
  Moon,
  Clock,
  Gauge,
  LineChart,
  Activity,
  BrainCircuit,
  Flame,
  Wrench,
  Boxes,
  FileSpreadsheet,
  Bell,
  Home,
  AlertTriangle,
  Users,
  ScrollText,
  Cpu,
  Upload
} from 'lucide-react';

export type AdminTab = 
  | 'dashboard'
  | 'pumps'
  | 'sensors'
  | 'measurements'
  | 'ml-predictions'
  | 'anomalies'
  | 'failure-events'
  | 'maintenance'
  | 'manual-input'
  | 'import-data'
  | 'data-imports'
  | 'equipment'
  | 'sensor-management'
  | 'users'
  | 'activity-log'
  | 'system';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  children: React.ReactNode;
}

export const AdminSidebarLayout: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
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

  const isAdmin = user?.role === 'admin';

  const menuGroups = [
    {
      groupTitle: 'MONITORING',
      items: [
        { id: 'dashboard' as AdminTab, label: 'Station Overview', icon: LayoutDashboard },
        { id: 'pumps' as AdminTab, label: 'Pumps (Slots)', icon: Gauge },
        { id: 'sensors' as AdminTab, label: 'Sensors', icon: Activity },
        { id: 'measurements' as AdminTab, label: 'Measurements', icon: LineChart },
      ]
    },
    {
      groupTitle: 'PREDICTIVE MAINTENANCE',
      items: [
        { id: 'ml-predictions' as AdminTab, label: 'AI Predictions', icon: BrainCircuit },
        { id: 'anomalies' as AdminTab, label: 'Anomalies', icon: Flame },
        { id: 'failure-events' as AdminTab, label: 'Failure History', icon: Flame },
        { id: 'maintenance' as AdminTab, label: 'Maintenance', icon: Wrench },
      ]
    },
    {
      groupTitle: 'DATA',
      items: [
        { id: 'manual-input' as AdminTab, label: 'Manual Input', icon: HardDrive },
        { id: 'import-data' as AdminTab, label: 'Import Data', icon: Upload },
        { id: 'data-imports' as AdminTab, label: 'Import History', icon: FileSpreadsheet },
      ]
    },
    {
      groupTitle: 'MANAGEMENT',
      items: [
        { id: 'equipment' as AdminTab, label: 'Equipment (Aset)', icon: Boxes },
        { id: 'sensor-management' as AdminTab, label: 'Sensor Management', icon: Cpu },
        ...(isAdmin ? [
          { id: 'users' as AdminTab, label: 'Users & Roles', icon: Users },
          { id: 'activity-log' as AdminTab, label: 'Activity Log', icon: ScrollText },
          { id: 'system' as AdminTab, label: 'Settings & System', icon: Server },
        ] : []),
      ]
    }
  ];

  const handleTabClick = (tab: AdminTab) => {
    onSelectTab(tab);
    setIsMobileOpen(false);
  };

  const getBreadcrumbTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'RASTA Booster Pump Monitoring System • Station Overview';
      case 'pumps':
        return 'Monitoring Slot Operasi & Pompa';
      case 'sensors':
        return 'Monitoring Status & Matriks Sensor Lapangan';
      case 'measurements':
        return 'Analitik Deret Waktu & Log Pengukuran (Measurements)';
      case 'ml-predictions':
        return 'Diagnostik Kecerdasan Buatan & Prediksi AI / ML';
      case 'anomalies':
        return 'Deteksi Anomali Sinyal & Getaran (Anomalies)';
      case 'failure-events':
        return 'Riwayat Kegagalan & Linimasa Kerusakan';
      case 'maintenance':
        return 'Pemeliharaan, Servis & Work Order';
      case 'equipment':
        return 'Manajemen Aset Fisik Pompa & Master Peralatan';
      case 'sensor-management':
        return 'Manajemen Inventaris & Penggantian Sensor Fisik';
      case 'import-data':
        return 'Import Data Telemetri & Log Batch (Import Wizard)';
      case 'data-imports':
        return 'Audit Provenance & Riwayat File Import';
      case 'manual-input':
        return 'Input Pengukuran Manual Lapangan';
      case 'users':
        return 'Manajemen Pengguna, Peran (RBAC) & Akses Akun';
      case 'activity-log':
        return 'Jejak Audit Sistem & Log Aktivitas (Traceability)';
      case 'system':
        return 'Status Sistem & Database';
      default:
        return 'RASTA Booster Pump Monitoring';
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

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 flex flex-col justify-between bg-[#0B132B] border-r border-slate-800/80 text-slate-300 shadow-xl transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Brand Header */}
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

          {/* Grouped Navigation Links */}
          <div className="p-3.5 space-y-5 flex-1">
            {menuGroups.map((group, gIdx) => (
              <div key={gIdx}>
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider mb-2 text-slate-400">
                  {group.groupTitle}
                </p>

                <nav className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-white shrink-0" />}
                      </button>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* User Profile & Logout Footer */}
          <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/40 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400 text-xs shrink-0">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{user?.username || 'admin'}</p>
                </div>
              </div>

              <button
                onClick={logout}
                title="Keluar / Logout"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Top Header Bar (Mobile: h-14/56px with ☰ RASTA 🔔 👤, Desktop: h-16 rich breadcrumb) */}
        <header className={`sticky top-0 z-30 h-14 md:h-16 border-b transition-colors px-3 sm:px-6 flex items-center justify-between backdrop-blur-md ${
          theme === 'dark' 
            ? 'bg-[#070D1E]/90 border-slate-800/80 text-white' 
            : 'bg-white/90 border-slate-200/90 text-slate-800 shadow-xs'
        }`}>
          {/* Left: Mobile Menu Toggle & Logo */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsMobileOpen(true)}
              className={`p-2 rounded-xl border transition-colors md:hidden ${
                theme === 'dark' ? 'border-slate-800 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title="Buka Menu Sidebar"
              aria-label="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Logo: Clean badge */}
            <div className="h-8 px-2.5 bg-white rounded-lg flex items-center justify-center shadow-xs border border-white/50 md:hidden shrink-0 overflow-hidden">
              <img src="/logo-tr.png" alt="RASTA" className="h-5 max-h-5 w-auto object-contain block" />
            </div>

            {/* Desktop Breadcrumb Title */}
            <div className="hidden md:block">
              <h1 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <span>{getBreadcrumbTitle()}</span>
              </h1>
            </div>
          </div>

          {/* Right: Actions, Warning Indicator, Theme & Profile */}
          <div className="flex items-center gap-2">
            {/* Live Clock (Desktop only) */}
            <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium ${
              theme === 'dark' ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <Clock className="w-3.5 h-3.5 text-cyan-500" />
              <span>{currentTime}</span>
            </div>

            {/* Sticky Warning Indicator (Mobile & Desktop) */}
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] font-black"
              title="1 Pompa Membutuhkan Perhatian (Pump C Warning)"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>1</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`w-8 h-8 flex items-center justify-center rounded-xl border transition-colors ${
                theme === 'dark'
                  ? 'bg-slate-900/80 border-slate-800 text-amber-400 hover:bg-slate-800'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title={theme === 'dark' ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Mobile User Avatar */}
            <div className="md:hidden flex items-center">
              <div 
                onClick={() => setIsMobileOpen(true)}
                className="w-8 h-8 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center font-black text-cyan-400 text-xs cursor-pointer"
                title={user?.name || 'Administrator'}
              >
                {user?.name?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Body Container */}
        <main className="p-3.5 sm:p-6 lg:p-8 flex-1 pb-24 md:pb-8">
          {children}
        </main>

        {/* Sticky Mobile Bottom Navigation (Admin Tasks: Overview, Pumps, Alerts, More) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0E1726]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 px-4 py-2">
          <div className="max-w-md mx-auto flex items-center justify-around">
            <button
              type="button"
              onClick={() => handleTabClick('dashboard')}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
                currentTab === 'dashboard'
                  ? 'text-cyan-600 dark:text-cyan-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px]">Overview</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('pumps')}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
                currentTab === 'pumps'
                  ? 'text-cyan-600 dark:text-cyan-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <Gauge className="w-5 h-5" />
              <span className="text-[10px]">Pumps</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleTabClick('dashboard');
                // Scroll down to alerts section if on mobile
                setTimeout(() => {
                  const alertsEl = document.getElementById('mobile-alerts-section');
                  if (alertsEl) alertsEl.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium relative"
            >
              <Bell className="w-5 h-5" />
              <span className="text-[10px]">Alerts</span>
              <span className="absolute top-0.5 right-2 w-2 h-2 rounded-full bg-amber-500" />
            </button>

            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
            >
              <Menu className="w-5 h-5" />
              <span className="text-[10px]">More</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};
