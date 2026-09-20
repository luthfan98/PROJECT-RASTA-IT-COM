import React, { useState } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import { PumpVisualization, PumpData } from './PumpVisualization';
import { FailureProgressionBar } from './FailureProgressionBar';

interface PumpDetailModalProps {
  pump: PumpData | null;
  onClose: () => void;
  onOpenSensorDetail?: (sensorKey: string) => void;
}

export const PumpDetailModal: React.FC<PumpDetailModalProps> = ({
  pump,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sensors' | 'ai' | 'failures' | 'equipment'>('overview');

  if (!pump) return null;

  const isWarning = pump.health === 'WARNING' || pump.operating_state === 'WARNING';
  const isStandby = pump.operating_state === 'STANDBY' || pump.pump_status === 'OFF';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="w-full max-w-4xl bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-scaleIn max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 text-cyan-400 font-black text-lg shadow-inner">
              {pump.slot_code}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  PUMP {pump.slot_code} — Booster Pump Batang HO
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                  isWarning 
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
                    : isStandby
                    ? 'bg-slate-500/15 text-slate-500 border border-slate-500/30'
                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                }`}>
                  {isStandby ? 'STANDBY' : pump.health}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Unit Fisik: {pump.asset_code || 'PUMP-L4-BTG-003'} • Model: Leistritz L4 Multi-Stage • Seq: {pump.sequence_position}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 border-b border-slate-100 dark:border-slate-800/80 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Overview & Status
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sensors')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'sensors'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Sensors & Titik Ukur
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'ai'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            AI Predictive Analysis
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('failures')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'failures'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Riwayat Kegagalan
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('equipment')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'equipment'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Histori Pergantian Unit (Slot vs Aset)
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'overview' && (
            <>
              {/* Prominent Warning Callout if Pump C */}
              {isWarning && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs">
                  <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-sm">PERHATIAN DIPERLUKAN: Degradasi Vibrasi Berkelanjutan</span>
                    <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-300">
                      Pompa C menunjukkan pola kenaikan getaran pada bantalan Drive End (Pump DE) yang signifikan. Estimasi waktu tersisa sebelum kerusakan kritis adalah <b>~46 jam</b> (21 Sep 2026 • 12:00) dengan dugaan utama <b>Coupling Misalignment</b>.
                    </p>
                  </div>
                </div>
              )}

              {/* Large SVG Package Illustration */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                <PumpVisualization
                  pump={pump}
                  size="lg"
                />
              </div>

              {/* Progression Track */}
              <FailureProgressionBar
                currentStage={isWarning ? 'WARNING' : 'NORMAL'}
                degradingDurationHours={isWarning ? 38 : 0}
                warningDetectedHoursAgo={isWarning ? 8 : 0}
                pumpName={`Pump ${pump.slot_code}`}
              />

              {/* Operational KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] font-bold uppercase text-slate-500">Operating Sequence</div>
                  <div className="text-xl font-mono font-black text-slate-900 dark:text-white mt-1">
                    Sequence {pump.sequence_position}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] font-bold uppercase text-slate-500">Operating Load</div>
                  <div className="text-xl font-mono font-black text-slate-900 dark:text-white mt-1">
                    {pump.load_pct}%
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] font-bold uppercase text-slate-500">Running Hours</div>
                  <div className="text-xl font-mono font-black text-slate-900 dark:text-white mt-1">
                    {pump.running_hours_total?.toLocaleString()} h
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] font-bold uppercase text-slate-500">Start Counts</div>
                  <div className="text-xl font-mono font-black text-slate-900 dark:text-white mt-1">
                    287 Siklus
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'sensors' && (
            <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase">
                Titik Ukur Sensor Fisik (16 Kanal)
              </h4>
              <p className="text-xs text-slate-500">
                Setiap titik ukur terpasang sensor fisik dengan kode QR dan nomor seri independen.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <div className="font-bold font-sans text-slate-900 dark:text-white">Motor DE Horizontal (M-DE-H)</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">SN: SNS-VIB-BTG-005 • Limit: 1.80 mm/s</div>
                  <div className="text-base font-black text-slate-800 dark:text-slate-200 mt-2">0.55 mm/s (NORMAL)</div>
                </div>

                <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/5">
                  <div className="font-bold font-sans text-slate-900 dark:text-white">Pump DE Horizontal (P-DE-H)</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">SN: SNS-VIB-BTG-011 • Limit: 1.80 mm/s</div>
                  <div className="text-base font-black text-amber-500 mt-2">1.82 mm/s (WARNING - EXCEEDED)</div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <div className="font-bold font-sans text-slate-900 dark:text-white">Pump DE Temperature (P-TEMP-DE)</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">SN: SNS-TMP-BTG-012 • Limit: 75.0°C</div>
                  <div className="text-base font-black text-slate-800 dark:text-slate-200 mt-2">63.4°C (NORMAL)</div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <div className="font-bold font-sans text-slate-900 dark:text-white">Pump NDE Temperature (P-TEMP-NDE)</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">SN: SNS-TMP-BTG-016 • Limit: 75.0°C</div>
                  <div className="text-base font-black text-slate-800 dark:text-slate-200 mt-2">67.2°C (ELEVATED)</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div className="text-sm font-black text-slate-900 dark:text-white uppercase mb-2">
                  Model Prediksi Degradasi RASTA ML
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Model memproses tren time-series getaran tri-axial dan temperatur housing dengan algoritma LSTM + Autoencoder Anomaly Detection yang telah dilatih menggunakan 35.040 baris data operasional pompa booster.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400">Anomaly Confidence:</span>
                    <div className="text-lg font-bold text-cyan-400 mt-1">82.4%</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400">Degradation Signature:</span>
                    <div className="text-lg font-bold text-amber-400 mt-1">1X / 2X Harmonics</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'failures' && (
            <div className="space-y-3">
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase">
                Riwayat Kejadian Kerusakan Terkait
              </h4>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                  <span>EVT-C-001 (Bearing Degradation)</span>
                  <span className="text-rose-500 font-mono">RESOLVED</span>
                </div>
                <p className="text-slate-500 mt-1">
                  15 Jan 2026 s/d 22 Jan 2026 • Durasi degradasi: 168 jam • Tindakan: Overhaul & penggantian mechanical seal.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'equipment' && (
            <div className="space-y-3">
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase">
                Riwayat Siklus Hidup Pemasangan Unit di Slot {pump.slot_code}
              </h4>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2 font-mono">
                <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 font-bold">
                  <span>Unit Aktif: {pump.asset_code} (SN-LZ-2023-0803)</span>
                  <span className="text-emerald-500">TERPASANG SEJAK 2024-01-01</span>
                </div>
                <p className="text-slate-500 text-[11px] font-sans">
                  Data pengukuran masa lalu tetap terikat ke nomor seri unit ini dan tidak akan hilang jika suatu saat unit diganti dengan pompa cadangan.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-cyan-600 transition-colors shadow-sm"
          >
            Tutup Jendela Detail
          </button>
        </div>
      </div>
    </div>
  );
};
