import React from 'react';
import { ShieldCheck, Clock, RefreshCw, QrCode, Layers, ChevronDown } from 'lucide-react';

interface StationHealthHeaderProps {
  stationName?: string;
  overallCondition?: 'NORMAL' | 'WARNING' | 'CRITICAL';
  runningPumpsCount?: number;
  totalPumpsCount?: number;
  warningCount?: number;
  criticalCount?: number;
  lastMeasurementTime?: string;
  freshnessMinutes?: number;
  nextExpectedTime?: string;
  includeSynthetic?: boolean;
  onToggleSynthetic?: (val: boolean) => void;
  onOpenManualInput?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const StationHealthHeader: React.FC<StationHealthHeaderProps> = ({
  stationName = 'Booster Pump Batang HO',
  overallCondition = 'NORMAL',
  runningPumpsCount = 2,
  totalPumpsCount = 4,
  warningCount = 1,
  criticalCount = 0,
  lastMeasurementTime = '19 Sep 2026 • 14:00',
  freshnessMinutes = 42,
  nextExpectedTime = '15:00',
  includeSynthetic = true,
  onToggleSynthetic,
  onOpenManualInput,
  onRefresh,
  isRefreshing = false
}) => {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0B132B]/80 backdrop-blur-md p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Side: Station Identification & Condition */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0B132B] animate-ping" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0B132B]" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Station Dropdown Selector */}
              <div className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                <span>Stasiun: <b>{stationName}</b></span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Overall Condition */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                KONDISI: {overallCondition}
              </span>
            </div>

            {/* Freshness & Schedule */}
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 font-mono">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-500" />
                <span>Pengukuran Terakhir: <b className="text-slate-700 dark:text-slate-300 font-sans">{lastMeasurementTime}</b> ({freshnessMinutes} menit lalu)</span>
              </div>
              <span>•</span>
              <div>
                <span>Jadwal Berikutnya: <b className="text-slate-700 dark:text-slate-300">{nextExpectedTime}</b></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: KPIs, Data Context & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Running Status Badge */}
          <div className="px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-center shadow-xs">
            <div className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-wider">Pompa Beroperasi</div>
            <div className="text-lg font-mono font-black text-slate-900 dark:text-white">
              {runningPumpsCount} / {totalPumpsCount} <span className="text-xs font-bold text-emerald-500 font-sans">RUNNING</span>
            </div>
          </div>

          {/* Warning Badge */}
          <div className="px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center shadow-xs">
            <div className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">Peringatan</div>
            <div className="text-lg font-mono font-black text-amber-600 dark:text-amber-400">
              {warningCount} <span className="text-xs font-bold font-sans">Unit</span>
            </div>
          </div>

          {/* Critical Badge */}
          <div className="px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center shadow-xs">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Kritis</div>
            <div className="text-lg font-mono font-black text-slate-400">
              {criticalCount}
            </div>
          </div>

          {/* GLOBAL DATA CONTEXT INDICATOR */}
          <div className="px-4 py-2 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-left flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-500" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                DATA CONTEXT
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono uppercase tracking-wider ${
                includeSynthetic
                  ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
                  : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
              }`}>
                {includeSynthetic ? 'IMPORT • SYNTHETIC' : 'MANUAL • ACTUAL'}
              </span>
              <button
                type="button"
                onClick={() => onToggleSynthetic && onToggleSynthetic(!includeSynthetic)}
                className="text-[10px] text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 underline font-bold"
                title="Ganti antara data aktual dan data training sintetik"
              >
                {includeSynthetic ? 'Ubah ke Aktual' : 'Gunakan Sintetik'}
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 pl-1">
            {/* Quick Manual Input */}
            <button
              type="button"
              onClick={onOpenManualInput}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-black shadow-md shadow-cyan-500/20 hover:brightness-110 transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span>Input Manual</span>
            </button>

            {/* Refresh */}
            <button
              type="button"
              onClick={onRefresh}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Perbarui Data Stasiun"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

