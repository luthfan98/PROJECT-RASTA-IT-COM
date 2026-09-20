import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  UserPlus, Search, Filter, Shield, Key, UserX, UserCheck, Eye,
  RefreshCw, AlertTriangle, ShieldCheck, HardDrive
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface UserItem {
  id: number;
  username: string;
  name: string;
  email: string | null;
  role: 'admin' | 'engineer' | 'operator' | 'petugas';
  status: 'active' | 'inactive';
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UserManagementPageProps {
  onSelectUser: (userId: number) => void;
}

export const UserManagementPage: React.FC<UserManagementPageProps> = ({ onSelectUser }) => {
  const { token } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [summary, setSummary] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    operatorUsers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<UserItem | null>(null);
  const [resetPasswordTarget, setResetPasswordTarget] = useState<UserItem | null>(null);

  // Form States for Add User
  const [addForm, setAddForm] = useState({
    fullName: '',
    username: '',
    email: '',
    role: 'operator',
    password: '',
    confirmPassword: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Reset Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetError, setResetError] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/api/users', {
        params: {
          search: searchQuery.trim() || undefined,
          role: roleFilter !== 'all' ? roleFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        },
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (res.data?.success) {
        setUsers(res.data.data.users || []);
        setSummary(res.data.data.summary || { totalUsers: 0, activeUsers: 0, inactiveUsers: 0, operatorUsers: 0 });
      }
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, roleFilter, statusFilter]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!addForm.fullName.trim() || !addForm.username.trim() || !addForm.password) {
      setFormError('Nama lengkap, Username, dan Password wajib diisi.');
      return;
    }
    if (addForm.password !== addForm.confirmPassword) {
      setFormError('Konfirmasi password tidak cocok.');
      return;
    }
    if (addForm.password.length < 6) {
      setFormError('Password minimal 6 karakter.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post('/api/users', {
        name: addForm.fullName.trim(),
        username: addForm.username.trim(),
        email: addForm.email.trim() || null,
        role: addForm.role,
        password: addForm.password,
        confirmPassword: addForm.confirmPassword,
        status: addForm.status,
      }, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });

      if (res.data?.success) {
        setShowAddModal(false);
        setAddForm({
          fullName: '',
          username: '',
          email: '',
          role: 'operator',
          password: '',
          confirmPassword: '',
          status: 'active',
        });
        await fetchUsers();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Gagal menambahkan pengguna');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async (userItem: UserItem) => {
    const nextStatus = userItem.status === 'active' ? 'inactive' : 'active';
    try {
      await axios.put(`/api/users/${userItem.id}/status`, { status: nextStatus }, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      setDeactivateTarget(null);
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengubah status akun');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    if (!resetPasswordTarget) return;

    if (!newPassword || newPassword.length < 6) {
      setResetError('Password baru minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setResetError('Konfirmasi password baru tidak cocok.');
      return;
    }

    try {
      const res = await axios.put(`/api/users/${resetPasswordTarget.id}/reset-password`, {
        newPassword,
        confirmPassword: confirmNewPassword,
      }, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });

      if (res.data?.success) {
        setResetPasswordTarget(null);
        setNewPassword('');
        setConfirmNewPassword('');
        alert(`Password untuk ${resetPasswordTarget.name} berhasil diperbarui.`);
      }
    } catch (err: any) {
      setResetError(err.response?.data?.message || 'Gagal mereset password');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <ShieldCheck className="w-3 h-3" />
            Admin
          </span>
        );
      case 'engineer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
            <Shield className="w-3 h-3" />
            Engineer
          </span>
        );
      case 'operator':
      case 'petugas':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
            <HardDrive className="w-3 h-3" />
            Operator
          </span>
        );
    }
  };

  const formatLastLogin = (dateStr: string | null) => {
    if (!dateStr) return <span className="text-slate-400 italic">Belum pernah login</span>;
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return `Hari ini ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn pb-12">
      
      {/* 1. PAGE HEADER */}
      <div className="bg-white dark:bg-[#0B132B]/80 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                SECURITY & ACCESS
              </span>
              <span className="text-xs text-slate-400">• RBAC Authorization</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              USER MANAGEMENT
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Kelola akun aplikasi, hak akses peran (*Role-Based Access Control*), dan status otorisasi personil.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchUsers}
              className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-black shadow-md shadow-blue-500/20 hover:brightness-110 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ ADD USER</span>
            </button>
          </div>
        </div>

        {/* 2. SUMMARY METRICS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Users</p>
            <p className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
              {summary.totalUsers}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active</p>
            <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {summary.activeUsers}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Inactive</p>
            <p className="text-2xl font-black font-mono text-slate-600 dark:text-slate-300 mt-1">
              {summary.inactiveUsers}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/20">
            <p className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Field Operators</p>
            <p className="text-2xl font-black font-mono text-cyan-600 dark:text-cyan-400 mt-1">
              {summary.operatorUsers}
            </p>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & FILTERS */}
      <div className="bg-white dark:bg-[#0B132B]/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama pengguna, username, atau email..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-bold hidden md:inline">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 dark:text-slate-300"
            >
              <option value="all">Semua Role</option>
              <option value="admin">Admin</option>
              <option value="engineer">Engineer</option>
              <option value="operator">Operator Lapangan</option>
            </select>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-bold hidden md:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 dark:text-slate-300"
            >
              <option value="all">Semua Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. USERS LIST — DESKTOP TABLE & MOBILE CARDS */}
      
      {/* Desktop Table (md:block) */}
      <div className="hidden md:block bg-white dark:bg-[#0B132B]/80 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-800/30">
              <th className="py-3.5 px-6">Pengguna</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Last Login</th>
              <th className="py-3.5 px-4">Terdaftar</th>
              <th className="py-3.5 px-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-500" />
                  <span>Memuat daftar pengguna...</span>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  Tidak ada pengguna yang cocok dengan kriteria pencarian.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr 
                  key={u.id}
                  onClick={() => onSelectUser(u.id)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                >
                  {/* User info */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 text-sm shrink-0">
                        {u.name?.charAt(0) || u.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors">
                          {u.name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          @{u.username} {u.email && `• ${u.email}`}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-4 px-4">
                    {getRoleBadge(u.role)}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    {u.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        INACTIVE
                      </span>
                    )}
                  </td>

                  {/* Last Login */}
                  <td className="py-4 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                    {formatLastLogin(u.last_login_at)}
                  </td>

                  {/* Created At */}
                  <td className="py-4 px-4 font-mono text-[11px] text-slate-400">
                    {new Date(u.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectUser(u.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Lihat Detail & Aktivitas"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setResetPasswordTarget(u);
                          setNewPassword('');
                          setConfirmNewPassword('');
                          setResetError('');
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                        title="Reset Password"
                      >
                        <Key className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeactivateTarget(u)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          u.status === 'active'
                            ? 'text-slate-400 hover:text-rose-500 hover:bg-rose-500/10'
                            : 'text-emerald-500 hover:bg-emerald-500/10'
                        }`}
                        title={u.status === 'active' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                      >
                        {u.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List (md:hidden) */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 bg-white dark:bg-[#0B132B] rounded-2xl border border-slate-200 dark:border-slate-800">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-500" />
            <span>Memuat data pengguna...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white dark:bg-[#0B132B] rounded-2xl border border-slate-200 dark:border-slate-800">
            Tidak ada pengguna ditemukan.
          </div>
        ) : (
          users.map((u) => (
            <div
              key={u.id}
              onClick={() => onSelectUser(u.id)}
              className="p-4 rounded-2xl bg-white dark:bg-[#0B132B] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 active:scale-[0.99] transition-transform"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-700 dark:text-slate-200">
                    {u.name?.charAt(0) || u.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {u.name}
                    </h3>
                    <p className="text-xs font-mono text-slate-400">
                      @{u.username}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {getRoleBadge(u.role)}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div>
                  <span className="text-slate-400">Status: </span>
                  <span className={`font-bold ${u.status === 'active' ? 'text-emerald-500' : 'text-slate-500'}`}>
                    {u.status.toUpperCase()}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-500">
                  {formatLastLogin(u.last_login_at)}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onSelectUser(u.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                >
                  Profil & Log →
                </button>
                <button
                  type="button"
                  onClick={() => setDeactivateTarget(u)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    u.status === 'active' 
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' 
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {u.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= MODAL: ADD USER ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132B] rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Tambah Pengguna Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={addForm.fullName}
                  onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                  placeholder="Contoh: Andi Pratama"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/30 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.username}
                    onChange={(e) => setAddForm({ ...addForm, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                    placeholder="andi01"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/30 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Peran (Role) *
                  </label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/30 outline-none font-bold"
                  >
                    <option value="operator">Operator Lapangan</option>
                    <option value="engineer">Engineer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email (Opsional)
                </label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="andi@rasta.it"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/30 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder="Min. 6 karakter"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/30 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Konfirmasi Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={addForm.confirmPassword}
                    onChange={(e) => setAddForm({ ...addForm, confirmPassword: e.target.value })}
                    placeholder="Ulangi password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/30 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status Akun
                </label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={addForm.status === 'active'}
                      onChange={() => setAddForm({ ...addForm, status: 'active' })}
                      className="text-cyan-500"
                    />
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">● Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={addForm.status === 'inactive'}
                      onChange={() => setAddForm({ ...addForm, status: 'inactive' })}
                      className="text-slate-400"
                    />
                    <span className="text-slate-500">○ Inactive</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-black hover:brightness-110 disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'CREATE USER'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DEACTIVATE CONFIRMATION (Requirement 33) ================= */}
      {deactivateTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132B] rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {deactivateTarget.status === 'active' 
                  ? `Nonaktifkan ${deactivateTarget.name}?` 
                  : `Aktifkan Kembali ${deactivateTarget.name}?`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {deactivateTarget.status === 'active' ? (
                  <>
                    Pengguna tidak akan dapat lagi masuk atau menggunakan sistem RASTA.
                    <br />
                    <b className="text-slate-700 dark:text-slate-200">
                      Data historis pengukuran dan log aktivitas TIDAK AKAN dihapus.
                    </b>
                  </>
                ) : (
                  'Pengguna akan dapat kembali melakukan login dan melakukan tugas sesuai peran.'
                )}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeactivateTarget(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={() => handleStatusToggle(deactivateTarget)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-colors ${
                  deactivateTarget.status === 'active'
                    ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/20'
                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                }`}
              >
                {deactivateTarget.status === 'active' ? 'DEACTIVATE USER' : 'ACTIVATE USER'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: RESET PASSWORD ================= */}
      {resetPasswordTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132B] rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Reset Password: {resetPasswordTarget.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setResetPasswordTarget(null)}
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/30 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Konfirmasi Password Baru *
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/30 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setResetPasswordTarget(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black hover:bg-amber-400"
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
