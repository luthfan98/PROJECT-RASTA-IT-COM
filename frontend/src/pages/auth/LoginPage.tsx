import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, UserCheck, Lock, User as UserIcon, ArrowRight, AlertCircle } from 'lucide-react';
import axios from 'axios';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'petugas'>('admin');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRoleSelect = (role: 'admin' | 'petugas') => {
    setSelectedRole(role);
    setErrorMsg(null);
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('petugas');
      setPassword('petugas123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password,
        role: selectedRole,
      });

      if (response.data.success) {
        login(response.data.token, response.data.user);
      } else {
        setErrorMsg(response.data.message || 'Login gagal');
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || 'Gagal terhubung ke backend server Fastify'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background Decorator */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B132B]/10 to-transparent pointer-events-none h-80"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="h-16 px-6 bg-white rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-center mb-3 hover:shadow-md transition-shadow">
            <img src="/logo-tr.png" alt="RASTA Logo" className="h-10 w-auto object-contain" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight">
            RASTA <span className="text-cyan-600">IT COM</span>
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Pilih portal peran Anda untuk masuk ke sistem
          </p>
        </div>

        {/* Role Switcher Pill Container */}
        <div className="mt-8 bg-slate-200/80 p-1.5 rounded-2xl flex items-center shadow-inner border border-slate-300/60">
          <button
            type="button"
            onClick={() => handleRoleSelect('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
              selectedRole === 'admin'
                ? 'bg-[#0B132B] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${selectedRole === 'admin' ? 'text-amber-400' : ''}`} />
            <span>Portal Admin</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('petugas')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
              selectedRole === 'petugas'
                ? 'bg-[#0B132B] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className={`w-4 h-4 ${selectedRole === 'petugas' ? 'text-cyan-400' : ''}`} />
            <span>Portal Petugas</span>
          </button>
        </div>

        {/* Main Card Form */}
        <div className="mt-4 bg-white py-8 px-6 sm:px-10 shadow-lg shadow-slate-200/50 rounded-2xl border border-slate-200/80">
          {/* Banner Role Indicator */}
          <div
            className={`p-3 rounded-xl mb-6 flex items-center gap-3 border ${
              selectedRole === 'admin'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-900'
                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-900'
            }`}
          >
            {selectedRole === 'admin' ? (
              <>
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold">Mode Administrator</p>
                  <p className="text-slate-600">Akses penuh statistik, pengguna & audit penyimpanan.</p>
                </div>
              </>
            ) : (
              <>
                <UserCheck className="w-5 h-5 text-cyan-600 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold">Mode Petugas Lapangan</p>
                  <p className="text-slate-600">Akses tugas lapangan, dokumentasi & upload media terenkripsi.</p>
                </div>
              </>
            )}
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="Masukkan username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="Masukkan password"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 shadow-glow-blue transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Masuk sebagai {selectedRole === 'admin' ? 'Admin' : 'Petugas'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 font-medium mb-2">Akun Demo Standar Bawaan:</p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-left hover:border-amber-400 transition-colors"
              >
                <span className="font-bold text-slate-700 block">Admin:</span>
                <span className="text-slate-500">admin / admin123</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('petugas')}
                className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-left hover:border-cyan-400 transition-colors"
              >
                <span className="font-bold text-slate-700 block">Petugas:</span>
                <span className="text-slate-500">petugas / petugas123</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Fastify Backend + MySQL + React Vite &copy; 2026 RASTA IT COM
        </p>
      </div>
    </div>
  );
};
