import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { HardDrive, Search, ExternalLink, Calendar, RefreshCw, FolderSearch } from 'lucide-react';
import axios from 'axios';

interface MediaItem {
  id: number;
  original_name: string;
  stored_name: string;
  media_type: string;
  mime_type: string;
  file_size: number;
  relative_path: string;
  file_url: string;
  created_at: string;
}

export const MediaUploadsList: React.FC = () => {
  const { theme } = useTheme();
  const [files, setFiles] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/upload/list?limit=100&mediaType=${selectedType}`);
      if (res.data.success) {
        setFiles(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [selectedType]);

  const filtered = files.filter((f) =>
    (f.original_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.relative_path || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className={`rounded-2xl p-5 sm:p-6 border transition-all ${
        theme === 'dark' 
          ? 'bg-[#0E1726]/90 border-slate-800 shadow-xl' 
          : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              <HardDrive className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              Direktori Media & Arsip Berkas Terenkripsi
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Struktur folder fisik: <code className={`px-1.5 py-0.5 rounded font-mono ${
                theme === 'dark' ? 'bg-slate-900 text-cyan-300 border border-slate-800' : 'bg-slate-100 text-cyan-800 border border-slate-200'
              }`}>uploads/YYYY/MM/DD/jenis_media/</code>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari berkas atau jalur..."
                className={`pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 w-56 sm:w-64 transition-all border ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-800 text-slate-200 placeholder-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <button
              onClick={fetchFiles}
              className={`p-2 rounded-xl border transition-colors ${
                theme === 'dark'
                  ? 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300'
                  : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
              title="Segarkan Berkas"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 pb-4 mb-6 overflow-x-auto">
          {['all', 'images', 'documents', 'videos', 'others'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
                selectedType === t
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm'
                  : theme === 'dark'
                    ? 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {t === 'all' ? 'Semua Kategori' : t}
            </button>
          ))}
        </div>

        {/* Grid Preview Cards */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            <div className="w-7 h-7 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Memuat arsip media...
          </div>
        ) : filtered.length === 0 ? (
          <div className={`py-20 text-center text-xs rounded-xl border flex flex-col items-center justify-center ${
            theme === 'dark' ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <FolderSearch className="w-8 h-8 text-slate-400 mb-2" />
            Belum ada berkas pada kategori ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl p-4 border transition-all flex flex-col justify-between group ${
                  theme === 'dark'
                    ? 'bg-slate-900/70 border-slate-800 hover:border-cyan-500/50'
                    : 'bg-slate-50/80 border-slate-200/80 hover:border-cyan-500/50 hover:bg-white hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                      {item.media_type}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(item.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>

                  <h3 className={`font-bold text-xs truncate transition-colors ${
                    theme === 'dark' ? 'text-white group-hover:text-cyan-300' : 'text-slate-800 group-hover:text-cyan-600'
                  }`} title={item.original_name}>
                    {item.original_name}
                  </h3>

                  <div className={`mt-2 p-2 rounded-lg border font-mono text-[10px] break-all ${
                    theme === 'dark' ? 'bg-slate-950/80 border-slate-800/80 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
                  }`}>
                    {item.relative_path}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {(item.file_size / 1024).toFixed(1)} KB
                  </span>
                  <a
                    href={item.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    Buka Berkas <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
