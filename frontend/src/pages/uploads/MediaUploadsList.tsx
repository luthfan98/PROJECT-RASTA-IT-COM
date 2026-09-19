import React, { useState, useEffect } from 'react';
import { HardDrive, Search, ExternalLink, Calendar, RefreshCw } from 'lucide-react';
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
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-cyan-600" />
              Direktori Media & Arsip Berkas
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Struktur folder fisik: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-cyan-800">uploads/YYYY/MM/DD/jenis_media/</code>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari berkas atau jalur..."
                className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 w-64"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <button
              onClick={fetchFiles}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Segarkan"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-6 overflow-x-auto">
          {['all', 'images', 'documents', 'videos', 'others'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all shrink-0 ${
                selectedType === t
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {t === 'all' ? 'Semua Kategori' : t}
            </button>
          ))}
        </div>

        {/* Grid Preview Cards */}
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Memuat arsip media...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Belum ada berkas pada direktori ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 hover:border-cyan-400 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white border border-slate-200 text-slate-700">
                      {item.media_type}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-xs truncate group-hover:text-cyan-700 transition-colors" title={item.original_name}>
                    {item.original_name}
                  </h3>

                  <div className="mt-2 p-2 bg-white rounded-lg border border-slate-200/60 font-mono text-[10px] text-slate-500 break-all">
                    {item.relative_path}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {(item.file_size / 1024).toFixed(1)} KB
                  </span>
                  <a
                    href={item.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-800"
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
