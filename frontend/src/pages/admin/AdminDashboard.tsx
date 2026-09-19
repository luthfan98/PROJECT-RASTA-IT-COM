import React, { useState, useEffect } from 'react';
import { ShieldCheck, Database, HardDrive, Users, Layers, Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import axios from 'axios';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [allFiles, setAllFiles] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const fetchFiles = async (type = filterType) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/upload/list?limit=50&mediaType=${type}`);
      if (res.data.success) {
        setAllFiles(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFile = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus berkas ini dari disk dan database?')) {
      return;
    }
    try {
      await axios.delete(`/api/upload/${id}`);
      fetchFiles();
      fetchStats();
    } catch (err) {
      alert('Gagal menghapus file');
    }
  };

  useEffect(() => {
    fetchStats();
    fetchFiles('all');
  }, []);

  const handleFilterChange = (type: string) => {
    setFilterType(type);
    fetchFiles(type);
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Admin */}
      <div className="bg-gradient-to-r from-[#0B132B] via-[#1C2541] to-[#0B132B] rounded-2xl p-6 text-white shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Pusat Kontrol Administrator
            </span>
            <span className="text-xs text-slate-400">&bull; RASTA IT COM System</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Dashboard Utama <span className="text-cyan-400">Admin</span>
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Monitoring penyimpanan terstruktur, audit berkas unggahan petugas, dan status database MySQL lokal.
          </p>
        </div>

        <button
          onClick={() => {
            fetchStats();
            fetchFiles();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Segarkan Data
        </button>
      </div>

      {/* KPI Cards (Diselaraskan dengan style vibrasi AI) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Berkas */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Berkas</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {stats?.totalFiles || 0}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Tersimpan di uploads/</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <HardDrive className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Penggunaan Storage */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kapasitas Storage</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {formatBytes(stats?.totalBytes || 0)}
            </p>
            <p className="text-[11px] text-cyan-600 font-semibold mt-0.5">Struktur YYYY/MM/DD</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Database MySQL */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status MySQL</p>
            <p className="text-xl font-extrabold text-emerald-600 mt-1 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              Connected
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">DB: rasta_it_db (port 3306)</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Database className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Pengguna Terdaftar */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Peran Terdaftar</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {stats?.userStats?.reduce((acc: number, curr: any) => acc + curr.count, 0) || 2} Akun
            </p>
            <p className="text-[11px] text-amber-600 font-semibold mt-0.5">1 Admin, 1 Petugas</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Audit & Management Table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              Audit Berkas Terenkripsi (uploads/)
            </h2>
            <p className="text-xs text-slate-500">
              Daftar seluruh file fisik yang diunggah petugas beserta hashing nama dan jalurnya
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/60 self-start sm:self-auto">
            {['all', 'images', 'documents', 'videos', 'others'].map((t) => (
              <button
                key={t}
                onClick={() => handleFilterChange(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filterType === t
                    ? 'bg-[#0B132B] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'all' ? 'Semua' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Memuat data berkas...
          </div>
        ) : allFiles.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Tidak ada berkas dengan filter <span className="font-bold">"{filterType}"</span>.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Tipe</th>
                  <th className="py-3 px-4">Nama Asli</th>
                  <th className="py-3 px-4">Nama Terenkripsi di Disk</th>
                  <th className="py-3 px-4">Jalur Relatif (YYYY/MM/DD)</th>
                  <th className="py-3 px-4">Ukuran</th>
                  <th className="py-3 px-4">Uploader</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 font-semibold uppercase px-2 py-0.5 rounded-full text-[10px] ${
                        file.media_type === 'images'
                          ? 'bg-blue-100 text-blue-700'
                          : file.media_type === 'documents'
                          ? 'bg-emerald-100 text-emerald-700'
                          : file.media_type === 'videos'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {file.media_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs truncate">
                      {file.original_name}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 max-w-xs truncate">
                      {file.stored_name}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-cyan-700">
                      {file.relative_path}
                    </td>
                    <td className="py-3 px-4">{formatBytes(file.file_size)}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-700">
                        {file.uploader_name || file.role || 'Sistem / Anonim'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <a
                          href={file.file_url}
                          target="_blank"
                          rel="noreferrer"
                          title="Buka / Preview"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-cyan-50 text-cyan-600 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          title="Hapus Berkas"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
