import React from 'react';
import { PumpVisualization, PumpData, SensorPointData } from './PumpVisualization';
import { ArrowDown, Gauge, Waves } from 'lucide-react';

interface StationProcessOverviewProps {
  slots: PumpData[];
  selectedPump: PumpData | null;
  onSelectPump: (pump: PumpData) => void;
  onSelectSensor: (pump: PumpData, sensorKey: 'motorNde' | 'motorDe' | 'pumpDe' | 'pumpNde', data: SensorPointData) => void;
  incomingPressurePsi?: number;
  dischargePressurePsi?: number;
  flowPct?: number;
}

export const StationProcessOverview: React.FC<StationProcessOverviewProps> = ({
  slots,
  selectedPump,
  onSelectPump,
  onSelectSensor,
  incomingPressurePsi = 72.4,
  dischargePressurePsi = 72.4,
  flowPct = 67.4
}) => {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/60 backdrop-blur-md p-5 shadow-sm">
      {/* Station Process Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Diagram Alir Operasional Stasiun (Station Process Flow)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Integrasi 4 unit pompa booster twin-screw dengan common suction & discharge headers
          </p>
        </div>

        {/* Process Indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
            <Gauge className="w-4 h-4 text-cyan-500" />
            <span className="text-slate-500">Incoming:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{incomingPressurePsi} PSI</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
            <Waves className="w-4 h-4 text-blue-500" />
            <span className="text-slate-500">Total Flow:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{flowPct}%</span>
          </div>
        </div>
      </div>

      {/* SUCTION HEADER PIPE VISUAL */}
      <div className="my-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-900/25 via-blue-900/35 to-cyan-900/25 border border-cyan-500/40 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-xs">
        <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300 font-black">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
          <span className="tracking-wider">COMMON SUCTION HEADER</span>
        </div>
        <div className="flex flex-wrap items-center gap-5 text-slate-600 dark:text-slate-300">
          <span>Suction Press: <b className="text-cyan-600 dark:text-cyan-400 font-bold">{incomingPressurePsi.toFixed(2)} PSI</b></span>
          <span>Suction Flow: <b className="text-cyan-600 dark:text-cyan-400 font-bold">14,850 BOPD ({flowPct.toFixed(1)}%)</b></span>
          <span>Suction Temp: <b className="text-slate-800 dark:text-slate-200">32.5°C</b></span>
        </div>
      </div>

      {/* 4 PUMPS HORIZONTAL GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 my-2">
        {slots.map((pump) => (
          <div key={pump.slot_id} className="flex flex-col">
            {/* Feeder Pipe connection arrow */}
            <div className="flex items-center justify-center h-5">
              <div className={`flex items-center justify-center w-5 h-5 rounded-full transition-colors ${
                pump.pump_status === 'ON' 
                  ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/40 animate-bounce' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
              }`}>
                <ArrowDown className="w-3 h-3" />
              </div>
            </div>

            {/* Reusable SVG Card with direct click routing */}
            <PumpVisualization
              pump={pump}
              isSelected={selectedPump?.slot_id === pump.slot_id}
              onSelectPump={onSelectPump}
              onSelectSensor={onSelectSensor}
            />

            {/* Discharge connection arrow */}
            <div className="flex items-center justify-center h-5">
              <div className={`flex items-center justify-center w-5 h-5 rounded-full transition-colors ${
                pump.pump_status === 'ON' 
                  ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/40 animate-pulse' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
              }`}>
                <ArrowDown className="w-3 h-3" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DISCHARGE HEADER PIPE VISUAL */}
      <div className="mt-1 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-900/25 via-indigo-900/35 to-blue-900/25 border border-blue-500/40 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-xs">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-black">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="tracking-wider">COMMON DISCHARGE HEADER</span>
        </div>
        <div className="flex flex-wrap items-center gap-5 text-slate-600 dark:text-slate-300">
          <span>Discharge Press: <b className="text-blue-600 dark:text-blue-400 font-bold">{dischargePressurePsi.toFixed(2)} PSI</b></span>
          <span>Discharge Flow: <b className="text-blue-600 dark:text-blue-400 font-bold">14,850 BOPD ({flowPct.toFixed(1)}%)</b></span>
          <span>Discharge Temp: <b className="text-slate-800 dark:text-slate-200">33.1°C</b></span>
        </div>
      </div>
    </div>
  );
};
