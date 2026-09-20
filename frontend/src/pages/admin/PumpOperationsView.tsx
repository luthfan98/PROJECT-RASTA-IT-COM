import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import { 
  Gauge, 
  History, 
  RefreshCw, 
  ArrowRightLeft, 
  CheckCircle2, 
  X
} from 'lucide-react';

interface SlotData {
  slot_id: number;
  slot_code: string;
  slot_name: string;
  pump_id: number;
  asset_code: string;
  serial_number: string;
  pump_name: string;
  manufacturer: string;
  model: string;
  qr_code: string;
  pump_asset_status: string;
  installation_id: number;
  installed_at: string;
  sequence_position: number;
  pump_status: 'ON' | 'OFF' | 'MAINTENANCE' | 'UNAVAILABLE';
  operating_state: string;
  load_pct: number | null;
  running_hours_total: number | null;
  start_count_total: number | null;
}

interface InstallHistory {
  id: number;
  slot_code: string;
  slot_name: string;
  asset_code: string;
  pump_name: string;
  serial_number: string;
  installed_at: string;
  removed_at: string | null;
  notes: string;
}

export const PumpOperationsView: React.FC = () => {
  const { theme } = useTheme();
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [history, setHistory] = useState<InstallHistory[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal swap pump
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotData | null>(null);
  const [newAssetCode, setNewAssetCode] = useState('');
  const [newSerialNumber, setNewSerialNumber] = useState('');
  const [swapNotes, setSwapNotes] = useState('');
  const [swapSubmitting, setSwapSubmitting] = useState(false);
  const [swapSuccessMsg, setSwapSuccessMsg] = useState('');

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const res = await axios.get('/api/monitoring/pumps');
      if (res.data?.success) {
        setSlots(res.data.data.slots || []);
        setHistory(res.data.data.history || []);
      }
    } catch (err) {
      console.error('Failed to load pump slots:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openSwapModal = (slot: SlotData) => {
    setSelectedSlot(slot);
    const nextNum = Math.floor(100 + Math.random() * 900);
    setNewAssetCode(`PUMP-L4-BTG-${nextNum}`);
    setNewSerialNumber(`SN-LZ-2026-${nextNum}`);
    setSwapNotes(`Penggantian rutin unit pompa di Slot ${slot.slot_code}`);
    setSwapSuccessMsg('');
    setSwapModalOpen(true);
  };

  const handleSwapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !newAssetCode) return;

    try {
      setSwapSubmitting(true);
      const res = await axios.post('/api/monitoring/swap-pump', {
        slotId: selectedSlot.slot_id,
        newAssetCode,
        serialNumber: newSerialNumber,
        pumpName: `Leistritz L4 Unit #${newAssetCode.split('-').pop()}`,
        manufacturer: 'Sulzer / Leistritz',
        model: 'Centrifugal L4 Multi-Stage',
        notes: swapNotes
      });

      if (res.data?.success) {
        setSwapSuccessMsg(`Sukses! Unit ${newAssetCode} berhasil dipasang ke Slot ${selectedSlot.slot_code}.`);
        setTimeout(() => {
          setSwapModalOpen(false);
          fetchData();
        }, 1500);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengganti unit pompa');
    } finally {
      setSwapSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-black flex items-center gap-2.5 ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            <Gauge className="w-6 h-6 text-cyan-500" />
            Monitoring Slot Operasi & Unit Pompa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Status operasional 4 slot pompa Stasiun Batang dan riwayat siklus hidup unit aset fisik terpasang.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={isRefreshing}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
            theme === 'dark'
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-500' : ''}`} />
          Segarkan Data
        </button>
      </div>

      {/* 4 Pump Slots Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {slots.map((slot) => {
          const isRunning = slot.pump_status === 'ON';
          const isWarning = slot.operating_state === 'WARNING' || slot.operating_state === 'DEGRADING';
          const isCritical = slot.operating_state === 'CRITICAL' || slot.operating_state === 'FAILURE';

          let stateBadgeColor = 'bg-slate-500/15 text-slate-400 border-slate-500/30';
          if (isRunning) stateBadgeColor = 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';
          if (isWarning) stateBadgeColor = 'bg-amber-500/15 text-amber-500 border-amber-500/30';
          if (isCritical) stateBadgeColor = 'bg-rose-500/15 text-rose-500 border-rose-500/30';

          return (
            <div
              key={slot.slot_id}
              className={`rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                theme === 'dark'
                  ? 'bg-[#0E1726]/90 border-slate-800 hover:border-cyan-500/40 shadow-xl'
                  : 'bg-white border-slate-200/90 hover:border-cyan-400 shadow-sm'
              }`}
            >
              {/* Glow Accent */}
              {isRunning && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              )}
              {isCritical && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />
              )}

              <div>
                {/* Top Slot Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-cyan-600/15 border border-cyan-500/30 text-cyan-500 font-black text-sm flex items-center justify-center">
                      {slot.slot_code}
                    </span>
                    <div>
                      <h2 className={`font-black text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        {slot.slot_name}
                      </h2>
                      <span className="text-[10px] text-slate-500">Urutan: #{slot.sequence_position || slot.slot_code}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${stateBadgeColor}`}>
                    {slot.operating_state || slot.pump_status}
                  </span>
                </div>

                {/* Installed Physical Pump Asset Box */}
                <div className={`p-3.5 rounded-xl border mb-4 space-y-1.5 ${
                  theme === 'dark' ? 'bg-slate-900/80 border-slate-800/80' : 'bg-slate-50 border-slate-200/80'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unit Fisik Terpasang</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-cyan-500/15 text-cyan-500 font-bold">
                      {slot.pump_asset_status}
                    </span>
                  </div>
                  <p className={`font-mono font-bold text-xs ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-800'}`}>
                    {slot.asset_code || 'Belum Terpasang'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    SN: <span className="font-mono text-slate-400">{slot.serial_number || '-'}</span>
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Model: <span className="font-medium text-slate-300">{slot.model || slot.pump_name}</span>
                  </p>
                </div>

                {/* Operating Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div className={`p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950/40 border-slate-800/60' : 'bg-white border-slate-200'}`}>
                    <span className="text-[10px] text-slate-400 block">Beban (Load)</span>
                    <span className="font-bold text-sm text-cyan-500">
                      {slot.load_pct ? `${slot.load_pct}%` : '0%'}
                    </span>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950/40 border-slate-800/60' : 'bg-white border-slate-200'}`}>
                    <span className="text-[10px] text-slate-400 block">Running Hours</span>
                    <span className="font-bold text-sm text-emerald-500">
                      {slot.running_hours_total ? Number(slot.running_hours_total).toLocaleString('id-ID') : '0'} j
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button: Swap Pump */}
              <button
                onClick={() => openSwapModal(slot)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-800 hover:bg-cyan-600/20 hover:border-cyan-500/50 text-slate-200'
                    : 'bg-slate-100 hover:bg-cyan-50 hover:border-cyan-300 text-slate-700'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-500" />
                Ganti Unit di Slot Ini
              </button>
            </div>
          );
        })}
      </div>

      {/* Installation History Table */}
      <div className={`rounded-2xl p-5 sm:p-6 border transition-all ${
        theme === 'dark' ? 'bg-[#0E1726]/90 border-slate-800 shadow-xl' : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-base font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              <History className="w-4 h-4 text-cyan-500" />
              Riwayat Pemasangan Pompa di Setiap Slot (Asset Lifecycle)
            </h2>
            <p className="text-xs text-slate-500">
              Audit log pergantian unit pompa fisik per posisi stasiun tanpa menghapus histori data masa lalu.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b ${theme === 'dark' ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <th className="py-2.5 px-3">Slot Stasiun</th>
                <th className="py-2.5 px-3">Kode Aset Pompa</th>
                <th className="py-2.5 px-3">Nomor Seri Fisik</th>
                <th className="py-2.5 px-3">Tanggal Pasang</th>
                <th className="py-2.5 px-3">Tanggal Dilepas</th>
                <th className="py-2.5 px-3">Status Saat Ini</th>
                <th className="py-2.5 px-3">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
              {history.map((h) => {
                const isActive = !h.removed_at;
                return (
                  <tr key={h.id} className={`${theme === 'dark' ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50/80'}`}>
                    <td className="py-3 px-3 font-bold text-cyan-500">
                      Slot {h.slot_code}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold">
                      {h.asset_code}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {h.serial_number || '-'}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(h.installed_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 px-3">
                      {h.removed_at ? (
                        <span className="text-slate-500">
                          {new Date(h.removed_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Masih Terpasang</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {isActive ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                          Aktif di Slot
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-400 border border-slate-500/30">
                          Dilepas / Diganti
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-500 max-w-xs truncate">
                      {h.notes || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Swap Pump */}
      {swapModalOpen && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl relative ${
            theme === 'dark' ? 'bg-[#0E1726] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <button
              onClick={() => setSwapModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold flex items-center gap-2 mb-1">
              <ArrowRightLeft className="w-5 h-5 text-cyan-500" />
              Ganti Unit Pompa di Slot {selectedSlot.slot_code}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Unit saat ini ({selectedSlot.asset_code}) akan ditutup riwayatnya dengan status MAINTENANCE dan unit baru akan dipasang.
            </p>

            {swapSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {swapSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleSwapSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Kode Aset Unit Baru</label>
                  <input
                    type="text"
                    required
                    value={newAssetCode}
                    onChange={(e) => setNewAssetCode(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border font-mono ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Nomor Seri Pabrik (Serial Number)</label>
                  <input
                    type="text"
                    required
                    value={newSerialNumber}
                    onChange={(e) => setNewSerialNumber(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border font-mono ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Alasan / Catatan Penggantian</label>
                  <textarea
                    rows={2}
                    value={swapNotes}
                    onChange={(e) => setSwapNotes(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSwapModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border font-bold text-slate-400 hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={swapSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-white shadow-md flex items-center justify-center gap-2"
                  >
                    {swapSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Konfirmasi Pasang'}
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
