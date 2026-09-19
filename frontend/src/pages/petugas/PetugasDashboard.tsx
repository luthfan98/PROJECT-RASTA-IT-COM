import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UploadCloud, CheckCircle, Clock, AlertCircle, Copy, Check, ExternalLink, HardDrive } from 'lucide-react';
import axios from 'axios';

export const PetugasDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<any | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [recentUploads, setRecentUploads] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchRecentUploads = async () => {
    try {
      const res = await axios.get('/api/upload/list?limit=10');
      if (res.data.success) {
        setRecentUploads(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch uploads:', err);
    }
  };

  useEffect(() => {
    fetchRecentUploads();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadSuccess(null);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/upload/single', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (res.data.success) {
        setUploadSuccess(res.data.data);
        fetchRecentUploads();
      } else {
        setUploadError(res.data.message || 'Upload gagal');
      }
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Terjadi kesalahan saat mengunggah file');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-[#0B132B] to-[#1C2541] rounded-2xl p-6 text-white shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Portal Petugas Lapangan
            </span>
            <span className="text-xs text-slate-400">&bull; Wilayah Kerja Aktif</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Selamat Datang, <span className="text-cyan-400">{user?.name}</span>
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Unggah dokumentasi foto, dokumen, atau video lapangan. Berkas akan otomatis dienkripsi dan disusun dalam struktur hierarki tanggal <code className="text-cyan-300 bg-slate-900/60 px-1.5 py-0.5 rounded">YYYY/MM/DD/jenis_media</code>.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto bg-slate-900/50 border border-slate-700/60 p-3 rounded-xl">
          <HardDrive className="w-8 h-8 text-cyan-400" />
          <div className="text-xs">
            <p className="text-slate-400">Penyimpanan Terenkripsi</p>
            <p className="font-bold text-emerald-400">Aktif & Siap Menerima</p>
          </div>
        </div>
      </div>

      {/* Main Upload Box */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
        <h2 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-cyan-600" />
          Area Unggah Berkas & Media
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Pilih file foto, laporan PDF/Word, atau video. Sistem akan mengklasifikasikan folder dan mengenkripsi nama berkas secara otomatis.
        </p>

        {/* Dropzone container */}
        <label className="border-2 border-dashed border-slate-300 hover:border-cyan-500 hover:bg-cyan-50/20 transition-all rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer group">
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <div className="w-16 h-16 rounded-full bg-cyan-100/60 group-hover:bg-cyan-100 flex items-center justify-center mb-3 transition-colors">
            {isUploading ? (
              <div className="w-8 h-8 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <UploadCloud className="w-8 h-8 text-cyan-600 group-hover:scale-110 transition-transform" />
            )}
          </div>
          <p className="text-sm font-bold text-slate-800 group-hover:text-cyan-700 transition-colors">
            {isUploading ? 'Sedang mengenkripsi dan mengunggah berkas...' : 'Klik untuk memilih berkas dari perangkat'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Mendukung Gambar (JPG, PNG, WEBP), Dokumen (PDF, DOCX, XLSX), Video (MP4) hingga 50MB
          </p>
        </label>

        {/* Upload Feedback */}
        {uploadSuccess && (
          <div className="mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs animate-fade-in">
            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1.5 flex-1">
                <p className="font-bold text-sm text-emerald-800">File Berhasil Dienkripsi & Disimpan!</p>
                <p>
                  <span className="font-semibold text-slate-600">Nama Asli:</span> {uploadSuccess.originalName}
                </p>
                <p>
                  <span className="font-semibold text-slate-600">Jalur Folder Tersimpan:</span>{' '}
                  <code className="bg-white/80 px-2 py-0.5 rounded border border-emerald-300 font-mono text-emerald-900">
                    uploads/{uploadSuccess.relativePath}
                  </code>
                </p>
                <div className="pt-1 flex items-center gap-3">
                  <a
                    href={uploadSuccess.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-cyan-700 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Lihat / Unduh Berkas
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {uploadError && (
          <div className="mt-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Riwayat Upload Petugas */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-600" />
              Riwayat Unggahan Terakhir
            </h3>
            <p className="text-xs text-slate-400">10 file terakhir yang tercatat di database MySQL</p>
          </div>
          <button
            onClick={fetchRecentUploads}
            className="text-xs font-medium text-cyan-600 hover:text-cyan-800 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Segarkan
          </button>
        </div>

        {recentUploads.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            Belum ada data unggahan. Mulai unggah file di atas!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Tipe</th>
                  <th className="py-3 px-4">Nama Asli</th>
                  <th className="py-3 px-4">Jalur Struktur Folder</th>
                  <th className="py-3 px-4">Ukuran</th>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentUploads.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold uppercase px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700">
                        {item.media_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs truncate">
                      {item.original_name}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-cyan-700">
                      {item.relative_path}
                    </td>
                    <td className="py-3 px-4">{formatBytes(item.file_size)}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(item.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => copyToClipboard(item.relative_path, item.id)}
                          title="Salin path fisik"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noreferrer"
                          title="Buka file"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-cyan-50 text-cyan-600 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
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
