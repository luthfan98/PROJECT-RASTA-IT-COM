import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Database, 
  HardDrive, 
  Users, 
  Layers, 
  Trash2, 
  ExternalLink, 
  RefreshCw,
  FolderLock,
  FileText,
  Image as ImageIcon,
  Film,
  FileSpreadsheet
} from 'lucide-react';
import axios from 'axios';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [allFiles, setAllFiles] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchStats(), fetchFiles()]);
    setTimeout(() => setIsRefreshing(false), 500);
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

  const getMediaTypeBadge = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'images':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            <ImageIcon className="w-3 h-3" /> Images
          </span>
        );
      case 'documents':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <FileText className="w-3 h-3" /> Documents
          </span>
        );
      case 'videos':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <Film className="w-3 h-3" /> Videos
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-700/40 text-slate-300 border border-slate-600/40">
            <FileSpreadsheet className="w-3 h-3" /> {type || 'Others'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Sleek Top Header Bar inside Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
              <FolderLock className="w-3.5 h-3.5" />
              Pusat Kontrol Administrator
            </span>
            <span className="text-xs text-slate-400">&bull; RASTA IT COM System</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Dashboard Monitoring & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Penyimpanan Terstruktur</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pengawasan audit berkas terenkripsi, alokasi kapasitas direktori <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">YYYY/MM/DD</code>, dan status database MySQL.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all self-start sm:self-auto shrink-0 border border-cyan-400/30"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Memperbarui...' : 'Segarkan Data'}</span>
        </button>
      </div>

      {/* KPI Cards (Vibrasi AI Sleek Glassmorphic Theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Berkas */}
        <div className="bg-[#0E1726]/90 backdrop-blur-md rounded-2xl p-5 border border-slate-800 shadow-xl hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] transition-all flex items-center justify-between group">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Berkas</p>
            <p className="text-3xl font-black text-white mt-1 group-hover:text-cyan-300 transition-colors">
              {stats?.totalFiles || 0}
            </p>
            <p className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Tersimpan di uploads/
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-blue-500/10 text-cyan-400 flex items-center justify-center border border-blue-500/25 group-hover:scale-105 transition-transform">
            <HardDrive className="w-6 h-6 text-cyan-400" />
          </div>
        </div>

        {/* Card 2: Penggunaan Storage */}
        <div className="bg-[#0E1726]/90 backdrop-blur-md rounded-2xl p-5 border border-slate-800 shadow-xl hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] transition-all flex items-center justify-between group">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kapasitas Storage</p>
            <p className="text-3xl font-black text-white mt-1 group-hover:text-cyan-300 transition-colors">
              {formatBytes(stats?.totalBytes || 0)}
            </p>
            <p className="text-[11px] text-cyan-400 font-semibold mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Struktur YYYY/MM/DD
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/25 group-hover:scale-105 transition-transform">
            <Layers className="w-6 h-6 text-cyan-400" />
          </div>
        </div>

        {/* Card 3: Database MySQL */}
        <div className="bg-[#0E1726]/90 backdrop-blur-md rounded-2xl p-5 border border-slate-800 shadow-xl hover:border-emerald-500/40 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] transition-all flex items-center justify-between group">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status MySQL</p>
            <p className="text-2xl font-black text-emerald-400 mt-1 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Connected
            </p>
            <p className="text-[11px] text-slate-400 mt-1">DB: rasta_it_db (port 3306)</p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/25 group-hover:scale-105 transition-transform">
            <Database className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        {/* Card 4: Pengguna Terdaftar */}
        <div className="bg-[#0E1726]/90 backdrop-blur-md rounded-2xl p-5 border border-slate-800 shadow-xl hover:border-amber-500/40 hover:shadow-[0_0_25px_rgba(245,158,11,0.15)] transition-all flex items-center justify-between group">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Peran Terdaftar</p>
            <p className="text-3xl font-black text-white mt-1 group-hover:text-amber-300 transition-colors">
              {stats?.userStats?.reduce((acc: number, curr: any) => acc + curr.count, 0) || 2} Akun
            </p>
            <p className="text-[11px] text-amber-400 font-semibold mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              1 Admin, 1 Petugas
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/25 group-hover:scale-105 transition-transform">
            <Users className="w-6 h-6 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Audit & Management Table Card */}
      <div className="bg-[#0E1726]/90 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              Audit Berkas Terenkripsi (uploads/)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Daftar seluruh file fisik yang diunggah petugas beserta hashing nama kriptografi dan jalurnya
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
            {['all', 'images', 'documents', 'videos', 'others'].map((t) => (
              <button
                key={t}
                onClick={() => handleFilterChange(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  filterType === t
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {t === 'all' ? 'Semua' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <div className="w-7 h-7 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Memuat data audit berkas...
          </div>
        ) : allFiles.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs bg-slate-900/40 rounded-xl border border-slate-800/60">
            Tidak ada berkas dengan filter <span className="font-bold text-cyan-400">"{filterType}"</span>.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-semibold tracking-wider">
                  <th className="py-3 px-4">TIPE</th>
                  <th className="py-3 px-4">NAMA ASLI</th>
                  <th className="py-3 px-4">NAMA TERENKRIPSI DI DISK</th>
                  <th className="py-3 px-4">JALUR RELATIF (YYYY/MM/DD)</th>
                  <th className="py-3 px-4">UKURAN</th>
                  <th className="py-3 px-4">UPLOADER</th>
                  <th className="py-3 px-4 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {allFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3 px-4">
                      {getMediaTypeBadge(file.media_type)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white max-w-[180px] truncate">
                      {file.original_name}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 max-w-[200px] truncate">
                      {file.stored_name}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-cyan-300 max-w-[220px] truncate">
                      {file.relative_path}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">
                      {formatBytes(file.file_size)}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {file.uploader_name || 'Petugas'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <a
                          href={file.file_url}
                          target="_blank"
                          rel="noreferrer"
                          title="Buka Berkas Asli"
                          className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          title="Hapus Berkas dari Disk & DB"
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-colors"
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
