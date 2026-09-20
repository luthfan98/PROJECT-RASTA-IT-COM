import React from 'react';
import { Bell, ChevronRight } from 'lucide-react';

interface AlertItem {
  id: string;
  time: string;
  pump: string;
  severity: 'WARNING' | 'DEGRADING' | 'NORMAL' | 'CRITICAL';
  title: string;
  description: string;
  point?: string;
}

interface RecentAlertsListProps {
  alerts: AlertItem[];
  onSelectAlert?: (alert: AlertItem) => void;
}

export const RecentAlertsList: React.FC<RecentAlertsListProps> = ({
  alerts,
  onSelectAlert
}) => {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B]/70 backdrop-blur-md p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-500" />
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Peringatan & Aktivitas Terkini (Recent Alerts)
            </h3>
            <p className="text-[11px] text-slate-500">
              Notifikasi operasional dan deteksi kondisi abnormal otomatis
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          Realtime Feed
        </span>
      </div>

      <div className="space-y-2.5">
        {alerts.map((alt) => {
          const isWarn = alt.severity === 'WARNING';
          const isDeg = alt.severity === 'DEGRADING';

          return (
            <div
              key={alt.id}
              onClick={() => onSelectAlert && onSelectAlert(alt)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isWarn
                  ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/15'
                  : isDeg
                  ? 'bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/15'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-slate-500 shrink-0">
                  {alt.time}
                </span>

                <div className="w-2 h-2 rounded-full shrink-0 bg-current">
                  {isWarn ? (
                    <span className="w-2 h-2 rounded-full bg-amber-500 block animate-ping" />
                  ) : isDeg ? (
                    <span className="w-2 h-2 rounded-full bg-cyan-500 block" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 block" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {alt.pump}: {alt.title}
                    </span>
                    <span className={`px-2 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      isWarn
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                        : isDeg
                        ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300'
                        : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                    }`}>
                      {alt.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {alt.description}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
