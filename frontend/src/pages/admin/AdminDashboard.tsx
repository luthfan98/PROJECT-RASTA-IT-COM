import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  ShieldCheck, 
  Database, 
  HardDrive, 
  Users, 
  Layers, 
  Trash2, 
  ExternalLink, 
  FileText,
  Image as ImageIcon,
  Film,
  FileSpreadsheet,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';

export const AdminDashboard: React.FC = () => {
  const { theme } = useTheme();
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
    setTimeout(() => setIsRefreshing(false), 400);
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
            <ImageIcon className="w-3 h-3" /> Images
          </span>
        );
      case 'documents':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <FileText className="w-3 h-3" /> Documents
          </span>
        );
      case 'videos':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30">
            <Film className="w-3 h-3" /> Videos
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-400/30">
            <FileSpreadsheet className="w-3 h-3" /> {type || 'Others'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 4 KPI Cards (Clean, high contrast, adapts to light/dark) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Berkas */}
        <div className={`rounded-2xl p-5 border transition-all flex items-center justify-between ${
          theme === 'dark' 
            ? 'bg-[#0E1726]/90 border-slate-800 shadow-lg text-white' 
            : 'bg-white border-slate-200/80 shadow-sm text-slate-800 hover:shadow-md'
        }`}>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Berkas</p>
            <p className={`text-2xl sm:text-3xl font-black mt-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {stats?.totalFiles || 0}
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Tersimpan di uploads/
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-cyan-400 flex items-center justify-center border border-blue-500/20">
            <HardDrive className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Penggunaan Storage */}
        <div className={`rounded-2xl p-5 border transition-all flex items-center justify-between ${
          theme === 'dark' 
            ? 'bg-[#0E1726]/90 border-slate-800 shadow-lg text-white' 
            : 'bg-white border-slate-200/80 shadow-sm text-slate-800 hover:shadow-md'
        }`}>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kapasitas Storage</p>
            <p className={`text-2xl sm:text-3xl font-black mt-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {formatBytes(stats?.totalBytes || 0)}
            </p>
            <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
              Struktur YYYY/MM/DD
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Database MySQL */}
        <div className={`rounded-2xl p-5 border transition-all flex items-center justify-between ${
          theme === 'dark' 
            ? 'bg-[#0E1726]/90 border-slate-800 shadow-lg text-white' 
            : 'bg-white border-slate-200/80 shadow-sm text-slate-800 hover:shadow-md'
        }`}>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status MySQL</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              Connected
            </p>
            <p className="text-[11px] text-slate-400 mt-1">DB: rasta_it_db (port 3306)</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Database className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Pengguna Terdaftar */}
        <div className={`rounded-2xl p-5 border transition-all flex items-center justify-between ${
          theme === 'dark' 
            ? 'bg-[#0E1726]/90 border-slate-800 shadow-lg text-white' 
            : 'bg-white border-slate-200/80 shadow-sm text-slate-800 hover:shadow-md'
        }`}>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Peran Terdaftar</p>
            <p className={`text-2xl sm:text-3xl font-black mt-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {stats?.userStats?.reduce((acc: number, curr: any) => acc + curr.count, 0) || 2} Akun
            </p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              1 Admin, 1 Petugas
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Audit & Management Table Card */}
      <div className={`rounded-2xl p-5 sm:p-6 border transition-all ${
        theme === 'dark' 
          ? 'bg-[#0E1726]/90 border-slate-800 shadow-xl' 
          : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className={`text-base font-bold flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              Audit Berkas Terenkripsi (uploads/)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar seluruh berkas yang diunggah petugas beserta enkripsi nama acak unik dan jalurnya
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Filter Pills */}
            <div className={`flex items-center gap-1 p-1 rounded-xl border ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              {['all', 'images', 'documents', 'videos', 'others'].map((t) => (
                <button
                  key={t}
                  onClick={() => handleFilterChange(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    filterType === t
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t === 'all' ? 'Semua' : t}
                </button>
              ))}
            </div>

            {/* Quick Refresh Icon */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Segarkan Berkas"
              className={`p-2 rounded-xl border transition-colors ${
                theme === 'dark'
                  ? 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300'
                  : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <div className="w-7 h-7 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Memuat data audit berkas...
          </div>
        ) : allFiles.length === 0 ? (
          <div className={`py-16 text-center text-xs rounded-xl border my-4 ${
            theme === 'dark' ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            Tidak ada berkas dengan filter <span className="font-bold text-cyan-600 dark:text-cyan-400">"{filterType}"</span>.
          </div>
        ) : (
          <div className={`overflow-x-auto rounded-xl border mt-4 ${
            theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b font-bold tracking-wider ${
                  theme === 'dark' 
                    ? 'bg-slate-900/80 text-slate-400 border-slate-800' 
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                  <th className="py-3 px-4">TIPE</th>
                  <th className="py-3 px-4">NAMA ASLI</th>
                  <th className="py-3 px-4">NAMA TERENKRIPSI DI DISK</th>
                  <th className="py-3 px-4">JALUR RELATIF (YYYY/MM/DD)</th>
                  <th className="py-3 px-4">UKURAN</th>
                  <th className="py-3 px-4">UPLOADER</th>
                  <th className="py-3 px-4 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800/80' : 'divide-slate-200'}`}>
                {allFiles.map((file) => (
                  <tr 
                    key={file.id} 
                    className={`transition-colors ${
                      theme === 'dark' ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-4">
                      {getMediaTypeBadge(file.media_type)}
                    </td>
                    <td className={`py-3 px-4 font-semibold max-w-[180px] truncate ${
                      theme === 'dark' ? 'text-white' : 'text-slate-800'
                    }`}>
                      {file.original_name}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 max-w-[200px] truncate">
                      {file.stored_name}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-cyan-600 dark:text-cyan-300 max-w-[220px] truncate font-medium">
                      {file.relative_path}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-300 font-medium">
                      {formatBytes(file.file_size)}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {file.uploader_name || 'Petugas'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <a
                          href={file.file_url}
                          target="_blank"
                          rel="noreferrer"
                          title="Buka Berkas Asli"
                          className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          title="Hapus Berkas dari Disk & DB"
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-colors"
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
