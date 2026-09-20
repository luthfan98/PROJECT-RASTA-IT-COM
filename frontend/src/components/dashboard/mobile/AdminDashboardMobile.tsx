import React, { useState } from 'react';
import { 
  ShieldAlert, ArrowRight, AlertTriangle, 
  ChevronRight, ChevronDown, Activity, Info, X, TrendingUp,
  QrCode, Layers, Cpu, Database
} from 'lucide-react';
import { PumpData, SensorPointData } from '../PumpVisualization';

interface AdminDashboardMobileProps {
  stationData: any;
  slots: PumpData[];
  aiAnalysis: any;
  alerts: any[];
  onSelectPump: (pump: PumpData) => void;
  onSelectSensor?: (pump: PumpData, sensorKey: any, data: SensorPointData) => void;
  onOpenManualInput?: () => void;
  onNavigateToAnalytics?: (slotCode: string, pointKey: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AdminDashboardMobile: React.FC<AdminDashboardMobileProps> = ({
  stationData,
  slots,
  aiAnalysis,
  alerts,
  onSelectPump,
  onOpenManualInput,
  onRefresh
}) => {
  // AI Metrics from props
  const failureRisk = aiAnalysis?.failureProbability || 71;
  const rulHours = aiAnalysis?.predictedTimeToFailureHours || 46;
  const failureMode = aiAnalysis?.likelyFailureMode || 'Coupling Misalignment (Drive End Asymmetry)';
  const aiConf = aiAnalysis?.confidence || 82;

  // Alerts from props
  const displayAlerts = alerts && alerts.length > 0 ? alerts.slice(0, 3) : [
    { time: '14:00', pump: 'Pump C', type: 'warning', message: 'Vibration increasing on P-DE (1.82 mm/s)' },
    { time: '13:00', pump: 'Pump C', type: 'info', message: 'Degradation pattern detected by ML model' },
    { time: '09:00', pump: 'Pump B', type: 'success', message: 'Returned to normal standby rotation' }
  ];

  // Find Pump C (default focus if warning)
  const pumpC = slots.find((s) => s.slot_code === 'C') || slots[2] || slots[0];

  // Quick selected pump for mobile overview card (defaults to Pump C if warning)
  const [activePumpSlot, setActivePumpSlot] = useState<string>(
    pumpC?.health === 'WARNING' ? 'C' : slots[0]?.slot_code || 'A'
  );

  // Popover state for Data Context
  const [showDataContext, setShowDataContext] = useState(false);

  // Collapsible "More Station Analytics"
  const [isMoreAnalyticsOpen, setIsMoreAnalyticsOpen] = useState(false);

  // Trend chart states
  const [trendMetric, setTrendMetric] = useState<'vibration' | 'temperature' | 'load'>('vibration');
  const [trendRange, setTrendRange] = useState<'24H' | '7D' | '30D'>('24H');

  const selectedPump = slots.find((s) => s.slot_code === activePumpSlot) || slots[0];

  // Generate mobile sparkline/chart points
  const getTrendData = () => {
    if (trendMetric === 'vibration') {
      if (activePumpSlot === 'C') {
        return [0.65, 0.72, 0.81, 0.95, 1.12, 1.34, 1.58, 1.82];
      }
      return [0.51, 0.54, 0.49, 0.53, 0.50, 0.52, 0.55, 0.54];
    }
    if (trendMetric === 'temperature') {
      if (activePumpSlot === 'C') {
        return [54, 56, 58, 61, 63, 65, 66, 67.2];
      }
      return [52, 53, 54, 53, 54, 55, 54, 55];
    }
    // Load
    return [60, 65, 70, 72, 74, 73, 75, 74];
  };

  const trendPoints = getTrendData();
  const maxTrendVal = Math.max(...trendPoints) * 1.15;
  const minTrendVal = Math.min(...trendPoints) * 0.85;

  // Build SVG path for trend chart
  const svgWidth = 340;
  const svgHeight = 150;
  const paddingX = 15;
  const paddingY = 15;
  const usableWidth = svgWidth - paddingX * 2;
  const usableHeight = svgHeight - paddingY * 2;

  const getCoordinates = (val: number, idx: number, total: number) => {
    const x = paddingX + (idx / (total - 1)) * usableWidth;
    const y = svgHeight - paddingY - ((val - minTrendVal) / (maxTrendVal - minTrendVal || 1)) * usableHeight;
    return { x, y };
  };

  const pathD = trendPoints.reduce((acc, val, idx) => {
    const { x, y } = getCoordinates(val, idx, trendPoints.length);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const areaD = `${pathD} L ${svgWidth - paddingX} ${svgHeight - paddingY} L ${paddingX} ${svgHeight - paddingY} Z`;

  return (
    <div className="space-y-4 max-w-xl mx-auto animate-fadeIn pb-6">

      {/* ================= 1. STATION SUMMARY CARD ================= */}
      <div className="bg-white dark:bg-[#0E1726] rounded-3xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 transition-all">
        {/* Top: Station & Condition */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Stasiun</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {stationData?.lastMeasurementAt || '14:00 • 42 min lalu'}
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {stationData?.name || 'Booster Pump Batang HO'}
            </h2>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>NORMAL</span>
          </span>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-slate-100 dark:bg-slate-800/80 my-3" />

        {/* 3 Prominent Operational Counters */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/15">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Running</p>
            <p className="text-xl font-black font-mono text-cyan-600 dark:text-cyan-400 mt-0.5">
              {stationData?.runningPumpsCount || 2} <span className="text-xs text-slate-400 font-normal">/ {stationData?.totalPumpsCount || 4}</span>
            </p>
          </div>

          <div className="p-2.5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Warning</p>
            <p className="text-xl font-black font-mono text-amber-600 dark:text-amber-400 mt-0.5">
              {stationData?.warningCount || 1}
            </p>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Critical</p>
            <p className="text-xl font-black font-mono text-slate-700 dark:text-slate-300 mt-0.5">
              {stationData?.criticalCount || 0}
            </p>
          </div>
        </div>

        {/* Compact Data Context Chip */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowDataContext(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Database className="w-3 h-3 text-cyan-500" />
            <span>IMPORT • SYNTHETIC</span>
            <Info className="w-3 h-3 text-slate-400" />
          </button>

          <span className="text-[10px] font-mono text-slate-400">
            Next: {stationData?.nextExpectedAt || '15:00'} WIB
          </span>
        </div>
      </div>

      {/* ================= DATA CONTEXT MODAL ================= */}
      {showDataContext && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Data Context & Provenance</h3>
              </div>
              <button type="button" onClick={() => setShowDataContext(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Source:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Import (File CSV/Excel)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Data Type:</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">Synthetic Training Set</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Measurement Time:</span>
                  <span>19 Sep 2026 • 14:00 WIB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Import Batch:</span>
                  <span>RASTA Training 1Y #0919</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Points:</span>
                  <span>64 Sensor Channels</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDataContext(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ================= 2. ATTENTION REQUIRED BANNER ================= */}
      {pumpC && pumpC.health === 'WARNING' && (
        <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent p-5 shadow-sm space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500 text-slate-950">
                <ShieldAlert className="w-3 h-3" />
                ATTENTION REQUIRED
              </span>
              <span className="text-xs font-black text-amber-600 dark:text-amber-400">WARNING</span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-500">Pump C</span>
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
              Progressive Vibration Anomaly Detected
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Dugaan penyebab: <b className="text-slate-900 dark:text-white">Coupling Misalignment</b>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-[10px] text-slate-500 uppercase block">Failure Risk</span>
              <span className="text-base font-black text-amber-600 dark:text-amber-400">71%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-[10px] text-slate-500 uppercase block">Estimated RUL</span>
              <span className="text-base font-black text-amber-600 dark:text-amber-400">~46 h</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectPump(pumpC)}
            className="w-full py-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 hover:bg-amber-400 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>[ VIEW PUMP C INVESTIGATION ]</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ================= 3. COMPACT STATION PROCESS SUMMARY ================= */}
      <div className="bg-white dark:bg-[#0E1726] rounded-3xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
          <span className="uppercase tracking-wider">Skematik Alur Stasiun</span>
          <span className="font-mono text-[10px]">Suction → Pumps → Discharge</span>
        </div>

        {/* Process Flow Diagram */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/80 space-y-2.5">
          {/* Suction Line */}
          <div className="flex items-center justify-between text-xs font-mono px-1">
            <span className="font-bold text-slate-700 dark:text-slate-300">SUCTION</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-bold">
              {stationData?.incomingPressurePsi || 72.4} PSI • {stationData?.flowPct || 67.4}% Flow
            </span>
          </div>

          {/* 4 Interactive Pump Nodes */}
          <div className="grid grid-cols-4 gap-2">
            {slots.map((p) => {
              const isWarning = p.health === 'WARNING';
              const isStandby = p.operating_state === 'STANDBY' || p.pump_status === 'OFF';
              const isSelected = p.slot_code === activePumpSlot;

              return (
                <button
                  key={p.slot_id}
                  type="button"
                  onClick={() => setActivePumpSlot(p.slot_code)}
                  className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/15 border-2 border-cyan-500 shadow-xs scale-105'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-cyan-500/50'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {p.slot_code}
                    </span>
                    <span 
                      className={`w-2 h-2 rounded-full ${
                        isWarning 
                          ? 'bg-amber-500 animate-pulse' 
                          : isStandby 
                            ? 'bg-slate-400' 
                            : 'bg-emerald-500'
                      }`} 
                    />
                  </div>
                  <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    {isWarning ? 'Warn' : isStandby ? 'Stby' : 'Run'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Discharge Line */}
          <div className="flex items-center justify-between text-xs font-mono px-1 pt-1 border-t border-slate-200/50 dark:border-slate-800">
            <span className="font-bold text-slate-700 dark:text-slate-300">DISCHARGE</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-bold">
              {stationData?.dischargePressurePsi || 72.4} PSI
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 pt-0.5">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Running</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400" /> Standby</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Warning</span>
        </div>
      </div>

      {/* ================= 4. PUMPS QUICK SELECTOR & SINGLE FOCUSED CARD ================= */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            PUMP OVERVIEW
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Pilih Pompa:</span>
        </div>

        {/* Quick Selector Pills */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          {slots.map((p) => {
            const isWarn = p.health === 'WARNING';
            const isStby = p.operating_state === 'STANDBY' || p.pump_status === 'OFF';
            const isCurr = p.slot_code === activePumpSlot;

            return (
              <button
                key={p.slot_id}
                type="button"
                onClick={() => setActivePumpSlot(p.slot_code)}
                className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isCurr
                    ? isWarn
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{p.slot_code}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${isWarn ? 'bg-amber-950 dark:bg-amber-200' : isStby ? 'bg-slate-400' : 'bg-emerald-400'}`} />
              </button>
            );
          })}
        </div>

        {/* Single Focused Pump Card (Entire Card Clickable) */}
        {selectedPump && (
          <div 
            onClick={() => onSelectPump(selectedPump)}
            className={`rounded-3xl p-5 border transition-all cursor-pointer shadow-sm hover:shadow-md ${
              selectedPump.health === 'WARNING'
                ? 'bg-amber-500/5 dark:bg-[#0E1726] border-amber-500/40 shadow-amber-500/10'
                : 'bg-white dark:bg-[#0E1726] border-slate-200/80 dark:border-slate-800'
            }`}
          >
            {/* Card Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base font-black ${
                  selectedPump.health === 'WARNING'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400'
                }`}>
                  {selectedPump.slot_code}
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    Pump {selectedPump.slot_code}
                  </h4>
                  <p className="text-[10px] font-mono text-slate-500">
                    {selectedPump.asset_code || `L4-BTG-00${selectedPump.slot_id}`} • Seq {selectedPump.sequence_position}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  selectedPump.operating_state === 'STANDBY'
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                }`}>
                  {selectedPump.operating_state}
                </span>
                {selectedPump.health === 'WARNING' && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    ⚠ WARNING
                  </span>
                )}
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono my-3">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Beban (Load)</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {selectedPump.operating_state === 'STANDBY' ? '0%' : `${selectedPump.load_pct || 74}%`}
                </span>
              </div>

              <div className={`p-2.5 rounded-xl border ${
                selectedPump.health === 'WARNING'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800 text-slate-800 dark:text-slate-200'
              }`}>
                <span className="text-[10px] text-slate-500 uppercase block">Max Vibration</span>
                <span className="text-sm font-bold">
                  {selectedPump.maxVibration ? `${selectedPump.maxVibration.toFixed(2)} mm/s` : '0.54 mm/s'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Max Temp</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {selectedPump.maxTemperature ? `${selectedPump.maxTemperature.toFixed(1)}°C` : '58.0°C'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Running Hours</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {selectedPump.running_hours_total ? `${selectedPump.running_hours_total.toLocaleString()} h` : '5,881 h'}
                </span>
              </div>
            </div>

            {/* Abnormal location indicator if any */}
            {selectedPump.health === 'WARNING' && (
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-[11px] mb-3 flex items-center justify-between">
                <span>Lokasi Anomali:</span>
                <span className="font-bold font-mono">Pump Drive End (P-DE)</span>
              </div>
            )}

            {/* Tap Action */}
            <button
              type="button"
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-cyan-600 dark:hover:bg-cyan-600 text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>[ VIEW PUMP {selectedPump.slot_code} DETAIL ]</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ================= 5. AI CONDITION & INLINE FAILURE PROGRESSION ================= */}
      <div className="bg-white dark:bg-[#0E1726] rounded-3xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              AI CONDITION ANALYSIS
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold">
            Pump C • {aiConf}% Conf
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Failure Risk</span>
            <span className="text-base font-black text-amber-600 dark:text-amber-400">{failureRisk}%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Estimated RUL</span>
            <span className="text-base font-black text-amber-600 dark:text-amber-400">~{rulHours} h</span>
          </div>
        </div>

        <div className="text-xs">
          <span className="text-slate-500">Possible Failure Mode:</span>
          <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
            {failureMode}
          </p>
        </div>

        {/* Integrated Inline Progression */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Condition Progression
          </span>
          <div className="flex items-center justify-between text-[10px] font-mono font-bold">
            <span className="text-slate-400">Normal</span>
            <span className="text-slate-400">Degrading</span>
            <span className="text-amber-500 font-black">● Warning</span>
            <span className="text-slate-400">Critical</span>
            <span className="text-slate-400">Failure</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
            <div className="w-[40%] bg-emerald-500" />
            <div className="w-[20%] bg-amber-400" />
            <div className="w-[10%] bg-amber-500 animate-pulse" />
            <div className="w-[30%] bg-transparent" />
          </div>
        </div>

        <button
          type="button"
          onClick={() => pumpC && onSelectPump(pumpC)}
          className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
        >
          <span>[ VIEW AI ANALYSIS ]</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ================= 6. MOBILE CONDITION TREND ================= */}
      <div className="bg-white dark:bg-[#0E1726] rounded-3xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-cyan-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              CONDITION TREND
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Pump {activePumpSlot}
          </span>
        </div>

        {/* Metric & Range Selectors */}
        <div className="flex items-center justify-between gap-2">
          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
            {(['vibration', 'temperature', 'load'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setTrendMetric(m)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition-all ${
                  trendMetric === m
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Range Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl font-mono text-[10px]">
            {(['24H', '7D', '30D'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTrendRange(r)}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  trendRange === r
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Current Metric Display */}
        <div className="flex items-baseline justify-between pt-1 font-mono">
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {trendMetric === 'vibration' 
                ? `${trendPoints[trendPoints.length - 1]} mm/s`
                : trendMetric === 'temperature'
                  ? `${trendPoints[trendPoints.length - 1]}°C`
                  : `${trendPoints[trendPoints.length - 1]}%`}
            </span>
            <span className="text-[11px] text-amber-500 font-bold ml-2">
              ↑ 64% / 36h
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Limit: 1.80 mm/s</span>
        </div>

        {/* Clean SVG Trend Chart */}
        <div className="relative w-full h-[160px] bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl p-2 border border-slate-200/50 dark:border-slate-800/60 overflow-hidden">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="mobileTrendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Threshold Line at 1.80 */}
            {trendMetric === 'vibration' && (
              <line 
                x1={paddingX} 
                y1={getCoordinates(1.80, 0, trendPoints.length).y} 
                x2={svgWidth - paddingX} 
                y2={getCoordinates(1.80, 0, trendPoints.length).y} 
                stroke="#F59E0B" 
                strokeDasharray="4 4" 
                strokeWidth="1.5" 
              />
            )}

            {/* Fill Area */}
            <path d={areaD} fill="url(#mobileTrendGrad)" />

            {/* Trend Line */}
            <path d={pathD} fill="none" stroke="#06B6D4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Peak Dot */}
            <circle 
              cx={getCoordinates(trendPoints[trendPoints.length - 1], trendPoints.length - 1, trendPoints.length).x} 
              cy={getCoordinates(trendPoints[trendPoints.length - 1], trendPoints.length - 1, trendPoints.length).y} 
              r="4.5" 
              fill={activePumpSlot === 'C' ? '#F59E0B' : '#06B6D4'} 
              stroke="#FFFFFF" 
              strokeWidth="2" 
            />
          </svg>
        </div>

        <button
          type="button"
          onClick={() => pumpC && onSelectPump(pumpC)}
          className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
        >
          <span>[ VIEW FULL TREND ]</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ================= 7. RECENT ALERTS (MAX 3 ITEMS) ================= */}
      <div id="mobile-alerts-section" className="bg-white dark:bg-[#0E1726] rounded-3xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              RECENT ALERTS
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">3 Terkini</span>
        </div>

        <div className="space-y-2">
          {displayAlerts.map((alt: any, idx: number) => {
            const isWarn = alt.type === 'warning' || (alt.severity && alt.severity === 'WARNING');
            const isSuccess = alt.type === 'success';

            return (
              <div 
                key={idx} 
                className={`p-3 rounded-2xl border flex items-start gap-2.5 ${
                  isWarn 
                    ? 'bg-amber-500/10 border-amber-500/25' 
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800'
                }`}
              >
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  isWarn ? 'bg-amber-500 animate-pulse' : isSuccess ? 'bg-emerald-500' : 'bg-cyan-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isWarn ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {isWarn ? '⚠ ' : isSuccess ? '✓ ' : '◉ '}{alt.pump || alt.title || 'Pump Alert'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{alt.time || alt.timestamp || '14:00'}</span>
                  </div>
                  <p className={`text-xs mt-0.5 ${isWarn ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
                    {alt.message || alt.text || 'Operational event'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => pumpC && onSelectPump(pumpC)}
          className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
        >
          <span>[ VIEW ALL ALERTS ]</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ================= 8. COLLAPSIBLE "MORE STATION ANALYTICS" ================= */}
      <div className="bg-white dark:bg-[#0E1726] rounded-3xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setIsMoreAnalyticsOpen(!isMoreAnalyticsOpen)}
          className="w-full flex items-center justify-between text-xs font-black text-slate-800 dark:text-slate-200 py-1 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-500" />
            <span>More Station Analytics & Actions</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isMoreAnalyticsOpen ? 'rotate-180' : ''}`} />
        </button>

        {isMoreAnalyticsOpen && (
          <div className="pt-3.5 mt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-3 animate-fadeIn text-xs">
            {/* Station Pressures */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 font-mono space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Common Suction:</span>
                <span className="font-bold">{stationData?.incomingPressurePsi || 72.4} PSI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Common Discharge:</span>
                <span className="font-bold">{stationData?.dischargePressurePsi || 72.4} PSI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Station Flow Rate:</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400">{stationData?.flowPct || 67.4}%</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {onOpenManualInput && (
                <button
                  type="button"
                  onClick={onOpenManualInput}
                  className="w-full py-2.5 rounded-xl bg-cyan-600 text-white font-bold text-xs flex items-center justify-center gap-2"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Input Pengukuran Manual Lapangan</span>
                </button>
              )}

              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Refresh Data Stasiun</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
