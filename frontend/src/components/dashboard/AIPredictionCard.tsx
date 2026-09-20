import React from 'react';
import { Cpu, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

interface AIPredictionCardProps {
  flaggedPump?: string;
  currentCondition?: string;
  failureProbability?: number;
  predictedTimeToFailureHours?: number;
  estimatedFailureAt?: string;
  likelyFailureMode?: string;
  confidence?: number;
  basisFactors?: string[];
  disclaimer?: string;
  onViewAnalysis?: () => void;
}

export const AIPredictionCard: React.FC<AIPredictionCardProps> = ({
  flaggedPump = 'Pump C',
  currentCondition = 'WARNING',
  failureProbability = 71,
  predictedTimeToFailureHours = 46,
  estimatedFailureAt = '21 Sep 2026 • 12:00',
  likelyFailureMode = 'Coupling Misalignment',
  confidence = 82,
  basisFactors = [
    'Vibration DE trend meningkat +64% dalam 36 jam (0.72 → 1.82 mm/s)',
    'Motor DE vibration terpengaruh naik +31%',
    'Suhu Pump DE naik +8.4°C / 24 jam',
    'Beban pompa stabil pada 74% (indikasi mechanical anomaly)'
  ],
  disclaimer = 'AI prediction is an early-warning estimate and should be verified with operational inspection.',
  onViewAnalysis
}) => {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B]/80 backdrop-blur-md p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              AI Condition Analysis & Prognostics
            </h3>
            <p className="text-[11px] text-slate-500">
              Analisis prediksi kegagalan berbasis machine learning RASTA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Target:</span>
          <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-black text-xs">
            {flaggedPump} ({currentCondition})
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
        {/* Metric 1: Failure Probability */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Probabilitas Kerusakan
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-mono font-black text-rose-500">
              {failureProbability}%
            </span>
            <span className="text-xs font-bold text-amber-500">RISIKO TINGGI</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-rose-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${failureProbability}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Predicted Time to Failure (RUL) */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Estimasi Sisa Umur (RUL)
          </div>
          <div className="text-3xl font-mono font-black text-amber-500 mt-1">
            ~{predictedTimeToFailureHours} jam
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            Est. Failure: {estimatedFailureAt}
          </div>
        </div>

        {/* Metric 3: Likely Failure Mode */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Moda Kegagalan Utama
          </div>
          <div className="text-base font-black text-slate-900 dark:text-white mt-1.5 leading-snug">
            {likelyFailureMode}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 font-bold mt-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AI Confidence: {confidence}%</span>
          </div>
        </div>
      </div>

      {/* Why did RASTA flag this pump? (Explainable AI factors) */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 my-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-1.5">
          <span>Mengapa RASTA memberi peringatan pada pompa ini?</span>
        </h4>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
          {basisFactors.map((factor, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
              <span>{factor}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer & Disclaimer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 italic max-w-xl">
          <HelpCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{disclaimer}</span>
        </div>

        <button
          type="button"
          onClick={onViewAnalysis}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-cyan-600 transition-colors shadow-sm ml-auto"
        >
          <span>Buka Diagnostik Lengkap</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
