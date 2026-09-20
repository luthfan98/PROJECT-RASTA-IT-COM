import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import { 
  Boxes, 
  QrCode, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  X, 
  ArrowRightLeft
} from 'lucide-react';
import { RealQRCodeModal } from '../../components/common/RealQRCodeModal';

interface PhysicalPump {
  id: number;
  asset_code: string;
  serial_number: string;
  name: string;
  manufacturer: string;
  model: string;
  qr_code: string;
  status: string;
  slot_code: string | null;
  current_slot_name: string | null;
  installed_at: string | null;
}

interface PhysicalSensor {
  id: number;
  pump_id: number;
  asset_code: string;
  measurement_point: string;
  sensor_code: string;
  serial_number: string;
  name: string;
  measurement_type: string;
  component: string;
  position: string;
  axis: string;
  unit: string;
  upper_limit: number | null;
  qr_code: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DAMAGED' | 'REPLACED';
  installed_at: string;
  replaced_at: string | null;
}

interface AssetsManagementViewProps {
  initialTab?: 'pumps' | 'sensors';
}

export const AssetsManagementView: React.FC<AssetsManagementViewProps> = ({
  initialTab = 'pumps'
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'pumps' | 'sensors'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [pumps, setPumps] = useState<PhysicalPump[]>([]);
  const [sensors, setSensors] = useState<PhysicalSensor[]>([]);

  // Search & Filters for Sensors
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPump, setFilterPump] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  // QR Modal
  const [qrModalItem, setQrModalItem] = useState<{ code: string; title: string; subtitle: string } | null>(null);

  // Replace Sensor Modal
  const [replaceModalSensor, setReplaceModalSensor] = useState<PhysicalSensor | null>(null);
  const [newSensorSerial, setNewSensorSerial] = useState('');
  const [replaceSubmitting, setReplaceSubmitting] = useState(false);
  const [replaceSuccessMsg, setReplaceSuccessMsg] = useState('');

  const fetchAssets = async () => {
    try {
      const res = await axios.get('/api/monitoring/assets');
      if (res.data?.success) {
        setPumps(res.data.data.pumps || []);
        setSensors(res.data.data.sensors || []);
      }
    } catch (err) {
      console.error('Failed to load assets:', err);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const openReplaceModal = (s: PhysicalSensor) => {
    setReplaceModalSensor(s);
    setNewSensorSerial(`SN-SNS-${Date.now().toString().slice(-4)}`);
    setReplaceSuccessMsg('');
  };

  const handleReplaceSensor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replaceModalSensor) return;

    try {
      setReplaceSubmitting(true);
      const res = await axios.post('/api/monitoring/replace-sensor', {
        oldSensorId: replaceModalSensor.id,
        newSerialNumber: newSensorSerial
      });

      if (res.data?.success) {
        setReplaceSuccessMsg('Sukses! Sensor pengganti aktif dan sensor lama diarsipkan sebagai REPLACED.');
        setTimeout(() => {
          setReplaceModalSensor(null);
          fetchAssets();
        }, 1500);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengganti sensor');
    } finally {
      setReplaceSubmitting(false);
    }
  };

  const filteredSensors = sensors.filter(s => {
    const matchSearch = s.sensor_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.measurement_point.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPump = filterPump === 'ALL' || s.asset_code === filterPump;
    const matchType = filterType === 'ALL' || s.measurement_type === filterType;
    return matchSearch && matchPump && matchType;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-black flex items-center gap-2.5 ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            <Boxes className="w-6 h-6 text-cyan-500" />
            Master Manajemen Aset Fisik & Sensor
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Katalog unit pompa fisik, penelusuran nomor seri, kode QR, dan siklus penggantian sensor.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs font-bold">
          <button
            onClick={() => setActiveTab('pumps')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              activeTab === 'pumps'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Unit Pompa Fisik ({pumps.length})
          </button>
          <button
            onClick={() => setActiveTab('sensors')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              activeTab === 'sensors'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sensor Fisik ({sensors.length})
          </button>
        </div>
      </div>

      {/* TAB 1: PUMPS */}
      {activeTab === 'pumps' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {pumps.map((pump) => (
            <div
              key={pump.id}
              className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                theme === 'dark'
                  ? 'bg-[#0E1726]/90 border-slate-800 hover:border-cyan-500/50 shadow-xl'
                  : 'bg-white border-slate-200 hover:border-cyan-400 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono font-black text-sm text-cyan-400">
                    {pump.asset_code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                    {pump.status}
                  </span>
                </div>

                <h2 className={`font-black text-base mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {pump.name}
                </h2>
                <p className="text-xs text-slate-500 mb-4">{pump.model} • {pump.manufacturer}</p>

                <div className={`p-3 rounded-xl border space-y-1.5 text-xs mb-4 ${
                  theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nomor Seri:</span>
                    <span className="font-mono font-bold text-slate-300">{pump.serial_number || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Posisi Slot Saat Ini:</span>
                    <span className="font-bold text-cyan-400">
                      {pump.slot_code ? `Slot ${pump.slot_code}` : 'Di Gudang / Spare'}
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Button */}
              <button
                onClick={() => setQrModalItem({
                  code: pump.qr_code,
                  title: pump.name,
                  subtitle: `Kode Aset: ${pump.asset_code} | SN: ${pump.serial_number}`
                })}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 text-cyan-500" />
                Lihat Kode QR Aset
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: SENSORS */}
      {activeTab === 'sensors' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
            theme === 'dark' ? 'bg-[#0E1726]/90 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari kode sensor, nama, atau titik ukur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 rounded-xl border ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold">Filter Pompa:</span>
              <select
                value={filterPump}
                onChange={(e) => setFilterPump(e.target.value)}
                className={`px-3 py-2 rounded-xl border ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                }`}
              >
                <option value="ALL">Semua Pompa</option>
                {pumps.map(p => (
                  <option key={p.id} value={p.asset_code}>{p.asset_code} ({p.slot_code ? `Slot ${p.slot_code}` : 'Spare'})</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold">Jenis:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`px-3 py-2 rounded-xl border ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                }`}
              >
                <option value="ALL">Semua Jenis</option>
                <option value="VIBRATION">Vibrasi (mm/s)</option>
                <option value="TEMPERATURE">Temperatur (°C)</option>
              </select>
            </div>
          </div>

          {/* Sensors Table */}
          <div className={`rounded-2xl p-5 border overflow-x-auto ${
            theme === 'dark' ? 'bg-[#0E1726]/90 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b ${theme === 'dark' ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                  <th className="py-2.5 px-3">Kode Titik</th>
                  <th className="py-2.5 px-3">Unit Pompa</th>
                  <th className="py-2.5 px-3">Kode Fisik Sensor</th>
                  <th className="py-2.5 px-3">Jenis & Sumbu</th>
                  <th className="py-2.5 px-3">Batas Ambang</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                {filteredSensors.map((s) => (
                  <tr key={s.id} className={`${theme === 'dark' ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50/80'}`}>
                    <td className="py-3 px-3 font-bold text-cyan-400 font-mono">
                      {s.measurement_point}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold">
                      {s.asset_code}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-slate-300 block">{s.sensor_code}</span>
                      <span className="text-[10px] text-slate-500">SN: {s.serial_number || '-'}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span>{s.measurement_type}</span>
                      <span className="text-[10px] text-slate-500 block">Posisi: {s.position} | Axis: {s.axis}</span>
                    </td>
                    <td className="py-3 px-3 font-bold">
                      {s.upper_limit ? `${s.upper_limit} ${s.unit}` : '-'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        s.status === 'ACTIVE'
                          ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                          : 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setQrModalItem({
                            code: s.qr_code,
                            title: s.name,
                            subtitle: `Point: ${s.measurement_point} | Code: ${s.sensor_code}`
                          })}
                          className="p-1.5 rounded-lg border text-cyan-400 hover:bg-cyan-500/10 border-slate-700"
                          title="Lihat QR Code"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        {s.status === 'ACTIVE' && (
                          <button
                            onClick={() => openReplaceModal(s)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-600/20 text-slate-200 border border-slate-700 text-[11px] font-bold"
                          >
                            Ganti Sensor
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal QR Code */}
      {qrModalItem && (
        <RealQRCodeModal
          isOpen={!!qrModalItem}
          onClose={() => setQrModalItem(null)}
          value={qrModalItem.code}
          title={qrModalItem.title}
          subtitle={qrModalItem.subtitle}
          assetType={qrModalItem.title.toLowerCase().includes('sensor') ? 'SENSOR' : 'PUMP'}
        />
      )}

      {/* Modal Replace Sensor */}
      {replaceModalSensor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl relative ${
            theme === 'dark' ? 'bg-[#0E1726] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <button
              onClick={() => setReplaceModalSensor(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold flex items-center gap-2 mb-1">
              <ArrowRightLeft className="w-5 h-5 text-cyan-500" />
              Ganti Sensor Fisik ({replaceModalSensor.measurement_point})
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Sensor lama ({replaceModalSensor.sensor_code}) akan berstatus REPLACED, dan unit sensor baru dengan SN baru akan dipasang di titik ini.
            </p>

            {replaceSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {replaceSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleReplaceSensor} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Nomor Seri Sensor Baru</label>
                  <input
                    type="text"
                    required
                    value={newSensorSerial}
                    onChange={(e) => setNewSensorSerial(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border font-mono ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReplaceModalSensor(null)}
                    className="flex-1 py-2.5 rounded-xl border font-bold text-slate-400 hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={replaceSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-white shadow-md flex items-center justify-center gap-2"
                  >
                    {replaceSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Pasang Sensor Baru'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
