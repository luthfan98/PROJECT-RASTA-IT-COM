import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  ShieldCheck, UserCheck, Lock, User as UserIcon, 
  ArrowRight, AlertCircle, Sun, Moon, Sparkles 
} from 'lucide-react';
import axios from 'axios';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'petugas'>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRoleSelect = (role: 'admin' | 'petugas') => {
    setSelectedRole(role);
    setErrorMsg(null);
  };

  const handleFillDemo = () => {
    setUsername(selectedRole === 'admin' ? 'admin' : 'petugas');
    setPassword('password123');
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
    <div className={`min-h-screen w-full flex flex-col justify-between py-6 px-4 sm:px-6 transition-colors duration-200 relative overflow-x-hidden ${
      theme === 'dark' ? 'bg-[#070D1E] text-slate-100' : 'bg-[#F0F4F8] text-slate-800'
    }`}>
      {/* Background Decorator */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent pointer-events-none h-96" />

      {/* Top Bar with Theme Switcher */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between relative z-10">
        <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sistem Aktif</span>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0E1726]/90 backdrop-blur-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs transition-all cursor-pointer"
          title={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>

      {/* Main Login Card Container */}
      <div className="w-full max-w-md mx-auto relative z-10 my-auto py-4">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="h-14 px-4 bg-white rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center mb-2.5 transition-transform hover:scale-105">
            <img
              src="/logo-tr.png"
              alt="RASTA Logo"
              className="h-7 w-auto object-contain"
            />
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
            RASTA <span className="text-cyan-600 dark:text-cyan-400">IT COM</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Condition Monitoring & Predictive Maintenance
          </p>
        </div>

        {/* Role Switcher Pill Container */}
        <div className="bg-slate-200/90 dark:bg-slate-800/90 p-1.5 rounded-2xl flex items-center shadow-inner border border-slate-300/60 dark:border-slate-700/60 mb-3.5">
          <button
            type="button"
            onClick={() => handleRoleSelect('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedRole === 'admin'
                ? 'bg-white dark:bg-[#0E1726] text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${selectedRole === 'admin' ? 'text-amber-500' : ''}`} />
            <span>Portal Admin</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('petugas')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedRole === 'petugas'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Portal Petugas</span>
          </button>
        </div>

        {/* Main Card Form */}
        <div className="bg-white dark:bg-[#0E1726] p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-black/50 border border-slate-200/80 dark:border-slate-800/80 transition-all">
          {/* Banner Role Indicator */}
          <div
            className={`p-3 rounded-2xl mb-5 flex items-center gap-3 border ${
              selectedRole === 'admin'
                ? 'bg-amber-500/10 border-amber-500/25 text-amber-900 dark:text-amber-300'
                : 'bg-cyan-500/10 border-cyan-500/25 text-cyan-900 dark:text-cyan-300'
            }`}
          >
            {selectedRole === 'admin' ? (
              <>
                <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold">Mode Administrator</p>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                    Akses penuh dashboard monitoring, ML diagnostics, dan manajemen sensor.
                  </p>
                </div>
              </>
            ) : (
              <>
                <UserCheck className="w-5 h-5 text-cyan-500 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold">Mode Petugas Lapangan</p>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                    Input cepat nilai vibrasi & temperatur sensor melalui scan QR & antrean offline.
                  </p>
                </div>
              </>
            )}
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative rounded-2xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder={selectedRole === 'admin' ? 'admin' : 'petugas'}
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-2xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 shadow-lg shadow-cyan-500/25 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Masuk sebagai {selectedRole === 'admin' ? 'Admin' : 'Petugas'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Quick Fill Helper for Mobile Testing */}
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={handleFillDemo}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Gunakan Akun Demo ({selectedRole === 'admin' ? 'admin' : 'petugas'})</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto text-center relative z-10 pt-2 pb-1">
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          RASTA IT COM &bull; Booster Pump Station Batang HO
        </p>
      </footer>
    </div>
  );
};
