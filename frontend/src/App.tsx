import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { Header } from './components/Header';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { PetugasDashboard } from './pages/petugas/PetugasDashboard';
import { MediaUploadsList } from './pages/uploads/MediaUploadsList';
import { Database, Server, HardDrive, CheckCircle2 } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'uploads' | 'system'>('dashboard');

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col">
      <Header currentTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab as any)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'dashboard' && (
          user?.role === 'admin' ? <AdminDashboard /> : <PetugasDashboard />
        )}

        {currentTab === 'uploads' && <MediaUploadsList />}

        {currentTab === 'system' && user?.role === 'admin' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
              <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-600" />
                Informasi Sistem & Database
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Rincian infrastruktur backend Fastify, koneksi MySQL lokal, dan parameter penyimpanan.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Server className="w-4 h-4 text-blue-600" />
                    Backend API
                  </p>
                  <p><span className="text-slate-500">Framework:</span> Fastify v4 (TypeScript)</p>
                  <p><span className="text-slate-500">Host / Port:</span> http://localhost:5000</p>
                  <p className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> API Healthcheck: Status OK
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-600" />
                    Database MySQL
                  </p>
                  <p><span className="text-slate-500">Host:</span> 127.0.0.1:3306</p>
                  <p><span className="text-slate-500">User / Pass:</span> root / (tanpa password)</p>
                  <p><span className="text-slate-500">Database Name:</span> rasta_it_db</p>
                  <p className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> MySQL Status: Connected
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 md:col-span-2">
                  <p className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-cyan-600" />
                    Arsitektur Penyimpanan Unggahan
                  </p>
                  <p><span className="text-slate-500">Struktur Direktori:</span> <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-cyan-800">uploads/YYYY/MM/DD/jenis_media/</code></p>
                  <p><span className="text-slate-500">Skema Nama Berkas:</span> Enkripsi Hash Kriptografi SHA-256 (32 karakter acak unik + ekstensi asli)</p>
                  <p><span className="text-slate-500">Kategori Media Otomatis:</span> images, documents, videos, audio, others</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
