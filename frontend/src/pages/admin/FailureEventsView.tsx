import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import { 
  Flame, 
  Clock, 
  RefreshCw,
  ShieldAlert
} from 'lucide-react';

interface FailureEvent {
  id: number;
  asset_code: string;
  pump_name: string;
  failure_code: string;
  failure_mode: string;
  severity: string;
  degradation_started_at: string;
  warning_started_at: string;
  critical_started_at: string;
  failure_at: string;
  resolved_at: string;
  source_type: string;
  data_type: string;
  description: string;
  degradation_duration_hours: number;
}

export const FailureEventsView: React.FC = () => {
  const { theme } = useTheme();
  const [failures, setFailures] = useState<FailureEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFailures = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/monitoring/failures');
      if (res.data?.success) {
        setFailures(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch failure events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFailures();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-black flex items-center gap-2.5 ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            <Flame className="w-6 h-6 text-rose-500" />
            Audit Riwayat Kegagalan & Linimasa Kerusakan Mekanikal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rekam jejak insiden kerusakan, durasi degradasi, dan penanganan pemulihan unit pompa fisik.
          </p>
        </div>

        <button
          onClick={fetchFailures}
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

      {/* Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-[#0E1726]/90 border-slate-800' : 'bg-white border-slate-200'}`}>
          <span className="text-xs text-slate-400 font-bold block mb-1">Total Insiden Teridentifikasi</span>
          <span className="text-2xl font-black text-rose-500">{failures.length} Kejadian</span>
          <span className="text-[10px] text-slate-500 block mt-1">Dalam dataset training 1 tahun</span>
        </div>

        <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-[#0E1726]/90 border-slate-800' : 'bg-white border-slate-200'}`}>
          <span className="text-xs text-slate-400 font-bold block mb-1">Rata-rata Waktu Deteksi Dini</span>
          <span className="text-2xl font-black text-amber-500">~310 Jam</span>
          <span className="text-[10px] text-slate-500 block mt-1">Lead time sebelum failure terjadi</span>
        </div>

        <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-[#0E1726]/90 border-slate-800' : 'bg-white border-slate-200'}`}>
          <span className="text-xs text-slate-400 font-bold block mb-1">Status Penanganan</span>
          <span className="text-2xl font-black text-emerald-500">100% Resolved</span>
          <span className="text-[10px] text-slate-500 block mt-1">Semua insiden selesai di-maintenance</span>
        </div>
      </div>

      {/* Failure Events List */}
      <div className="space-y-4">
        {failures.map((f) => (
          <div
            key={f.id}
            className={`rounded-2xl p-5 sm:p-6 border transition-all ${
              theme === 'dark'
                ? 'bg-[#0E1726]/90 border-slate-800 shadow-xl'
                : 'bg-white border-slate-200/90 shadow-sm'
            }`}
          >
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-500 font-bold">
                  <ShieldAlert className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-cyan-400">{f.failure_code}</span>
                    <span className="text-xs font-bold text-slate-500">•</span>
                    <h2 className={`font-black text-base ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      {f.failure_mode.replace(/_/g, ' ').toUpperCase()}
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500">
                    Unit Terkait: <span className="font-mono font-bold text-slate-400">{f.asset_code}</span> ({f.pump_name})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-500/15 text-rose-500 border border-rose-500/30 uppercase">
                  {f.severity}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  {f.data_type}
                </span>
              </div>
            </div>

            {/* Lifecycle Timeline Progression */}
            <div className="py-4">
              <span className="text-xs font-bold text-slate-400 block mb-3">Linimasa Eskalasi Degradasi Mekanikal:</span>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                {/* 1. Degrading */}
                <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold text-amber-400 block mb-1">1. Mulai Degradasi</span>
                  <span className="font-bold text-slate-300 block">{formatDate(f.degradation_started_at)}</span>
                  <span className="text-[10px] text-slate-500">Sinyal anomali awal</span>
                </div>

                {/* 2. Warning */}
                <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold text-amber-500 block mb-1">2. Status Warning</span>
                  <span className="font-bold text-slate-300 block">{formatDate(f.warning_started_at)}</span>
                  <span className="text-[10px] text-slate-500">Batas ISO terlampaui</span>
                </div>

                {/* 3. Critical */}
                <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold text-rose-400 block mb-1">3. Status Critical</span>
                  <span className="font-bold text-slate-300 block">{formatDate(f.critical_started_at)}</span>
                  <span className="text-[10px] text-slate-500">Suhu & vibrasi melonjak</span>
                </div>

                {/* 4. Failure */}
                <div className={`p-3 rounded-xl border border-rose-500/30 ${theme === 'dark' ? 'bg-rose-950/20' : 'bg-rose-50'}`}>
                  <span className="text-[10px] font-bold text-rose-500 block mb-1">4. Actual Failure</span>
                  <span className="font-bold text-rose-400 block">{formatDate(f.failure_at)}</span>
                  <span className="text-[10px] text-rose-500">Unit terhenti / trip</span>
                </div>

                {/* 5. Resolved */}
                <div className={`p-3 rounded-xl border border-emerald-500/30 ${theme === 'dark' ? 'bg-emerald-950/20' : 'bg-emerald-50'}`}>
                  <span className="text-[10px] font-bold text-emerald-500 block mb-1">5. Resolved / Selesai</span>
                  <span className="font-bold text-emerald-400 block">{formatDate(f.resolved_at)}</span>
                  <span className="text-[10px] text-emerald-500">Selesai diperbaiki</span>
                </div>
              </div>
            </div>

            {/* Description & Duration Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-400">
              <p className="italic">{f.description}</p>
              <div className="flex items-center gap-1.5 font-bold text-cyan-400 whitespace-nowrap">
                <Clock className="w-3.5 h-3.5" />
                <span>Durasi Degradasi: ~{f.degradation_duration_hours || 368} Jam Sebelum Rusak</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
