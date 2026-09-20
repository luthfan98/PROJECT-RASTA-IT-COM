import React from 'react';
import { ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { PumpData } from './PumpVisualization';

interface PumpStatusCardsRowProps {
  slots: PumpData[];
  onSelectPump: (pump: PumpData) => void;
}

export const PumpStatusCardsRow: React.FC<PumpStatusCardsRowProps> = ({
  slots,
  onSelectPump
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {slots.map((pump) => {
        const isRunning = pump.pump_status === 'ON';
        const isWarning = pump.health === 'WARNING' || pump.operating_state === 'WARNING';
        const isStandby = pump.operating_state === 'STANDBY' || pump.pump_status === 'OFF';

        return (
          <div
            key={pump.slot_id}
            onClick={() => onSelectPump(pump)}
            className={`cursor-pointer rounded-3xl p-5 border transition-all duration-300 flex flex-col justify-between hover:shadow-xl group ${
              isWarning
                ? 'bg-amber-500/[0.05] dark:bg-amber-500/[0.03] border-amber-500/50 hover:border-amber-500 shadow-md shadow-amber-500/10'
                : 'bg-white dark:bg-[#0B132B]/80 border-slate-200 dark:border-slate-800 hover:border-cyan-500/60'
            }`}
          >
            {/* Top row: Name, Sequence, Operating Status */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-slate-900 dark:text-white tracking-wide">
                      PUMP {pump.slot_code}
                    </h4>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {pump.asset_code || `L4-BTG-00${pump.slot_id}`}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-500 mt-0.5">
                    Sequence {pump.sequence_position}
                  </div>
                </div>

                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                  isRunning
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                  {isStandby ? 'STANDBY' : isWarning ? 'RUNNING' : 'RUNNING'}
                </span>
              </div>

              {/* Health State Banner */}
              <div className={`p-2.5 rounded-2xl my-3 text-xs font-black flex items-center justify-between ${
                isWarning
                  ? 'bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/40'
                  : isStandby
                  ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300'
                  : 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30'
              }`}>
                <div className="flex items-center gap-2">
                  {isWarning ? (
                    <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                  <span className="tracking-wide">{isStandby ? 'HEALTHY (STANDBY)' : pump.health}</span>
                </div>
                <span className="font-mono text-[11px] font-bold opacity-80">
                  {isStandby ? 'Standby' : `${pump.load_pct}% Load`}
                </span>
              </div>

              {/* Core Measurements Matrix (Clear & High Readability) */}
              <div className="space-y-2 my-4 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-500 font-bold">Load</span>
                  <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                    {pump.load_pct}%
                  </span>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-500 font-bold">Max Vibration</span>
                  <span className={`font-mono font-black text-sm ${
                    pump.maxVibration > 1.8 ? 'text-amber-500' : 'text-slate-900 dark:text-white'
                  }`}>
                    {pump.maxVibration.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">mm/s</span>
                  </span>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-500 font-bold">Max Temperature</span>
                  <span className={`font-mono font-black text-sm ${
                    pump.maxTemperature > 65 ? 'text-amber-500' : 'text-slate-900 dark:text-white'
                  }`}>
                    {pump.maxTemperature.toFixed(1)}°C
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Running Hours</span>
                  <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                    {pump.running_hours_total?.toLocaleString()} h
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Call-To-Action */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <span className={`text-[11px] font-bold ${isWarning ? 'text-amber-500 font-black' : 'text-slate-400'}`}>
                {isWarning ? '● Anomali Terdeteksi' : isStandby ? 'Rotasi Standar' : 'Operasi Normal'}
              </span>

              <span className="inline-flex items-center gap-1 text-xs font-black text-cyan-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform">
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

