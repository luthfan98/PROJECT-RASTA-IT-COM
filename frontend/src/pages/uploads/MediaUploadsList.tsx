import React, { useState, useEffect } from 'react';
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
      <div className="bg-[#0E1726]/90 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-cyan-400" />
              Direktori Media & Arsip Berkas Terenkripsi
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Struktur folder fisik: <code className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-cyan-300 font-mono">uploads/YYYY/MM/DD/jenis_media/</code>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari berkas atau jalur..."
                className="pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 w-64 transition-all"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>

            <button
              onClick={fetchFiles}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors shadow-sm"
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
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
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
          <div className="py-20 text-center text-slate-400 text-xs bg-slate-900/40 rounded-xl border border-slate-800/60 flex flex-col items-center justify-center">
            <FolderSearch className="w-8 h-8 text-slate-600 mb-2" />
            Belum ada berkas pada kategori ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/70 rounded-2xl p-4 border border-slate-800 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      {item.media_type}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {new Date(item.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-xs truncate group-hover:text-cyan-300 transition-colors" title={item.original_name}>
                    {item.original_name}
                  </h3>

                  <div className="mt-2 p-2 bg-slate-950/80 rounded-lg border border-slate-800/80 font-mono text-[10px] text-slate-400 break-all">
                    {item.relative_path}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {(item.file_size / 1024).toFixed(1)} KB
                  </span>
                  <a
                    href={item.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
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
