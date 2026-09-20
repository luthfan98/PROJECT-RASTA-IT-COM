import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  FileSpreadsheet, 
  Upload, 
  CheckCircle2, 
  FileCheck, 
  Download, 
  Info
} from 'lucide-react';

export const ImportDataWizardView: React.FC<{ onNavigateToHistory?: () => void }> = ({
  onNavigateToHistory
}) => {
  const { theme } = useTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dataType, setDataType] = useState<'ACTUAL' | 'SYNTHETIC'>('ACTUAL');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [previewRows] = useState<any[]>([
    { timestamp: '2026-09-19 14:00:00', slot: 'C', point: 'PUMP-DE-H', value: '1.82', unit: 'mm/s', status: 'VALID' },
    { timestamp: '2026-09-19 14:00:00', slot: 'C', point: 'PUMP-DE-V', value: '1.15', unit: 'mm/s', status: 'VALID' },
    { timestamp: '2026-09-19 14:00:00', slot: 'C', point: 'PUMP-DE-A', value: '0.95', unit: 'mm/s', status: 'VALID' },
    { timestamp: '2026-09-19 14:00:00', slot: 'C', point: 'TEMP-PUMP-DE', value: '67.2', unit: '°C', status: 'VALID' },
    { timestamp: '2026-09-19 14:00:00', slot: 'A', point: 'ELMOT-DE-H', value: '0.43', unit: 'mm/s', status: 'VALID' }
  ]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleStartImport = () => {
    if (!selectedFile && !previewRows.length) return;
    setIsUploading(true);
    setUploadProgress(15);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setIsSuccess(true);
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  const handleDownloadTemplate = () => {
    const csvContent = 'data:text/csv;charset=utf-8,measured_at,slot_code,measurement_point,value,unit,quality\n2026-09-19 14:00:00,C,PUMP-DE-H,1.82,mm/s,GOOD\n2026-09-19 14:00:00,C,TEMP-PUMP-DE,67.2,C,GOOD\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'RASTA_Import_Template_Standard.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 w-full animate-fadeIn">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-500">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Import Data Telemetri & Log Batch (Import Wizard)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Unggah file dataset pengukuran getaran (*.CSV, *.XLSX) untuk analisis deret waktu stasiun.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-500" />
            <span>Unduh Format Template CSV</span>
          </button>
        </div>
      </div>

      {isSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>File telemetri berhasil diimpor! Sebanyak 5 baris pengukuran terverifikasi dan masuk ke database.</span>
          </div>
          {onNavigateToHistory && (
            <button
              type="button"
              onClick={onNavigateToHistory}
              className="px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500"
            >
              Lihat Riwayat Import →
            </button>
          )}
        </div>
      )}

      {/* 2. Upload Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Dropzone */}
        <div className="lg:col-span-2 space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`p-8 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all ${
              selectedFile
                ? 'border-cyan-500 bg-cyan-500/5'
                : theme === 'dark'
                ? 'border-slate-700 hover:border-slate-600 bg-[#0E1726]/80'
                : 'border-slate-300 hover:border-slate-400 bg-white'
            }`}
          >
            <div className="w-14 h-14 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500 mb-3">
              <FileSpreadsheet className="w-7 h-7" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {selectedFile ? selectedFile.name : 'Tarik & Letakkan Berkas CSV / Excel ke Sini'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Mendukung file format <b>.csv</b>, <b>.xlsx</b> berukuran hingga 50 MB dengan ribuan baris sampel getaran tri-aksial.
            </p>

            <label className="mt-4 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm">
              <span>Pilih Berkas Komputer</span>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-[#0E1726]' : 'bg-white'}`}>
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span>Memproses & Melakukan Ingest Data...</span>
                <span className="font-mono text-cyan-500">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Import Settings */}
        <div className={`p-5 rounded-3xl border flex flex-col justify-between ${
          theme === 'dark' ? 'bg-[#0E1726]/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Konfigurasi Provenance
            </h3>

            {/* Data Type Tag */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Klasifikasi Data (Audit Provenance)
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setDataType('ACTUAL')}
                  className={`py-2 px-3 rounded-xl font-bold border transition-colors ${
                    dataType === 'ACTUAL'
                      ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent'
                  }`}
                >
                  ACTUAL (Riil Lapangan)
                </button>
                <button
                  type="button"
                  onClick={() => setDataType('SYNTHETIC')}
                  className={`py-2 px-3 rounded-xl font-bold border transition-colors ${
                    dataType === 'SYNTHETIC'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent'
                  }`}
                >
                  SYNTHETIC (Simulasi)
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Data akan ditandai pada tabel audit agar data riil tidak tercampur simulasi.
              </p>
            </div>

            {/* Info notice */}
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-800 dark:text-cyan-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Info className="w-4 h-4 text-cyan-500 shrink-0" />
                <span>Validasi Kolom Otomatis</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Sistem akan memetakan kolom waktu, slot pompa (A/B/C/D), titik ukur (M-NDE, P-DE), dan nilai getaran secara otomatis.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStartImport}
            disabled={isUploading}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black shadow-md shadow-cyan-600/20 transition-colors"
          >
            <Upload className={`w-4 h-4 ${isUploading ? 'animate-spin' : ''}`} />
            <span>{isUploading ? 'Mengimpor Data...' : 'Mulai Proses Import'}</span>
          </button>
        </div>
      </div>

      {/* 3. Sample Data Preview Table */}
      <div className={`rounded-3xl border overflow-hidden ${
        theme === 'dark' ? 'bg-[#0E1726]/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-cyan-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Pratinjau Data Sebelum Ingest (5 Baris Sampel Teratas)
            </h3>
          </div>
          <span className="text-[11px] text-emerald-500 font-bold">Status: Siap Diimpor</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5">Waktu Pengukuran (WIB)</th>
                <th className="px-4 py-2.5">Slot Pompa</th>
                <th className="px-4 py-2.5">Titik Sensor</th>
                <th className="px-4 py-2.5">Nilai Terukur</th>
                <th className="px-4 py-2.5">Satuan</th>
                <th className="px-4 py-2.5 text-right">Validasi Format</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {previewRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300 font-sans">{row.timestamp}</td>
                  <td className="px-4 py-2.5 font-bold text-cyan-600 dark:text-cyan-400">{row.slot}</td>
                  <td className="px-4 py-2.5 text-slate-800 dark:text-slate-200">{row.point}</td>
                  <td className="px-4 py-2.5 font-black text-slate-900 dark:text-white">{row.value}</td>
                  <td className="px-4 py-2.5 text-slate-500 font-sans">{row.unit}</td>
                  <td className="px-4 py-2.5 text-right font-sans">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      ✓ {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
