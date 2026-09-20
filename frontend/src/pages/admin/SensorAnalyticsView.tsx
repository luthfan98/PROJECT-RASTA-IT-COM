import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import { 
  LineChart, 
  TrendingUp, 
  RefreshCw,
  Download,
  Search,
  FileSpreadsheet
} from 'lucide-react';

interface SensorReading {
  measured_at: string;
  value: number;
  quality: string;
  source_type?: string;
  operator_name?: string;
}

const MEASUREMENT_POINTS = [
  // Vibration
  { key: 'PUMP-DE-H', label: 'Pump DE Horizontal', type: 'VIBRATION', unit: 'mm/s', limit: 7.1 },
  { key: 'PUMP-DE-V', label: 'Pump DE Vertical', type: 'VIBRATION', unit: 'mm/s', limit: 7.1 },
  { key: 'PUMP-DE-A', label: 'Pump DE Axial', type: 'VIBRATION', unit: 'mm/s', limit: 7.1 },
  { key: 'PUMP-NDE-H', label: 'Pump NDE Horizontal', type: 'VIBRATION', unit: 'mm/s', limit: 7.1 },
  { key: 'PUMP-NDE-V', label: 'Pump NDE Vertical', type: 'VIBRATION', unit: 'mm/s', limit: 7.1 },
  { key: 'PUMP-NDE-A', label: 'Pump NDE Axial', type: 'VIBRATION', unit: 'mm/s', limit: 7.1 },
  { key: 'ELMOT-DE-H', label: 'Elmot DE Horizontal', type: 'VIBRATION', unit: 'mm/s', limit: 4.5 },
  { key: 'ELMOT-DE-V', label: 'Elmot DE Vertical', type: 'VIBRATION', unit: 'mm/s', limit: 4.5 },
  { key: 'ELMOT-DE-A', label: 'Elmot DE Axial', type: 'VIBRATION', unit: 'mm/s', limit: 4.5 },
  { key: 'ELMOT-NDE-H', label: 'Elmot NDE Horizontal', type: 'VIBRATION', unit: 'mm/s', limit: 4.5 },
  { key: 'ELMOT-NDE-V', label: 'Elmot NDE Vertical', type: 'VIBRATION', unit: 'mm/s', limit: 4.5 },
  { key: 'ELMOT-NDE-A', label: 'Elmot NDE Axial', type: 'VIBRATION', unit: 'mm/s', limit: 4.5 },
  // Temperature
  { key: 'TEMP-PUMP-DE', label: 'Temp Pump DE', type: 'TEMPERATURE', unit: '°C', limit: 90.0 },
  { key: 'TEMP-PUMP-NDE', label: 'Temp Pump NDE', type: 'TEMPERATURE', unit: '°C', limit: 90.0 },
  { key: 'TEMP-ELMOT-DE', label: 'Temp Elmot DE', type: 'TEMPERATURE', unit: '°C', limit: 85.0 },
  { key: 'TEMP-ELMOT-NDE', label: 'Temp Elmot NDE', type: 'TEMPERATURE', unit: '°C', limit: 85.0 },
];

interface SensorAnalyticsViewProps {
  initialSlot?: string;
  initialPoint?: string;
}

export const SensorAnalyticsView: React.FC<SensorAnalyticsViewProps> = ({
  initialSlot = 'C',
  initialPoint = 'PUMP-DE-H'
}) => {
  const { theme } = useTheme();
  const [selectedSlot, setSelectedSlot] = useState<string>(initialSlot);
  const [selectedPoint, setSelectedPoint] = useState<string>(initialPoint);
  const [limitCount, setLimitCount] = useState<number>(48);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tableSearch, setTableSearch] = useState<string>('');

  useEffect(() => {
    if (initialSlot) setSelectedSlot(initialSlot);
    if (initialPoint) setSelectedPoint(initialPoint);
  }, [initialSlot, initialPoint]);

  const [sensorInfo, setSensorInfo] = useState<any>(null);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/monitoring/analytics', {
        params: {
          slotCode: selectedSlot,
          measurementPoint: selectedPoint,
          limit: limitCount
        }
      });
      if (res.data?.success) {
        setSensorInfo(res.data.data.sensor);
        setReadings(res.data.data.readings || []);
        setStats(res.data.data.stats || null);
      }
    } catch (err) {
      console.error('Failed to fetch sensor analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedSlot, selectedPoint, limitCount]);

  const currentDef = MEASUREMENT_POINTS.find(p => p.key === selectedPoint) || MEASUREMENT_POINTS[0];
  const isTemperature = currentDef.type === 'TEMPERATURE';

  // SVG Chart rendering calculations (Fluid 100% full-width dimensions)
  const values = readings.map(r => Number(r.value) || 0);
  const minVal = values.length ? Math.min(...values, 0) : 0;
  const maxVal = values.length ? Math.max(...values, currentDef.limit * 1.15) : 10;
  const currentVal = values.length ? values[values.length - 1] : 0;

  const chartHeight = 260;
  const chartWidth = 1100;
  const padding = { top: 30, right: 40, bottom: 40, left: 65 };

  const getCoordinates = (val: number, idx: number) => {
    const usableWidth = chartWidth - padding.left - padding.right;
    const usableHeight = chartHeight - padding.top - padding.bottom;
    const x = padding.left + (idx / Math.max(values.length - 1, 1)) * usableWidth;
    const y = chartHeight - padding.bottom - ((val - minVal) / Math.max(maxVal - minVal, 1)) * usableHeight;
    return { x, y };
  };

  const pointsString = values.map((val, idx) => {
    const { x, y } = getCoordinates(val, idx);
    return `${x},${y}`;
  }).join(' ');

  const areaPointsString = values.length > 1 ? [
    `${padding.left},${chartHeight - padding.bottom}`,
    ...values.map((val, idx) => {
      const { x, y } = getCoordinates(val, idx);
      return `${x},${y}`;
    }),
    `${chartWidth - padding.right},${chartHeight - padding.bottom}`
  ].join(' ') : '';

  const usableHeight = chartHeight - padding.top - padding.bottom;
  const limitY = chartHeight - padding.bottom - ((currentDef.limit - minVal) / Math.max(maxVal - minVal, 1)) * usableHeight;

  // ISO Zone Evaluation
  let isoZone = 'Zone A (Baru/Sangat Baik)';
  let isoBadgeColor = 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';
  if (currentVal > currentDef.limit * 0.9) {
    isoZone = 'Zone D (Bahaya / Rusak)';
    isoBadgeColor = 'bg-rose-500/15 text-rose-500 border-rose-500/30';
  } else if (currentVal > currentDef.limit * 0.6) {
    isoZone = 'Zone C (Perlu Perhatian)';
    isoBadgeColor = 'bg-amber-500/15 text-amber-500 border-amber-500/30';
  } else if (currentVal > currentDef.limit * 0.3) {
    isoZone = 'Zone B (Beroperasi Normal)';
    isoBadgeColor = 'bg-cyan-500/15 text-cyan-500 border-cyan-500/30';
  }

  // Export CSV
  const handleExportCSV = () => {
    if (!readings.length) return;
    const headers = 'Waktu Pengukuran (WIB),Slot Pompa,Titik Ukur,Nilai,Satuan,Batas ISO,Kualitas Sinyal\n';
    const rows = readings.map(r => 
      `"${r.measured_at}","${selectedSlot}","${selectedPoint}",${r.value},"${currentDef.unit}",${currentDef.limit},"${r.quality}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `RASTA_Measurements_${selectedSlot}_${selectedPoint}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredReadings = readings.filter(r => 
    r.measured_at.toLowerCase().includes(tableSearch.toLowerCase()) ||
    String(r.value).includes(tableSearch) ||
    r.quality.toLowerCase().includes(tableSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full animate-fadeIn">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-500">
              <LineChart className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Analitik Deret Waktu & Log Pengukuran (Measurements)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Eksplorasi tren gelombang sinyal mekanikal terhadap batas toleransi getaran ISO 10816.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={fetchAnalytics}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-500 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Toolbar */}
      <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
        theme === 'dark' ? 'bg-[#0E1726]/90 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
      }`}>
        {/* Left: Slot & Point Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-slate-400 mr-1">Slot:</span>
            {['A', 'B', 'C', 'D'].map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors ${
                  selectedSlot === slot
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Titik:</span>
            <select
              value={selectedPoint}
              onChange={(e) => setSelectedPoint(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <optgroup label="Pengukuran Vibrasi (mm/s)">
                {MEASUREMENT_POINTS.filter(p => p.type === 'VIBRATION').map(p => (
                  <option key={p.key} value={p.key}>{p.label} ({p.key})</option>
                ))}
              </optgroup>
              <optgroup label="Pengukuran Suhu (°C)">
                {MEASUREMENT_POINTS.filter(p => p.type === 'TEMPERATURE').map(p => (
                  <option key={p.key} value={p.key}>{p.label} ({p.key})</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Right: Sample Window Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl text-xs">
          {[24, 48, 120, 720].map((hours) => (
            <button
              key={hours}
              type="button"
              onClick={() => setLimitCount(hours)}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                limitCount === hours
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {hours === 720 ? '30 Hari' : `${hours} Jam`}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-[#0E1726]/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <span className="text-xs text-slate-400 font-bold block mb-1">Nilai Pengukuran Terakhir</span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-black ${
              currentVal > currentDef.limit * 0.9 ? 'text-rose-500' : currentVal > currentDef.limit * 0.6 ? 'text-amber-500' : 'text-slate-900 dark:text-white'
            }`}>
              {currentVal ? Number(currentVal).toFixed(3) : '-'}
            </span>
            <span className="text-xs font-bold text-slate-400">{currentDef.unit}</span>
          </div>
          <span className="text-[10px] text-slate-500">Titik: {selectedPoint}</span>
        </div>

        <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-[#0E1726]/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <span className="text-xs text-slate-400 font-bold block mb-1">Kategori Standar ISO</span>
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-black border ${isoBadgeColor}`}>
            {isoZone}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Batas Bahaya: {currentDef.limit} {currentDef.unit}</span>
        </div>

        <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-[#0E1726]/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <span className="text-xs text-slate-400 font-bold block mb-1">Statistik Sampel (Mean)</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-500">
              {stats?.avg_val ? Number(stats.avg_val).toFixed(3) : '-'}
            </span>
            <span className="text-xs font-bold text-slate-400">{currentDef.unit}</span>
          </div>
          <span className="text-[10px] text-slate-500">Min: {Number(stats?.min_val || 0).toFixed(2)} | Max: {Number(stats?.max_val || 0).toFixed(2)}</span>
        </div>

        <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-[#0E1726]/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <span className="text-xs text-slate-400 font-bold block mb-1">Identitas Sensor Fisik</span>
          <p className="font-mono text-xs font-bold text-cyan-400 truncate">
            {sensorInfo?.sensor_code || 'SNS-BTG-003-PUMP-DE-H'}
          </p>
          <span className="text-[10px] text-slate-500 block mt-1">Slot: {selectedSlot} • Unit Terpasang Aktif</span>
        </div>
      </div>

      {/* 4. FULL-WIDTH FLUID TIME-SERIES SVG CHART */}
      <div className={`rounded-2xl p-5 sm:p-6 border transition-all ${
        theme === 'dark' ? 'bg-[#0E1726]/90 border-slate-800 shadow-xl' : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-base font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              <TrendingUp className="w-4 h-4 text-cyan-500" />
              Grafik Fluktuasi {currentDef.label} (Slot {selectedSlot})
            </h2>
            <p className="text-xs text-slate-500">
              Garis horizontal merah putus-putus menunjukkan ambang batas ISO ({currentDef.limit} {currentDef.unit}).
            </p>
          </div>
        </div>

        {/* Fluid SVG Canvas: Takes 100% width of card container without letterbox empty space */}
        <div className="w-full relative overflow-hidden">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto min-w-[700px] select-none"
          >
            <defs>
              <linearGradient id="waveCyanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="waveAmberGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Background Grid Lines across full width */}
            <line x1={padding.left} y1={padding.top} x2={chartWidth - padding.right} y2={padding.top} stroke={theme === 'dark' ? '#1E293B' : '#E2E8F0'} strokeDasharray="3 3" />
            <line x1={padding.left} y1={chartHeight / 2} x2={chartWidth - padding.right} y2={chartHeight / 2} stroke={theme === 'dark' ? '#1E293B' : '#E2E8F0'} strokeDasharray="3 3" />
            <line x1={padding.left} y1={chartHeight - padding.bottom} x2={chartWidth - padding.right} y2={chartHeight - padding.bottom} stroke={theme === 'dark' ? '#334155' : '#CBD5E1'} strokeWidth="1.5" />

            {/* Y-Axis Value Labels */}
            <text x={padding.left - 10} y={padding.top + 4} textAnchor="end" fill="#64748B" fontSize="10" font-family="monospace">
              {maxVal.toFixed(1)}
            </text>
            <text x={padding.left - 10} y={chartHeight / 2 + 4} textAnchor="end" fill="#64748B" fontSize="10" font-family="monospace">
              {((minVal + maxVal) / 2).toFixed(1)}
            </text>
            <text x={padding.left - 10} y={chartHeight - padding.bottom + 4} textAnchor="end" fill="#64748B" fontSize="10" font-family="monospace">
              {minVal.toFixed(1)}
            </text>

            {/* Threshold Alarm Line spanning 100% full width */}
            {limitY >= padding.top && limitY <= chartHeight - padding.bottom && (
              <g>
                <line
                  x1={padding.left}
                  y1={limitY}
                  x2={chartWidth - padding.right}
                  y2={limitY}
                  stroke="#EF4444"
                  strokeWidth="1.5"
                  strokeDasharray="5 4"
                />
                <text x={chartWidth - padding.right - 95} y={limitY - 6} fill="#EF4444" fontSize="10" fontWeight="bold">
                  Batas ISO ({currentDef.limit} {currentDef.unit})
                </text>
              </g>
            )}

            {/* Area Fill Gradient under the line */}
            {values.length > 1 && (
              <polygon
                points={areaPointsString}
                fill={isTemperature ? 'url(#waveAmberGrad)' : 'url(#waveCyanGrad)'}
              />
            )}

            {/* Data Trend Line */}
            {values.length > 1 && (
              <polyline
                fill="none"
                stroke={isTemperature ? '#F59E0B' : '#06B6D4'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsString}
              />
            )}

            {/* Data Points */}
            {values.map((val, idx) => {
              const { x, y } = getCoordinates(val, idx);
              const isOverLimit = val >= currentDef.limit;
              const isHovered = hoveredIdx === idx;

              return (
                <g 
                  key={idx} 
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 6 : (isOverLimit ? 4 : 2.5)}
                    fill={isOverLimit ? '#EF4444' : isTemperature ? '#F59E0B' : '#06B6D4'}
                    stroke="#FFFFFF"
                    strokeWidth={isHovered ? 2 : 1}
                    className="transition-all"
                  />

                  {/* Tooltip on hover */}
                  {isHovered && (
                    <g>
                      <rect
                        x={x - 65}
                        y={y - 45}
                        width="130"
                        height="35"
                        rx="8"
                        fill="#0F172A"
                        stroke="#38BDF8"
                        strokeWidth="1"
                        className="drop-shadow-lg"
                      />
                      <text x={x} y={y - 30} textAnchor="middle" fill="#94A3B8" fontSize="9" fontWeight="bold">
                        {readings[idx]?.measured_at || ''}
                      </text>
                      <text x={x} y={y - 17} textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="black">
                        {val.toFixed(3)} {currentDef.unit}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Timeline Range Indicator */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 mt-3">
          <span>{readings[0]?.measured_at || 'Awal Periode'}</span>
          <span className="font-bold font-mono">Total Titik Sampel: {readings.length} Jam</span>
          <span>{readings[readings.length - 1]?.measured_at || 'Terbaru'}</span>
        </div>
      </div>

      {/* 5. Measurement Records Log Table */}
      <div className={`rounded-2xl border overflow-hidden ${
        theme === 'dark' ? 'bg-[#0E1726]/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-cyan-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Tabel Log Data Pengukuran Terperinci
            </h3>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Saring log..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="pl-8 pr-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider sticky top-0">
              <tr>
                <th className="px-4 py-2.5">Waktu Pengukuran</th>
                <th className="px-4 py-2.5">Slot</th>
                <th className="px-4 py-2.5">Titik Ukur</th>
                <th className="px-4 py-2.5">Nilai Terukur</th>
                <th className="px-4 py-2.5">Status ISO</th>
                <th className="px-4 py-2.5">Kualitas Sinyal</th>
                <th className="px-4 py-2.5">Sumber Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {filteredReadings.slice(0, 50).map((row, idx) => {
                const isOver = row.value >= currentDef.limit;
                return (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-2 text-slate-600 dark:text-slate-300 font-sans">{row.measured_at}</td>
                    <td className="px-4 py-2 font-bold text-cyan-600 dark:text-cyan-400">{selectedSlot}</td>
                    <td className="px-4 py-2 text-slate-500 font-sans">{currentDef.label}</td>
                    <td className={`px-4 py-2 font-black ${isOver ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                      {Number(row.value).toFixed(3)} {currentDef.unit}
                    </td>
                    <td className="px-4 py-2 font-sans">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOver ? 'bg-rose-500/15 text-rose-500' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {isOver ? 'Zone D' : 'Zone A/B'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-emerald-600 dark:text-emerald-400 font-sans font-semibold">
                      {row.quality || 'GOOD (100%)'}
                    </td>
                    <td className="px-4 py-2 font-sans text-slate-500">
                      {idx === readings.length - 1 ? 'Input Manual Petugas' : 'SCADA Telemetri'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
