import React, { useState } from 'react';
import { X, QrCode, CheckCircle2, Save } from 'lucide-react';
import axios from 'axios';

interface ManualMeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ManualMeasurementModal: React.FC<ManualMeasurementModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedPump, setSelectedPump] = useState('C');
  const [selectedPoint, setSelectedPoint] = useState('PUMP-DE-H');
  const [sensorId, setSensorId] = useState<number>(37); // Sensor ID for Pump C PUMP-DE-H
  const [measurementValue, setMeasurementValue] = useState('');
  const [quality, setQuality] = useState<'GOOD' | 'SUSPECT' | 'INVALID'>('GOOD');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!measurementValue) return;

    setIsSubmitting(true);
    try {
      const res = await axios.post('/api/monitoring/measurements/manual', {
        sensorId,
        value: parseFloat(measurementValue),
        quality,
        notes: notes || `Pengukuran manual lapangan pada Pompa ${selectedPump} (${selectedPoint})`
      });

      if (res.data.success) {
        setSuccessMessage('Pengukuran lapangan berhasil disimpan dengan provenance MANUAL • ACTUAL');
        setTimeout(() => {
          setSuccessMessage(null);
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan pengukuran manual');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Input Pengukuran Manual Lapangan
              </h3>
              <p className="text-xs text-slate-500">
                Pencatatan inspeksi petugas dengan audit provenance <b className="text-cyan-500">MANUAL • ACTUAL</b>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {successMessage ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-xs font-bold animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>{successMessage}</span>
            </div>
          ) : null}

          {/* Select Pump & Point */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Pilih Pompa / Slot
              </label>
              <select
                value={selectedPump}
                onChange={(e) => setSelectedPump(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="A">Pump A (Slot A)</option>
                <option value="B">Pump B (Slot B)</option>
                <option value="C">Pump C (Slot C)</option>
                <option value="D">Pump D (Slot D)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Titik Ukur Sensor
              </label>
              <select
                value={selectedPoint}
                onChange={(e) => {
                  setSelectedPoint(e.target.value);
                  if (e.target.value === 'PUMP-DE-H') setSensorId(37);
                  else if (e.target.value === 'MOTOR-DE-H') setSensorId(33);
                  else setSensorId(38);
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="PUMP-DE-H">Pump DE Horizontal (mm/s)</option>
                <option value="PUMP-DE-V">Pump DE Vertical (mm/s)</option>
                <option value="PUMP-DE-A">Pump DE Axial (mm/s)</option>
                <option value="MOTOR-DE-H">Motor DE Horizontal (mm/s)</option>
                <option value="PUMP-TEMP-DE">Pump DE Temperature (°C)</option>
              </select>
            </div>
          </div>

          {/* Current / Last Value Reference */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 font-sans">Pengukuran Terakhir:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {selectedPump === 'C' ? '1.82 mm/s (WARNING)' : '0.54 mm/s (NORMAL)'}
            </span>
          </div>

          {/* Measurement Input */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
              Nilai Pengukuran Baru (RMS / Satuan Baku) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                required
                value={measurementValue}
                onChange={(e) => setMeasurementValue(e.target.value)}
                placeholder="Contoh: 1.84"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-base font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <span className="absolute right-4 top-3 text-xs text-slate-400 font-mono">
                {selectedPoint.includes('TEMP') ? '°C' : 'mm/s'}
              </span>
            </div>
          </div>

          {/* Quality Indicator */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
              Kualitas Pengukuran (Data Quality Flag)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['GOOD', 'SUSPECT', 'INVALID'] as const).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuality(q)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                    quality === q
                      ? 'border-cyan-500 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-black'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Pilih <b>SUSPECT</b> jika sensor terhalang atau angka bergerak liar. Sistem tidak akan menganggap data aneh sebagai kegagalan pompa jika di-flag SUSPECT.
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
              Catatan Inspeksi Lapangan (Opsional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan inspeksi visual / getaran suara bantalan..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-black shadow-md shadow-cyan-500/20 hover:brightness-110 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Pengukuran (MANUAL • ACTUAL)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
