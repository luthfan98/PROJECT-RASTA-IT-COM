import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import { 
  Wrench, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  X
} from 'lucide-react';

interface MaintenanceRecord {
  id: number;
  asset_code: string;
  pump_name: string;
  maintenance_type: string;
  started_at: string;
  completed_at: string | null;
  description: string;
  action_taken: string;
  performed_by: string;
  recorded_by_name: string;
}

export const MaintenanceView: React.FC = () => {
  const { theme } = useTheme();
  const [logs, setLogs] = useState<MaintenanceRecord[]>([]);

  // Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetAsset, setTargetAsset] = useState('PUMP-L4-BTG-001');
  const [mType, setMType] = useState('PREVENTIVE');
  const [technician, setTechnician] = useState('');
  const [description, setDescription] = useState('');
  const [actionTaken, setActionTaken] = useState('');

  const fetchLogs = async () => {
    try {
      const res = await axios.get('/api/monitoring/maintenance');
      if (res.data?.success) {
        setLogs(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load maintenance records from database:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: MaintenanceRecord = {
      id: Date.now(),
      asset_code: targetAsset,
      pump_name: `Unit ${targetAsset.split('-').pop()}`,
      maintenance_type: mType,
      started_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      completed_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      description,
      action_taken: actionTaken,
      performed_by: technician || 'Tim Pemeliharaan',
      recorded_by_name: 'Admin'
    };

    setLogs([newEntry, ...logs]);
    setIsModalOpen(false);
    setDescription('');
    setActionTaken('');
    setTechnician('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-black flex items-center gap-2.5 ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            <Wrench className="w-6 h-6 text-cyan-500" />
            Pemeliharaan, Servis & Work Order
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pencatatan tindakan pemeliharaan preventif, korektif, perbaikan overhaul, dan penggantian komponen pompa.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-white text-xs shadow-md shadow-cyan-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Catat Tindakan Baru
        </button>
      </div>

      {/* Maintenance Logs List */}
      <div className="space-y-4">
        {logs.map((log) => {
          let typeColor = 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
          if (log.maintenance_type === 'CORRECTIVE') typeColor = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
          if (log.maintenance_type === 'OVERHAUL') typeColor = 'bg-purple-500/15 text-purple-400 border-purple-500/30';

          return (
            <div
              key={log.id}
              className={`rounded-2xl p-5 border transition-all ${
                theme === 'dark'
                  ? 'bg-[#0E1726]/90 border-slate-800 shadow-xl'
                  : 'bg-white border-slate-200/90 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-cyan-600/15 border border-cyan-500/30 text-cyan-400 font-bold">
                    <Wrench className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-cyan-400">{log.asset_code}</span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="font-bold text-sm">{log.pump_name}</span>
                    </div>
                    <span className="text-xs text-slate-500">
                      Pelaksana: <span className="font-bold text-slate-400">{log.performed_by}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black border uppercase ${typeColor}`}>
                    {log.maintenance_type}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(log.started_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Content Details */}
              <div className="py-3.5 space-y-2 text-xs">
                <div>
                  <span className="font-bold text-slate-400 block mb-0.5">Deskripsi Masalah / Alasan Pemeliharaan:</span>
                  <p className="text-slate-300 font-medium">{log.description}</p>
                </div>
                <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="font-bold text-cyan-400 block mb-0.5">Tindakan Teknis yang Dilakukan:</span>
                  <p className="text-slate-300">{log.action_taken}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                <span>Dicatat oleh: <strong className="text-slate-400">{log.recorded_by_name}</strong></span>
                <span className="flex items-center gap-1 text-emerald-500 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Pekerjaan Selesai
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add Maintenance */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl relative ${
            theme === 'dark' ? 'bg-[#0E1726] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold flex items-center gap-2 mb-1">
              <Wrench className="w-5 h-5 text-cyan-500" />
              Catat Tindakan Pemeliharaan
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Masukkan rincian servis, suku cadang yang diganti, dan nama teknisi yang bertugas.
            </p>

            <form onSubmit={handleAddLog} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Unit Pompa Fisik</label>
                <select
                  value={targetAsset}
                  onChange={(e) => setTargetAsset(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  <option value="PUMP-L4-BTG-001">PUMP-L4-BTG-001 (Slot A)</option>
                  <option value="PUMP-L4-BTG-002">PUMP-L4-BTG-002 (Slot B)</option>
                  <option value="PUMP-L4-BTG-003">PUMP-L4-BTG-003 (Slot C)</option>
                  <option value="PUMP-L4-BTG-004">PUMP-L4-BTG-004 (Slot D)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Jenis Tindakan</label>
                <select
                  value={mType}
                  onChange={(e) => setMType(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  <option value="PREVENTIVE">Preventive Maintenance (Pencegahan)</option>
                  <option value="CORRECTIVE">Corrective Maintenance (Perbaikan)</option>
                  <option value="INSPECTION">Inspeksi Mekanikal</option>
                  <option value="OVERHAUL">Major Overhaul</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Nama Teknisi / Vendor</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Tim Mekanik Harnet (Budi & Eko)"
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Deskripsi Masalah</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Indikasi kenaikan vibrasi 2X RPM"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Tindakan Teknis yang Dilakukan</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Rincian suku cadang yang diganti, alignment, lubrikasi..."
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border font-bold text-slate-400 hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-white shadow-md"
                >
                  Simpan Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
