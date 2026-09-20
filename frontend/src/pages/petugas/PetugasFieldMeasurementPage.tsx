import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  QrCode, Camera, Flashlight, RefreshCw, CheckCircle2, AlertTriangle, 
  History, Home, UploadCloud, ChevronRight, X, ArrowLeft, 
  ShieldAlert, Clock, FileText, Check, AlertCircle,
  Sparkles, LogOut, Sun, Moon, Wifi, WifiOff
} from 'lucide-react';
import axios from 'axios';

// Resolved Measurement Target Interface
export interface ResolvedTarget {
  sensorId: number;
  sensorCode: string;
  serialNumber: string;
  sensorName: string;
  measurementPoint: string;
  measurementType: string;
  component: string;
  position: string;
  axis: string;
  unit: string;
  upperLimit: number;
  stationName: string;
  slotCode: string;
  slotName: string;
  pumpAssetCode: string;
  pumpName: string;
  operatingState: string;
  isStandby: boolean;
  recentRange: string;
  previousValue: number;
  previousMeasuredAt: string;
  previousQuality?: string;
  isRecentlyMeasured?: boolean;
  minutesAgo?: number;
}

export const PetugasFieldMeasurementPage: React.FC = () => {
  const { user, token, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Navigation tabs: 'home' | 'scan' | 'input' | 'manual-select' | 'history' | 'uploads'
  const [activeTab, setActiveTab] = useState<'home' | 'scan' | 'input' | 'manual-select' | 'history' | 'uploads'>('home');

  // Network & Sync State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncList, setPendingSyncList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('rasta_pending_measurements');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Round Progress State
  const [progressData, setProgressData] = useState<any>({
    totalSensors: 64,
    completedCount: 28,
    percentage: 44,
    lastInputTime: '14:03',
    startedAt: '14:00',
    slots: [
      { slotCode: 'A', name: 'Pump A', completed: 16, total: 16, status: 'COMPLETE' },
      { slotCode: 'B', name: 'Pump B (Standby)', completed: 8, total: 16, status: 'IN_PROGRESS' },
      { slotCode: 'C', name: 'Pump C', completed: 4, total: 16, status: 'IN_PROGRESS' },
      { slotCode: 'D', name: 'Pump D (Standby)', completed: 0, total: 16, status: 'NOT_STARTED' }
    ]
  });

  // History State
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any | null>(null);

  // Active Resolved Target & Input State
  const [target, setTarget] = useState<ResolvedTarget | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState<boolean>(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Warnings & Quality Dialogs
  const [unusualWarning, setUnusualWarning] = useState<boolean>(false);
  const [recentWarning, setRecentWarning] = useState<boolean>(false);
  const [retiredSensorModal, setRetiredSensorModal] = useState<{ active: boolean; message: string } | null>(null);
  const [retiredPumpModal, setRetiredPumpModal] = useState<{ active: boolean; message: string } | null>(null);
  const [standbyConfirmed, setStandbyConfirmed] = useState<boolean>(false);
  const [showSkipModal, setShowSkipModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  // Success Feedback
  const [lastSavedResult, setLastSavedResult] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Scanner UI States
  const [isFlashlightOn, setIsFlashlightOn] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [manualCodeInput, setManualCodeInput] = useState<string>('');
  const [scannerError, setScannerError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputFieldRef = useRef<HTMLInputElement | null>(null);

  // Manual Selection Fallback States
  const [manualStep, setManualStep] = useState<'pump' | 'location' | 'type'>('pump');
  const [selectedSlot, setSelectedSlot] = useState<'A' | 'B' | 'C' | 'D'>('C');
  const [selectedLocation, setSelectedLocation] = useState<'M-NDE' | 'M-DE' | 'P-DE' | 'P-NDE'>('P-DE');

  // Media Upload State (preserving original upload feature)
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadSuccessMedia, setUploadSuccessMedia] = useState<any | null>(null);

  // Check network online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync pending measurements
  const syncPendingMeasurements = async () => {
    if (!pendingSyncList.length || !isOnline) return;
    try {
      for (const item of pendingSyncList) {
        await axios.post('/api/monitoring/measurements/manual', item, {
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
      }
      setPendingSyncList([]);
      localStorage.removeItem('rasta_pending_measurements');
      fetchHistory();
      fetchProgress();
    } catch (err) {
      console.error('Pending sync failed:', err);
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await axios.get('/api/monitoring/operator/progress');
      if (res.data.success) {
        setProgressData(res.data.data);
      }
    } catch {
      // fallback to mock state
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/monitoring/operator/history');
      if (res.data.success) {
        setHistoryList(res.data.data);
      }
    } catch {
      // fallback history
    }
  };

  useEffect(() => {
    fetchProgress();
    fetchHistory();
  }, []);

  // Start Camera Stream when entering 'scan' tab
  useEffect(() => {
    if (activeTab === 'scan') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab, cameraFacing]);

  const startCamera = async () => {
    setScannerError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: cameraFacing }
        });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setScannerError('Kamera tidak aktif atau diblokir browser. Anda dapat menggunakan simulator scan cepat atau input manual.');
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const toggleFlashlight = async () => {
    if (mediaStreamRef.current) {
      const track = mediaStreamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.() as any;
      if (capabilities && capabilities.torch) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !isFlashlightOn } as any]
          });
          setIsFlashlightOn(!isFlashlightOn);
        } catch (e) {
          console.error(e);
        }
      } else {
        setIsFlashlightOn(!isFlashlightOn);
      }
    } else {
      setIsFlashlightOn(!isFlashlightOn);
    }
  };

  // Auto-focus input when entering input screen
  useEffect(() => {
    if (activeTab === 'input') {
      setTimeout(() => {
        inputFieldRef.current?.focus();
      }, 100);
    }
  }, [activeTab]);

  // QR Resolution function (Requirement 4 & 34)
  const handleResolveQR = async (code: string) => {
    if (!code) return;
    stopCamera();

    try {
      const res = await axios.post('/api/monitoring/qr/resolve', { qrCode: code });

      if (res.data.isRetiredSensor) {
        setRetiredSensorModal({ active: true, message: res.data.message });
        return;
      }

      if (res.data.isRetiredPump) {
        setRetiredPumpModal({ active: true, message: res.data.message });
        return;
      }

      if (res.data.success && res.data.data) {
        const resolved: ResolvedTarget = res.data.data;
        setTarget(resolved);
        setInputValue('');
        setNotes('');
        setShowNotes(false);
        setPhotoPreview(null);
        setStandbyConfirmed(false);

        // Check if recently measured < 10 mins (Requirement 27)
        if (resolved.isRecentlyMeasured) {
          setRecentWarning(true);
        }

        setActiveTab('input');
      } else {
        alert(res.data.message || 'QR Code tidak dikenali');
      }
    } catch (err: any) {
      // Offline fallback: synthesize target from standard QR formats
      const fallbackTarget: ResolvedTarget = {
        sensorId: 33,
        sensorCode: code,
        serialNumber: `SN-${code}`,
        sensorName: 'Pump Drive End Horizontal Vibration',
        measurementPoint: code.includes('T') ? 'PUMP-DE-T' : 'PUMP-DE-H',
        measurementType: code.includes('T') ? 'Temperature' : 'Horizontal Vibration',
        component: 'PUMP',
        position: 'DE',
        axis: code.includes('T') ? 'TEMP' : 'H',
        unit: code.includes('T') ? '°C' : 'mm/s',
        upperLimit: code.includes('T') ? 75.0 : 1.80,
        stationName: 'Booster Pump Batang HO',
        slotCode: code.includes('BTG-1') ? 'A' : code.includes('BTG-2') ? 'B' : 'C',
        slotName: 'Slot C',
        pumpAssetCode: 'PUMP-L4-BTG-003',
        pumpName: 'Booster Pump Batang HO #3',
        operatingState: code.includes('BTG-2') ? 'STANDBY' : 'RUNNING',
        isStandby: code.includes('BTG-2'),
        recentRange: code.includes('T') ? '35.0 – 65.0 °C' : '0.68 – 1.92 mm/s',
        previousValue: code.includes('T') ? 54.0 : 1.74,
        previousMeasuredAt: '13:00 (1 jam lalu)'
      };
      setTarget(fallbackTarget);
      setInputValue('');
      setActiveTab('input');
    }
  };

  // Perform Save Measurement (Requirement 5, 8, 9, 10)
  const handleExecuteSave = async (isForcedSuspect = false) => {
    if (!target) return;
    const num = parseFloat(inputValue);

    if (isNaN(num)) {
      alert('Mohon masukkan angka nilai pengukuran yang valid');
      return;
    }

    // Data Quality Check (Requirement 9): Check if extreme difference
    if (!isForcedSuspect && target.previousValue > 0) {
      const ratio = num / target.previousValue;
      if (ratio > 4.5 || ratio < 0.15) {
        setUnusualWarning(true);
        return;
      }
    }

    setIsSaving(true);
    const quality = isForcedSuspect ? 'SUSPECT' : 'ACTUAL';
    const condition = num > target.upperLimit ? 'WARNING' : num > (target.upperLimit * 0.8) ? 'DEGRADING' : 'NORMAL';

    const payload = {
      sensorId: target.sensorId,
      slotCode: target.slotCode,
      pointCode: target.measurementPoint,
      value: num,
      notes: notes.trim() || undefined,
      quality,
      source_type: 'MANUAL',
      data_type: 'ACTUAL',
      recorded_by: user?.name || user?.username || 'Petugas Lapangan',
      measured_at: new Date().toISOString()
    };

    try {
      if (isOnline) {
        await axios.post('/api/monitoring/measurements/manual', payload, {
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
      } else {
        // Save to offline queue (Requirement 30)
        const updatedQueue = [payload, ...pendingSyncList];
        setPendingSyncList(updatedQueue);
        localStorage.setItem('rasta_pending_measurements', JSON.stringify(updatedQueue));
      }

      // Record in local history
      const newHistoryItem = {
        id: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date().toISOString(),
        slotCode: target.slotCode,
        pumpName: `Pump ${target.slotCode}`,
        location: `${target.component} ${target.position}`,
        channelCode: target.measurementPoint,
        measurementType: target.measurementType,
        value: num,
        unit: target.unit,
        condition,
        quality,
        operator: user?.name || 'Petugas Lapangan',
        notes: notes.trim() || null
      };
      setHistoryList(prev => [newHistoryItem, ...prev]);

      // Update progress
      setProgressData((prev: any) => ({
        ...prev,
        completedCount: Math.min(prev.completedCount + 1, prev.totalSensors),
        lastInputTime: newHistoryItem.time
      }));

      // Success State (Requirement 11)
      setLastSavedResult({
        pumpSlot: target.slotCode,
        pointCode: target.measurementPoint,
        value: num,
        unit: target.unit,
        condition,
        quality
      });

      setIsSaving(false);
      setUnusualWarning(false);
      setRecentWarning(false);
    } catch (err) {
      // Fallback offline queue
      const updatedQueue = [payload, ...pendingSyncList];
      setPendingSyncList(updatedQueue);
      localStorage.setItem('rasta_pending_measurements', JSON.stringify(updatedQueue));
      setIsSaving(false);
      setLastSavedResult({
        pumpSlot: target.slotCode,
        pointCode: target.measurementPoint,
        value: num,
        unit: target.unit,
        condition,
        quality: 'OFFLINE_PENDING'
      });
    }
  };

  // Skip Measurement Action (Requirement 19)
  const handleSkipMeasurement = async (reason: string) => {
    if (!target) return;
    try {
      await axios.post('/api/monitoring/operator/skip', {
        sensorId: target.sensorId,
        slotCode: target.slotCode,
        pointCode: target.measurementPoint,
        reason
      });
    } catch (e) {
      console.warn(e);
    }

    setShowSkipModal(false);
    setLastSavedResult({
      pumpSlot: target.slotCode,
      pointCode: target.measurementPoint,
      value: null,
      unit: target.unit,
      condition: 'SKIPPED',
      quality: 'NOT_MEASURED',
      reason
    });
  };

  // Report Sensor Issue Action (Requirement 20)
  const handleReportIssue = async (issueType: string, reportNotes: string) => {
    if (!target) return;
    try {
      await axios.post('/api/monitoring/operator/report-sensor-issue', {
        sensorId: target.sensorId,
        slotCode: target.slotCode,
        pointCode: target.measurementPoint,
        issueType,
        notes: reportNotes
      });
    } catch (e) {
      console.warn(e);
    }
    setShowReportModal(false);
    alert(`Laporan isu sensor (${issueType}) berhasil dikirim ke tim pemeliharaan!`);
  };

  // Resolve Manual Selection (Requirement 14 & 15)
  const handleFinishManualSelection = (type: string) => {
    const pointCode = `${selectedLocation === 'M-NDE' || selectedLocation === 'M-DE' ? 'ELMOT' : 'PUMP'}-${selectedLocation.replace('-', '')}-${type === 'Temperature' ? 'T' : type.charAt(0)}`;
    const syntheticQR = `QR-SNS-BTG-${selectedSlot === 'A' ? '1' : selectedSlot === 'B' ? '2' : selectedSlot === 'C' ? '3' : '4'}-${pointCode}`;
    handleResolveQR(syntheticQR);
  };

  return (
    <div className={`min-h-screen w-full flex flex-col font-sans transition-colors duration-200 ${
      theme === 'dark' ? 'bg-[#070D1E] text-slate-100' : 'bg-[#F1F5F9] text-slate-800'
    }`}>
      {/* ================= TOP MOBILE APP BAR ================= */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0E1726]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-2.5 shadow-xs">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Logo with Official /logo-tr.png */}
          <div className="flex items-center shrink-0">
            <div className="h-9 px-2.5 bg-white rounded-xl shadow-xs border border-slate-200 dark:border-slate-700/80 flex items-center justify-center shrink-0">
              <img src="/logo-tr.png" alt="RASTA Logo" className="h-5 w-auto object-contain" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Sync Badge */}
            {pendingSyncList.length > 0 && (
              <button
                type="button"
                onClick={syncPendingMeasurements}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold animate-pulse whitespace-nowrap"
                title="Klik untuk sinkronkan data offline"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{pendingSyncList.length} sync</span>
              </button>
            )}

            {/* Online Indicator */}
            <div 
              className={`flex items-center gap-1.5 text-[11px] font-bold px-2 py-1.5 rounded-xl border whitespace-nowrap ${
                isOnline 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
              }`}
              title={isOnline ? 'Terhubung (Online)' : 'Terputus (Offline)'}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-500" /> : <WifiOff className="w-3.5 h-3.5 text-rose-500" />}
              <span className="hidden xs:inline text-[10px]">{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            {/* Prominent Dark / Light Mode Switch Icon Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-xs cursor-pointer"
              title={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* User Profile / Logout */}
            <button
              type="button"
              onClick={logout}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-rose-500 hover:bg-rose-500/10 border border-slate-200/60 dark:border-slate-700/60 hover:border-rose-500/30 transition-all"
              title="Keluar dari sesi"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN MOBILE WORKSPACE ================= */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 pb-24 space-y-4">

        {/* ---------------- 1. HOME SCREEN (Requirement 1 & 25) ---------------- */}
        {activeTab === 'home' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Operator Welcome Header (Harmonized with Light & Dark Modes) */}
            <div className="bg-white dark:bg-gradient-to-br dark:from-[#0E1726] dark:via-[#0B132B] dark:to-[#1C2541] rounded-3xl p-5 text-slate-900 dark:text-white shadow-sm dark:shadow-xl border border-slate-200/80 dark:border-slate-800 transition-all">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-500/20 dark:border-cyan-500/30">
                    Putaran Shift Petugas
                  </span>
                </div>
                <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                Selamat Bertugas, <span className="text-cyan-600 dark:text-cyan-400">{user?.name || 'Petugas Lapangan'}</span>!
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Posisikan ponsel dekat sensor bantalan pompa dan lakukan scan QR untuk mencatat pengukuran cepat.
              </p>
            </div>

            {/* HERO BIG ACTION: SCAN QR (Requirement 1 & 3) */}
            <div 
              onClick={() => setActiveTab('scan')}
              className="group cursor-pointer rounded-3xl p-6 bg-gradient-to-b from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/25 border border-cyan-400/40 hover:brightness-105 active:scale-[0.98] transition-all flex flex-col items-center justify-center text-center space-y-3"
            >
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                <QrCode className="w-11 h-11 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight">SCAN QR SENSOR</h3>
                <p className="text-xs text-cyan-100 mt-0.5 font-medium">
                  Arahkan kamera ke label QR titik ukur pompa
                </p>
              </div>
              <div className="px-4 py-1.5 rounded-full bg-white text-cyan-700 text-xs font-black shadow-sm flex items-center gap-1.5">
                <span>Buka Kamera Sekarang</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Manual Fallback Action Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setManualStep('pump');
                  setActiveTab('manual-select');
                }}
                className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1 py-1"
              >
                <span>Label QR Rusak? Pilih Titik Secara Manual</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* TODAY'S ROUND PROGRESS (Requirement 17 & 25) */}
            <div className="bg-white dark:bg-[#0E1726] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Progres Putaran Pengukuran
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-0.5">
                    Dimulai {progressData.startedAt} • Terakhir {progressData.lastInputTime}
                  </p>
                </div>
                <span className="text-lg font-mono font-black text-cyan-600 dark:text-cyan-400">
                  {progressData.completedCount} <span className="text-xs text-slate-400 font-normal">/ {progressData.totalSensors}</span>
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
                  style={{ width: `${progressData.percentage}%` }}
                />
              </div>

              {/* Breakdown per pump */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {progressData.slots?.map((slot: any) => (
                  <div key={slot.slotCode} className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{slot.name}</span>
                      <span className="block text-[10px] text-slate-400 font-mono">{slot.completed} / {slot.total}</span>
                    </div>
                    {slot.completed === slot.total ? (
                      <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Selesai
                      </span>
                    ) : slot.completed > 0 ? (
                      <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">
                        {Math.round((slot.completed / slot.total) * 100)}%
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400">
                        Belum
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('scan')}
                className="w-full py-3 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <span>Lanjutkan Pengukuran Lapangan</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ---------------- 2. QR SCANNER SCREEN (Requirement 13) ---------------- */}
        {activeTab === 'scan' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Batal / Kembali</span>
              </button>
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                Scanner Aktif
              </span>
            </div>

            {/* Viewfinder View */}
            <div className="relative w-full aspect-square max-h-[380px] rounded-3xl bg-black overflow-hidden shadow-2xl border-2 border-cyan-500/40 flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Target Scan Frame */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-56 h-56 border-2 border-dashed border-cyan-400 rounded-3xl relative flex items-center justify-center">
                  {/* Corner accents */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl-xl"></div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr-xl"></div>
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl-xl"></div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br-xl"></div>
                  
                  {/* Laser line effect */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-pulse shadow-lg shadow-cyan-400"></div>

                  <p className="absolute -bottom-9 text-white/90 text-[11px] font-semibold bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                    Posisikan QR di dalam kotak
                  </p>
                </div>
              </div>

              {/* Camera Controls Overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
                <button
                  type="button"
                  onClick={toggleFlashlight}
                  className={`p-2.5 rounded-2xl backdrop-blur-md font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all ${
                    isFlashlightOn ? 'bg-amber-400 text-slate-950' : 'bg-black/60 text-white hover:bg-black/80'
                  }`}
                >
                  <Flashlight className="w-4 h-4" />
                  <span>Senter {isFlashlightOn ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCameraFacing(prev => prev === 'environment' ? 'user' : 'environment')}
                  className="p-2.5 rounded-2xl bg-black/60 text-white backdrop-blur-md text-xs font-bold flex items-center gap-1.5 shadow-lg hover:bg-black/80 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Putar Kamera</span>
                </button>
              </div>
            </div>

            {scannerError && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs">
                {scannerError}
              </div>
            )}

            {/* Quick Testing Simulator Bar */}
            <div className="bg-white dark:bg-[#0E1726] rounded-3xl p-4 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Simulasi Scan Cepat (Untuk Pengujian Lapangan)
                </span>
                <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleResolveQR('QR-SNS-BTG-3-PUMP-DE-H')}
                  className="p-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-left font-bold text-amber-900 dark:text-amber-200 transition-colors"
                >
                  <div className="text-[10px] text-amber-600 dark:text-amber-400">Pump C • P-DE</div>
                  <div className="font-mono mt-0.5">Vibrasi Horiz (1.82 mm/s)</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleResolveQR('QR-SNS-BTG-3-PUMP-DE-T')}
                  className="p-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-left font-bold text-rose-900 dark:text-rose-200 transition-colors"
                >
                  <div className="text-[10px] text-rose-600 dark:text-rose-400">Pump C • P-DE</div>
                  <div className="font-mono mt-0.5">Suhu Bantalan (63.4°C)</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleResolveQR('QR-SNS-BTG-1-ELMOT-DE-H')}
                  className="p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-left font-bold text-emerald-900 dark:text-emerald-200 transition-colors"
                >
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400">Pump A • M-DE</div>
                  <div className="font-mono mt-0.5">Normal (0.43 mm/s)</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleResolveQR('QR-SNS-BTG-2-PUMP-DE-H')}
                  className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-left font-bold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <div className="text-[10px] text-slate-500">Pump B (STANDBY)</div>
                  <div className="font-mono mt-0.5">Mesin Mati (0.04 mm/s)</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleResolveQR('SNS-C-PDE-H-001')}
                  className="col-span-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 text-slate-500 text-[11px] font-mono text-center hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Uji Proteksi: Sensor Lama Non-Aktif (SNS-C-PDE-H-001)
                </button>
              </div>

              {/* Manual Input Code Box */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex gap-2">
                <input
                  type="text"
                  placeholder="Ketik kode QR (misal: P-DE-H)"
                  value={manualCodeInput}
                  onChange={(e) => setManualCodeInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleResolveQR(manualCodeInput || 'QR-SNS-BTG-3-PUMP-DE-H')}
                  className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold shrink-0 hover:bg-cyan-500 transition-colors"
                >
                  Buka
                </button>
              </div>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setManualStep('pump');
                  setActiveTab('manual-select');
                }}
                className="text-xs font-bold text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 py-1"
              >
                Gunakan Pemilihan Manual via Diagram Pompa →
              </button>
            </div>
          </div>
        )}

        {/* ---------------- 3. DIRECT LARGE NUMERIC INPUT SCREEN (Requirement 5, 6, 7, 8, 18, 21, 32) ---------------- */}
        {activeTab === 'input' && target && (
          <div className="space-y-4 animate-scaleIn">
            {/* Top Back Action */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Batal</span>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} WIB
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
            </div>

            {/* Context Card (Requirement 7: Context must always be visible) */}
            <div className="bg-white dark:bg-[#0E1726] rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-slate-900 text-cyan-400 font-black text-sm flex items-center justify-center">
                    {target.slotCode}
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      PUMP {target.slotCode} • {target.pumpAssetCode}
                    </h3>
                    <p className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">
                      {target.component} — {target.position} ({target.measurementPoint})
                    </p>
                  </div>
                </div>

                {/* Operating State Badge */}
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  target.isStandby
                    ? 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30'
                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                }`}>
                  {target.operatingState}
                </span>
              </div>

              {/* Requirement 18: Standby pump condition warning */}
              {target.isStandby && !standbyConfirmed && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-2 animate-fadeIn">
                  <div className="flex items-start gap-2 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>Perhatian: Pompa {target.slotCode} saat ini berstatus STANDBY.</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    Pengukuran getaran saat mesin tidak berputar tidak mencerminkan kondisi operasi normal dinamis.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setStandbyConfirmed(true)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-sm hover:brightness-105"
                    >
                      Tetap Ukur
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSkipMeasurement('Pompa dalam kondisi standby')}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Lewati Titik Ini
                    </button>
                  </div>
                </div>
              )}

              <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2">
                <span>Jenis: <b className="text-slate-700 dark:text-slate-300">{target.measurementType}</b></span>
                <span>Satuan: <b className="text-cyan-600 dark:text-cyan-400 font-mono font-bold">{target.unit}</b></span>
              </div>
            </div>

            {/* LARGE INPUT CONTAINER (Requirement 6) */}
            <div className="bg-white dark:bg-[#0E1726] rounded-3xl p-6 border-2 border-cyan-500/40 shadow-xl text-center space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                NILAI PENGUKURAN SAAT INI
              </span>

              <div className="flex items-center justify-center gap-2">
                <input
                  ref={inputFieldRef}
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value.replace(/,/g, '.'))}
                  className="w-full text-5xl sm:text-6xl font-black font-mono text-center tracking-tight text-slate-950 dark:text-white bg-transparent outline-none selection:bg-cyan-500/30"
                />
                <span className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400 shrink-0">
                  {target.unit}
                </span>
              </div>

              {/* Requirement 8: Show previous measurement comparison */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Pengukuran Sebelumnya</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {target.previousValue.toFixed(2)} {target.unit}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Riwayat Normal</span>
                  <span className="font-mono text-slate-500 text-[11px]">
                    {target.recentRange}
                  </span>
                </div>
              </div>
            </div>

            {/* Optional Collapsible Fields: Notes & Photo (Requirement 22 & 23) */}
            <div className="space-y-2">
              {!showNotes ? (
                <button
                  type="button"
                  onClick={() => setShowNotes(true)}
                  className="w-full py-2 px-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-white/50 transition-all flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>+ Tambah Catatan Lapangan</span>
                </button>
              ) : (
                <div className="p-3 rounded-2xl bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-slate-800 space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>Catatan Lapangan (Opsional)</span>
                    <button type="button" onClick={() => setShowNotes(false)} className="text-slate-400 hover:text-slate-600">
                      Tutup
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tuliskan temuan visual, getaran tidak wajar, atau kondisi baut..."
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>
              )}

              {!showPhotoUpload ? (
                <button
                  type="button"
                  onClick={() => setShowPhotoUpload(true)}
                  className="w-full py-2 px-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-white/50 transition-all flex items-center justify-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>+ Lampirkan Foto Temuan Anomali</span>
                </button>
              ) : (
                <div className="p-3 rounded-2xl bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-slate-800 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>Foto Anomali (Opsional)</span>
                    <button type="button" onClick={() => setShowPhotoUpload(false)} className="text-slate-400 hover:text-slate-600">
                      Tutup
                    </button>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPhotoPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="text-xs text-slate-500"
                  />
                  {photoPreview && (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 mt-2">
                      <img src={photoPreview} alt="Temuan" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Fast Actions Row: Skip & Report Issue */}
            <div className="flex items-center justify-between gap-2 pt-1 text-xs">
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="text-amber-600 dark:text-amber-400 font-bold hover:underline inline-flex items-center gap-1"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Laporkan Masalah Sensor</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSkipModal(true)}
                className="text-slate-500 dark:text-slate-400 font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>Lewati Titik Ini</span>
              </button>
            </div>

            {/* STICKY BOTTOM ACTION BAR (Requirement 31 & 32: One-hand usability) */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-[#0E1726]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 z-30">
              <div className="max-w-md mx-auto">
                <button
                  type="button"
                  disabled={isSaving || !inputValue}
                  onClick={() => handleExecuteSave(false)}
                  className={`w-full h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
                    !inputValue || isSaving
                      ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/25 hover:brightness-110 active:scale-[0.98]'
                  }`}
                >
                  {isSaving ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>SIMPAN & SCAN BERIKUTNYA</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 4. MANUAL SELECTION FALLBACK (Requirement 14 & 15) ---------------- */}
        {activeTab === 'manual-select' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <span className="text-xs font-black uppercase text-cyan-600 dark:text-cyan-400">
                Pilihan Manual
              </span>
            </div>

            <div className="bg-white dark:bg-[#0E1726] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              {/* Step 1: Pilih Pompa */}
              {manualStep === 'pump' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">
                    1. Pilih Unit Pompa di Stasiun:
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {(['A', 'B', 'C', 'D'] as const).map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          setSelectedSlot(slot);
                          setManualStep('location');
                        }}
                        className={`p-4 rounded-2xl border text-center transition-all ${
                          selectedSlot === slot
                            ? 'border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-black'
                            : 'border-slate-200 dark:border-slate-800 hover:border-cyan-500/50'
                        }`}
                      >
                        <div className="text-2xl font-black">{slot}</div>
                        <div className="text-xs font-bold text-slate-500 mt-1">PUMP {slot}</div>
                        <div className="text-[10px] text-slate-400">
                          {slot === 'B' || slot === 'D' ? 'STANDBY' : 'RUNNING'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Pilih Lokasi Pengukuran (Requirement 15: DE / NDE) */}
              {manualStep === 'location' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-800 dark:text-white">
                      2. Pilih Lokasi Bantalan pada PUMP {selectedSlot}:
                    </h3>
                    <button
                      type="button"
                      onClick={() => setManualStep('pump')}
                      className="text-xs text-cyan-600 font-bold hover:underline"
                    >
                      Ubah Pompa
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLocation('M-NDE');
                        setManualStep('type');
                      }}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500 text-left"
                    >
                      <div className="text-xs font-black text-cyan-600 dark:text-cyan-400">M-NDE</div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">Motor Non-Drive End</div>
                      <div className="text-[10px] text-slate-400">Sisi ujung bebas motor</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLocation('M-DE');
                        setManualStep('type');
                      }}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500 text-left"
                    >
                      <div className="text-xs font-black text-cyan-600 dark:text-cyan-400">M-DE</div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">Motor Drive End</div>
                      <div className="text-[10px] text-slate-400">Sisi poros dekat kopling</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLocation('P-DE');
                        setManualStep('type');
                      }}
                      className="p-3.5 rounded-2xl border-2 border-cyan-500 bg-cyan-500/10 text-left"
                    >
                      <div className="text-xs font-black text-cyan-600 dark:text-cyan-400">P-DE ●</div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">Pump Drive End</div>
                      <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold">Poros input dekat kopling</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLocation('P-NDE');
                        setManualStep('type');
                      }}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500 text-left"
                    >
                      <div className="text-xs font-black text-cyan-600 dark:text-cyan-400">P-NDE</div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">Pump Non-Drive End</div>
                      <div className="text-[10px] text-slate-400">Ujung pompa seberang kopling</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Pilih Jenis Pengukuran (H, V, A, Temp) */}
              {manualStep === 'type' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-800 dark:text-white">
                      3. Apa yang sedang diukur di {selectedLocation}?
                    </h3>
                    <button
                      type="button"
                      onClick={() => setManualStep('location')}
                      className="text-xs text-cyan-600 font-bold hover:underline"
                    >
                      Ubah Lokasi
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleFinishManualSelection('Horizontal')}
                      className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 text-left flex items-center justify-between hover:bg-cyan-500/20"
                    >
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white">Vibrasi Horizontal (H)</div>
                        <div className="text-[11px] text-slate-500 font-mono">Standar satuan: mm/s RMS</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-cyan-600" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFinishManualSelection('Vertical')}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left flex items-center justify-between hover:bg-slate-100"
                    >
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white">Vibrasi Vertical (V)</div>
                        <div className="text-[11px] text-slate-500 font-mono">Standar satuan: mm/s RMS</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFinishManualSelection('Axial')}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left flex items-center justify-between hover:bg-slate-100"
                    >
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white">Vibrasi Axial (A)</div>
                        <div className="text-[11px] text-slate-500 font-mono">Standar satuan: mm/s RMS</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFinishManualSelection('Temperature')}
                      className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-left flex items-center justify-between hover:bg-rose-500/20"
                    >
                      <div>
                        <div className="text-xs font-black text-rose-900 dark:text-rose-200">Suhu Bantalan (Temperature)</div>
                        <div className="text-[11px] text-slate-500 font-mono">Standar satuan: °C</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-rose-600" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------- 5. OPERATOR HISTORY SCREEN (Requirement 26) ---------------- */}
        {activeTab === 'history' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Riwayat Pengukuran Hari Ini</h3>
                <p className="text-xs text-slate-500">Log masukan data manual lapangan oleh petugas</p>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                {historyList.length} Input
              </span>
            </div>

            <div className="space-y-2.5">
              {historyList.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedHistoryItem(item)}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between cursor-pointer hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 text-cyan-400 font-black text-xs flex items-center justify-center shrink-0">
                      {item.slotCode}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          Pump {item.slotCode} • {item.channelCode}
                        </span>
                        <span className={`px-2 py-0.2 rounded text-[9px] font-black uppercase ${
                          item.condition === 'WARNING'
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                            : item.condition === 'SKIPPED'
                            ? 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {item.condition}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{item.time} WIB</span>
                        <span>&bull;</span>
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-black font-mono text-slate-900 dark:text-white">
                      {item.value !== null ? `${item.value.toFixed(2)} ${item.unit}` : 'DILEWATI'}
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 font-mono uppercase">
                      {item.quality}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- 6. MEDIA & FILE UPLOADS (Preserved Tool) ---------------- */}
        {activeTab === 'uploads' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white dark:bg-[#0E1726] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-cyan-600" />
                Unggah Dokumen & Berkas Terenkripsi
              </h3>
              <p className="text-xs text-slate-500">
                Dokumentasi foto lapangan, laporan servis PDF, atau video inspeksi disusun dalam hierarki tanggal <code className="text-cyan-600 font-mono">YYYY/MM/DD/jenis_media/</code>.
              </p>

              <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 transition-all rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsUploadingMedia(true);
                    setUploadSuccessMedia(null);

                    const formData = new FormData();
                    formData.append('file', file);

                    try {
                      const res = await axios.post('/api/upload/single', formData, {
                        headers: {
                          'Content-Type': 'multipart/form-data',
                          Authorization: token ? `Bearer ${token}` : ''
                        }
                      });
                      if (res.data.success) {
                        setUploadSuccessMedia(res.data.data);
                      }
                    } catch (err: any) {
                      alert('Gagal mengunggah berkas');
                    } finally {
                      setIsUploadingMedia(false);
                      e.target.value = '';
                    }
                  }}
                  disabled={isUploadingMedia}
                />
                <UploadCloud className="w-8 h-8 text-cyan-600 mb-2" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isUploadingMedia ? 'Mengenkripsi dan mengunggah...' : 'Pilih Berkas dari Perangkat'}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">Foto, Dokumen PDF, Video hingga 50MB</span>
              </label>

              {uploadSuccessMedia && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs">
                  <span className="font-bold block">✓ Berkas Berhasil Dienkripsi & Disimpan!</span>
                  <p className="font-mono text-[10px] mt-1 break-all">
                    uploads/{uploadSuccessMedia.relativePath}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ================= STICKY MOBILE BOTTOM NAVIGATION (Requirement 2 & 31) ================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0E1726]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 px-4 py-2">
        <div className="max-w-xl mx-auto flex items-center justify-around relative">
          {/* 1. Home */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
              activeTab === 'home'
                ? 'text-cyan-600 dark:text-cyan-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Beranda</span>
          </button>

          {/* 2. Center Glowing Scan Button */}
          <button
            type="button"
            onClick={() => setActiveTab('scan')}
            className="flex flex-col items-center -mt-6 group focus:outline-none"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-105 active:scale-95 transition-all border-2 border-white dark:border-[#0E1726]">
              <QrCode className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 mt-1">
              SCAN QR
            </span>
          </button>

          {/* 3. History */}
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
              activeTab === 'history'
                ? 'text-cyan-600 dark:text-cyan-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px]">Riwayat</span>
          </button>

          {/* 4. Media & Uploads */}
          <button
            type="button"
            onClick={() => setActiveTab('uploads')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
              activeTab === 'uploads'
                ? 'text-cyan-600 dark:text-cyan-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <UploadCloud className="w-5 h-5" />
            <span className="text-[10px]">Unggahan</span>
          </button>
        </div>
      </nav>

      {/* ================= MODALS & DIALOGS ================= */}

      {/* SUCCESS CONFIRMATION MODAL (Requirement 11 & 12) */}
      {lastSavedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 text-center space-y-4 animate-scaleIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {lastSavedResult.condition === 'SKIPPED' ? 'Titik Pengukuran Dilewati' : 'Pengukuran Berhasil Disimpan!'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pump {lastSavedResult.pumpSlot} • {lastSavedResult.pointCode}
              </p>
            </div>

            {lastSavedResult.value !== null && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                  {lastSavedResult.value.toFixed(2)} {lastSavedResult.unit}
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    lastSavedResult.condition === 'WARNING'
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                      : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {lastSavedResult.condition}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    PROVENANCE: MANUAL • ACTUAL
                  </span>
                </div>
              </div>
            )}

            {/* Requirement 11 & 12: Primary action is SCAN NEXT QR */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setLastSavedResult(null);
                  setTarget(null);
                  setActiveTab('scan');
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xs shadow-lg shadow-cyan-500/25 hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>[ SCAN NEXT QR ]</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setLastSavedResult(null);
                  setTarget(null);
                  setActiveTab('home');
                }}
                className="w-full py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNUSUAL MEASUREMENT WARNING DIALOG (Requirement 9) */}
      {unusualWarning && target && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-[#0E1726] border border-amber-500/50 rounded-3xl shadow-2xl p-6 text-center space-y-4 animate-scaleIn">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-500 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-black text-amber-600 dark:text-amber-400">
                ⚠ Nilai Tidak Biasa (Unusual Measurement)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Nilai yang dimasukkan jauh lebih tinggi dari rentang riwayat normal.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Rentang Normal:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{target.recentRange}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sebelumnya:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{target.previousValue.toFixed(2)} {target.unit}</span>
              </div>
              <div className="flex justify-between border-t border-amber-500/20 pt-1 text-sm font-bold text-amber-600 dark:text-amber-400">
                <span>Nilai Diketik:</span>
                <span className="font-mono">{inputValue} {target.unit}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUnusualWarning(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                KOREKSI NILAI
              </button>

              <button
                type="button"
                onClick={() => handleExecuteSave(true)}
                className="flex-1 py-3 rounded-xl bg-amber-500 text-slate-950 text-xs font-black shadow-md hover:brightness-105"
              >
                TETAP SIMPAN (SUSPECT)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECENTLY MEASURED PROTECTION WARNING (Requirement 27) */}
      {recentWarning && target && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-[#0E1726] border border-cyan-500/40 rounded-3xl shadow-2xl p-6 text-center space-y-4 animate-scaleIn">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 text-cyan-500 mx-auto flex items-center justify-center">
              <Clock className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Titik Ini Baru Saja Diukur!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Pump {target.slotCode} • {target.measurementPoint} telah diukur {target.minutesAgo} menit lalu ({target.previousValue} {target.unit}).
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRecentWarning(false);
                  setActiveTab('scan');
                }}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                SCAN TITIK LAIN
              </button>

              <button
                type="button"
                onClick={() => setRecentWarning(false)}
                className="flex-1 py-3 rounded-xl bg-cyan-600 text-white text-xs font-black shadow-md"
              >
                UKUR ULANG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RETIRED SENSOR MODAL (Requirement 28) */}
      {retiredSensorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-[#0E1726] border border-rose-500/50 rounded-3xl shadow-2xl p-6 text-center space-y-4 animate-scaleIn">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-500 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-black text-rose-600 dark:text-rose-400">
                ⚠ SENSOR NO LONGER ACTIVE
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {retiredSensorModal.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setRetiredSensorModal(null);
                setActiveTab('scan');
              }}
              className="w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-black"
            >
              SCAN LABEL LAIN
            </button>
          </div>
        </div>
      )}

      {/* RETIRED PUMP MODAL (Requirement 29) */}
      {retiredPumpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-[#0E1726] border border-rose-500/50 rounded-3xl shadow-2xl p-6 text-center space-y-4 animate-scaleIn">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-500 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-black text-rose-600 dark:text-rose-400">
                ⚠ EQUIPMENT NOT ACTIVE
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {retiredPumpModal.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setRetiredPumpModal(null);
                setActiveTab('scan');
              }}
              className="w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-black"
            >
              KEMBALI KE SCANNER
            </button>
          </div>
        </div>
      )}

      {/* SKIP MODAL (Requirement 19) */}
      {showSkipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Lewati Titik Pengukuran
              </h3>
              <button type="button" onClick={() => setShowSkipModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Pilih alasan valid mengapa titik ini dilewati. Data akan disimpan sebagai NOT_MEASURED tanpa membuat nilai palsu 0.
            </p>

            <div className="space-y-2">
              {[
                'Pump not running (Mesin mati / standby)',
                'Sensor inaccessible (Titik terhalang)',
                'Sensor damaged (Fisik sensor rusak)',
                'Instrument unavailable (Alat ukur tidak tersedia)',
                'Unsafe to measure (Kondisi area tidak aman)'
              ].map(reason => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => handleSkipMeasurement(reason)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-left text-xs font-semibold hover:bg-cyan-500/10 hover:border-cyan-500"
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REPORT ISSUE MODAL (Requirement 20) */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Laporkan Masalah Sensor
              </h3>
              <button type="button" onClick={() => setShowReportModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Laporan ini mencatat isu teknis sensor ke tim pemeliharaan tanpa memicu status pompa mati.
            </p>

            <div className="space-y-2">
              {[
                'QR damaged (Label QR pudar / rusak)',
                'Sensor damaged (Sensor fisik retak / kabel putus)',
                'Sensor missing (Sensor hilang dari dudukan)',
                'Cannot access (Akses terhalang pipa / scaffolding)'
              ].map(issue => (
                <button
                  key={issue}
                  type="button"
                  onClick={() => handleReportIssue(issue, 'Dilaporkan oleh petugas lapangan saat putaran shift')}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-left text-xs font-semibold hover:bg-amber-500/10 hover:border-amber-500"
                >
                  {issue}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HISTORY DETAIL MODAL */}
      {selectedHistoryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 space-y-3 animate-scaleIn">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Rincian Input Lapangan
              </h3>
              <button type="button" onClick={() => setSelectedHistoryItem(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Titik Ukur:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedHistoryItem.pumpName} • {selectedHistoryItem.channelCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lokasi:</span>
                <span>{selectedHistoryItem.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nilai:</span>
                <span className="text-sm font-black text-cyan-600 dark:text-cyan-400">
                  {selectedHistoryItem.value !== null ? `${selectedHistoryItem.value} ${selectedHistoryItem.unit}` : 'DILEWATI'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kondisi:</span>
                <span className="font-bold">{selectedHistoryItem.condition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Provenance:</span>
                <span>MANUAL • {selectedHistoryItem.quality}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Waktu:</span>
                <span>{selectedHistoryItem.time} WIB</span>
              </div>
              {selectedHistoryItem.notes && (
                <div className="border-t border-slate-200 dark:border-slate-800 pt-1 text-slate-600 dark:text-slate-300 font-sans text-[11px]">
                  Catatan: {selectedHistoryItem.notes}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedHistoryItem(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
