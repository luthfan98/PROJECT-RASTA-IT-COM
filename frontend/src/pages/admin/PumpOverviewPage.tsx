import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Maximize2, 
  Minimize2, 
  ShieldAlert, 
  Activity, 
  QrCode, 
  History, 
  Cpu 
} from 'lucide-react';
import { PumpVisualization, PumpData, SensorPointData } from '../../components/dashboard/PumpVisualization';
import { SensorPopupModal } from '../../components/dashboard/SensorPopupModal';
import { FailureProgressionBar } from '../../components/dashboard/FailureProgressionBar';
import { ConditionTrendChart } from '../../components/dashboard/ConditionTrendChart';

interface PumpOverviewPageProps {
  pump: PumpData;
  allPumps?: PumpData[];
  onBack: () => void;
  onSelectOtherPump?: (pump: PumpData) => void;
  onOpenManualInput?: () => void;
  onNavigateToAnalytics?: (slotCode: string, pointKey: string) => void;
}

export const PumpOverviewPage: React.FC<PumpOverviewPageProps> = ({
  pump,
  allPumps = [],
  onBack,
  onSelectOtherPump,
  onOpenManualInput,
  onNavigateToAnalytics
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sensors' | 'measurements' | 'ai' | 'failures' | 'maintenance' | 'equipment'>('overview');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [selectedSensorPopup, setSelectedSensorPopup] = useState<{
    pump: PumpData;
    sensorKey: 'motorNde' | 'motorDe' | 'pumpDe' | 'pumpNde';
    data: SensorPointData;
  } | null>(null);

  const isWarning = pump.health === 'WARNING' || pump.operating_state === 'WARNING';
  const isStandby = pump.operating_state === 'STANDBY' || pump.pump_status === 'OFF';

  const [selectedMobileLocation, setSelectedMobileLocation] = useState<'M-NDE' | 'M-DE' | 'P-DE' | 'P-NDE'>(
    isWarning ? 'P-DE' : 'M-DE'
  );

  const handleSensorClick = (pumpData: PumpData, sensorKey: 'motorNde' | 'motorDe' | 'pumpDe' | 'pumpNde', data: SensorPointData) => {
    setSelectedSensorPopup({ pump: pumpData, sensorKey, data });
  };

  return (
    <div className={`space-y-6 animate-fadeIn transition-all duration-300 ${
      isFocusMode ? 'w-full fixed inset-0 z-50 p-4 sm:p-6 bg-white dark:bg-[#070D1E] overflow-y-auto' : 'w-full'
    }`}>
      {/* Mobile Sticky Header (< 768px): ← Station | PUMP C ⚠ WARNING */}
      <div className="md:hidden sticky top-14 z-20 -mx-4 -mt-4 mb-3 px-3 py-2.5 bg-white/95 dark:bg-[#070D1E]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Station</span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-black text-slate-900 dark:text-white">PUMP {pump.slot_code}</span>
          {isWarning ? (
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
              ⚠ WARNING
            </span>
          ) : (
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              ● RUNNING
            </span>
          )}
        </div>

        {allPumps.length > 0 && (
          <select
            value={pump.slot_code}
            onChange={(e) => {
              const found = allPumps.find(p => p.slot_code === e.target.value);
              if (found && onSelectOtherPump) onSelectOtherPump(found);
            }}
            className="text-xs font-mono bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-700 font-bold"
          >
            {allPumps.map(p => (
              <option key={p.slot_id} value={p.slot_code}>Pump {p.slot_code}</option>
            ))}
          </select>
        )}
      </div>

      {/* 1. TOP BREADCRUMB & FOCUS CONTROLS (Desktop md:flex) */}
      <div className="hidden md:flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-black text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Station Overview</span>
          </button>

          {/* Breadcrumb path */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span>Booster Pump Batang HO</span>
            <span>/</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">Slot {pump.slot_code}</span>
            <span>/</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-black text-cyan-700 dark:text-cyan-300">
              {pump.asset_code || `L4-BTG-00${pump.slot_id}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Pump switcher */}
          {allPumps.length > 0 && (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              {allPumps.map((p) => (
                <button
                  key={p.slot_id}
                  type="button"
                  onClick={() => onSelectOtherPump && onSelectOtherPump(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-colors ${
                    p.slot_id === pump.slot_id
                      ? 'bg-cyan-500 text-slate-950 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Pump {p.slot_code}
                </button>
              ))}
            </div>
          )}

          {/* Focus Mode Button */}
          <button
            type="button"
            onClick={() => setIsFocusMode(!isFocusMode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
            title="Toggle Focus Mode (Memaksimalkan layar investigasi)"
          >
            {isFocusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFocusMode ? 'Exit Focus Mode' : 'Focus Mode'}</span>
          </button>
        </div>
      </div>

      {/* 2. FULL PUMP HEADER */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B]/80 backdrop-blur-md p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 dark:bg-slate-800 text-cyan-400 font-black text-2xl shadow-inner border border-slate-700">
              {pump.slot_code}
            </span>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-wide">
                  PUMP {pump.slot_code}
                </h2>
                <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-black text-slate-700 dark:text-slate-300">
                  Unit Fisik: {pump.asset_code || `L4-BTG-00${pump.slot_id}`}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  pump.pump_status === 'ON'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-500/15 text-slate-500 border border-slate-500/30'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${pump.pump_status === 'ON' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                  {isStandby ? 'STANDBY' : isWarning ? 'RUNNING' : 'RUNNING'}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Sequence {pump.sequence_position}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                  isWarning 
                    ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40' 
                    : isStandby
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                }`}>
                  {isStandby ? 'HEALTHY (STANDBY)' : pump.health}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500 font-mono">
                <span>Lokasi: <b className="text-slate-700 dark:text-slate-300 font-sans">Booster Pump Batang HO • Slot {pump.slot_code}</b></span>
                <span>•</span>
                <span>Pengukuran Terakhir: <b className="text-slate-700 dark:text-slate-300 font-sans">19 Sep 2026 • 14:00</b></span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold">
                  DATA: MANUAL • ACTUAL
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenManualInput}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-black shadow-md shadow-cyan-500/20 hover:brightness-110 transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span>Input Pengukuran</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('equipment')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <History className="w-4 h-4 text-slate-400" />
              <span>Histori Peralatan</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. ATTENTION REQUIRED BANNER (IF WARNING) */}
      {isWarning && (
        <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent p-5 shadow-sm flex flex-wrap items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-900">
                  ATTENTION REQUIRED
                </span>
                <span className="text-base font-black text-slate-900 dark:text-white">
                  Progressive Vibration Anomaly Detected on Pump Drive End
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Terdeteksi: <b>17 Sep 2026 • 03:00</b> • Kondisi Saat Ini: <b className="text-amber-500">WARNING</b> • Estimasi Kerusakan: <b className="font-mono">~46 jam</b> (21 Sep 2026 • 12:00)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/20"
          >
            Lihat Diagnostik AI
          </button>
        </div>
      )}

      {/* 4. LARGE INTERACTIVE PUMP SVG MAP */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B]/80 backdrop-blur-md p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-500" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Peta Visual Titik Sensor Interaktif (Pump Condition Map)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Klik titik sensor pada gambar untuk melihat pembagian tri-axial & suhu
          </span>
        </div>

        {/* Large SVG Component */}
        <div className={`transition-all duration-300 w-full ${
          isFocusMode ? 'max-w-6xl mx-auto p-2 sm:p-4' : 'max-w-5xl mx-auto p-1 sm:p-2'
        }`}>
          <PumpVisualization
            pump={pump}
            size={isFocusMode ? 'fullscreen' : 'hero'}
            onSelectSensor={handleSensorClick}
          />
        </div>

        {/* Mobile Quick Measurement Location Selector (< 768px) */}
        <div className="md:hidden mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              MEASUREMENT LOCATIONS
            </span>
            <span className="text-[10px] text-slate-400">Tap untuk cek tri-axial & suhu</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'M-NDE' as const, label: 'M-NDE', warn: false },
              { id: 'M-DE' as const, label: 'M-DE', warn: false },
              { id: 'P-DE' as const, label: 'P-DE ⚠', warn: isWarning },
              { id: 'P-NDE' as const, label: 'P-NDE', warn: false },
            ].map((loc) => {
              const isSelected = selectedMobileLocation === loc.id;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setSelectedMobileLocation(loc.id)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-black transition-all ${
                    isSelected
                      ? loc.warn
                        ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400'
                        : 'bg-cyan-500 text-slate-950 shadow-md ring-2 ring-cyan-400'
                      : loc.warn
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/40'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {loc.label}
                </button>
              );
            })}
          </div>

          {/* Selected Location Details Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            {selectedMobileLocation === 'M-NDE' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-900 dark:text-white">Motor Non-Drive End (M-NDE)</div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">NORMAL</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">H: <b className="text-slate-700 dark:text-slate-300">0.48 mm/s</b></div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">V: <b className="text-slate-700 dark:text-slate-300">0.46 mm/s</b></div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">A: <b className="text-slate-700 dark:text-slate-300">0.49 mm/s</b></div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">Suhu: <b className="text-slate-700 dark:text-slate-300">40.2°C</b></div>
                </div>
              </div>
            )}

            {selectedMobileLocation === 'M-DE' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-900 dark:text-white">Motor Drive End (M-DE)</div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">DEGRADING</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">H: <b className="text-slate-700 dark:text-slate-300">0.55 mm/s</b></div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">V: <b className="text-slate-700 dark:text-slate-300">0.52 mm/s</b></div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">A: <b className="text-slate-700 dark:text-slate-300">0.51 mm/s</b></div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">Suhu: <b className="text-slate-700 dark:text-slate-300">46.1°C</b></div>
                </div>
              </div>
            )}

            {selectedMobileLocation === 'P-DE' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-900 dark:text-white">Pump Drive End (P-DE)</div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40">WARNING</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/40">H: <b className="text-amber-500 font-black">1.82 mm/s</b></div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">V: <b className="text-slate-700 dark:text-slate-300">0.74 mm/s</b></div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">A: <b className="text-slate-700 dark:text-slate-300">0.82 mm/s</b></div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">Suhu: <b className="text-amber-500 font-bold">63.4°C</b></div>
                </div>
              </div>
            )}

            {selectedMobileLocation === 'P-NDE' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-900 dark:text-white">Pump Non-Drive End (P-NDE)</div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">DEGRADING</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">H: <b className="text-slate-700 dark:text-slate-300">0.65 mm/s</b></div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">V: <b className="text-slate-700 dark:text-slate-300">0.58 mm/s</b></div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">A: <b className="text-slate-700 dark:text-slate-300">0.55 mm/s</b></div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">Suhu: <b className="text-rose-500 font-bold">67.2°C</b></div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('condition-trend-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full mt-2 py-2 rounded-xl bg-slate-200/70 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black transition-colors"
            >
              Lihat Grafik Tren Titik Ini →
            </button>
          </div>
        </div>

        {/* Sensor Condition Around/Below SVG (Desktop Only) */}
        <div className="hidden md:grid md:grid-cols-2 gap-5 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          {/* Left: Electric Motor */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
              <span>ELECTRIC MOTOR CONDITION</span>
              <span className="font-mono text-[10px] text-slate-400">150 kW • Induction</span>
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              {/* Motor DE */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <div className="font-sans font-bold text-slate-800 dark:text-slate-200">Drive End (M-DE)</div>
                <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                  <div>H: <b className="text-slate-700 dark:text-slate-300">0.55 mm/s</b></div>
                  <div>V: <b className="text-slate-700 dark:text-slate-300">0.52 mm/s</b></div>
                  <div>A: <b className="text-slate-700 dark:text-slate-300">0.51 mm/s</b></div>
                  <div>Suhu: <b className="text-slate-700 dark:text-slate-300">46.1°C</b></div>
                </div>
                <div className="mt-2 text-[10px] font-bold text-cyan-500 font-sans">STATUS: DEGRADING</div>
              </div>

              {/* Motor NDE */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <div className="font-sans font-bold text-slate-800 dark:text-slate-200">Non-Drive End (M-NDE)</div>
                <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                  <div>H: <b className="text-slate-700 dark:text-slate-300">0.48 mm/s</b></div>
                  <div>V: <b className="text-slate-700 dark:text-slate-300">0.46 mm/s</b></div>
                  <div>A: <b className="text-slate-700 dark:text-slate-300">0.49 mm/s</b></div>
                  <div>Suhu: <b className="text-slate-700 dark:text-slate-300">40.2°C</b></div>
                </div>
                <div className="mt-2 text-[10px] font-bold text-emerald-500 font-sans">STATUS: NORMAL</div>
              </div>
            </div>
          </div>

          {/* Right: Twin-Screw Pump */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
              <span>TWIN-SCREW PUMP CONDITION</span>
              <span className="font-mono text-[10px] text-slate-400">Leistritz L4 Package</span>
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              {/* Pump DE */}
              <div className={`p-3 rounded-xl border ${
                isWarning
                  ? 'bg-amber-500/10 border-amber-500/40'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
              }`}>
                <div className="font-sans font-bold text-slate-800 dark:text-slate-200">Drive End (P-DE)</div>
                <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                  <div>H: <b className="text-amber-500 font-black">1.82 mm/s</b> (WARN)</div>
                  <div>V: <b className="text-slate-700 dark:text-slate-300">0.74 mm/s</b></div>
                  <div>A: <b className="text-slate-700 dark:text-slate-300">0.82 mm/s</b></div>
                  <div>Suhu: <b className="text-slate-700 dark:text-slate-300">63.4°C</b></div>
                </div>
                <div className="mt-2 text-[10px] font-black text-amber-500 font-sans">STATUS: WARNING</div>
              </div>

              {/* Pump NDE */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <div className="font-sans font-bold text-slate-800 dark:text-slate-200">Non-Drive End (P-NDE)</div>
                <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                  <div>H: <b className="text-slate-700 dark:text-slate-300">0.65 mm/s</b></div>
                  <div>V: <b className="text-slate-700 dark:text-slate-300">0.58 mm/s</b></div>
                  <div>A: <b className="text-slate-700 dark:text-slate-300">0.55 mm/s</b></div>
                  <div>Suhu: <b className="text-rose-500 font-bold">67.2°C</b></div>
                </div>
                <div className="mt-2 text-[10px] font-bold text-cyan-500 font-sans">STATUS: DEGRADING</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. DUAL TELEMETRY PANELS: OPERATIONAL & PROCESS AUXILIARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Panel 1: Operational Condition */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B]/80 p-5 shadow-sm">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
            OPERATIONAL CONDITION
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-400 font-bold">Status:</span>
              <div className="font-black text-slate-900 dark:text-white mt-0.5">{pump.pump_status === 'ON' ? 'RUNNING' : 'STANDBY'}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-400 font-bold">Operating State:</span>
              <div className="font-black text-slate-900 dark:text-white mt-0.5">{pump.operating_state}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-400 font-bold">Load:</span>
              <div className="font-black text-slate-900 dark:text-white mt-0.5 font-mono">{pump.load_pct}%</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-400 font-bold">Running Hours:</span>
              <div className="font-black text-slate-900 dark:text-white mt-0.5 font-mono">{pump.running_hours_total?.toLocaleString()} h</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-400 font-bold">Start Count:</span>
              <div className="font-black text-slate-900 dark:text-white mt-0.5 font-mono">287 Siklus</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-400 font-bold">RPM / Speed:</span>
              <div className="font-mono text-slate-400 mt-0.5 font-bold">{isStandby ? '0 RPM' : '1,480 RPM'}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-400 font-bold">Torque:</span>
              <div className="font-mono text-slate-400 mt-0.5">—</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-400 font-bold">Power / Frequency:</span>
              <div className="font-mono text-slate-400 mt-0.5">{isStandby ? '—' : '50.0 Hz • 112 kW'}</div>
            </div>
          </div>
        </div>

        {/* Panel 2: Process & Auxiliary (Clean '—' for unmeasured parameters) */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B]/80 p-5 shadow-sm">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
            PROCESS & AUXILIARY TELEMETRY
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-400 font-bold">Pump Suction Press:</span>
              <div className="font-mono font-black text-slate-900 dark:text-white mt-0.5">72.40 PSI</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-400 font-bold">Pump Discharge Press:</span>
              <div className="font-mono font-black text-slate-900 dark:text-white mt-0.5">72.40 PSI</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-400 font-bold">DP Strainer 1:</span>
              <div className="font-mono text-slate-400 mt-0.5">— (Belum Terpasang)</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-400 font-bold">DP Strainer 2:</span>
              <div className="font-mono text-slate-400 mt-0.5">— (Belum Terpasang)</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-400 font-bold">Circulating Pump 1 Press:</span>
              <div className="font-mono text-slate-400 mt-0.5">—</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-400 font-bold">Circulating Pump 1 Temp:</span>
              <div className="font-mono text-slate-400 mt-0.5">—</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-400 font-bold">Circulating Pump 2 Press:</span>
              <div className="font-mono text-slate-400 mt-0.5">—</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-400 font-bold">Circulating Pump 2 Temp:</span>
              <div className="font-mono text-slate-400 mt-0.5">—</div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. AI CONDITION PROGNOSTICS & FAILURE PROGRESSION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* AI Prognostics */}
        <div className="lg:col-span-6 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B]/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-500" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                RASTA AI CONDITION ANALYSIS
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase bg-amber-500/15 text-amber-500 border border-amber-500/30">
              {isWarning ? 'WARNING' : 'HEALTHY'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Probabilitas Gagal</div>
              <div className="text-2xl font-mono font-black text-rose-500 mt-1">71%</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Sisa Umur (RUL)</div>
              <div className="text-2xl font-mono font-black text-amber-500 mt-1">~46 h</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Confidence</div>
              <div className="text-2xl font-mono font-black text-cyan-500 mt-1">82%</div>
            </div>
          </div>

          {/* Why was this pump flagged? */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs">
            <div className="font-black text-slate-800 dark:text-slate-200 uppercase mb-2">
              WHY WAS THIS PUMP FLAGGED?
            </div>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                <span>Pump DE Horizontal: <b>0.72 → 1.82 mm/s</b> (+153% tren dalam 36 jam)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                <span>Pump DE Temperature: <b>+8.4°C / 24 jam</b></span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                <span>Motor DE Vibration: terpengaruh naik <b>+31%</b></span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                <span>Load: Stabil pada ~74% (anomali murni mekanikal coupling)</span>
              </li>
            </ul>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            * Prediction is an early-warning estimate and should be verified through operational inspection.
          </p>
        </div>

        {/* Progression Track */}
        <div className="lg:col-span-6 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B]/80 shadow-sm flex flex-col justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
            CONDITION PROGRESSION TIMELINE
          </h4>

          <FailureProgressionBar
            currentStage={isWarning ? 'WARNING' : 'NORMAL'}
            degradingDurationHours={isWarning ? 38 : 0}
            warningDetectedHoursAgo={isWarning ? 8 : 0}
            pumpName={`Pump ${pump.slot_code}`}
          />

          <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs font-mono space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Degradation Detected:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">17 Sep • 03:00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Warning Threshold Exceeded:</span>
              <span className="font-bold text-amber-500">19 Sep • 06:00 (8 jam lalu)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Current Reading:</span>
              <span className="font-bold text-cyan-400">19 Sep • 14:00 (1.82 mm/s)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6.5. MAIN CONDITION TREND CHART */}
      <div id="condition-trend-section">
        <ConditionTrendChart initialPump={pump.slot_code} />
      </div>

      {/* 7. INVESTIGATION TABS */}
      <div id="investigation-tabs-section" className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B]/80 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-xs font-bold">
          {(['overview', 'sensors', 'measurements', 'ai', 'failures', 'maintenance', 'equipment'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`py-3.5 px-3 border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab === 'ai' ? 'AI Analysis' : tab === 'equipment' ? 'Equipment History' : tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4 text-xs">
              <h4 className="font-black text-sm uppercase text-slate-800 dark:text-white">
                Ringkasan Diagnostik Telemetri
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Unit pompa berada dalam status aktif dan mengalami peningkatan getaran pada sumbu horizontal bantalan pompa Drive End (P-DE-H). Berdasarkan model prediksi RASTA ML, pola harmonik menunjukkan tanda awal misalignment pada kopling lentur (*flexible coupling*). Disarankan untuk melakukan pengecekan visual baut kopling dan pelumasan bearing pada jadwal pemeliharaan terdekat.
              </p>
            </div>
          )}

          {activeTab === 'sensors' && (
            <div className="space-y-3 font-mono text-xs">
              <h4 className="font-black font-sans text-sm uppercase text-slate-800 dark:text-white">
                Daftar Sensor Fisik & Riwayat Penggantian
              </h4>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-between items-center">
                <div>
                  <div className="font-bold font-sans text-slate-900 dark:text-white">SNS-C-PDE-H-021 (Sensor Aktif)</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Titik: Pump DE Horizontal • Terpasang: 12 Mar 2026 • Status: ACTIVE</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 font-black text-[10px]">AKTIF</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-between items-center opacity-70">
                <div>
                  <div className="font-bold font-sans text-slate-700 dark:text-slate-300">SNS-C-PDE-H-001 (Sensor Lama)</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Titik: Pump DE Horizontal • 2024 s/d 12 Mar 2026 • Alasan: Sensor drift</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[10px]">REPLACED</span>
              </div>
            </div>
          )}

          {activeTab === 'measurements' && (
            <div className="space-y-3 font-mono text-xs overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 uppercase font-sans font-black">
                    <th className="py-2 px-3">Timestamp</th>
                    <th className="py-2 px-3">Operating State</th>
                    <th className="py-2 px-3 text-right">Load</th>
                    <th className="py-2 px-3 text-right">Max Vib</th>
                    <th className="py-2 px-3 text-right">Max Temp</th>
                    <th className="py-2 px-3 text-center">Health</th>
                    <th className="py-2 px-3 text-center">Provenance</th>
                    <th className="py-2 px-3 text-center">Quality</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-2.5 px-3">19 Sep 14:00</td>
                    <td className="py-2.5 px-3">RUNNING</td>
                    <td className="py-2.5 px-3 text-right font-bold">74%</td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-500">1.82 mm/s</td>
                    <td className="py-2.5 px-3 text-right font-bold">67.2°C</td>
                    <td className="py-2.5 px-3 text-center text-amber-500 font-bold">WARNING</td>
                    <td className="py-2.5 px-3 text-center"><span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-600 text-[10px]">MANUAL • ACTUAL</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 text-[10px]">GOOD</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3">19 Sep 13:00</td>
                    <td className="py-2.5 px-3">RUNNING</td>
                    <td className="py-2.5 px-3 text-right font-bold">74%</td>
                    <td className="py-2.5 px-3 text-right font-bold">1.75 mm/s</td>
                    <td className="py-2.5 px-3 text-right font-bold">66.5°C</td>
                    <td className="py-2.5 px-3 text-center text-cyan-500 font-bold">DEGRADING</td>
                    <td className="py-2.5 px-3 text-center"><span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px]">IMPORT • SYNTHETIC</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 text-[10px]">GOOD</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-3 text-xs leading-relaxed">
              <h4 className="font-black text-sm uppercase text-slate-800 dark:text-white">
                Analisis Spektral & Bobot Prediksi
              </h4>
              <p className="text-slate-600 dark:text-slate-300">
                Deteksi anomali didorong oleh deviasi sinyal getaran 1X dan 2X RPM harmonics pada sensor P-DE-H. Pola ini konsisten dengan model misalignment kopling yang tercatat pada basis data historis kerusakan RASTA.
              </p>
            </div>
          )}

          {activeTab === 'failures' && (
            <div className="space-y-3 text-xs font-mono">
              <h4 className="font-black font-sans text-sm uppercase text-slate-800 dark:text-white">
                Riwayat Kejadian Kerusakan (Failure Events)
              </h4>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <div className="flex justify-between font-bold text-slate-800 dark:text-white font-sans">
                  <span>EVT-C-001 (Bearing Degradation)</span>
                  <span className="text-emerald-500">RESOLVED</span>
                </div>
                <div className="text-slate-500 text-[11px] mt-1 font-mono">
                  15 Jan 2026 s/d 22 Jan 2026 • Durasi degradasi: 168 jam • Tindakan: Overhaul & penggantian mechanical seal.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-3 text-xs font-mono">
              <h4 className="font-black font-sans text-sm uppercase text-slate-800 dark:text-white">
                Catatan Pemeliharaan (Maintenance Logs)
              </h4>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <div className="flex justify-between font-bold text-slate-800 dark:text-white font-sans">
                  <span>Preventive Maintenance (PM-6M)</span>
                  <span className="text-cyan-500">COMPLETED</span>
                </div>
                <div className="text-slate-500 text-[11px] mt-1">
                  18 Agu 2026 • Bearing inspection, lubrication check, alignment calibration • Teknisi: Tim Pemeliharaan Batang
                </div>
              </div>
            </div>
          )}

          {activeTab === 'equipment' && (
            <div className="space-y-3 text-xs font-mono">
              <h4 className="font-black font-sans text-sm uppercase text-slate-800 dark:text-white">
                Riwayat Siklus Hidup Pemasangan Unit di Slot {pump.slot_code}
              </h4>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <div className="flex justify-between font-bold text-slate-800 dark:text-white">
                  <span>L4-BTG-003 (Unit Aktif Saat Ini)</span>
                  <span className="text-emerald-500 font-sans font-bold text-[10px]">12 Mar 2026 → CURRENT</span>
                </div>
                <div className="text-slate-500 text-[11px] mt-1 font-sans">
                  Nomor Seri Pabrik: SN-LZ-2023-0803 • Terpasang pada Slot C.
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 opacity-70">
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                  <span>L4-BTG-001 (Unit Sebelumnya)</span>
                  <span className="text-slate-400 font-sans text-[10px]">01 Jan 2024 → 11 Mar 2026</span>
                </div>
                <div className="text-slate-500 text-[11px] mt-1 font-sans">
                  Dilepas untuk overhaul total di workshop pusat.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sensor Quick Popup */}
      {selectedSensorPopup && (
        <SensorPopupModal
          pump={selectedSensorPopup.pump}
          sensorKey={selectedSensorPopup.sensorKey}
          sensorData={selectedSensorPopup.data}
          onClose={() => setSelectedSensorPopup(null)}
          onViewAnalytics={(slotCode, pointKey) => {
            setSelectedSensorPopup(null);
            if (onNavigateToAnalytics) {
              onNavigateToAnalytics(slotCode, pointKey);
            } else {
              setActiveTab('sensors');
              setTimeout(() => {
                const el = document.getElementById('condition-trend-section') || document.getElementById('investigation-tabs-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 100);
            }
          }}
        />
      )}
    </div>
  );
};
