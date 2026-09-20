import React from 'react';
import { AlertTriangle, Clock, Activity } from 'lucide-react';

interface FailureProgressionBarProps {
  currentStage: 'NORMAL' | 'DEGRADING' | 'WARNING' | 'CRITICAL' | 'FAILURE';
  degradingDurationHours?: number;
  warningDetectedHoursAgo?: number;
  pumpName?: string;
}

export const FailureProgressionBar: React.FC<FailureProgressionBarProps> = ({
  currentStage = 'WARNING',
  degradingDurationHours = 38,
  warningDetectedHoursAgo = 8,
  pumpName = 'Pump C'
}) => {
  const stages = [
    { key: 'NORMAL', label: 'Normal', color: 'emerald' },
    { key: 'DEGRADING', label: 'Degrading', color: 'cyan' },
    { key: 'WARNING', label: 'Warning', color: 'amber' },
    { key: 'CRITICAL', label: 'Critical', color: 'orange' },
    { key: 'FAILURE', label: 'Failure', color: 'rose' },
  ];

  const getStageIndex = (stage: string) => {
    switch (stage) {
      case 'NORMAL': return 0;
      case 'DEGRADING': return 1;
      case 'WARNING': return 2;
      case 'CRITICAL': return 3;
      case 'FAILURE': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStageIndex(currentStage);

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1726] border border-amber-500/30 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
            Failure Progression Track ({pumpName})
          </h4>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-cyan-500" />
            <span>Degrading: <b className="text-slate-800 dark:text-slate-200">{degradingDurationHours}h</b></span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <Activity className="w-3.5 h-3.5 text-amber-500" />
            <span>Warning: <b className="text-slate-800 dark:text-slate-200">{warningDetectedHoursAgo}h lalu</b></span>
          </div>
        </div>
      </div>

      {/* Progressive Step Line */}
      <div className="relative my-4 px-2">
        <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-slate-200 dark:bg-slate-800 rounded-full" />
        
        {/* Active progress fill */}
        <div 
          className="absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-gradient-to-r from-emerald-500 via-cyan-500 to-amber-500 rounded-full transition-all duration-500"
          style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}
        />

        <div className="relative flex justify-between">
          {stages.map((stg, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={stg.key} className="flex flex-col items-center">
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] transition-all duration-300 ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-900 ring-4 ring-amber-500/30 scale-125 z-10'
                      : isCompleted
                      ? 'bg-slate-900 dark:bg-slate-100 text-cyan-400 dark:text-cyan-600'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span className={`text-[10px] mt-1.5 font-bold ${
                  isCurrent
                    ? 'text-amber-600 dark:text-amber-400 underline font-black'
                    : isCompleted
                    ? 'text-slate-700 dark:text-slate-300'
                    : 'text-slate-400'
                }`}>
                  {stg.label}
                </span>
                {isCurrent && (
                  <span className="text-[9px] font-mono text-amber-500 font-bold uppercase tracking-wider">
                    ● AKTIF
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
