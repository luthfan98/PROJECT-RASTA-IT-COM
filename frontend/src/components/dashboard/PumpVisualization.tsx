import React, { useState } from 'react';

export interface SensorPointData {
  name: string;
  component?: 'MOTOR' | 'PUMP';
  position?: 'DE' | 'NDE';
  code?: 'M-NDE' | 'M-DE' | 'P-DE' | 'P-NDE';
  h?: number | null;
  v?: number | null;
  a?: number | null;
  temp?: number | null;
  status: 'NORMAL' | 'DEGRADING' | 'WARNING' | 'CRITICAL' | 'FAILURE' | 'OFFLINE' | 'NO_DATA';
  activeSensorId?: string;
  sensorModel?: string;
  installedDate?: string;
  lastMeasurementTime?: string;
  source?: string;
  hTrend?: string;
  vTrend?: string;
  aTrend?: string;
  tempTrend?: string;
}

export interface PumpData {
  slot_id: number;
  slot_code: string;
  slot_name: string;
  pump_id?: number;
  asset_code?: string;
  serial_number?: string;
  pump_name?: string;
  sequence_position: number;
  pump_status: 'ON' | 'OFF';
  operating_state: string;
  health: 'HEALTHY' | 'DEGRADING' | 'WARNING' | 'CRITICAL' | 'FAILURE';
  healthScore?: number;
  load_pct: number;
  maxVibration: number;
  maxTemperature: number;
  running_hours_total: number;
  sensorPoints?: {
    motorNde: SensorPointData;
    motorDe: SensorPointData;
    pumpDe: SensorPointData;
    pumpNde: SensorPointData;
  };
}

interface PumpVisualizationProps {
  pump: PumpData;
  isSelected?: boolean;
  onSelectPump?: (pump: PumpData) => void;
  onSelectSensor?: (pump: PumpData, sensorKey: 'motorNde' | 'motorDe' | 'pumpDe' | 'pumpNde', data: SensorPointData) => void;
  size?: 'sm' | 'md' | 'lg' | 'hero' | 'fullscreen';
}

export const PumpVisualization: React.FC<PumpVisualizationProps> = ({
  pump,
  isSelected = false,
  onSelectPump,
  onSelectSensor,
  size = 'md'
}) => {
  const isRunning = pump.pump_status === 'ON' || pump.operating_state.includes('RUNNING') || pump.operating_state === 'WARNING';
  const isWarning = pump.health === 'WARNING' || pump.operating_state === 'WARNING';
  const isCritical = pump.health === 'CRITICAL' || pump.health === 'FAILURE';
  const isStandby = pump.operating_state === 'STANDBY' || pump.pump_status === 'OFF';

  const isLarge = size === 'lg' || size === 'hero' || size === 'fullscreen';

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'NORMAL':
        return '#10B981'; // emerald-500
      case 'DEGRADING':
        return '#06B6D4'; // cyan-500
      case 'WARNING':
        return '#F59E0B'; // amber-500
      case 'CRITICAL':
      case 'FAILURE':
        return '#EF4444'; // rose-500
      case 'NO_DATA':
      case 'OFFLINE':
      default:
        return '#94A3B8'; // slate-400
    }
  };

  const getSequenceSymbol = (seq: number) => {
    switch (seq) {
      case 1: return '①';
      case 2: return '②';
      case 3: return '③';
      case 4: return '④';
      default: return `#${seq}`;
    }
  };

  const sensorPoints = pump.sensorPoints || {
    motorNde: { 
      name: 'Motor NDE', 
      component: 'MOTOR' as const,
      position: 'NDE' as const,
      code: 'M-NDE' as const,
      h: isStandby ? 0.04 : 0.42, 
      v: isStandby ? 0.03 : 0.38, 
      a: isStandby ? 0.03 : 0.39, 
      temp: isStandby ? 31.0 : 48.2, 
      status: isStandby ? 'OFFLINE' : 'NORMAL',
      activeSensorId: `SNS-${pump.slot_code}-MNDE-012`,
      lastMeasurementTime: '19 Sep 2026 • 14:00',
      source: 'IMPORT • SYNTHETIC'
    },
    motorDe: { 
      name: 'Motor DE', 
      component: 'MOTOR' as const,
      position: 'DE' as const,
      code: 'M-DE' as const,
      h: isStandby ? 0.04 : isWarning ? 1.15 : 0.46, 
      v: isStandby ? 0.03 : 0.44, 
      a: isStandby ? 0.04 : 0.45, 
      temp: isStandby ? 32.0 : isWarning ? 56.4 : 51.0, 
      status: isStandby ? 'OFFLINE' : isWarning ? 'DEGRADING' : 'NORMAL',
      activeSensorId: `SNS-${pump.slot_code}-MDE-015`,
      lastMeasurementTime: '19 Sep 2026 • 14:00',
      source: 'IMPORT • SYNTHETIC'
    },
    pumpDe: { 
      name: 'Pump DE', 
      component: 'PUMP' as const,
      position: 'DE' as const,
      code: 'P-DE' as const,
      h: isStandby ? 0.05 : isWarning ? 1.82 : 0.45, 
      v: isStandby ? 0.04 : 0.74, 
      a: isStandby ? 0.04 : 0.82, 
      temp: isStandby ? 33.0 : isWarning ? 63.4 : 54.0, 
      status: isStandby ? 'OFFLINE' : isWarning ? 'WARNING' : 'NORMAL',
      activeSensorId: `SNS-${pump.slot_code}-PDE-021`,
      lastMeasurementTime: '19 Sep 2026 • 14:00',
      source: 'IMPORT • SYNTHETIC'
    },
    pumpNde: { 
      name: 'Pump NDE', 
      component: 'PUMP' as const,
      position: 'NDE' as const,
      code: 'P-NDE' as const,
      h: isStandby ? 0.04 : 0.48, 
      v: isStandby ? 0.03 : 0.46, 
      a: isStandby ? 0.04 : 0.49, 
      temp: isStandby ? 31.5 : 58.0, 
      status: isStandby ? 'OFFLINE' : 'NORMAL',
      activeSensorId: `SNS-${pump.slot_code}-PNDE-018`,
      lastMeasurementTime: '19 Sep 2026 • 14:00',
      source: 'IMPORT • SYNTHETIC'
    }
  };

  const [hoveredLocation, setHoveredLocation] = useState<{
    code: string;
    name: string;
    status: string;
    maxVib: number;
    temp: number;
    trend: string;
    x: number;
    y: number;
  } | null>(null);

  // Requirement 8: Location status represents the worst relevant condition among measurements at that location
  // NORMAL < DEGRADING < WARNING < CRITICAL < FAILURE
  const getLocationStatus = (pt: SensorPointData, isDefaultWarning?: boolean): 'NORMAL' | 'DEGRADING' | 'WARNING' | 'CRITICAL' | 'FAILURE' | 'OFFLINE' | 'NO_DATA' => {
    if (isStandby) return 'OFFLINE';
    const hasH = pt.h !== undefined && pt.h !== null;
    const hasV = pt.v !== undefined && pt.v !== null;
    const hasA = pt.a !== undefined && pt.a !== null;
    const hasTemp = pt.temp !== undefined && pt.temp !== null;
    if (!hasH && !hasV && !hasA && !hasTemp) return 'NO_DATA';

    const maxVib = Math.max(hasH ? pt.h! : 0, hasV ? pt.v! : 0, hasA ? pt.a! : 0);
    const temp = hasTemp ? pt.temp! : 0;

    if (pt.status === 'CRITICAL' || pt.status === 'FAILURE' || maxVib >= 7.1 || temp >= 85) return 'CRITICAL';
    if (pt.status === 'WARNING' || isDefaultWarning || maxVib >= 1.8 || temp >= 65) return 'WARNING';
    if (pt.status === 'DEGRADING' || maxVib >= 1.1 || temp >= 55) return 'DEGRADING';
    return 'NORMAL';
  };

  // Trimmed viewBox for large/fullscreen views to eliminate wasted border whitespace
  const viewBox = isLarge ? '12 14 430 192' : '0 0 460 220';

  return (
    <div 
      className={`relative flex flex-col rounded-2xl transition-all duration-300 border ${
        isLarge ? 'p-5 sm:p-6' : 'p-4'
      } ${
        isSelected
          ? 'ring-2 ring-cyan-500 border-cyan-500 bg-white dark:bg-[#0E1726]'
          : isWarning
          ? 'border-amber-500/40 bg-amber-500/[0.03] dark:bg-amber-500/[0.02] hover:border-amber-500'
          : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D1527] hover:border-cyan-500/50 hover:shadow-lg'
      } shadow-sm`}
    >
      {/* Header Info */}
      <div className={`flex items-center justify-between ${isLarge ? 'mb-4' : 'mb-2'}`}>
        <div className="flex items-center gap-2.5">
          <span className={`flex items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-800 text-cyan-400 font-bold shadow-inner ${
            isLarge ? 'w-9 h-9 text-base' : 'w-7 h-7 text-sm'
          }`}>
            {pump.slot_code}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h4 className={`font-black text-slate-800 dark:text-slate-100 ${
                isLarge ? 'text-base sm:text-lg' : 'text-sm'
              }`}>
                PUMP {pump.slot_code}
              </h4>
              <span className={`font-mono rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold ${
                isLarge ? 'text-xs px-2 py-0.5' : 'text-[11px] px-1.5 py-0.5'
              }`}>
                Seq {pump.sequence_position} {getSequenceSymbol(pump.sequence_position)}
              </span>
            </div>
            <span className={`text-slate-600 dark:text-slate-400 font-mono ${
              isLarge ? 'text-xs' : 'text-[10px]'
            }`}>
              {pump.asset_code || `PUMP-L4-BTG-00${pump.slot_id}`}
            </span>
          </div>
        </div>

        {/* Operating & Health Badge */}
        <div className="flex flex-col items-end gap-1">
          <span 
            className={`inline-flex items-center gap-1.5 rounded-full font-black uppercase tracking-wider ${
              isLarge ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[10px]'
            } ${
              isRunning
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
            {isStandby ? 'STANDBY' : isWarning ? 'RUNNING (WARN)' : 'RUNNING'}
          </span>

          <span 
            className={`font-bold rounded ${
              isLarge ? 'text-xs px-2 py-0.5' : 'text-[10px] px-1.5 py-0.2'
            } ${
              isCritical
                ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10'
                : isWarning
                ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                : 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
            }`}
          >
            {isStandby ? 'Healthy (Standby)' : pump.health}
          </span>
        </div>
      </div>

      {/* SVG Industrial Package Illustration */}
      <div 
        className={`w-full relative flex items-center justify-center cursor-pointer group ${
          isLarge ? 'my-3 sm:my-6' : 'my-1'
        }`}
        onClick={() => onSelectPump && onSelectPump(pump)}
        title="Klik untuk membuka diagnostik detail pompa"
      >
        <svg
          viewBox={viewBox}
          className={`w-full h-auto select-none overflow-visible ${
            size === 'fullscreen'
              ? 'max-h-[560px] min-h-[340px] md:min-h-[440px]'
              : size === 'hero' || size === 'lg'
              ? 'max-h-[440px] min-h-[280px] md:min-h-[360px]'
              : size === 'sm'
              ? 'max-h-[150px]'
              : 'max-h-[190px]'
          }`}
        >
          <defs>
            {/* Gradients */}
            <linearGradient id={`motorGrad-${pump.slot_code}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            <linearGradient id={`pumpGrad-${pump.slot_code}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>

            <linearGradient id={`screwGrad-${pump.slot_code}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="30%" stopColor="#94A3B8" />
              <stop offset="70%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>

            <linearGradient id={`flowGrad-${pump.slot_code}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.8" />
            </linearGradient>

            {/* Subtle flow pattern animation */}
            <pattern id={`flowPattern-${pump.slot_code}`} width="20" height="20" patternUnits="userSpaceOnUse">
              <line x1="0" y1="10" x2="20" y2="10" stroke="#06B6D4" strokeWidth="2" strokeDasharray="6,4" />
            </pattern>
          </defs>

          {/* Common Skid / Base Frame */}
          <rect x="25" y="180" width="410" height="14" rx="3" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
          <line x1="45" y1="194" x2="415" y2="194" stroke="#0F172A" strokeWidth="2" />
          <rect x="70" y="194" width="20" height="6" fill="#475569" />
          <rect x="190" y="194" width="20" height="6" fill="#475569" />
          <rect x="370" y="194" width="20" height="6" fill="#475569" />

          {/* ================= ELECTRIC MOTOR ================= */}
          {/* Motor Mounting Pedestal */}
          <rect x="45" y="166" width="130" height="14" rx="2" fill="#334155" stroke="#475569" strokeWidth="1" />

          {/* Motor Body */}
          <rect
            x="40"
            y="70"
            width="140"
            height="96"
            rx="8"
            fill={`url(#motorGrad-${pump.slot_code})`}
            stroke="#64748B"
            strokeWidth="1.5"
          />

          {/* Motor Cooling Fins */}
          <g opacity="0.35">
            <line x1="55" y1="78" x2="55" y2="158" stroke="#94A3B8" strokeWidth="2" />
            <line x1="70" y1="78" x2="70" y2="158" stroke="#94A3B8" strokeWidth="2" />
            <line x1="85" y1="78" x2="85" y2="158" stroke="#94A3B8" strokeWidth="2" />
            <line x1="100" y1="78" x2="100" y2="158" stroke="#94A3B8" strokeWidth="2" />
            <line x1="115" y1="78" x2="115" y2="158" stroke="#94A3B8" strokeWidth="2" />
            <line x1="130" y1="78" x2="130" y2="158" stroke="#94A3B8" strokeWidth="2" />
            <line x1="145" y1="78" x2="145" y2="158" stroke="#94A3B8" strokeWidth="2" />
            <line x1="160" y1="78" x2="160" y2="158" stroke="#94A3B8" strokeWidth="2" />
          </g>

          {/* Motor Terminal Box on top */}
          <rect x="80" y="52" width="50" height="18" rx="2" fill="#1E293B" stroke="#64748B" strokeWidth="1" />
          <circle cx="105" cy="61" r="3" fill="#06B6D4" opacity={isRunning ? '0.8' : '0.2'} />

          {/* Motor End Covers */}
          <path d="M 40 78 Q 30 118 40 158 Z" fill="#1E293B" stroke="#64748B" strokeWidth="1.5" />
          <text x="75" y="122" fill="#94A3B8" fontSize="10" fontWeight="bold" letterSpacing="1">MOTOR</text>
          <text x="88" y="135" fill="#64748B" fontSize="8" fontFamily="monospace">150 kW</text>

          {/* ================= SHAFT & COUPLING ================= */}
          {/* Exposed Shaft */}
          <rect x="180" y="110" width="48" height="16" fill="#64748B" stroke="#475569" strokeWidth="1" />

          {/* Flexible Coupling Hub */}
          <rect x="194" y="98" width="22" height="40" rx="3" fill="#334155" stroke="#94A3B8" strokeWidth="1.5" />
          
          {/* Coupling bolts & spin animation */}
          <g className={isRunning ? 'animate-pulse' : ''}>
            <circle cx="205" cy="106" r="2.5" fill={isWarning ? '#F59E0B' : '#E2E8F0'} />
            <circle cx="205" cy="118" r="2.5" fill={isWarning ? '#F59E0B' : '#E2E8F0'} />
            <circle cx="205" cy="130" r="2.5" fill={isWarning ? '#F59E0B' : '#E2E8F0'} />
          </g>

          {/* ================= TWIN-SCREW PUMP BODY ================= */}
          {/* Pump Pedestal */}
          <rect x="235" y="166" width="180" height="14" rx="2" fill="#334155" stroke="#475569" strokeWidth="1" />

          {/* Main Pump Casing with cutaway window */}
          <rect
            x="228"
            y="74"
            width="190"
            height="92"
            rx="6"
            fill={`url(#pumpGrad-${pump.slot_code})`}
            stroke="#64748B"
            strokeWidth="1.5"
          />

          {/* Cutaway chamber revealing twin screws */}
          <rect x="260" y="86" width="130" height="68" rx="4" fill="#0B132B" stroke="#334155" strokeWidth="1" />

          {/* TWIN SCREW 1 (Top Screw) */}
          <g className={isRunning ? 'animate-pulse' : ''} style={{ animationDuration: '2s' }}>
            {/* Intermeshing flights */}
            <path
              d="M 270 94 L 282 108 L 294 94 L 306 108 L 318 94 L 330 108 L 342 94 L 354 108 L 366 94 L 378 108"
              fill="none"
              stroke={`url(#screwGrad-${pump.slot_code})`}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <line x1="266" y1="101" x2="382" y2="101" stroke="#94A3B8" strokeWidth="3" opacity="0.7" />
          </g>

          {/* TWIN SCREW 2 (Bottom Screw) */}
          <g className={isRunning ? 'animate-pulse' : ''} style={{ animationDuration: '2s' }}>
            <path
              d="M 270 138 L 282 124 L 294 138 L 306 124 L 318 138 L 330 124 L 342 138 L 354 124 L 366 138 L 378 124"
              fill="none"
              stroke={`url(#screwGrad-${pump.slot_code})`}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <line x1="266" y1="131" x2="382" y2="131" stroke="#94A3B8" strokeWidth="3" opacity="0.7" />
          </g>

          {/* Casing Label */}
          <text x="290" y="82" fill="#CBD5E1" fontSize="9" fontWeight="bold" letterSpacing="0.8">
            TWIN-SCREW L4
          </text>

          {/* ================= SUCTION INLET & DISCHARGE OUTLET ================= */}
          {/* Suction Inlet Flange (Top Left of Pump) */}
          <g>
            <rect x="270" y="32" width="28" height="42" fill="#334155" stroke="#64748B" strokeWidth="1.5" />
            <rect x="264" y="28" width="40" height="8" rx="2" fill="#1E293B" stroke="#94A3B8" strokeWidth="1.5" />
            {isRunning && (
              <path
                d="M 284 34 L 284 68"
                stroke="#06B6D4"
                strokeWidth="3"
                strokeDasharray="4,4"
                className="animate-pulse"
              />
            )}
            <text x="250" y="24" fill="#06B6D4" fontSize="8" fontWeight="bold">INLET</text>
          </g>

          {/* Discharge Outlet Flange (Bottom Right of Pump) */}
          <g>
            <rect x="360" y="32" width="28" height="42" fill="#334155" stroke="#64748B" strokeWidth="1.5" />
            <rect x="354" y="28" width="40" height="8" rx="2" fill="#1E293B" stroke="#94A3B8" strokeWidth="1.5" />
            {isRunning && (
              <path
                d="M 374 68 L 374 34"
                stroke="#3B82F6"
                strokeWidth="3"
                strokeDasharray="4,4"
                className="animate-pulse"
              />
            )}
            <text x="350" y="24" fill="#3B82F6" fontSize="8" fontWeight="bold">OUTLET</text>
          </g>

          {/* ================= SHAFT CENTERLINE REFERENCE ================= */}
          <line x1="30" y1="118" x2="422" y2="118" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3,3" opacity="0.25" pointerEvents="none" />

          {/* ================= MEASUREMENT LOCATIONS (DRIVE END / NON-DRIVE END) ================= */}
          {/* 1. Motor NDE (Motor Non-Drive End: Far Left Bearing) */}
          <g 
            className="cursor-pointer group/sensor"
            onClick={(e) => {
              e.stopPropagation();
              onSelectSensor && onSelectSensor(pump, 'motorNde', sensorPoints.motorNde);
            }}
            onMouseEnter={() => {
              setHoveredLocation({
                code: 'M-NDE',
                name: 'Motor Non-Drive End',
                status: isStandby ? 'NORMAL (STANDBY)' : getLocationStatus(sensorPoints.motorNde),
                maxVib: isStandby ? 0.04 : Math.max(sensorPoints.motorNde.h || 0, sensorPoints.motorNde.v || 0, sensorPoints.motorNde.a || 0),
                temp: sensorPoints.motorNde.temp || 0,
                trend: '→ Baseline normal',
                x: 38,
                y: 118
              });
            }}
            onMouseLeave={() => setHoveredLocation(null)}
          >
            <title>{`M-NDE: Motor Non-Drive End\nStatus: ${isStandby ? 'NORMAL (STANDBY)' : getLocationStatus(sensorPoints.motorNde)}\nVibrasi: H=${sensorPoints.motorNde.h ?? '—'} | V=${sensorPoints.motorNde.v ?? '—'} | A=${sensorPoints.motorNde.a ?? '—'} mm/s\nSuhu: ${sensorPoints.motorNde.temp ?? '—'}°C\nKlik untuk melihat rincian lokasi pengukuran`}</title>
            
            {/* Bearing Hub Collar */}
            <circle
              cx="38"
              cy="118"
              r={hoveredLocation?.code === 'M-NDE' ? 13 : 11}
              fill="#1E293B"
              stroke={hoveredLocation?.code === 'M-NDE' ? '#38BDF8' : '#475569'}
              strokeWidth={hoveredLocation?.code === 'M-NDE' ? 2 : 1.5}
              className="transition-all duration-150"
            />
            <circle
              cx="38"
              cy="118"
              r={hoveredLocation?.code === 'M-NDE' ? 9 : 7}
              fill={getStatusColor(getLocationStatus(sensorPoints.motorNde))}
              stroke="#FFFFFF"
              strokeWidth={hoveredLocation?.code === 'M-NDE' ? 2.5 : 2}
              className="drop-shadow-md transition-all duration-150"
            />
            {/* Label above bearing housing */}
            <text x="38" y="96" textAnchor="middle" fill={hoveredLocation?.code === 'M-NDE' ? '#38BDF8' : '#CBD5E1'} fontSize="9" fontWeight="bold" letterSpacing="0.5">
              M-NDE
            </text>
          </g>

          {/* 2. Motor DE (Motor Drive End: Right Side Near Coupling) */}
          <g 
            className="cursor-pointer group/sensor"
            onClick={(e) => {
              e.stopPropagation();
              onSelectSensor && onSelectSensor(pump, 'motorDe', sensorPoints.motorDe);
            }}
            onMouseEnter={() => {
              setHoveredLocation({
                code: 'M-DE',
                name: 'Motor Drive End',
                status: isStandby ? 'NORMAL (STANDBY)' : getLocationStatus(sensorPoints.motorDe),
                maxVib: isStandby ? 0.04 : Math.max(sensorPoints.motorDe.h || 0, sensorPoints.motorDe.v || 0, sensorPoints.motorDe.a || 0),
                temp: sensorPoints.motorDe.temp || 0,
                trend: sensorPoints.motorDe.status === 'DEGRADING' ? '↑ Terpengaruh (+31%)' : '→ Normal',
                x: 176,
                y: 118
              });
            }}
            onMouseLeave={() => setHoveredLocation(null)}
          >
            <title>{`M-DE: Motor Drive End (Sisi Poros/Bantalan Dekat Kopling)\nStatus: ${isStandby ? 'NORMAL (STANDBY)' : getLocationStatus(sensorPoints.motorDe)}\nVibrasi: H=${sensorPoints.motorDe.h ?? '—'} | V=${sensorPoints.motorDe.v ?? '—'} | A=${sensorPoints.motorDe.a ?? '—'} mm/s\nSuhu: ${sensorPoints.motorDe.temp ?? '—'}°C\nKlik untuk melihat rincian lokasi pengukuran`}</title>
            
            {/* Bearing Hub Collar */}
            <circle
              cx="176"
              cy="118"
              r={hoveredLocation?.code === 'M-DE' ? 13 : 11}
              fill="#1E293B"
              stroke={hoveredLocation?.code === 'M-DE' ? '#38BDF8' : '#475569'}
              strokeWidth={hoveredLocation?.code === 'M-DE' ? 2 : 1.5}
              className="transition-all duration-150"
            />
            <circle
              cx="176"
              cy="118"
              r={hoveredLocation?.code === 'M-DE' ? 9 : 7}
              fill={getStatusColor(getLocationStatus(sensorPoints.motorDe))}
              stroke="#FFFFFF"
              strokeWidth={hoveredLocation?.code === 'M-DE' ? 2.5 : 2}
              className="drop-shadow-md transition-all duration-150"
            />
            {/* Label above bearing housing */}
            <text x="176" y="96" textAnchor="middle" fill={hoveredLocation?.code === 'M-DE' ? '#38BDF8' : '#CBD5E1'} fontSize="9" fontWeight="bold" letterSpacing="0.5">
              M-DE
            </text>
          </g>

          {/* 3. Pump DE (Pump Drive End: Sisi Poros Input / Dekat Kopling - Terpisah Jelas dari Inlet) */}
          <g 
            className="cursor-pointer group/sensor"
            onClick={(e) => {
              e.stopPropagation();
              onSelectSensor && onSelectSensor(pump, 'pumpDe', sensorPoints.pumpDe);
            }}
            onMouseEnter={() => {
              const status = isStandby ? 'NORMAL (STANDBY)' : getLocationStatus(sensorPoints.pumpDe, isWarning);
              setHoveredLocation({
                code: 'P-DE',
                name: 'Pump Drive End',
                status,
                maxVib: isStandby ? 0.05 : Math.max(sensorPoints.pumpDe.h || 0, sensorPoints.pumpDe.v || 0, sensorPoints.pumpDe.a || 0),
                temp: sensorPoints.pumpDe.temp || 0,
                trend: isWarning ? '↑ Memburuk (+64% / 36h)' : '→ Stabil',
                x: 236,
                y: 118
              });
            }}
            onMouseLeave={() => setHoveredLocation(null)}
          >
            <title>{`P-DE: Pump Drive End (Bantalan Pompa Sisi Poros Input Dekat Kopling)\nStatus: ${isStandby ? 'NORMAL (STANDBY)' : getLocationStatus(sensorPoints.pumpDe, isWarning)}\nVibrasi Horizontal: ${sensorPoints.pumpDe.h ?? '—'} mm/s (WARNING)\nSuhu Bantalan: ${sensorPoints.pumpDe.temp ?? '—'}°C (ELEVATED)\nPerhatian: Getaran tinggi terdeteksi di area bantalan input!\nKlik untuk melihat rincian lokasi pengukuran`}</title>
            
            {/* Bearing Hub Collar */}
            <circle 
              cx="236" 
              cy="118" 
              r={hoveredLocation?.code === 'P-DE' ? 15 : 13} 
              fill="#1E293B" 
              stroke={hoveredLocation?.code === 'P-DE' ? '#38BDF8' : (getLocationStatus(sensorPoints.pumpDe, isWarning) === 'WARNING' ? '#F59E0B' : '#475569')} 
              strokeWidth={hoveredLocation?.code === 'P-DE' ? 2 : 1.5}
              className="transition-all duration-150"
            />
            
            {/* Warning Ping Animation (SVG native animation - centered on bearing) */}
            {getLocationStatus(sensorPoints.pumpDe, isWarning) === 'WARNING' && (
              <circle cx="236" cy="118" r="13" fill="none" stroke="#F59E0B" strokeWidth="1.5">
                <animate attributeName="r" values="13;22;13" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
              </circle>
            )}

            <circle
              cx="236"
              cy="118"
              r={hoveredLocation?.code === 'P-DE' ? 11 : (getLocationStatus(sensorPoints.pumpDe, isWarning) === 'WARNING' ? 9 : 7)}
              fill={getStatusColor(getLocationStatus(sensorPoints.pumpDe, isWarning))}
              stroke="#FFFFFF"
              strokeWidth={hoveredLocation?.code === 'P-DE' ? 2.5 : 2}
              className="drop-shadow-md transition-all duration-150"
            />
            {/* Label above bearing housing */}
            <text 
              x="236" 
              y="96" 
              textAnchor="middle"
              fill={hoveredLocation?.code === 'P-DE' ? '#38BDF8' : (getLocationStatus(sensorPoints.pumpDe, isWarning) === 'WARNING' ? '#F59E0B' : '#CBD5E1')} 
              fontSize="9" 
              fontWeight="black"
              letterSpacing="0.5"
            >
              P-DE ●
            </text>
          </g>

          {/* 4. Pump NDE (Pump Non-Drive End: Ujung Pompa Seberang Kopling - Terpisah Jelas dari Outlet) */}
          <g 
            className="cursor-pointer group/sensor"
            onClick={(e) => {
              e.stopPropagation();
              onSelectSensor && onSelectSensor(pump, 'pumpNde', sensorPoints.pumpNde);
            }}
            onMouseEnter={() => {
              setHoveredLocation({
                code: 'P-NDE',
                name: 'Pump Non-Drive End',
                status: isStandby ? 'NORMAL (STANDBY)' : getLocationStatus(sensorPoints.pumpNde),
                maxVib: isStandby ? 0.04 : Math.max(sensorPoints.pumpNde.h || 0, sensorPoints.pumpNde.v || 0, sensorPoints.pumpNde.a || 0),
                temp: sensorPoints.pumpNde.temp || 0,
                trend: '→ Baseline normal',
                x: 414,
                y: 118
              });
            }}
            onMouseLeave={() => setHoveredLocation(null)}
          >
            <title>{`P-NDE: Pump Non-Drive End (Bantalan Pompa Ujung Seberang Kopling)\nStatus: ${isStandby ? 'NORMAL (STANDBY)' : getLocationStatus(sensorPoints.pumpNde)}\nVibrasi: H=${sensorPoints.pumpNde.h ?? '—'} | V=${sensorPoints.pumpNde.v ?? '—'} | A=${sensorPoints.pumpNde.a ?? '—'} mm/s\nSuhu: ${sensorPoints.pumpNde.temp ?? '—'}°C\nKlik untuk melihat rincian lokasi pengukuran`}</title>
            
            {/* Bearing Hub Collar */}
            <circle
              cx="414"
              cy="118"
              r={hoveredLocation?.code === 'P-NDE' ? 13 : 11}
              fill="#1E293B"
              stroke={hoveredLocation?.code === 'P-NDE' ? '#38BDF8' : '#475569'}
              strokeWidth={hoveredLocation?.code === 'P-NDE' ? 2 : 1.5}
              className="transition-all duration-150"
            />
            <circle
              cx="414"
              cy="118"
              r={hoveredLocation?.code === 'P-NDE' ? 9 : 7}
              fill={getStatusColor(getLocationStatus(sensorPoints.pumpNde))}
              stroke="#FFFFFF"
              strokeWidth={hoveredLocation?.code === 'P-NDE' ? 2.5 : 2}
              className="drop-shadow-md transition-all duration-150"
            />
            {/* Label above bearing housing */}
            <text x="414" y="96" textAnchor="middle" fill={hoveredLocation?.code === 'P-NDE' ? '#38BDF8' : '#CBD5E1'} fontSize="9" fontWeight="bold" letterSpacing="0.5">
              P-NDE
            </text>
          </g>
        </svg>

        {/* Interactive Floating Location Hover Tooltip (Requirement 11) */}
        {hoveredLocation && (
          <div 
            className="absolute z-30 pointer-events-none p-3 rounded-2xl bg-slate-950/95 border border-cyan-500/50 text-white shadow-2xl backdrop-blur-md text-xs transition-all duration-150 animate-fadeIn"
            style={{
              left: `${Math.round(((hoveredLocation.x - (isLarge ? 12 : 0)) / (isLarge ? 430 : 460)) * 100)}%`,
              top: '25%',
              transform: 'translate(-50%, -100%)',
              minWidth: '200px'
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-1.5">
              <div>
                <div className="font-black text-slate-100">{hoveredLocation.name}</div>
                <div className="font-mono text-[10px] text-cyan-400">Titik Ukur: {hoveredLocation.code}</div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                hoveredLocation.status.includes('WARN')
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : hoveredLocation.status.includes('STANDBY')
                  ? 'bg-slate-700/50 text-slate-300'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}>
                {hoveredLocation.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono mb-2">
              <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[9px] font-sans text-slate-400">Max Vibrasi</div>
                <div className={`font-bold mt-0.5 ${hoveredLocation.maxVib > 1.8 ? 'text-amber-400' : 'text-slate-200'}`}>
                  {hoveredLocation.maxVib.toFixed(2)} mm/s
                </div>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[9px] font-sans text-slate-400">Suhu Bantalan</div>
                <div className={`font-bold mt-0.5 ${hoveredLocation.temp > 65 ? 'text-amber-400' : 'text-slate-200'}`}>
                  {hoveredLocation.temp.toFixed(1)}°C
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-1.5">
              <span>Tren: <b className={hoveredLocation.trend.includes('Memburuk') ? 'text-amber-400' : 'text-slate-300'}>{hoveredLocation.trend}</b></span>
              <span className="text-[9px] text-cyan-400 underline font-bold">Klik untuk rincian</span>
            </div>
          </div>
        )}
      </div>

      {/* Sensor Quick Summary Bar */}
      <div className={`grid grid-cols-4 gap-1.5 border-t border-slate-100 dark:border-slate-800/80 text-center ${
        isLarge ? 'pt-3 sm:pt-4' : 'pt-2'
      }`}>
        <button
          type="button"
          onClick={() => onSelectSensor && onSelectSensor(pump, 'motorNde', sensorPoints.motorNde)}
          className={`rounded bg-slate-50 dark:bg-slate-800/50 hover:bg-cyan-50 dark:hover:bg-slate-800 transition-colors text-left ${
            isLarge ? 'p-2 sm:p-2.5' : 'p-1'
          }`}
        >
          <div className={`font-bold text-slate-500 ${isLarge ? 'text-[11px]' : 'text-[9px]'}`}>M-NDE</div>
          <div className={`font-mono font-bold text-slate-800 dark:text-slate-200 ${
            isLarge ? 'text-sm sm:text-base' : 'text-[11px]'
          }`}>
            {isStandby ? '0.04' : sensorPoints.motorNde.h != null ? sensorPoints.motorNde.h.toFixed(2) : '—'}
          </div>
          <div className={`text-slate-400 ${isLarge ? 'text-[10px]' : 'text-[8px]'}`}>mm/s</div>
        </button>

        <button
          type="button"
          onClick={() => onSelectSensor && onSelectSensor(pump, 'motorDe', sensorPoints.motorDe)}
          className={`rounded transition-colors text-left ${
            sensorPoints.motorDe.status === 'DEGRADING'
              ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-900 dark:text-cyan-200'
              : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-cyan-50 dark:hover:bg-slate-800'
          } ${isLarge ? 'p-2 sm:p-2.5' : 'p-1'}`}
        >
          <div className={`flex items-center justify-between font-bold ${isLarge ? 'text-[11px]' : 'text-[9px]'}`}>
            <span>M-DE</span>
            {sensorPoints.motorDe.status === 'DEGRADING' && (
              <span className={`text-cyan-600 dark:text-cyan-400 ${isLarge ? 'text-[10px]' : 'text-[8px]'}`}>DEG</span>
            )}
          </div>
          <div className={`font-mono font-bold text-slate-800 dark:text-slate-200 ${
            isLarge ? 'text-sm sm:text-base' : 'text-[11px]'
          }`}>
            {isStandby ? '0.04' : sensorPoints.motorDe.h != null ? sensorPoints.motorDe.h.toFixed(2) : '—'}
          </div>
          <div className={`text-slate-400 ${isLarge ? 'text-[10px]' : 'text-[8px]'}`}>mm/s</div>
        </button>

        <button
          type="button"
          onClick={() => onSelectSensor && onSelectSensor(pump, 'pumpDe', sensorPoints.pumpDe)}
          className={`rounded transition-colors text-left ${
            sensorPoints.pumpDe.status === 'WARNING'
              ? 'bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-200'
              : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-cyan-50 dark:hover:bg-slate-800'
          } ${isLarge ? 'p-2 sm:p-2.5' : 'p-1'}`}
        >
          <div className={`flex items-center justify-between font-black ${isLarge ? 'text-[11px]' : 'text-[9px]'}`}>
            <span>P-DE</span>
            {sensorPoints.pumpDe.status === 'WARNING' && (
              <span className={`text-amber-500 ${isLarge ? 'text-[10px]' : 'text-[8px]'}`}>WARN</span>
            )}
          </div>
          <div className={`font-mono font-black text-slate-900 dark:text-white ${
            isLarge ? 'text-sm sm:text-base' : 'text-[11px]'
          }`}>
            {isStandby ? '0.05' : sensorPoints.pumpDe.h != null ? sensorPoints.pumpDe.h.toFixed(2) : '—'}
          </div>
          <div className={`text-slate-400 ${isLarge ? 'text-[10px]' : 'text-[8px]'}`}>mm/s</div>
        </button>

        <button
          type="button"
          onClick={() => onSelectSensor && onSelectSensor(pump, 'pumpNde', sensorPoints.pumpNde)}
          className={`rounded bg-slate-50 dark:bg-slate-800/50 hover:bg-cyan-50 dark:hover:bg-slate-800 transition-colors text-left ${
            isLarge ? 'p-2 sm:p-2.5' : 'p-1'
          }`}
        >
          <div className={`font-bold text-slate-500 ${isLarge ? 'text-[11px]' : 'text-[9px]'}`}>P-NDE</div>
          <div className={`font-mono font-bold text-slate-800 dark:text-slate-200 ${
            isLarge ? 'text-sm sm:text-base' : 'text-[11px]'
          }`}>
            {isStandby ? '0.04' : sensorPoints.pumpNde.h != null ? sensorPoints.pumpNde.h.toFixed(2) : '—'}
          </div>
          <div className={`text-slate-400 ${isLarge ? 'text-[10px]' : 'text-[8px]'}`}>mm/s</div>
        </button>
      </div>

      {/* Metrics strip */}
      <div className={`flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 ${
        isLarge ? 'mt-4 pt-3 text-xs sm:text-sm' : 'mt-2 pt-2 text-[11px]'
      }`}>
        <div className="flex items-center gap-1.5 text-slate-500">
          <span>Load:</span>
          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{pump.load_pct}%</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <span>Max Temp:</span>
          <span className={`font-mono font-bold ${pump.maxTemperature > 65 ? 'text-amber-500' : 'text-slate-700 dark:text-slate-300'}`}>
            {pump.maxTemperature.toFixed(1)}°C
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <span>Running Hours:</span>
          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{pump.running_hours_total?.toLocaleString()} h</span>
        </div>
      </div>
    </div>
  );
};
