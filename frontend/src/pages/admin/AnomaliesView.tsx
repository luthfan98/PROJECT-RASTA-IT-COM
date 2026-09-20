import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import { 
  Flame, 
  ShieldAlert, 
  Search, 
  Clock, 
  TrendingUp, 
  Check,
  RefreshCw
} from 'lucide-react';

interface AnomalyIncident {
  id: string;
  slot_code: string;
  pump_name: string;
  measurement_point: string;
  location_name: string;
  anomaly_type: string;
  severity: 'CRITICAL' | 'WARNING' | 'MODERATE' | 'RESOLVED';
  anomaly_score: number; // 0.0 - 1.0
  detected_at: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  evidence_metric: string;
  ai_confidence: number;
  assigned_to?: string;
}

export const AnomaliesView: React.FC<{ onNavigateToAnalytics?: (slot: string, point: string) => void }> = ({
  onNavigateToAnalytics
}) => {
  const { theme } = useTheme();
  const [selectedSlot, setSelectedSlot] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  // State loaded from MySQL anomalies table
  const [incidents, setIncidents] = useState<AnomalyIncident[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/monitoring/anomalies');
      if (res.data?.success) {
        setIncidents(res.data.data.map((row: any) => ({
          id: row.anomaly_code,
          slot_code: row.slot_code,
          pump_name: `${row.pump_name} (Unit #${String(row.pump_id).padStart(3, '0')})`,
          measurement_point: row.measurement_point,
          location_name: row.location_name,
          anomaly_type: row.anomaly_type,
          severity: row.severity,
          anomaly_score: parseFloat(row.anomaly_score) || 0.5,
          detected_at: new Date(row.detected_at).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) + ' WIB',
          status: row.status,
          evidence_metric: row.evidence_metric,
          ai_confidence: row.ai_confidence,
          assigned_to: row.assigned_to || 'Belum ditugaskan'
        })));
      }
    } catch (err) {
      console.error('Failed to load anomalies from database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const handleAcknowledge = async (id: string) => {
    const target = incidents.find(i => i.id === id);
    if (!target) return;
    const nextStatus = target.status === 'OPEN' ? 'INVESTIGATING' : 'RESOLVED';
    try {
      await axios.patch(`/api/monitoring/anomalies/${id}/status`, {
        status: nextStatus,
        notes: `Status diubah menjadi ${nextStatus} oleh pengguna melalui portal`
      });
      fetchAnomalies();
    } catch (err) {
      console.error('Failed to update anomaly status:', err);
    }
  };

  const filteredIncidents = incidents.filter(inc => {
    const matchSlot = selectedSlot === 'ALL' || inc.slot_code === selectedSlot;
    const matchSeverity = selectedSeverity === 'ALL' || inc.severity === selectedSeverity;
    const matchSearch = searchQuery === '' || 
      inc.pump_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.anomaly_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSlot && matchSeverity && matchSearch;
  });

  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length;
  const warningCount = incidents.filter(i => i.severity === 'WARNING' && i.status !== 'RESOLVED').length;
  const activeCount = incidents.filter(i => i.status !== 'RESOLVED').length;

  return (
    <div className="space-y-6 w-full animate-fadeIn">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Deteksi Anomali Sinyal & Getaran (Anomalies)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Peringatan dini deviasi statistik mekanikal, harmonisa spektrum abnormal, dan kenaikan gradien suhu.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchAnomalies()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all"
            title="Muat Ulang Data dari Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-500' : ''}`} />
            <span>Segarkan</span>
          </button>
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>{activeCount} Anomali Membutuhkan Atensi</span>
          </span>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className={`p-4 rounded-2xl border transition-all ${
          theme === 'dark' ? 'bg-[#0E1726]/80 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <span className="text-xs font-bold text-slate-400 block mb-1">Total Kejadian Anomali</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{incidents.length}</span>
            <span className="text-xs font-bold text-slate-400">Insiden Terdeteksi</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Dalam 30 Hari Terakhir</span>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          theme === 'dark' ? 'bg-[#0E1726]/80 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <span className="text-xs font-bold text-slate-400 block mb-1">Tingkat Kritis (Critical)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-500">{criticalCount}</span>
            <span className="text-xs font-bold text-slate-400">Pompa C (DE Axial)</span>
          </div>
          <span className="text-[11px] text-rose-500 font-semibold block mt-1">Tindakan darurat diperlukan</span>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          theme === 'dark' ? 'bg-[#0E1726]/80 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <span className="text-xs font-bold text-slate-400 block mb-1">Tingkat Perhatian (Warning)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-500">{warningCount}</span>
            <span className="text-xs font-bold text-slate-400">Titik Kanal</span>
          </div>
          <span className="text-[11px] text-amber-500 font-semibold block mt-1">Dalam pemantauan ketat</span>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          theme === 'dark' ? 'bg-[#0E1726]/80 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <span className="text-xs font-bold text-slate-400 block mb-1">Tingkat Akurasi AI (Precision)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-500">97.8%</span>
            <span className="text-xs font-bold text-slate-400">Valid</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">False Alarm Rate: &lt; 2.2%</span>
        </div>
      </div>

      {/* 3. Filters Toolbar */}
      <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
        theme === 'dark' ? 'bg-[#0E1726]/80 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
      }`}>
        {/* Slot selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['ALL', 'A', 'B', 'C', 'D'] as const).map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => setSelectedSlot(slot)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                selectedSlot === slot
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {slot === 'ALL' ? 'Semua Pompa' : `Pump ${slot}${slot === 'C' ? ' ⚠' : ''}`}
            </button>
          ))}
        </div>

        {/* Severity & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="ALL">Semua Keparahan</option>
            <option value="CRITICAL">Kritis (Critical)</option>
            <option value="WARNING">Peringatan (Warning)</option>
            <option value="MODERATE">Moderat</option>
            <option value="RESOLVED">Terselesaikan (Resolved)</option>
          </select>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari pola anomali..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* 4. Incident Cards List */}
      <div className="space-y-4">
        {filteredIncidents.map((inc) => {
          const isCrit = inc.severity === 'CRITICAL';
          const isWarn = inc.severity === 'WARNING';
          const isResolved = inc.status === 'RESOLVED';

          return (
            <div
              key={inc.id}
              className={`p-5 rounded-3xl border transition-all ${
                isCrit && !isResolved
                  ? 'border-rose-500/40 bg-rose-500/5 dark:bg-[#1C1014]/60 shadow-sm'
                  : isWarn && !isResolved
                  ? 'border-amber-500/40 bg-amber-500/5 dark:bg-[#1A160C]/60 shadow-sm'
                  : theme === 'dark'
                  ? 'bg-[#0E1726]/80 border-slate-800'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  {/* Top line badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {inc.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                      isCrit ? 'bg-rose-500 text-white' : isWarn ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {inc.severity}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      inc.status === 'RESOLVED'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                        : inc.status === 'INVESTIGATING'
                        ? 'border-blue-500/30 bg-blue-500/10 text-blue-500'
                        : 'border-amber-500/30 bg-amber-500/10 text-amber-500'
                    }`}>
                      STATUS: {inc.status}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {inc.detected_at}
                    </span>
                  </div>

                  {/* Anomaly Title */}
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {inc.anomaly_type}
                  </h3>

                  {/* Machine & Point */}
                  <div className="text-xs text-slate-600 dark:text-slate-300 font-medium flex flex-wrap items-center gap-2">
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">{inc.pump_name}</span>
                    <span>•</span>
                    <span>Titik: <b>{inc.location_name}</b> ({inc.measurement_point})</span>
                  </div>

                  {/* Evidence Text */}
                  <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Bukti Telemetri:</span>
                    <p className="text-slate-600 dark:text-slate-400">{inc.evidence_metric}</p>
                  </div>
                </div>

                {/* Right Action & Anomaly Meter */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Skor Anomali AI
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="w-24 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            inc.anomaly_score > 0.8 ? 'bg-rose-500' : inc.anomaly_score > 0.5 ? 'bg-amber-500' : 'bg-cyan-500'
                          }`}
                          style={{ width: `${inc.anomaly_score * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-sm font-black text-slate-900 dark:text-white">
                        {inc.anomaly_score.toFixed(3)}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Keyakinan Model: {inc.ai_confidence}%
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-2">
                    {onNavigateToAnalytics && (
                      <button
                        type="button"
                        onClick={() => onNavigateToAnalytics(inc.slot_code, inc.measurement_point)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-cyan-500" />
                        <span>Analisis Gelombang</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleAcknowledge(inc.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                        inc.status === 'RESOLVED'
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-default'
                          : inc.status === 'INVESTIGATING'
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>
                        {inc.status === 'OPEN' ? 'Investigasi' : inc.status === 'INVESTIGATING' ? 'Tandai Selesai' : 'Selesai'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
