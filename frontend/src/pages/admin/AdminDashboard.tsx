import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { StationHealthHeader } from '../../components/dashboard/StationHealthHeader';
import { StationProcessOverview } from '../../components/dashboard/StationProcessOverview';
import { PumpStatusCardsRow } from '../../components/dashboard/PumpStatusCard';
import { AIPredictionCard } from '../../components/dashboard/AIPredictionCard';
import { FailureProgressionBar } from '../../components/dashboard/FailureProgressionBar';
import { SensorMapTable } from '../../components/dashboard/SensorMapTable';
import { ConditionTrendChart } from '../../components/dashboard/ConditionTrendChart';
import { RecentAlertsList } from '../../components/dashboard/RecentAlertsList';
import { SensorPopupModal } from '../../components/dashboard/SensorPopupModal';
import { PumpDetailModal } from '../../components/dashboard/PumpDetailModal';
import { ManualMeasurementModal } from '../../components/dashboard/ManualMeasurementModal';
import { PumpData, SensorPointData } from '../../components/dashboard/PumpVisualization';
import { ShieldAlert, ArrowRight, ScrollText } from 'lucide-react';
import { PumpOverviewPage } from './PumpOverviewPage';
import { AdminTab } from '../../components/AdminSidebar';
import { AdminDashboardMobile } from '../../components/dashboard/mobile/AdminDashboardMobile';

export interface AdminDashboardProps {
  onNavigateTab?: (tab: AdminTab) => void;
  onNavigateToAnalytics?: (slotCode: string, pointKey: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateTab,
  onNavigateToAnalytics
}) => {
  const [stationData, setStationData] = useState<any>(null);
  const [slots, setSlots] = useState<PumpData[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [includeSynthetic, setIncludeSynthetic] = useState(true);

  // Modal states
  const [selectedPumpForDetail, setSelectedPumpForDetail] = useState<PumpData | null>(null);
  const [selectedSensorPopup, setSelectedSensorPopup] = useState<{
    pump: PumpData;
    sensorKey: 'motorNde' | 'motorDe' | 'pumpDe' | 'pumpNde';
    data: SensorPointData;
  } | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('/api/monitoring/overview');
      if (res.data.success) {
        setStationData(res.data.data.station);
        setSlots(res.data.data.slots);
        setAiAnalysis(res.data.data.aiAnalysis);
        setAlerts(res.data.data.alerts);
      }
    } catch (err) {
      console.error('Failed to load overview data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  const handleSelectPump = (pump: PumpData) => {
    setSelectedPumpForDetail(pump);
  };

  const handleSelectSensor = (
    pump: PumpData,
    sensorKey: 'motorNde' | 'motorDe' | 'pumpDe' | 'pumpNde',
    data: SensorPointData
  ) => {
    setSelectedSensorPopup({ pump, sensorKey, data });
  };

  // Find Pump C for highlighted cards
  const pumpC = slots.find((s) => s.slot_code === 'C') || slots[2] || null;

  if (isLoading && !slots.length) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-500">Memuat Kondisi Stasiun Batang...</p>
        </div>
      </div>
    );
  }

  // If a pump is selected, render the dedicated FULL PUMP OVERVIEW (Investigation Workspace)
  if (selectedPumpForDetail) {
    return (
      <>
        <PumpOverviewPage
          pump={selectedPumpForDetail}
          allPumps={slots}
          onBack={() => setSelectedPumpForDetail(null)}
          onSelectOtherPump={(p) => setSelectedPumpForDetail(p)}
          onOpenManualInput={() => setIsManualModalOpen(true)}
          onNavigateToAnalytics={onNavigateToAnalytics}
        />

        {/* Manual Measurement Field Entry Modal */}
        <ManualMeasurementModal
          isOpen={isManualModalOpen}
          onClose={() => setIsManualModalOpen(false)}
          onSuccess={() => {
            fetchDashboardData();
          }}
        />
      </>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* MOBILE DASHBOARD EXPERIENCE (< 768px): STATUS -> ATTENTION -> PUMPS -> AI -> TREND -> ALERTS */}
      <div className="block md:hidden">
        <AdminDashboardMobile
          stationData={stationData}
          slots={slots}
          aiAnalysis={aiAnalysis}
          alerts={alerts}
          onSelectPump={handleSelectPump}
          onSelectSensor={handleSelectSensor}
          onOpenManualInput={() => setIsManualModalOpen(true)}
          onNavigateToAnalytics={onNavigateToAnalytics}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      </div>

      {/* DESKTOP DASHBOARD EXPERIENCE (>= 768px): 100% FLUID FULL WIDTH */}
      <div className="hidden md:block space-y-5 w-full">
        {/* 1. STATION HEALTH HEADER */}
        <StationHealthHeader
          stationName={stationData?.name || 'Booster Pump Batang HO'}
          overallCondition={stationData?.overallCondition || 'NORMAL'}
          runningPumpsCount={stationData?.runningPumpsCount || 2}
          totalPumpsCount={stationData?.totalPumpsCount || 4}
          warningCount={stationData?.warningCount || 1}
          criticalCount={stationData?.criticalCount || 0}
          lastMeasurementTime={stationData?.lastMeasurementAt || '19 Sep 2026 • 14:00'}
          freshnessMinutes={stationData?.freshnessMinutes || 42}
          nextExpectedTime={stationData?.nextExpectedAt || '15:00'}
          includeSynthetic={includeSynthetic}
          onToggleSynthetic={(val) => setIncludeSynthetic(val)}
          onOpenManualInput={() => setIsManualModalOpen(true)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* 2. PROMINENT ATTENTION REQUIRED CALLOUT BANNER */}
        {pumpC && pumpC.health === 'WARNING' && (
          <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 shadow-sm flex flex-wrap items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-900">
                    ATTENTION REQUIRED
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    Pump C Menunjukkan Anomali Getaran Progresif
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Kondisi <b className="text-amber-500">WARNING</b> • Estimasi Sisa Umur: <b className="font-mono">~46 jam</b> • Dugaan Penyebab: <b className="text-slate-800 dark:text-slate-100">Coupling Misalignment</b>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelectPump(pumpC)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/20"
            >
              <span>Buka Analisis Diagnostik</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 3. STATION PROCESS OVERVIEW WITH 4 SVG PUMPS */}
        <StationProcessOverview
          slots={slots}
          selectedPump={selectedPumpForDetail}
          onSelectPump={handleSelectPump}
          onSelectSensor={handleSelectSensor}
          incomingPressurePsi={stationData?.incomingPressurePsi || 72.4}
          dischargePressurePsi={stationData?.dischargePressurePsi || 72.4}
          flowPct={stationData?.flowPct || 67.4}
        />

        {/* 4. FOUR PUMP STATUS CARDS ROW (OPERATIONAL STATE AWARE) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Status Operasional Unit Pompa (Operational States & Sequence)
            </h4>
            <span className="text-[11px] text-slate-400">
              Standby = Rotasi Standar (Beban 0% & Getaran Rendah Wajar)
            </span>
          </div>
          <PumpStatusCardsRow
            slots={slots}
            onSelectPump={handleSelectPump}
          />
        </div>

        {/* 5. DIAGNOSTICS & MULTI-SENSOR MATRIX GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: AI Prediction Card & Progression Bar */}
          <div className="lg:col-span-5 space-y-4">
            <AIPredictionCard
              flaggedPump={aiAnalysis?.flaggedPump || 'Pump C'}
              currentCondition={aiAnalysis?.currentCondition || 'WARNING'}
              failureProbability={aiAnalysis?.failureProbability || 71}
              predictedTimeToFailureHours={aiAnalysis?.predictedTimeToFailureHours || 46}
              estimatedFailureAt={aiAnalysis?.estimatedFailureAt || '21 Sep 2026 • 12:00'}
              likelyFailureMode={aiAnalysis?.likelyFailureMode || 'Coupling Misalignment'}
              confidence={aiAnalysis?.confidence || 82}
              basisFactors={aiAnalysis?.basisFactors}
              disclaimer={aiAnalysis?.disclaimer}
              onViewAnalysis={() => pumpC && handleSelectPump(pumpC)}
            />

            <FailureProgressionBar
              currentStage={pumpC?.health === 'WARNING' ? 'WARNING' : 'NORMAL'}
              degradingDurationHours={aiAnalysis?.degradationDurationHours || 38}
              warningDetectedHoursAgo={aiAnalysis?.warningDetectedHoursAgo || 8}
              pumpName={aiAnalysis?.flaggedPump || 'Pump C'}
            />
          </div>

          {/* Right Column: Multi-Sensor Vibration Map & Temperature Overview */}
          <div className="lg:col-span-7">
            {pumpC && (
              <SensorMapTable
                pump={pumpC}
                onSelectPoint={(code) => {
                  alert(`Membuka riwayat rinci titik ukur: ${code} pada Pompa C`);
                }}
              />
            )}
          </div>
        </div>

        {/* 6. MAIN CONDITION TREND CHART */}
        <ConditionTrendChart
          initialPump="C"
        />

        {/* 7. RECENT OPERATIONAL ALERTS */}
        <RecentAlertsList
          alerts={alerts}
          onSelectAlert={(alt) => {
            if (alt.pump.includes('C') && pumpC) {
              handleSelectPump(pumpC);
            }
          }}
        />

        {/* 8. RECENT SYSTEM ACTIVITY & AUDIT (Requirement 35) */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B]/80 p-5 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3.5">
            <div className="flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-cyan-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                RECENT SYSTEM ACTIVITY (AUDIT LOG)
              </h3>
            </div>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('activity-log')}
                className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>View All Activity</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
                <span>14:03</span>
                <span className="text-amber-500 font-bold">WARNING</span>
              </div>
              <div className="font-bold text-slate-900 dark:text-white">Andi Pratama</div>
              <div className="text-[11px] text-slate-500 truncate">Recorded Pump C P-DE-H (1.82 mm/s)</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
                <span>13:52</span>
                <span className="text-emerald-500 font-bold">LOGIN</span>
              </div>
              <div className="font-bold text-slate-900 dark:text-white">Andi Pratama</div>
              <div className="text-[11px] text-slate-500 truncate">Sesi login operator lapangan aktif</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
                <span>12:40</span>
                <span className="text-cyan-500 font-bold">IMPORT</span>
              </div>
              <div className="font-bold text-slate-900 dark:text-white">Administrator Utama</div>
              <div className="text-[11px] text-slate-500 truncate">Imported dataset telemetri tahunan</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
                <span>11:20</span>
                <span className="text-purple-500 font-bold">SERVICE</span>
              </div>
              <div className="font-bold text-slate-900 dark:text-white">Ferry Hartanto, S.T.</div>
              <div className="text-[11px] text-slate-500 truncate">Inspeksi & pelumasan Pump B</div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* Sensor Point Interactive Popup */}
      {selectedSensorPopup && (
        <SensorPopupModal
          pump={selectedSensorPopup.pump}
          sensorKey={selectedSensorPopup.sensorKey}
          sensorData={selectedSensorPopup.data}
          onClose={() => setSelectedSensorPopup(null)}
          onViewAnalytics={(slotCode, pointKey) => {
            const pumpTarget = selectedSensorPopup.pump;
            setSelectedSensorPopup(null);
            if (onNavigateToAnalytics) {
              onNavigateToAnalytics(slotCode, pointKey);
            } else if (onNavigateTab) {
              onNavigateTab('sensors');
            } else {
              handleSelectPump(pumpTarget);
            }
          }}
        />
      )}

      {/* Pump Detail In-depth Modal */}
      {selectedPumpForDetail && (
        <PumpDetailModal
          pump={selectedPumpForDetail}
          onClose={() => setSelectedPumpForDetail(null)}
        />
      )}

      {/* Manual Measurement Field Entry Modal */}
      <ManualMeasurementModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSuccess={() => {
          fetchDashboardData();
        }}
      />
    </div>
  );
};
