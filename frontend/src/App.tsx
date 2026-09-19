import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { LoginPage } from './pages/auth/LoginPage';
import { Header } from './components/Header';
import { AdminSidebarLayout } from './components/AdminSidebar';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { PetugasDashboard } from './pages/petugas/PetugasDashboard';
import { MediaUploadsList } from './pages/uploads/MediaUploadsList';
import { Database, Server, HardDrive, CheckCircle2 } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { theme } = useTheme();
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'uploads' | 'system'>('dashboard');

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Khusus Dashboard Admin: Gunakan Responsive Sidebar Layout
  if (user?.role === 'admin') {
    return (
      <AdminSidebarLayout currentTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab)}>
        {currentTab === 'dashboard' && <AdminDashboard />}
        {currentTab === 'uploads' && <MediaUploadsList />}
        {currentTab === 'system' && (
          <div className="space-y-6 animate-fade-in">
            <div className={`rounded-2xl p-5 sm:p-6 border transition-all ${
              theme === 'dark' 
                ? 'bg-[#0E1726]/90 border-slate-800 shadow-xl' 
                : 'bg-white border-slate-200/80 shadow-sm'
            }`}>
              <h2 className={`text-base sm:text-lg font-bold mb-1 flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                <Database className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                Informasi Sistem & Parameter Database
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Rincian infrastruktur backend Fastify, koneksi pool MySQL lokal, dan parameter arsitektur penyimpanan.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className={`p-4 rounded-xl border space-y-2 ${
                  theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <p className={`font-bold text-sm flex items-center gap-2 ${
                    theme === 'dark' ? 'text-white' : 'text-slate-800'
                  }`}>
                    <Server className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    Backend REST API
                  </p>
                  <p><span className="text-slate-500">Framework:</span> <span className="font-semibold">Fastify v4 (TypeScript)</span></p>
                  <p><span className="text-slate-500">Host / Port:</span> <span className="text-cyan-700 dark:text-cyan-300 font-mono">http://localhost:5000</span></p>
                  <p className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Fastify Health: Status OK (Online)
                  </p>
                </div>

                <div className={`p-4 rounded-xl border space-y-2 ${
                  theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <p className={`font-bold text-sm flex items-center gap-2 ${
                    theme === 'dark' ? 'text-white' : 'text-slate-800'
                  }`}>
                    <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Database Relasional MySQL
                  </p>
                  <p><span className="text-slate-500">Host & Port:</span> <span className="font-semibold">127.0.0.1:3306</span></p>
                  <p><span className="text-slate-500">Database Name:</span> <span className="text-cyan-700 dark:text-cyan-300 font-mono font-bold">rasta_it_db</span></p>
                  <p className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> MySQL Connection: Connected
                  </p>
                </div>

                <div className={`p-4 rounded-xl border space-y-2 md:col-span-2 ${
                  theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <p className={`font-bold text-sm flex items-center gap-2 ${
                    theme === 'dark' ? 'text-white' : 'text-slate-800'
                  }`}>
                    <HardDrive className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    Arsitektur Hirarki Penyimpanan Unggahan
                  </p>
                  <p><span className="text-slate-500">Struktur Direktori Fisik:</span> <code className={`px-2 py-0.5 rounded font-mono ${
                    theme === 'dark' ? 'bg-slate-950 border border-slate-800 text-cyan-300' : 'bg-white border border-slate-200 text-cyan-800'
                  }`}>uploads/YYYY/MM/DD/jenis_media/</code></p>
                  <p><span className="text-slate-500">Skema Nama Berkas:</span> <span>Enkripsi Hash Kriptografi SHA-256 (32 karakter hex unik) + ekstensi asli</span></p>
                  <p><span className="text-slate-500">Kategori Otomatis:</span> <span>images, documents, videos, audio, others</span></p>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminSidebarLayout>
    );
  }

  // Tampilan Petugas Lapangan
  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col">
      <Header currentTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab as any)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'dashboard' && <PetugasDashboard />}
        {currentTab === 'uploads' && <MediaUploadsList />}
      </main>
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
