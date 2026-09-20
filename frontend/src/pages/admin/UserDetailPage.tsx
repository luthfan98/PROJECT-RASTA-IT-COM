import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ArrowLeft, Shield, ShieldCheck, HardDrive, Key, UserX, UserCheck, 
  Edit3, CheckCircle2, XCircle, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserItem } from './UserManagementPage';

interface UserDetailPageProps {
  userId: number;
  onBack: () => void;
}

export const UserDetailPage: React.FC<UserDetailPageProps> = ({ userId, onBack }) => {
  const { token } = useAuth();
  const [userData, setUserData] = useState<UserItem | null>(null);
  const [operationalStats, setOperationalStats] = useState({
    totalMeasurements: 0,
    todayMeasurements: 0,
    lastMeasurementAt: null as string | null,
  });
  const [activityTimeline, setActivityTimeline] = useState<any[]>([]);
  const [recentMeasurements, setRecentMeasurements] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'measurements' | 'logins'>('overview');

  // Edit User Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'operator',
    status: 'active' as 'active' | 'inactive',
  });

  // Reset Password Modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');

  const fetchDetail = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/users/${userId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      if (res.data?.success) {
        const d = res.data.data;
        setUserData(d.user);
        setOperationalStats(d.operationalStats || { totalMeasurements: 0, todayMeasurements: 0, lastMeasurementAt: null });
        setActivityTimeline(d.activityTimeline || []);
        setRecentMeasurements(d.recentMeasurements || []);
        setLoginHistory(d.loginHistory || []);

        setEditForm({
          name: d.user.name || '',
          email: d.user.email || '',
          role: d.user.role || 'operator',
          status: d.user.status || 'active',
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch user details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [userId]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`/api/users/${userId}`, editForm, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      setShowEditModal(false);
      await fetchDetail();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memperbarui data pengguna');
    }
  };

  const handleStatusToggle = async () => {
    if (!userData) return;
    const nextStatus = userData.status === 'active' ? 'inactive' : 'active';
    const confirmMsg = userData.status === 'active'
      ? `Nonaktifkan ${userData.name}? Pengguna tidak akan dapat mengakses sistem, namun seluruh data historis dan pengukuran tetap tersimpan utuh.`
      : `Aktifkan kembali ${userData.name}?`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      await axios.put(`/api/users/${userId}/status`, { status: nextStatus }, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      await fetchDetail();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengubah status');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    if (!newPassword || newPassword.length < 6) {
      setResetError('Password minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Konfirmasi password tidak cocok.');
      return;
    }

    try {
      await axios.put(`/api/users/${userId}/reset-password`, {
        newPassword,
        confirmPassword,
      }, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      setShowResetModal(false);
      setNewPassword('');
      setConfirmPassword('');
      alert('Password berhasil direset.');
    } catch (err: any) {
      setResetError(err.response?.data?.message || 'Gagal mereset password');
    }
  };

  if (isLoading || !userData) {
    return (
      <div className="bg-white dark:bg-[#0B132B] rounded-3xl p-12 text-center text-slate-400 border border-slate-200 dark:border-slate-800">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-cyan-500" />
        <p className="text-sm font-bold">Memuat profil pengguna & riwayat jejak audit...</p>
      </div>
    );
  }

  const isOperator = userData.role === 'operator' || userData.role === 'petugas';

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn pb-12">
      
      {/* Top Back Navigation */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 w-fit transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>← Kembali ke User Management</span>
      </button>

      {/* 1. USER PROFILE HEADER */}
      <div className="bg-white dark:bg-[#0B132B]/80 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
              {userData.name?.charAt(0) || userData.username.charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {userData.name}
                </h1>
                
                {userData.role === 'admin' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                    <ShieldCheck className="w-3 h-3" />
                    Admin
                  </span>
                )}
                {userData.role === 'engineer' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                    <Shield className="w-3 h-3" />
                    Engineer
                  </span>
                )}
                {isOperator && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                    <HardDrive className="w-3 h-3" />
                    Field Operator
                  </span>
                )}

                {userData.status === 'active' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ACTIVE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    INACTIVE
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                <span>@{userData.username}</span>
                {userData.email && (
                  <>
                    <span>•</span>
                    <span>{userData.email}</span>
                  </>
                )}
                <span>•</span>
                <span>Terdaftar: {new Date(userData.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit User</span>
            </button>

            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-colors"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Reset Password</span>
            </button>

            <button
              type="button"
              onClick={handleStatusToggle}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                userData.status === 'active'
                  ? 'border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
                  : 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
              }`}
            >
              {userData.status === 'active' ? (
                <>
                  <UserX className="w-3.5 h-3.5" />
                  <span>Deactivate</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Activate</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 overflow-x-auto text-xs font-bold">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'activity', label: `Activity (${activityTimeline.length})` },
          { id: 'measurements', label: `Measurements (${recentMeasurements.length})` },
          { id: 'logins', label: `Login History (${loginHistory.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. TAB CONTENT */}

      {/* --- TAB: OVERVIEW --- */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Account Details Card */}
            <div className="bg-white dark:bg-[#0B132B]/80 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                INFORMASI AKUN
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-400 font-bold">Username:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">@{userData.username}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-400 font-bold">Email:</span>
                  <span className="text-slate-800 dark:text-slate-200">{userData.email || '—'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-400 font-bold">Peran Akses:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{userData.role}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-400 font-bold">Terdaftar:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono">
                    {new Date(userData.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400 font-bold">Last Login:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono">
                    {userData.last_login_at 
                      ? new Date(userData.last_login_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Operational Metrics (Informational/Audit Data) */}
            <div className="bg-white dark:bg-[#0B132B]/80 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>OPERASIONAL LAPANGAN HARI INI</span>
                <span className="text-[10px] text-slate-400 font-normal">Audit Trait Record</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/20 text-center">
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Input Hari Ini</p>
                  <p className="text-2xl font-black font-mono text-cyan-600 dark:text-cyan-400 mt-1">
                    {operationalStats.todayMeasurements}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Pengukuran manual</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Total Historis</p>
                  <p className="text-2xl font-black font-mono text-slate-800 dark:text-slate-200 mt-1">
                    {operationalStats.totalMeasurements}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Sepanjang waktu</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-400">Pengukuran Terakhir:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {operationalStats.lastMeasurementAt 
                    ? new Date(operationalStats.lastMeasurementAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Belum ada input hari ini'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Preview: Recent Activity Timeline */}
          <div className="bg-white dark:bg-[#0B132B]/80 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                LINIMASA AKTIVITAS TERKINI (USER TIMELINE)
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('activity')}
                className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                Lihat Selengkapnya →
              </button>
            </div>

            {activityTimeline.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">Belum ada catatan aktivitas untuk pengguna ini.</p>
            ) : (
              <div className="space-y-2.5 pt-2">
                {activityTimeline.slice(0, 5).map((act, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs">
                    <span className="font-mono text-slate-400 font-bold shrink-0 pt-0.5">
                      {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 dark:text-white">
                          {act.action.replace('_', ' ')}
                        </span>
                        {act.target && (
                          <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400">
                            • {act.target}
                          </span>
                        )}
                      </div>
                      {act.description && (
                        <p className="text-slate-500 text-[11px] mt-0.5 truncate">
                          {act.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB: ACTIVITY TIMELINE --- */}
      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-[#0B132B]/80 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
            RIWAYAT JEJAK AUDIT PENGGUNA ({userData.name})
          </h3>

          {activityTimeline.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-8 text-center">Belum ada rekaman audit log.</p>
          ) : (
            <div className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 pl-8">
              {activityTimeline.map((act, idx) => (
                <div key={idx} className="relative p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                  <span className="absolute -left-[27px] top-4 w-3.5 h-3.5 rounded-full bg-cyan-500 ring-4 ring-white dark:ring-slate-950" />
                  
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                        {act.module}
                      </span>
                      <span className="font-black text-slate-900 dark:text-white">
                        {act.action.replace('_', ' ')}
                      </span>
                    </div>

                    <span className="font-mono text-[11px] text-slate-400">
                      {new Date(act.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {act.target && (
                    <div className="text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                      Target: <b>{act.target}</b>
                    </div>
                  )}

                  {act.description && (
                    <p className="text-slate-500 text-[11px]">
                      {act.description}
                    </p>
                  )}

                  {act.reason && (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px]">
                      Alasan: <b>{act.reason}</b>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB: MEASUREMENTS --- */}
      {activeTab === 'measurements' && (
        <div className="bg-white dark:bg-[#0B132B]/80 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
            RIWAYAT PENGUKURAN MANUAL OLEH {userData.name.toUpperCase()}
          </h3>

          {recentMeasurements.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-8 text-center">Pengguna ini belum pernah mencatat pengukuran manual.</p>
          ) : (
            <div className="space-y-3">
              {recentMeasurements.map((m, idx) => {
                const isWarn = m.upper_limit && m.value > m.upper_limit;
                return (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 dark:text-white">
                          {m.slot_code ? `Pump ${m.slot_code}` : m.asset_code}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {m.sensor_name || m.measurement_point}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] font-mono mt-0.5">
                        Waktu Ukur: {new Date(m.measured_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`font-mono font-black text-base ${isWarn ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
                          {m.value} {m.unit || 'mm/s'}
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          isWarn ? 'bg-amber-500/15 text-amber-500' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {isWarn ? 'WARNING' : 'NORMAL'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- TAB: LOGIN HISTORY --- */}
      {activeTab === 'logins' && (
        <div className="bg-white dark:bg-[#0B132B]/80 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
            RIWAYAT SESI LOGIN ({userData.username})
          </h3>

          {loginHistory.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-8 text-center">Belum ada riwayat sesi login tercatat.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loginHistory.map((l, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {l.status === 'SUCCESS' ? (
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                        <XCircle className="w-4 h-4" />
                      </div>
                    )}

                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {l.status === 'SUCCESS' ? 'Login Berhasil' : 'Login Gagal'}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                        <span>IP: {l.ip_address || '127.0.0.1'}</span>
                        {l.user_agent && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[200px] sm:max-w-xs">{l.user_agent}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="font-mono text-slate-500 text-[11px]">
                    {new Date(l.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: EDIT USER ================= */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132B] rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Edit Profil: {userData.name}
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Role / Peran
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                >
                  <option value="operator">Operator Lapangan</option>
                  <option value="engineer">Engineer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-black"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: RESET PASSWORD ================= */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132B] rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Reset Password: {userData.name}
              </h3>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {resetError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
                {resetError}
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Password Baru *
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 karakter"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Konfirmasi Password Baru *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black"
                >
                  Simpan Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
