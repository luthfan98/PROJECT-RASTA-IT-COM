import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  Layers, 
  RefreshCw, 
  Database, 
  FileCheck
} from 'lucide-react';

interface ImportAudit {
  id: number;
  file_name: string;
  import_type: string;
  data_type: string;
  status: string;
  total_rows: number;
  success_rows: number;
  failed_rows: number;
  imported_by_name: string;
  started_at: string;
  completed_at: string;
}

export const DataImportsView: React.FC = () => {
  const { theme } = useTheme();
  const [imports, setImports] = useState<ImportAudit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchImports = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/monitoring/imports');
      if (res.data?.success) {
        setImports(res.data.data.imports || []);
      }
    } catch (err) {
      console.error('Failed to load imports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImports();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-black flex items-center gap-2.5 ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            <FileSpreadsheet className="w-6 h-6 text-cyan-500" />
            Audit Provenance & Riwayat File Import
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Penelusuran sumber keaslian data (MANUAL / IMPORT / SYSTEM) dan status data (ACTUAL / SYNTHETIC).
          </p>
        </div>

        <button
          onClick={fetchImports}
          disabled={loading}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
            theme === 'dark'
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-500' : ''}`} />
          Segarkan Data
        </button>
      </div>

      {/* Provenance Distribution KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-[#0E1726]/90 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">Total Baris CSV Terimpor</span>
            <span className="p-2 rounded-xl bg-cyan-500/15 text-cyan-500">
              <FileCheck className="w-4 h-4" />
            </span>
          </div>
          <span className="text-2xl font-black text-cyan-400">35.040 Baris</span>
          <span className="text-[11px] text-slate-500 block mt-1">560.640 pengukuran sensor terdistribusi</span>
        </div>

        <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-[#0E1726]/90 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">Distribusi Sesi: SYNTHETIC</span>
            <span className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <span className="text-2xl font-black text-purple-400">8.760 Sesi Jam</span>
          <span className="text-[11px] text-slate-500 block mt-1">Dataset latihan AI/ML (1 tahun penuh)</span>
        </div>

        <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-[#0E1726]/90 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">Distribusi Sesi: ACTUAL</span>
            <span className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <span className="text-2xl font-black text-emerald-400">Siap Input</span>
          <span className="text-[11px] text-slate-500 block mt-1">Data riil via Scan QR petugas lapangan</span>
        </div>
      </div>

      {/* Imports Table */}
      <div className={`rounded-2xl p-5 sm:p-6 border transition-all ${
        theme === 'dark' ? 'bg-[#0E1726]/90 border-slate-800 shadow-xl' : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        <h2 className={`text-base font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          <Database className="w-4 h-4 text-cyan-500" />
          Log Audit File Ingestion
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b ${theme === 'dark' ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <th className="py-2.5 px-3">Nama Berkas Sumber</th>
                <th className="py-2.5 px-3">Format</th>
                <th className="py-2.5 px-3">Tipe Data</th>
                <th className="py-2.5 px-3">Status Ingest</th>
                <th className="py-2.5 px-3">Jumlah Baris</th>
                <th className="py-2.5 px-3">Operator</th>
                <th className="py-2.5 px-3">Waktu Eksekusi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
              {imports.map((imp) => (
                <tr key={imp.id} className={`${theme === 'dark' ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50/80'}`}>
                  <td className="py-3 px-3 font-mono font-bold text-cyan-400">
                    {imp.file_name}
                  </td>
                  <td className="py-3 px-3 font-bold">
                    {imp.import_type}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                      {imp.data_type}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-max">
                      <CheckCircle2 className="w-3 h-3" /> {imp.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <strong>{Number(imp.success_rows).toLocaleString('id-ID')}</strong> / {Number(imp.total_rows).toLocaleString('id-ID')} baris
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {imp.imported_by_name || 'Admin'}
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                    {new Date(imp.started_at).toLocaleString('id-ID')}
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
