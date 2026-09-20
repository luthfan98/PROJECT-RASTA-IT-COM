import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import { 
  BrainCircuit, 
  ShieldCheck, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface MLModelCard {
  slotCode: string;
  pumpAssetCode: string;
  pumpName: string;
  status: 'HEALTHY' | 'DEGRADING' | 'NEAR_FAIL' | 'FAIL';
  probability: number; // 0 - 100%
  hoursToFailure: number | null;
  anomalyScore: number;
  likelyCause: string;
  recommendedAction: string;
  modelName: string;
  modelVersion: string;
}

export const MLPredictionsView: React.FC = () => {
  const { theme } = useTheme();

  // Predictions loaded directly from MySQL ml_predictions table
  const [predictions, setPredictions] = useState<MLModelCard[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/monitoring/predictions');
      if (res.data?.success) {
        setPredictions(res.data.data.map((r: any) => ({
          slotCode: r.slotCode || 'A',
          pumpAssetCode: r.pumpAssetCode,
          pumpName: r.pumpName,
          status: r.status,
          probability: Number(r.probability) || 0,
          hoursToFailure: r.hoursToFailure ? Number(r.hoursToFailure) : null,
          anomalyScore: parseFloat(r.anomalyScore) || 0.04,
          likelyCause: r.likelyCause,
          recommendedAction: r.recommendedAction,
          modelName: r.modelName || 'RASTA-PdM DeepVibe',
          modelVersion: r.modelVersion || 'v2.4-Transformer'
        })));
      }
    } catch (err) {
      console.error('Failed to load predictions from database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-black flex items-center gap-2.5 ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            <BrainCircuit className="w-6 h-6 text-cyan-500" />
            Diagnostik Kecerdasan Buatan & Prediksi AI / ML
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Deteksi dini kegagalan mekanikal, prediksi sisa umur operasional (RUL), dan anomali sinyal sensor.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchPredictions()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all"
            title="Muat Ulang Prediksi dari Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-500' : ''}`} />
            <span>Segarkan</span>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-600/15 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Model: RASTA-PdM v2.4 Active</span>
          </div>
        </div>
      </div>

      {/* 4 Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {predictions.map((p) => {
          let badgeStyle = 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';
          let borderGlow = '';
          if (p.status === 'DEGRADING') {
            badgeStyle = 'bg-amber-500/15 text-amber-500 border-amber-500/30';
            borderGlow = 'hover:border-amber-500/50';
          } else if (p.status === 'NEAR_FAIL' || p.status === 'FAIL') {
            badgeStyle = 'bg-rose-500/15 text-rose-500 border-rose-500/30';
            borderGlow = 'hover:border-rose-500/50';
          }

          return (
            <div
              key={p.slotCode}
              className={`rounded-2xl p-5 sm:p-6 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                theme === 'dark'
                  ? `bg-[#0E1726]/90 border-slate-800 shadow-xl ${borderGlow}`
                  : `bg-white border-slate-200/90 shadow-sm ${borderGlow}`
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-cyan-600/15 border border-cyan-500/30 text-cyan-500 font-black text-base flex items-center justify-center">
                      {p.slotCode}
                    </span>
                    <div>
                      <h2 className={`font-black text-sm sm:text-base ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        Slot {p.slotCode} — {p.pumpName}
                      </h2>
                      <span className="font-mono text-xs text-slate-500">{p.pumpAssetCode}</span>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${badgeStyle}`}>
                    {p.status}
                  </span>
                </div>

                {/* Gauges & Probabilities */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">Peluang Kerusakan (Risk)</span>
                    <div className="flex items-center justify-between">
                      <span className={`text-xl font-black ${
                        p.probability > 70 ? 'text-rose-500' : p.probability > 40 ? 'text-amber-500' : 'text-emerald-500'
                      }`}>
                        {p.probability}%
                      </span>
                      <span className="text-[10px] text-slate-500">Anomaly: {p.anomalyScore}</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          p.probability > 70 ? 'bg-rose-500' : p.probability > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${p.probability}%` }}
                      />
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">Estimasi RUL (Time to Fail)</span>
                    <div className="flex items-baseline gap-1">
                      {p.hoursToFailure !== null ? (
                        <>
                          <span className="text-xl font-black text-rose-500">~{p.hoursToFailure}</span>
                          <span className="text-xs font-bold text-slate-400">Jam</span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-emerald-500">Normal (&gt; 2.000 Jam)</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1">Remaining Useful Life</span>
                  </div>
                </div>

                {/* Root Cause Analysis */}
                <div className={`p-3.5 rounded-xl border mb-3 text-xs ${
                  theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <span className="font-bold text-slate-400 block mb-1">Indikasi Masalah / Modus Kegagalan:</span>
                  <p className="font-medium text-cyan-400">{p.likelyCause}</p>
                </div>

                {/* Recommended Action */}
                <div className={`p-3.5 rounded-xl border mb-4 text-xs ${
                  p.status === 'NEAR_FAIL'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : p.status === 'DEGRADING'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                }`}>
                  <span className="font-bold block mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Tindakan yang Direkomendasikan:
                  </span>
                  <p className="font-medium">{p.recommendedAction}</p>
                </div>
              </div>

              {/* Footer Model info */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                <span>Model: {p.modelName}</span>
                <span>Versi: {p.modelVersion}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
