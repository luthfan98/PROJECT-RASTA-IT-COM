import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, RefreshCw, Calendar, 
  CheckCircle2, AlertTriangle, XCircle, ChevronRight,
  Eye, Layers, ChevronDown, ChevronUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface AuditLogItem {
  id: number;
  user_id: number | null;
  actor_type: 'USER' | 'SYSTEM';
  actor_name: string | null;
  actor_role: string | null;
  action: string;
  module: string;
  entity_type: string | null;
  entity_id: string | null;
  target: string | null;
  description: string | null;
  old_values: any | null;
  new_values: any | null;
  reason: string | null;
  status: 'SUCCESS' | 'FAILED' | 'WARNING';
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export const ActivityLogPage: React.FC = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  // Filter States
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/api/audit-logs', {
        params: {
          search: search.trim() || undefined,
          role: roleFilter !== 'all' ? roleFilter : undefined,
          module: moduleFilter !== 'all' ? moduleFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          page,
          limit: 25,
        },
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });

      if (res.data?.success) {
        setLogs(res.data.data.logs || []);
        setTotalPages(res.data.data.pagination?.totalPages || 1);
      }
    } catch (err: any) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, roleFilter, moduleFilter, statusFilter, startDate, endDate, page]);

  const handleResetFilters = () => {
    setSearch('');
    setRoleFilter('all');
    setModuleFilter('all');
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const getModuleBadge = (moduleName: string) => {
    switch (moduleName) {
      case 'AUTH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">AUTH</span>;
      case 'MEASUREMENT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">MEASUREMENT</span>;
      case 'IMPORT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">IMPORT</span>;
      case 'USER':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">USER</span>;
      case 'SENSOR':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">SENSOR</span>;
      case 'EQUIPMENT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">EQUIPMENT</span>;
      case 'MAINTENANCE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20">MAINTENANCE</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{moduleName}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            SUCCESS
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            WARNING
          </span>
        );
      case 'FAILED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            FAILED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn pb-12">
      
      {/* 1. PAGE HEADER */}
      <div className="bg-white dark:bg-[#0B132B]/80 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                AUDIT TRAIL & PROVENANCE
              </span>
              <span className="text-xs text-slate-400">• Append-Only Log</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              ACTIVITY & AUDIT LOG
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Jejak audit sistem terpusat: siapa melakukan apa, kapan, pada entitas mana, dan apa perubahan nilainya.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchLogs}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Log</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. FILTER & SEARCH CONTROLS */}
      <div className="bg-white dark:bg-[#0B132B]/80 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Cari user (Andi, Ferry), target (Pump C, SNS-021), aksi, atau kata kunci..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
          </div>

          {/* Quick Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Module Filter */}
            <select
              value={moduleFilter}
              onChange={(e) => { setModuleFilter(e.target.value); setPage(1); }}
              className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-slate-700 dark:text-slate-300"
            >
              <option value="all">Semua Modul</option>
              <option value="AUTH">Authentication (AUTH)</option>
              <option value="MEASUREMENT">Measurement</option>
              <option value="IMPORT">Data Import</option>
              <option value="SENSOR">Sensor</option>
              <option value="EQUIPMENT">Equipment</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="USER">User Management</option>
              <option value="CONFIGURATION">Configuration & AI</option>
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-slate-700 dark:text-slate-300"
            >
              <option value="all">Semua Role</option>
              <option value="admin">Admin</option>
              <option value="engineer">Engineer</option>
              <option value="operator">Operator</option>
              <option value="SYSTEM">System / AI</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-slate-700 dark:text-slate-300"
            >
              <option value="all">Semua Status</option>
              <option value="SUCCESS">Success</option>
              <option value="WARNING">Warning</option>
              <option value="FAILED">Failed</option>
            </select>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Date Range Row */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 font-bold flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Rentang Tanggal:
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs"
          />
          <span className="text-slate-400">s/d</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs"
          />
        </div>
      </div>

      {/* 3. ACTIVITY LOG LIST (DESKTOP TABLE & MOBILE CARDS) */}

      {/* Desktop View (md:block) */}
      <div className="hidden md:block bg-white dark:bg-[#0B132B]/80 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-800/30">
              <th className="py-3.5 px-5">Waktu</th>
              <th className="py-3.5 px-4">Pengguna</th>
              <th className="py-3.5 px-4">Aksi / Event</th>
              <th className="py-3.5 px-4">Modul</th>
              <th className="py-3.5 px-5">Target Entitas</th>
              <th className="py-3.5 px-4">Hasil</th>
              <th className="py-3.5 px-4 text-right">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-500" />
                  <span>Memuat catatan jejak audit...</span>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  Tidak ada catatan audit yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                >
                  {/* Timestamp */}
                  <td className="py-3.5 px-5 font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    <div>
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(log.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                    </div>
                  </td>

                  {/* User */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {log.actor_name || 'System / Automated'}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase">
                      {log.actor_role || 'SYSTEM'}
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4">
                    <span className="font-black text-slate-800 dark:text-slate-200">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    {log.description && (
                      <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                        {log.description}
                      </p>
                    )}
                  </td>

                  {/* Module */}
                  <td className="py-3.5 px-4">
                    {getModuleBadge(log.module)}
                  </td>

                  {/* Target */}
                  <td className="py-3.5 px-5 font-mono text-xs text-slate-700 dark:text-slate-300">
                    <div className="font-bold truncate max-w-[220px]">
                      {log.target || '—'}
                    </div>
                    {log.entity_id && (
                      <div className="text-[10px] text-cyan-600 dark:text-cyan-400">
                        {log.entity_id}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {getStatusBadge(log.status)}
                  </td>

                  {/* Action link */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedLog(log)}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-cyan-500 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors"
                      title="Lihat Detail Perubahan"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View (md:hidden) — Requirement 26 */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 bg-white dark:bg-[#0B132B] rounded-2xl border border-slate-200 dark:border-slate-800">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-500" />
            <span>Memuat catatan audit...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white dark:bg-[#0B132B] rounded-2xl border border-slate-200 dark:border-slate-800">
            Tidak ada aktivitas ditemukan.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              onClick={() => setSelectedLog(log)}
              className="p-4 rounded-2xl bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5 active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-400">
                  {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                </span>
                {getStatusBadge(log.status)}
              </div>

              <div>
                <div className="font-bold text-xs text-slate-500 dark:text-slate-400">
                  {log.actor_name || 'System'} <span className="text-[10px] uppercase font-mono">({log.actor_role})</span>
                </div>
                <div className="font-black text-sm text-slate-900 dark:text-white mt-0.5">
                  {log.action.replace(/_/g, ' ')}
                </div>
              </div>

              {log.target && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-mono">
                  <div className="text-slate-700 dark:text-slate-300 font-bold">{log.target}</div>
                  {log.entity_id && <div className="text-[10px] text-cyan-500">{log.entity_id}</div>}
                </div>
              )}

              {log.old_values && log.new_values && (
                <div className="p-2 rounded-lg bg-cyan-500/10 text-[11px] text-cyan-700 dark:text-cyan-300 font-bold">
                  Perubahan data tercatat (Before / After)
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                {getModuleBadge(log.module)}
                <span className="font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                  <span>View Detail</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#0B132B]/80 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40"
          >
            ← Previous
          </button>

          <span className="text-slate-500">
            Halaman {page} dari {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}

      {/* ================= MODAL: ACTIVITY & DIFF DETAIL (Requirement 17, 18, 43) ================= */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132B] rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 shadow-2xl space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getModuleBadge(selectedLog.module)}
                  {getStatusBadge(selectedLog.status)}
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {selectedLog.action.replace(/_/g, ' ')}
                </h3>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  {new Date(selectedLog.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>

              <button
                type="button"
                onClick={() => { setSelectedLog(null); setShowRawJson(false); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Actor Info */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                PELAKSANA TINDAKAN (ACTOR)
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {selectedLog.actor_name || 'System Auto-Engine'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Peran: <b className="text-slate-700 dark:text-slate-300 uppercase">{selectedLog.actor_role}</b>
                  </div>
                </div>
                {selectedLog.ip_address && (
                  <div className="text-right font-mono text-[10px] text-slate-400">
                    <div>IP: {selectedLog.ip_address}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Target & Entity */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                TARGET ENTITAS
              </span>
              <div className="font-bold text-slate-900 dark:text-white">
                {selectedLog.target || '—'}
              </div>
              {selectedLog.entity_id && (
                <div className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400">
                  ID: {selectedLog.entity_id} {selectedLog.entity_type && `(${selectedLog.entity_type})`}
                </div>
              )}
              {selectedLog.description && (
                <p className="text-slate-600 dark:text-slate-300 text-xs pt-1 border-t border-slate-200/60 dark:border-slate-800/60 mt-1">
                  {selectedLog.description}
                </p>
              )}
            </div>

            {/* HUMAN-READABLE BEFORE / AFTER DIFF (Requirement 17, 18, 43) */}
            {(selectedLog.old_values || selectedLog.new_values) && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-cyan-500" />
                    <span>PERUBAHAN DATA (BEFORE / AFTER DIFF)</span>
                  </span>
                </div>

                {/* Diff Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* Before */}
                  <div className="p-3 rounded-xl bg-white dark:bg-[#070D1E] border border-rose-500/20">
                    <div className="text-[10px] font-black uppercase text-rose-500 mb-1.5">
                      BEFORE (NILAI SEBELUMNYA)
                    </div>
                    {selectedLog.old_values ? (
                      <div className="space-y-1 font-mono text-xs">
                        {Object.entries(selectedLog.old_values).map(([k, v]) => (
                          <div key={k}>
                            <span className="text-slate-400">{k}: </span>
                            <span className="font-bold text-rose-500">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">— (Entitas Baru / Tidak ada nilai lama)</span>
                    )}
                  </div>

                  {/* After */}
                  <div className="p-3 rounded-xl bg-white dark:bg-[#070D1E] border border-emerald-500/20">
                    <div className="text-[10px] font-black uppercase text-emerald-500 mb-1.5">
                      AFTER (NILAI BARU)
                    </div>
                    {selectedLog.new_values ? (
                      <div className="space-y-1 font-mono text-xs">
                        {Object.entries(selectedLog.new_values).map(([k, v]) => (
                          <div key={k}>
                            <span className="text-slate-400">{k}: </span>
                            <span className="font-bold text-emerald-500">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">—</span>
                    )}
                  </div>
                </div>

                {/* Reason for Correction */}
                {selectedLog.reason && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
                    <span className="font-black text-amber-700 dark:text-amber-300 block mb-0.5">
                      ALASAN KOREKSI / PERUBAHAN:
                    </span>
                    <span className="text-slate-800 dark:text-slate-200">
                      "{selectedLog.reason}"
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Raw JSON Accordion (For Advanced Audit Deep Dive) */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setShowRawJson(!showRawJson)}
                className="flex items-center justify-between w-full font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <span>Inspeksi Raw JSON Payload</span>
                {showRawJson ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showRawJson && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-950 text-cyan-400 font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-800">
                  <pre>{JSON.stringify(selectedLog, null, 2)}</pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => { setSelectedLog(null); setShowRawJson(false); }}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
