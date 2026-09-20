import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import { 
  Activity, 
  Search, 
  RefreshCw, 
  ArrowRight, 
  LayoutGrid,
  Table as TableIcon,
  QrCode
} from 'lucide-react';
import { RealQRCodeModal } from '../../components/common/RealQRCodeModal';

interface SensorItem {
  id: number;
  slot_code: string;
  pump_name: string;
  asset_code: string;
  sensor_code: string;
  measurement_point: string;
  name: string;
  measurement_type: 'VIBRATION' | 'TEMPERATURE';
  component: string;
  position: string;
  axis: string;
  unit: string;
  current_value: number;
  upper_limit: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'STANDBY';
  signal_quality: number;
  last_updated: string;
  model: string;
}

interface SensorsMonitoringViewProps {
  onNavigateToMeasurements?: (slotCode: string, pointKey: string) => void;
}

export const SensorsMonitoringView: React.FC<SensorsMonitoringViewProps> = ({
  onNavigateToMeasurements
}) => {
  const { theme } = useTheme();
  const [selectedSlot, setSelectedSlot] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isLoading, setIsLoading] = useState(false);

  // State for sensors loaded directly from MySQL database (64 physical channels)
  const [sensors, setSensors] = useState<SensorItem[]>([]);
  const [qrModalItem, setQrModalItem] = useState<{ code: string; title: string; subtitle: string } | null>(null);

  const fetchSensors = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/api/monitoring/sensors-summary');
      if (res.data?.success) {
        setSensors(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load sensors from database:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSensors();
  }, []);

  const handleRefresh = () => {
    fetchSensors();
  };

  // Filter Logic
  const filteredSensors = sensors.filter(sensor => {
    const matchSlot = selectedSlot === 'ALL' || sensor.slot_code === selectedSlot;
    const matchType = selectedType === 'ALL' || sensor.measurement_type === selectedType;
    const matchSearch = searchQuery === '' || 
      sensor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sensor.sensor_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sensor.asset_code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSlot && matchType && matchSearch;
  });

  // KPI Calculations
  const totalCount = sensors.length;
  const warningCount = sensors.filter(s => s.status === 'WARNING').length;
  const normalCount = sensors.filter(s => s.status === 'NORMAL').length;
  const standbyCount = sensors.filter(s => s.status === 'STANDBY').length;

  return (
    <div className="space-y-6 w-full animate-fadeIn">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-500">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Monitoring Status & Matriks Sensor
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Katalog instrumen telemetri dan status kesehatan 16 sensor akselerometer & temperatur lapangan.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Tampilan Grid Kartu"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                viewMode === 'table' 
                  ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Tampilan Tabel Matriks"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className={`p-4 rounded-2xl border transition-all ${
          theme === 'dark' ? 'bg-[#0E1726]/80 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <span className="text-xs font-bold text-slate-400 block mb-1">Total Titik Sensor</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{totalCount}</span>
            <span className="text-xs font-bold text-slate-400">Titik Kanal</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">4 Unit Pompa Booster L4</span>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          theme === 'dark' ? 'bg-[#0E1726]/80 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <span className="text-xs font-bold text-slate-400 block mb-1">Kondisi Normal</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-500">{normalCount}</span>
            <span className="text-xs font-bold text-slate-400">Titik Operasi</span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-1">ISO 10816 Zone A/B</span>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          theme === 'dark' ? 'bg-[#0E1726]/80 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <span className="text-xs font-bold text-slate-400 block mb-1">Perhatian / Warning</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-500">{warningCount}</span>
            <span className="text-xs font-bold text-slate-400">Titik Kanal</span>
          </div>
          <span className="text-[11px] text-amber-500 font-semibold block mt-1">Pump C (P-DE Getaran Tinggi)</span>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          theme === 'dark' ? 'bg-[#0E1726]/80 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <span className="text-xs font-bold text-slate-400 block mb-1">Status Standby</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-500">{standbyCount}</span>
            <span className="text-xs font-bold text-slate-400">Titik Unit</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Rotasi Standar Normal</span>
        </div>
      </div>

      {/* 3. Filters Bar */}
      <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
        theme === 'dark' ? 'bg-[#0E1726]/80 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
      }`}>
        {/* Slot Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['ALL', 'A', 'B', 'C', 'D'] as const).map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => setSelectedSlot(slot)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                selectedSlot === slot
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {slot === 'ALL' ? 'Semua Pompa' : `Pump ${slot}${slot === 'C' ? ' ⚠' : ''}`}
            </button>
          ))}
        </div>

        {/* Type & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setSelectedType('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                selectedType === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Semua Jenis
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('VIBRATION')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                selectedType === 'VIBRATION'
                  ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Vibrasi
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('TEMPERATURE')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                selectedType === 'TEMPERATURE'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Suhu
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari titik sensor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* 4. Sensor Catalog Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {filteredSensors.map((sensor) => {
            const isWarn = sensor.status === 'WARNING';
            const isStandby = sensor.status === 'STANDBY';

            return (
              <div
                key={sensor.id}
                className={`p-4 rounded-2xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                  isWarn
                    ? 'border-amber-500/50 bg-amber-500/5 dark:bg-[#1E190E]/60 shadow-xs'
                    : theme === 'dark'
                    ? 'bg-[#0E1726]/90 border-slate-800 hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Top Badge Row */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                        isWarn 
                          ? 'bg-amber-500 text-slate-950' 
                          : isStandby
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          : 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
                      }`}>
                        SLOT {sensor.slot_code}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        {sensor.position}
                      </span>
                    </div>

                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      isWarn
                        ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                        : isStandby
                        ? 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-400 border-slate-700/50'
                        : 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                    }`}>
                      {sensor.status}
                    </span>
                  </div>

                  {/* Sensor Name */}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {sensor.name}
                  </h3>
                  <p className="font-mono text-[10px] text-slate-400 mt-0.5 truncate">
                    {sensor.sensor_code}
                  </p>

                  {/* Reading Value Display */}
                  <div className="my-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Pembacaan Terkini
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className={`text-2xl font-black ${
                          isWarn ? 'text-amber-500' : isStandby ? 'text-slate-400' : 'text-slate-900 dark:text-white'
                        }`}>
                          {sensor.current_value.toFixed(2)}
                        </span>
                        <span className="text-xs font-bold text-slate-400">{sensor.unit}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Batas ISO</span>
                      <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                        {sensor.upper_limit} {sensor.unit}
                      </span>
                    </div>
                  </div>

                  {/* Hardware & Channel Details */}
                  <div className="space-y-1 text-[11px] text-slate-500">
                    <div className="flex items-center justify-between">
                      <span>Sumbu Kanal:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{sensor.axis}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Instrumen:</span>
                      <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400 truncate max-w-[140px]">
                        {sensor.model}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Sinyal:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {sensor.signal_quality}% (Good)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action to Jump to Measurements & QR Code */}
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQrModalItem({
                      code: sensor.sensor_code,
                      title: `QR Code: ${sensor.sensor_code}`,
                      subtitle: `${sensor.name} • ${sensor.pump_name}`
                    })}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-cyan-500 transition-colors"
                    title="Lihat Label QR Code Fisik"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateToMeasurements) {
                        onNavigateToMeasurements(sensor.slot_code, sensor.measurement_point);
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold transition-colors"
                  >
                    <span>Analisis Deret Waktu</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className={`rounded-2xl border overflow-hidden ${
          theme === 'dark' ? 'bg-[#0E1726]/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Slot Pompa</th>
                  <th className="px-4 py-3">Nama Titik Sensor</th>
                  <th className="px-4 py-3">Sumbu</th>
                  <th className="px-4 py-3">Tipe</th>
                  <th className="px-4 py-3">Nilai Riil Saat Ini</th>
                  <th className="px-4 py-3">Batas ISO</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Instrumen</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSensors.map((sensor) => (
                  <tr key={sensor.id} className="hover:bg-slate-500/5 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                      {sensor.pump_name}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {sensor.name}
                      <span className="block font-mono text-[10px] text-slate-400">{sensor.sensor_code}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{sensor.axis}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {sensor.measurement_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white font-mono">
                      {sensor.current_value.toFixed(2)} {sensor.unit}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono">
                      {sensor.upper_limit} {sensor.unit}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        sensor.status === 'WARNING'
                          ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                          : sensor.status === 'STANDBY'
                          ? 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-400 border-slate-700/50'
                          : 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                      }`}>
                        {sensor.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-500 font-mono truncate max-w-[150px]">
                      {sensor.model}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setQrModalItem({
                            code: sensor.sensor_code,
                            title: `QR Code: ${sensor.sensor_code}`,
                            subtitle: `${sensor.name} • ${sensor.pump_name}`
                          })}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-cyan-500 transition-colors"
                          title="Lihat Label QR Code Fisik"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (onNavigateToMeasurements) {
                              onNavigateToMeasurements(sensor.slot_code, sensor.measurement_point);
                            }
                          }}
                          className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline"
                        >
                          Analisis →
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Real Scannable QR Code */}
      {qrModalItem && (
        <RealQRCodeModal
          isOpen={!!qrModalItem}
          onClose={() => setQrModalItem(null)}
          value={qrModalItem.code}
          title={qrModalItem.title}
          subtitle={qrModalItem.subtitle}
          assetType="SENSOR"
        />
      )}
    </div>
  );
};
