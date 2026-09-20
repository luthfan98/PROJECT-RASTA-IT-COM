import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

interface TrendPoint {
  time: string;
  value: number;
  quality: string;
  source: string;
  operator: string;
  marker?: 'degradation' | 'warning' | 'critical' | 'failure' | 'maintenance' | 'replaced';
  note?: string;
}

interface ConditionTrendChartProps {
  initialPump?: string;
  onOpenSensorDetail?: () => void;
}

export const ConditionTrendChart: React.FC<ConditionTrendChartProps> = ({
  initialPump = 'C'
}) => {
  const [selectedPump, setSelectedPump] = useState<string>(initialPump);
  const [selectedMetric, setSelectedMetric] = useState<'vibration' | 'temperature' | 'pressure' | 'load'>('vibration');
  const [selectedRange, setSelectedRange] = useState<'24H' | '7D' | '30D' | '3M' | '1Y'>('24H');
  const [hoveredPoint, setHoveredPoint] = useState<TrendPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Generate realistic hourly trend points based on selected pump and metric
  const generateTrendData = (): TrendPoint[] => {
    const points: TrendPoint[] = [];
    const count = selectedRange === '24H' ? 24 : selectedRange === '7D' ? 28 : 30;

    for (let i = 0; i < count; i++) {
      const hour = (14 - count + i + 24) % 24;
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      
      let val = 0.45;
      let marker: TrendPoint['marker'] = undefined;
      let note: string | undefined = undefined;

      if (selectedMetric === 'vibration') {
        if (selectedPump === 'C') {
          // Degrading curve climbing up to 1.82 mm/s
          const progress = i / count;
          val = 0.65 + progress * 1.15 + (Math.sin(i) * 0.04);
          if (i === Math.floor(count * 0.4)) {
            marker = 'degradation';
            note = 'Degradation pattern detected by AI';
          }
          if (i === count - 1) {
            val = 1.82;
            marker = 'warning';
            note = 'Warning threshold exceeded (>1.80 mm/s)';
          }
        } else if (selectedPump === 'A') {
          val = 0.52 + Math.sin(i * 0.5) * 0.05;
        } else {
          // Standby pumps B & D
          val = 0.04;
        }
      } else if (selectedMetric === 'temperature') {
        if (selectedPump === 'C') {
          val = 52.0 + (i / count) * 15.2; // Up to 67.2°C
          if (i === count - 1) marker = 'warning';
        } else if (selectedPump === 'A') {
          val = 56.5 + Math.cos(i) * 1.5;
        } else {
          val = 31.0;
        }
      } else if (selectedMetric === 'pressure') {
        val = 71.5 + Math.sin(i * 0.3) * 1.8;
      } else {
        // Load
        val = selectedPump === 'C' ? 74 : selectedPump === 'A' ? 68 : 0;
      }

      points.push({
        time: timeStr,
        value: parseFloat(val.toFixed(2)),
        quality: 'GOOD',
        source: i === count - 1 ? 'Manual Input' : 'Import',
        operator: 'Ahmad Fauzi (Petugas)',
        marker,
        note
      });
    }

    return points;
  };

  const data = generateTrendData();

  // SVG Chart Dimensions
  const width = 850;
  const height = 240;
  const padding = { top: 25, right: 30, bottom: 35, left: 55 };

  const minVal = selectedMetric === 'vibration' ? 0 : selectedMetric === 'temperature' ? 25 : selectedMetric === 'pressure' ? 60 : 0;
  const maxVal = selectedMetric === 'vibration' ? 2.5 : selectedMetric === 'temperature' ? 85 : selectedMetric === 'pressure' ? 90 : 100;

  const getX = (index: number) => {
    return padding.left + (index / (data.length - 1)) * (width - padding.left - padding.right);
  };

  const getY = (val: number) => {
    return height - padding.bottom - ((val - minVal) / (maxVal - minVal)) * (height - padding.top - padding.bottom);
  };

  // Build SVG path
  const pathD = data.reduce((acc, point, i) => {
    const x = getX(i);
    const y = getY(point.value);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Fill area path
  const areaD = `${pathD} L ${getX(data.length - 1)} ${height - padding.bottom} L ${getX(0)} ${height - padding.bottom} Z`;

  // ISO 10816 limits (for vibration)
  const yZoneB = getY(0.71); // Good/Satisfactory boundary
  const yZoneC = getY(1.80); // Warning boundary

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B]/70 backdrop-blur-md p-5 shadow-sm">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-500" />
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Grafik Tren Kondisi Operasi (Condition Trend)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Data time-series per jam dengan batas standar ISO 10816 & penanda anomali
          </p>
        </div>

        {/* Pump Selectors */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
          {(['A', 'B', 'C', 'D'] as const).map((pump) => (
            <button
              key={pump}
              type="button"
              onClick={() => setSelectedPump(pump)}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                selectedPump === pump
                  ? 'bg-slate-900 dark:bg-cyan-500 text-cyan-400 dark:text-slate-900 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Pump {pump}
            </button>
          ))}
        </div>
      </div>

      {/* Sub Controls: Metric & Range */}
      <div className="flex flex-wrap items-center justify-between gap-3 my-3">
        {/* Metric Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500 mr-1">Metrik:</span>
          {(['vibration', 'temperature', 'pressure', 'load'] as const).map((metric) => (
            <button
              key={metric}
              type="button"
              onClick={() => setSelectedMetric(metric)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${
                selectedMetric === metric
                  ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-700 dark:text-cyan-300 font-black'
                  : 'bg-slate-100 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {metric === 'vibration' ? 'Vibration (mm/s)' : metric === 'temperature' ? 'Temperature (°C)' : metric === 'pressure' ? 'Pressure (PSI)' : 'Load (%)'}
            </button>
          ))}
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1">
          {(['24H', '7D', '30D', '3M', '1Y'] as const).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setSelectedRange(range)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-colors ${
                selectedRange === range
                  ? 'bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[700px] select-none"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {/* Background Grid Lines */}
          <line x1={padding.left} y1={getY(minVal)} x2={width - padding.right} y2={getY(minVal)} stroke="#64748B" strokeWidth="1" opacity="0.2" />
          <line x1={padding.left} y1={getY((minVal + maxVal) / 2)} x2={width - padding.right} y2={getY((minVal + maxVal) / 2)} stroke="#64748B" strokeWidth="1" strokeDasharray="4,4" opacity="0.2" />
          <line x1={padding.left} y1={getY(maxVal)} x2={width - padding.right} y2={getY(maxVal)} stroke="#64748B" strokeWidth="1" strokeDasharray="4,4" opacity="0.2" />

          {/* ISO 10816 Zone Limit Lines (If Vibration) */}
          {selectedMetric === 'vibration' && (
            <>
              {/* Zone C Warning Limit (1.80 mm/s) */}
              <line
                x1={padding.left}
                y1={yZoneC}
                x2={width - padding.right}
                y2={yZoneC}
                stroke="#F59E0B"
                strokeWidth="1.5"
                strokeDasharray="6,3"
                opacity="0.8"
              />
              <text x={width - padding.right + 4} y={yZoneC + 3} fill="#F59E0B" fontSize="9" fontWeight="bold">
                WARN 1.80
              </text>

              {/* Zone B Limit (0.71 mm/s) */}
              <line
                x1={padding.left}
                y1={yZoneB}
                x2={width - padding.right}
                y2={yZoneB}
                stroke="#10B981"
                strokeWidth="1"
                strokeDasharray="4,4"
                opacity="0.5"
              />
              <text x={width - padding.right + 4} y={yZoneB + 3} fill="#10B981" fontSize="9">
                ISO-B 0.71
              </text>
            </>
          )}

          {/* Area Fill */}
          <path
            d={areaD}
            fill={selectedPump === 'C' && selectedMetric === 'vibration' ? 'url(#trendAmberGrad)' : 'url(#trendCyanGrad)'}
            opacity="0.25"
          />

          <defs>
            <linearGradient id="trendCyanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="trendAmberGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Trend Line Path */}
          <path
            d={pathD}
            fill="none"
            stroke={selectedPump === 'C' && selectedMetric === 'vibration' ? '#F59E0B' : '#06B6D4'}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Data Points & Event Markers */}
          {data.map((pt, idx) => {
            const cx = getX(idx);
            const cy = getY(pt.value);

            return (
              <g
                key={idx}
                className="cursor-pointer group/pt"
                onMouseEnter={() => {
                  setHoveredPoint(pt);
                  setTooltipPos({ x: cx, y: cy });
                }}
              >
                {/* Event Marker */}
                {pt.marker === 'degradation' && (
                  <circle cx={cx} cy={cy} r="8" fill="#06B6D4" stroke="#FFFFFF" strokeWidth="2" className="animate-pulse" />
                )}

                {pt.marker === 'warning' && (
                  <polygon
                    points={`${cx},${cy - 9} ${cx - 7},${cy + 5} ${cx + 7},${cy + 5}`}
                    fill="#EF4444"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    className="animate-bounce"
                  />
                )}

                {/* Default Point Circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r="3.5"
                  fill="#FFFFFF"
                  stroke={selectedPump === 'C' && selectedMetric === 'vibration' ? '#F59E0B' : '#06B6D4'}
                  strokeWidth="2"
                  className="transition-transform group-hover/pt:scale-150"
                />

                {/* Invisible larger hit target */}
                <circle cx={cx} cy={cy} r="14" fill="transparent" />
              </g>
            );
          })}

          {/* X Axis Labels */}
          {data.filter((_, i) => i % (selectedRange === '24H' ? 4 : 5) === 0).map((pt, idx) => {
            const originalIndex = data.indexOf(pt);
            return (
              <text
                key={idx}
                x={getX(originalIndex)}
                y={height - 10}
                fill="#64748B"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {pt.time}
              </text>
            );
          })}

          {/* Y Axis Labels */}
          <text x={padding.left - 8} y={getY(minVal) + 4} fill="#64748B" fontSize="10" textAnchor="end">
            {minVal}
          </text>
          <text x={padding.left - 8} y={getY((minVal + maxVal) / 2) + 4} fill="#64748B" fontSize="10" textAnchor="end">
            {((minVal + maxVal) / 2).toFixed(1)}
          </text>
          <text x={padding.left - 8} y={getY(maxVal) + 4} fill="#64748B" fontSize="10" textAnchor="end">
            {maxVal}
          </text>
        </svg>

        {/* Rich Interactive Hover Tooltip */}
        {hoveredPoint && tooltipPos && (
          <div
            className="absolute z-20 pointer-events-none p-3 rounded-2xl bg-slate-900/95 text-white border border-slate-700 shadow-2xl backdrop-blur-md text-xs -translate-x-1/2 -translate-y-full mb-3"
            style={{ left: `${(tooltipPos.x / width) * 100}%`, top: `${tooltipPos.y}px` }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-700 pb-1.5 mb-1.5 font-mono">
              <span className="text-cyan-400 font-bold">19 Sep 2026 • {hoveredPoint.time}</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] uppercase font-bold text-slate-300">
                Pump {selectedPump}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Titik Sensor:</span>
                <span className="font-bold text-slate-200">Pump DE Horizontal</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Nilai:</span>
                <span className="font-mono font-black text-amber-400 text-sm">
                  {hoveredPoint.value} {selectedMetric === 'vibration' ? 'mm/s' : selectedMetric === 'temperature' ? '°C' : selectedMetric === 'pressure' ? 'PSI' : '%'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Status:</span>
                <span className={`font-bold ${hoveredPoint.value > 1.8 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {hoveredPoint.value > 1.8 ? 'WARNING' : 'NORMAL'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                <span>Sumber: <b className="text-slate-300">{hoveredPoint.source}</b></span>
                <span>Oleh: <b className="text-slate-300">{hoveredPoint.operator}</b></span>
              </div>
              {hoveredPoint.note && (
                <div className="mt-1 text-[10px] text-cyan-300 bg-cyan-950/60 p-1.5 rounded border border-cyan-800">
                  ℹ {hoveredPoint.note}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend & Event Marker Notes */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
            <span>● Degradation Detected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-rose-500"></span>
            <span>▲ Warning Anomaly</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-400">✕</span>
            <span>Failure Event</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>🔧</span>
            <span>Maintenance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-purple-500">│</span>
            <span>Sensor Replaced</span>
          </div>
        </div>

        <div className="font-mono text-[10px] text-slate-400">
          Ambang Batas ISO 10816: Zone A (&lt;0.71), Zone B (0.71-1.80), Zone C (&gt;1.80)
        </div>
      </div>
    </div>
  );
};
