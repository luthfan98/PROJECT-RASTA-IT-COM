import React from 'react';
import { Activity, ArrowUpRight } from 'lucide-react';
import { PumpData } from './PumpVisualization';

interface SensorMapTableProps {
  pump: PumpData;
  onSelectPoint?: (pointName: string) => void;
}

export const SensorMapTable: React.FC<SensorMapTableProps> = ({
  pump,
  onSelectPoint
}) => {
  const isStandby = pump.operating_state === 'STANDBY' || pump.pump_status === 'OFF';
  const isPumpC = pump.slot_code === 'C';

  const sensorPoints = [
    {
      component: 'Electric Motor',
      position: 'Drive End (DE)',
      code: 'M-DE',
      h: isStandby ? 0.04 : isPumpC ? 0.55 : 0.43,
      v: isStandby ? 0.03 : isPumpC ? 0.52 : 0.41,
      a: isStandby ? 0.04 : isPumpC ? 0.51 : 0.39,
      temp: isStandby ? 31.5 : isPumpC ? 46.1 : 44.0,
      tempTrend: isStandby ? '0.0°C' : '+1.2°C / 24h',
      status: isStandby ? 'STANDBY' : isPumpC ? 'DEGRADING' : 'NORMAL'
    },
    {
      component: 'Electric Motor',
      position: 'Non-Drive End (NDE)',
      code: 'M-NDE',
      h: isStandby ? 0.04 : isPumpC ? 0.48 : 0.42,
      v: isStandby ? 0.03 : isPumpC ? 0.46 : 0.44,
      a: isStandby ? 0.03 : isPumpC ? 0.49 : 0.41,
      temp: isStandby ? 31.0 : isPumpC ? 40.2 : 38.5,
      tempTrend: isStandby ? '0.0°C' : '+0.8°C / 24h',
      status: isStandby ? 'STANDBY' : 'NORMAL'
    },
    {
      component: 'Twin-Screw Pump',
      position: 'Drive End (DE)',
      code: 'P-DE',
      h: isStandby ? 0.05 : isPumpC ? 1.82 : 0.54,
      v: isStandby ? 0.04 : isPumpC ? 0.74 : 0.52,
      a: isStandby ? 0.04 : isPumpC ? 0.82 : 0.51,
      temp: isStandby ? 32.0 : isPumpC ? 63.4 : 54.2,
      tempTrend: isStandby ? '0.0°C' : isPumpC ? '+4.2°C / 24h' : '+1.1°C / 24h',
      status: isStandby ? 'STANDBY' : isPumpC ? 'WARNING' : 'NORMAL'
    },
    {
      component: 'Twin-Screw Pump',
      position: 'Non-Drive End (NDE)',
      code: 'P-NDE',
      h: isStandby ? 0.04 : isPumpC ? 0.65 : 0.48,
      v: isStandby ? 0.03 : isPumpC ? 0.58 : 0.46,
      a: isStandby ? 0.03 : isPumpC ? 0.55 : 0.49,
      temp: isStandby ? 31.0 : isPumpC ? 67.2 : 58.0,
      tempTrend: isStandby ? '0.0°C' : isPumpC ? '+5.1°C / 24h' : '+1.4°C / 24h',
      status: isStandby ? 'STANDBY' : isPumpC ? 'DEGRADING' : 'NORMAL'
    }
  ];

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B]/70 backdrop-blur-md p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-500" />
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Pemetaan Multi-Sensor Vibrasi & Suhu ({pump.slot_name || `Slot ${pump.slot_code}`})
            </h3>
            <p className="text-[11px] text-slate-500">
              Matriks pengukuran tri-axial (H, V, A) dan laju kenaikan suhu per 24 jam
            </p>
          </div>
        </div>

        <span className="font-mono text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
          {pump.asset_code || `PUMP-${pump.slot_code}`}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800/80 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <th className="py-2.5 px-3">Komponen & Posisi</th>
              <th className="py-2.5 px-3 text-center">Kode</th>
              <th className="py-2.5 px-3 text-right">Horiz (H)</th>
              <th className="py-2.5 px-3 text-right">Vert (V)</th>
              <th className="py-2.5 px-3 text-right">Axial (A)</th>
              <th className="py-2.5 px-3 text-right">Suhu (°C)</th>
              <th className="py-2.5 px-3 text-center">Tren Suhu</th>
              <th className="py-2.5 px-3 text-center">Status Titik</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
            {sensorPoints.map((pt, idx) => {
              const isPtWarn = pt.status === 'WARNING';
              const isPtDegrading = pt.status === 'DEGRADING';

              return (
                <tr 
                  key={idx}
                  onClick={() => onSelectPoint && onSelectPoint(pt.code)}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors ${
                    isPtWarn ? 'bg-amber-500/5' : ''
                  }`}
                >
                  <td className="py-3 px-3 font-sans">
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {pt.component}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {pt.position}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {pt.code}
                    </span>
                  </td>

                  {/* Horizontal */}
                  <td className={`py-3 px-3 text-right font-black ${
                    pt.h > 1.8 ? 'text-amber-500 font-bold' : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {pt.h.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">mm/s</span>
                  </td>

                  {/* Vertical */}
                  <td className="py-3 px-3 text-right text-slate-700 dark:text-slate-300">
                    {pt.v.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">mm/s</span>
                  </td>

                  {/* Axial */}
                  <td className="py-3 px-3 text-right text-slate-700 dark:text-slate-300">
                    {pt.a.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">mm/s</span>
                  </td>

                  {/* Temperature */}
                  <td className={`py-3 px-3 text-right font-bold ${
                    pt.temp > 65 ? 'text-rose-500' : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {pt.temp.toFixed(1)}°C
                  </td>

                  {/* Temp Trend */}
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${
                      isPumpC && pt.code.startsWith('P') ? 'text-amber-500' : 'text-slate-500'
                    }`}>
                      {isPumpC && pt.code.startsWith('P') && <ArrowUpRight className="w-3 h-3 text-amber-500" />}
                      {pt.tempTrend}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isPtWarn
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-black'
                        : isPtDegrading
                        ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
                        : pt.status === 'STANDBY'
                        ? 'bg-slate-500/15 text-slate-500 border border-slate-500/30'
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {pt.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
