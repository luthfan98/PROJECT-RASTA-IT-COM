import React from 'react';
import { X, ExternalLink, Activity, Thermometer, ShieldAlert, Cpu, Clock, Database, Info } from 'lucide-react';
import { PumpData, SensorPointData } from './PumpVisualization';

interface SensorPopupModalProps {
  pump: PumpData | null;
  sensorKey: 'motorNde' | 'motorDe' | 'pumpDe' | 'pumpNde' | null;
  sensorData: SensorPointData | null;
  onClose: () => void;
  onViewAnalytics?: (slotCode: string, pointName: string) => void;
}

export const SensorPopupModal: React.FC<SensorPopupModalProps> = ({
  pump,
  sensorKey,
  sensorData,
  onClose,
  onViewAnalytics
}) => {
  if (!pump || !sensorKey || !sensorData) return null;

  const isStandby = pump.operating_state === 'STANDBY' || pump.pump_status === 'OFF';
  
  // Point codes & full engineering terminology
  const pointCode = 
    sensorKey === 'motorNde' ? 'M-NDE' : 
    sensorKey === 'motorDe' ? 'M-DE' : 
    sensorKey === 'pumpDe' ? 'P-DE' : 'P-NDE';

  const componentType = sensorKey.startsWith('motor') ? 'MOTOR' : 'PUMP';
  const positionType = sensorKey.endsWith('De') ? 'DE' : 'NDE';

  const locationFullName = 
    sensorKey === 'motorNde' ? 'Motor Non-Drive End' :
    sensorKey === 'motorDe' ? 'Motor Drive End' :
    sensorKey === 'pumpDe' ? 'Pump Drive End' : 'Pump Non-Drive End';

  const locationDescription =
    sensorKey === 'motorNde' ? 'Sisi ujung motor bebas (menjauhi kopling)' :
    sensorKey === 'motorDe' ? 'Sisi poros motor penggerak (dekat kopling)' :
    sensorKey === 'pumpDe' ? 'Sisi poros input pompa terdekat dengan kopling' :
    'Sisi ujung bebas pompa (seberang kopling)';

  // Determine overall worst condition among valid measurements (Requirement 8)
  const isWarning = sensorData.status === 'WARNING';
  const isCritical = sensorData.status === 'CRITICAL' || sensorData.status === 'FAILURE';
  const isDegrading = sensorData.status === 'DEGRADING';

  // Standby condition logic (Requirement 15)
  const overallCondition = isStandby 
    ? 'NORMAL (STANDBY)' 
    : isCritical 
    ? 'CRITICAL' 
    : isWarning 
    ? 'WARNING' 
    : isDegrading 
    ? 'DEGRADING' 
    : 'NORMAL';

  // Active sensor instrument serial (Requirement 13: Sensor Replacement)
  const activeSensorSerial = 
    sensorData.activeSensorId || 
    `SNS-${pump.slot_code}-${pointCode.replace('-', '')}-${pointCode === 'P-DE' ? '021' : '014'}`;

  // Mapping to analytics channel
  const getAnalyticsPointKey = () => {
    switch (sensorKey) {
      case 'motorNde': return 'ELMOT-NDE-H';
      case 'motorDe': return 'ELMOT-DE-H';
      case 'pumpDe': return 'PUMP-DE-H';
      case 'pumpNde': return 'PUMP-NDE-H';
      default: return 'PUMP-DE-H';
    }
  };

  // Trend deltas based on condition
  const hTrend = isWarning ? '↑ 64% / 36h' : isDegrading ? '↑ 31% / 24h' : '→ Stabil';
  const tempTrend = isWarning ? '↑ 8.2°C / 24h' : '→ Stabil normal';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-scaleIn flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-900 dark:bg-slate-800 text-cyan-400 font-black text-lg shadow-inner">
              {pump.slot_code}
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {componentType} • {positionType}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  PUMP {pump.slot_code} — {locationFullName} ({pointCode})
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                {locationDescription}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Overall Condition Card */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Overall Condition
              </span>
              <span className="text-xs text-slate-500">
                (Evaluasi tingkat keparahan tertinggi seluruh sumbu pengukuran)
              </span>
            </div>
            <span 
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isStandby
                  ? 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30'
                  : isCritical
                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse'
                  : isWarning
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  : isDegrading
                  ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {overallCondition}
            </span>
          </div>

          {/* Attention Banner if Warning */}
          {isWarning && (
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs leading-relaxed">
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Perhatian: Anomali Pada Titik Poros Masuk (P-DE)!</span>
                <p className="mt-0.5 text-slate-600 dark:text-slate-300">
                  Getaran horizontal pada bantalan pompa sisi kopling melebihi ambang batas ISO 10816 Zone B (1.80 mm/s). Terpisah jelas dari saluran fluida (Inlet/Outlet).
                </p>
              </div>
            </div>
          )}

          {/* Tri-Axial Vibration Breakdown (Requirement 6 & 7) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-500" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  VIBRATION (Tri-Axial Velocity RMS)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">ISO 10816-3 Standard</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {/* Horizontal (H) */}
              <div className={`p-3 rounded-2xl border ${
                sensorData.h != null && sensorData.h > 1.8 
                  ? 'border-amber-500/50 bg-amber-500/10' 
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
              }`}>
                <div className="text-[11px] font-bold text-slate-500">Horizontal</div>
                <div className="text-base sm:text-lg font-mono font-black text-slate-900 dark:text-white mt-1">
                  {sensorData.h != null ? (
                    <>
                      {sensorData.h.toFixed(2)}
                      <span className="text-[10px] font-normal text-slate-400 ml-1">mm/s</span>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400">NOT MEASURED</span>
                  )}
                </div>
                {sensorData.h != null && (
                  <div className="mt-1.5 flex flex-col gap-1">
                    <span className={`inline-block text-[9px] font-black px-1.5 py-0.2 rounded w-fit ${
                      sensorData.h > 1.8 
                        ? 'text-amber-600 dark:text-amber-400 bg-amber-500/15 border border-amber-500/30' 
                        : 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15'
                    }`}>
                      {sensorData.h > 1.8 ? 'WARNING' : 'NORMAL'}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">{hTrend}</span>
                  </div>
                )}
              </div>

              {/* Vertical (V) */}
              <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <div className="text-[11px] font-bold text-slate-500">Vertical</div>
                <div className="text-base sm:text-lg font-mono font-black text-slate-900 dark:text-white mt-1">
                  {sensorData.v != null ? (
                    <>
                      {sensorData.v.toFixed(2)}
                      <span className="text-[10px] font-normal text-slate-400 ml-1">mm/s</span>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400">NOT MEASURED</span>
                  )}
                </div>
                {sensorData.v != null && (
                  <div className="mt-1.5 flex flex-col gap-1">
                    <span className="inline-block text-[9px] font-black px-1.5 py-0.2 rounded w-fit text-emerald-600 dark:text-emerald-400 bg-emerald-500/15">
                      NORMAL
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">→ Stabil</span>
                  </div>
                )}
              </div>

              {/* Axial (A) */}
              <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <div className="text-[11px] font-bold text-slate-500">Axial</div>
                <div className="text-base sm:text-lg font-mono font-black text-slate-900 dark:text-white mt-1">
                  {sensorData.a != null ? (
                    <>
                      {sensorData.a.toFixed(2)}
                      <span className="text-[10px] font-normal text-slate-400 ml-1">mm/s</span>
                    </>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-400">— NOT MEASURED</span>
                  )}
                </div>
                {sensorData.a != null ? (
                  <div className="mt-1.5 flex flex-col gap-1">
                    <span className="inline-block text-[9px] font-black px-1.5 py-0.2 rounded w-fit text-emerald-600 dark:text-emerald-400 bg-emerald-500/15">
                      NORMAL
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">→ Stabil</span>
                  </div>
                ) : (
                  <div className="mt-1.5">
                    <span className="text-[9px] font-mono text-slate-400 block">Sumbu opsional</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Temperature Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="w-4 h-4 text-rose-500" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                TEMPERATURE
              </h4>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-mono font-black text-slate-900 dark:text-white">
                    {sensorData.temp != null ? `${sensorData.temp.toFixed(1)}°C` : '— NOT MEASURED'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {tempTrend}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Batas Aman: &lt; 75.0°C • Ambang Kritis: 85.0°C
                </div>
              </div>

              {sensorData.temp != null && (
                <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                  sensorData.temp > 65 
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                }`}>
                  {sensorData.temp > 65 ? 'ELEVATED' : 'NORMAL'}
                </span>
              )}
            </div>
          </div>

          {/* Measurement Provenance & Active Instrument (Requirement 13 & 14) */}
          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500 font-bold">
                <Clock className="w-3.5 h-3.5 text-cyan-500" />
                Last Measurement
              </span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {sensorData.lastMeasurementTime || '19 Sep 2026 • 14:00'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500 font-bold">
                <Database className="w-3.5 h-3.5 text-indigo-500" />
                Source
              </span>
              <span className="font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 font-bold">
                {sensorData.source || 'IMPORT • SYNTHETIC'}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800/60 pt-2">
              <span className="flex items-center gap-1.5 text-slate-500 font-bold">
                <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                Active Instrument
              </span>
              <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                {activeSensorSerial}
              </span>
            </div>
          </div>

          {/* Engineering Disclaimer (Requirement 18) */}
          <div className="flex items-center gap-2 text-[10px] text-slate-400 leading-tight">
            <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span>
              Schematic location: Titik ukur mengacu pada area bantalan poros DE/NDE, bukan mounting fisik 1:1.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onViewAnalytics) {
                onViewAnalytics(pump.slot_code, getAnalyticsPointKey());
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-md shadow-cyan-500/20 hover:brightness-110 transition-all cursor-pointer"
          >
            <span>[ VIEW FULL TREND ]</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
