import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  HardDrive, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck
} from 'lucide-react';

export const AdminManualInputView: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [selectedSlot, setSelectedSlot] = useState<string>('C');
  const [measuredAt, setMeasuredAt] = useState<string>(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });
  const [operatorName, setOperatorName] = useState<string>(user?.name || 'Administrator');
  const [notes, setNotes] = useState<string>('');

  // Values for 4 points
  const [values, setValues] = useState({
    motorNdeH: 0.42,
    motorNdeV: 0.38,
    motorNdeA: 0.25,
    motorNdeTemp: 52.0,

    motorDeH: 0.43,
    motorDeV: 0.40,
    motorDeA: 0.30,
    motorDeTemp: 54.5,

    pumpDeH: 1.82,
    pumpDeV: 1.15,
    pumpDeA: 0.95,
    pumpDeTemp: 67.2,

    pumpNdeH: 0.65,
    pumpNdeV: 0.50,
    pumpNdeA: 0.45,
    pumpNdeTemp: 58.0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (field: string, val: string) => {
    const num = parseFloat(val) || 0;
    setValues(prev => ({ ...prev, [field]: num }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSubmitSuccess(false);

    try {
      const payload = {
        slotCode: selectedSlot,
        measuredAt: new Date(measuredAt).toISOString(),
        operatorName,
        notes,
        measurements: values
      };

      const res = await axios.post('/api/monitoring/manual-measurement', payload);
      if (res.data?.success) {
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 4000);
      } else {
        setErrorMsg(res.data?.message || 'Gagal menyimpan pengukuran');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Gagal menyimpan pengukuran ke database');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full animate-fadeIn">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-500">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Input Pengukuran Manual Lapangan
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Pencatatan data getaran tri-axial dan temperatur langsung dari vibrometer portabel petugas.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold flex items-center gap-1.5">
            <FileCheck className="w-4 h-4" />
            <span>ISO 10816 Standar Industri</span>
          </span>
        </div>
      </div>

      {submitSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5" />
          <span>Pengukuran manual berhasil disimpan ke database dan tercatat dalam sistem audit trail!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-500 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. Main Entry Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Metadata Controls */}
        <div className={`p-5 rounded-3xl border ${
          theme === 'dark' ? 'bg-[#0E1726]/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">
            1. Parameter Sesi & Unit Pompa
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Slot selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Slot Pompa
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {['A', 'B', 'C', 'D'].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                      selectedSlot === slot
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    Pump {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Timestamp */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Waktu Pengukuran (WIB)
              </label>
              <input
                type="datetime-local"
                value={measuredAt}
                onChange={(e) => setMeasuredAt(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
              />
            </div>

            {/* Operator */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Petugas / Teknisi
              </label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                required
                placeholder="Nama personel lapangan..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* 4 Bearing Measurement Points Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Motor NDE */}
          <div className={`p-5 rounded-3xl border ${
            theme === 'dark' ? 'bg-[#0E1726]/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3.5">
              <span className="text-xs font-black uppercase text-cyan-600 dark:text-cyan-400">
                M-NDE • Motor Non-Drive End
              </span>
              <span className="text-[10px] text-slate-400">Batas ISO: 4.5 mm/s</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Horizontal (H) mm/s</label>
                <input
                  type="number"
                  step="0.01"
                  value={values.motorNdeH}
                  onChange={(e) => handleInputChange('motorNdeH', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Vertical (V) mm/s</label>
                <input
                  type="number"
                  step="0.01"
                  value={values.motorNdeV}
                  onChange={(e) => handleInputChange('motorNdeV', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Axial (A) mm/s</label>
                <input
                  type="number"
                  step="0.01"
                  value={values.motorNdeA}
                  onChange={(e) => handleInputChange('motorNdeA', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Suhu Bantalan (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={values.motorNdeTemp}
                  onChange={(e) => handleInputChange('motorNdeTemp', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Motor DE */}
          <div className={`p-5 rounded-3xl border ${
            theme === 'dark' ? 'bg-[#0E1726]/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3.5">
              <span className="text-xs font-black uppercase text-cyan-600 dark:text-cyan-400">
                M-DE • Motor Drive End
              </span>
              <span className="text-[10px] text-slate-400">Batas ISO: 4.5 mm/s</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Horizontal (H) mm/s</label>
                <input
                  type="number"
                  step="0.01"
                  value={values.motorDeH}
                  onChange={(e) => handleInputChange('motorDeH', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Vertical (V) mm/s</label>
                <input
                  type="number"
                  step="0.01"
                  value={values.motorDeV}
                  onChange={(e) => handleInputChange('motorDeV', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Axial (A) mm/s</label>
                <input
                  type="number"
                  step="0.01"
                  value={values.motorDeA}
                  onChange={(e) => handleInputChange('motorDeA', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Suhu Bantalan (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={values.motorDeTemp}
                  onChange={(e) => handleInputChange('motorDeTemp', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Pump DE (Highlight if warning) */}
          <div className={`p-5 rounded-3xl border ${
            values.pumpDeH >= 1.8 
              ? 'border-amber-500/50 bg-amber-500/5 dark:bg-[#1A160C]/60 shadow-sm'
              : theme === 'dark' ? 'bg-[#0E1726]/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-amber-500">
                  P-DE • Pump Drive End (Kopling)
                </span>
                {values.pumpDeH >= 1.8 && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                    WARNING
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400">Batas ISO: 7.1 mm/s</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Horizontal (H) mm/s</label>
                <input
                  type="number"
                  step="0.01"
                  value={values.pumpDeH}
                  onChange={(e) => handleInputChange('pumpDeH', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Vertical (V) mm/s</label>
                <input
                  type="number"
                  step="0.01"
                  value={values.pumpDeV}
                  onChange={(e) => handleInputChange('pumpDeV', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Axial (A) mm/s</label>
                <input
                  type="number"
                  step="0.01"
                  value={values.pumpDeA}
                  onChange={(e) => handleInputChange('pumpDeA', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Suhu Bantalan (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={values.pumpDeTemp}
                  onChange={(e) => handleInputChange('pumpDeTemp', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Pump NDE */}
          <div className={`p-5 rounded-3xl border ${
            theme === 'dark' ? 'bg-[#0E1726]/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3.5">
              <span className="text-xs font-black uppercase text-cyan-600 dark:text-cyan-400">
                P-NDE • Pump Non-Drive End (Rear)
              </span>
              <span className="text-[10px] text-slate-400">Batas ISO: 7.1 mm/s</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Horizontal (H) mm/s</label>
                <input
                  type="number"
                  step="0.01"
                  value={values.pumpNdeH}
                  onChange={(e) => handleInputChange('pumpNdeH', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Vertical (V) mm/s</label>
                <input
                  type="number"
                  step="0.01"
                  value={values.pumpNdeV}
                  onChange={(e) => handleInputChange('pumpNdeV', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Axial (A) mm/s</label>
                <input
                  type="number"
                  step="0.01"
                  value={values.pumpNdeA}
                  onChange={(e) => handleInputChange('pumpNdeA', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Suhu Bantalan (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={values.pumpNdeTemp}
                  onChange={(e) => handleInputChange('pumpNdeTemp', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Submit Button */}
        <div className={`p-5 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
          theme === 'dark' ? 'bg-[#0E1726]/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="w-full sm:w-2/3">
            <input
              type="text"
              placeholder="Catatan inspeksi / kondisi fisik pompa saat pengukuran..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black shadow-md shadow-cyan-600/20 transition-colors"
          >
            <Save className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Pengukuran Manual'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
