"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API } from '@/lib/api';
import { User, Certification, TribunalReport, AuditLog } from '@/lib/types';
import { ShieldAlert, XCircle, FileText, Lock, Activity, AlertTriangle, ShieldCheck, UserPlus, Clock, Filter } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  
  // Data
  const [certs, setCerts] = useState<Certification[]>([]);
  const [reports, setReports] = useState<TribunalReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [inspectors, setInspectors] = useState<User[]>([]);
  
  // State
  const [activeTab, setActiveTab] = useState<'CERTS' | 'MODERATION' | 'PUBLISH' | 'AUDIT'>('CERTS');
  const [loading, setLoading] = useState(true);

  // Publish Form
  const [reportTitle, setReportTitle] = useState('');
  const [reportSlug, setReportSlug] = useState('');
  const [reportSummary, setReportSummary] = useState('');
  const [reportContent, setReportContent] = useState('');

  useEffect(() => {
    const u = API.getCurrentUser();
    if (!u || u.role !== 'ADMIN') {
      router.push('/');
    } else {
      setUser(u);
      loadData();
    }
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [certsData, reportsData, auditData, inspectorData] = await Promise.all([
        API.getCertifications().catch(() => []),
        API.getAdminReports().catch(() => []),
        API.getAuditLogs().catch(() => []),
        API.getInspectors().catch(() => [])
      ]);
      setCerts(certsData || []);
      setReports(reportsData || []);
      setAuditLogs(auditData || []);
      setInspectors(inspectorData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (certId: string, inspectorId: string) => {
    if (!inspectorId) return;
    try {
      await API.assignInspector(certId, inspectorId);
      loadData(); 
    } catch (err) { alert(err instanceof Error ? err.message : 'Error assigning'); }
  };

  const handleDecision = async (certId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      await API.submitDecision(certId, action);
      loadData();
    } catch (err) { alert(err instanceof Error ? err.message : 'Error decision'); }
  };

  const handleReportStatus = async (reportId: string, status: string, is_flagged: boolean) => {
    try {
      await API.updateReportStatus(reportId, status, is_flagged);
      loadData();
    } catch (err) { alert(err instanceof Error ? err.message : 'Error status'); }
  };

  const handlePublish = async () => {
    try {
      await API.publishTransparencyReport({
        title: reportTitle, slug: reportSlug, summary: reportSummary, content: reportContent
      });
      alert('TRIBUNAL NOTICE: Transparency Report authorized and released.');
      setReportTitle(''); setReportSlug(''); setReportSummary(''); setReportContent('');
      loadData();
    } catch (err) { alert(err instanceof Error ? err.message : 'Error publishing'); }
  };

  if (!user || user.role !== 'ADMIN') return null;

  const pendingPriority = certs.filter(c => c.status === 'PENDING');
  const activeReports = reports.filter(r => r.status === 'OPEN' || r.is_flagged);

  return (
    <div className="container mx-auto px-4 py-12 flex-1 max-w-7xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-white/[0.05] pb-12 mb-12">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
             <ShieldAlert className="w-12 h-12 text-red-500" />
          </div>
          <div>
            <h1 className="text-5xl font-black text-white uppercase tracking-tighter">Tribunal Command</h1>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em] mt-2">Authority Oversight & Sovereignty Interface</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-zinc-900 border border-white/5 rounded-2xl">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black text-zinc-400 font-mono uppercase tracking-widest">Operator: {user.name}</span>
        </div>
      </div>

      {loading ? (
          <div className="py-40 text-center"><Activity className="w-10 h-10 animate-spin text-zinc-800 mx-auto" /></div>
      ) : (
        <>
            {/* PRIORITY MONITOR (Moderation Feed) */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="glass-card p-6 rounded-2xl border border-white/[0.05] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity"><Clock className="w-16 h-16" /></div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Priority Certifications</p>
                    <h3 className="text-4xl font-black text-white">{pendingPriority.length}</h3>
                    <p className="text-[10px] text-zinc-600 mt-2 uppercase font-bold">Unassigned PENDING queue</p>
                </div>
                <div className="glass-card p-6 rounded-2xl border border-white/[0.05] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity"><AlertTriangle className="w-16 h-16" /></div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Active Misconduct</p>
                    <h3 className="text-4xl font-black text-red-500">{activeReports.length}</h3>
                    <p className="text-[10px] text-zinc-600 mt-2 uppercase font-bold">Flagged or OPEN reports</p>
                </div>
                <div className="glass-card p-6 rounded-2xl border border-white/[0.05] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity"><Activity className="w-16 h-16" /></div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Registry Load</p>
                    <h3 className="text-4xl font-black text-emerald-500">{certs.length}</h3>
                    <p className="text-[10px] text-zinc-600 mt-2 uppercase font-bold">Total Certification Tracking</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-8 mb-10 border-b border-white/[0.05]">
                {['CERTS', 'MODERATION', 'PUBLISH', 'AUDIT'].map((t) => (
                    <button key={t} onClick={() => setActiveTab(t as 'CERTS' | 'MODERATION' | 'PUBLISH' | 'AUDIT')} className={`pb-5 font-black uppercase tracking-[0.2em] text-xs transition-all border-b-4 ${activeTab === t ? 'border-red-500 text-white' : 'border-transparent text-zinc-600 hover:text-zinc-400'}`}>
                        {t}
                    </button>
                ))}
            </div>

            {activeTab === 'CERTS' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Filter className="w-4 h-4" /> Certification Registry</h2>
                    </div>
                    <div className="glass-card rounded-2xl border border-white/[0.05] overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/[0.02] border-b border-white/[0.05]">
                                    <th className="p-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Case Source</th>
                                    <th className="p-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Authority Status</th>
                                    <th className="p-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Inspector Assignment</th>
                                    <th className="p-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Command</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.05]">
                                {certs.map(c => (
                                    <tr key={c.id} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="p-6">
                                            <p className="text-white font-black text-sm uppercase">{c.products?.name}</p>
                                            <p className="text-[9px] text-zinc-600 font-mono mt-1">UUID: {c.id.substring(0,12)}</p>
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded border ${
                                                c.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                                c.status === 'PENDING' ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' : 
                                                'bg-zinc-800 text-zinc-400 border-white/5'
                                            }`}>{c.status}</span>
                                        </td>
                                        <td className="p-6">
                                            {c.status === 'PENDING' ? (
                                                <div className="flex items-center gap-3">
                                                    <select 
                                                        onChange={(e) => handleAssign(c.id, e.target.value)}
                                                        className="bg-black border border-white/10 text-[10px] font-black uppercase text-zinc-400 p-2 rounded-lg outline-none focus:ring-1 focus:ring-red-500 transition-all"
                                                        defaultValue=""
                                                    >
                                                        <option value="" disabled>SELECT AGENT</option>
                                                        {inspectors.map(idx => <option key={idx.id} value={idx.id}>{idx.name}</option>)}
                                                    </select>
                                                    <UserPlus className="w-4 h-4 text-zinc-700" />
                                                </div>
                                            ) : (
                                                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Assigned: {c.inspector_id?.substring(0,8) || 'SYSTEM'}</p>
                                            )}
                                        </td>
                                        <td className="p-6">
                                            {c.status === 'INSPECTED' && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleDecision(c.id, 'APPROVE')} className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg text-emerald-500 transition-all"><ShieldCheck className="w-5 h-5" /></button>
                                                    <button onClick={() => handleDecision(c.id, 'REJECT')} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500 transition-all"><XCircle className="w-5 h-5" /></button>
                                                </div>
                                            )}
                                            {c.status === 'APPROVED' && <div className="p-2 bg-zinc-900 border border-white/5 rounded-lg text-zinc-600"><ShieldCheck className="w-5 h-5" /></div>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {certs.length === 0 && <div className="p-20 text-center"><p className="text-zinc-600 uppercase font-black text-xs tracking-[0.5em]">No Global Requests</p></div>}
                    </div>
                </div>
            )}

            {activeTab === 'MODERATION' && (
                <div className="space-y-6">
                    <div className="glass-card rounded-2xl border border-white/[0.05] overflow-hidden">
                        <div className="p-6 bg-red-500/5 border-b border-white/[0.05] flex justify-between items-center">
                            <h2 className="text-xs font-black uppercase text-red-500 tracking-widest flex items-center gap-2"><Activity className="w-4 h-4" /> Misconduct Feed</h2>
                        </div>
                        <div className="divide-y divide-white/[0.05]">
                            {reports.map(r => (
                                <div key={r.id} className={`p-6 flex items-center justify-between transition-all ${r.is_flagged ? 'bg-red-500/[0.03]' : 'hover:bg-white/[0.01]'}`}>
                                    <div className="flex items-center gap-6">
                                        <div className={`p-3 rounded-xl border ${r.is_flagged ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-zinc-900 border-white/5 text-zinc-600'}`}>
                                            <ShieldAlert className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-white font-black text-sm uppercase">{r.products?.name}</p>
                                            <p className="text-[10px] text-zinc-500 font-mono mt-1">{r.report_type} | BY: {r.users?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <select 
                                            value={r.status}
                                            onChange={(e) => handleReportStatus(r.id, e.target.value, r.is_flagged)}
                                            className="bg-black border border-white/10 text-[10px] font-black uppercase text-zinc-400 p-2 rounded-lg outline-none transition-all"
                                        >
                                            <option value="OPEN">OPEN</option>
                                            <option value="UNDER_REVIEW">REVIEW</option>
                                            <option value="RESOLVED">RESOLVED</option>
                                        </select>
                                        <button onClick={() => handleReportStatus(r.id, r.status, !r.is_flagged)} className={`p-3 rounded-xl transition-all ${r.is_flagged ? 'bg-red-500 text-white' : 'bg-white/5 text-zinc-700 hover:text-red-500'}`}>
                                            <AlertTriangle className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {reports.length === 0 && <div className="p-20 text-center"><p className="text-zinc-600 uppercase font-black text-xs tracking-[0.5em]">Registry Clear</p></div>}
                    </div>
                </div>
            )}

            {activeTab === 'AUDIT' && (
                <div className="space-y-4">
                    <div className="glass-card rounded-2xl border border-white/[0.05] overflow-hidden">
                        <div className="p-6 bg-emerald-500/5 border-b border-white/[0.05] flex items-center gap-3">
                            <Activity className="w-5 h-5 text-emerald-500" />
                            <h2 className="text-xs font-black uppercase text-emerald-500 tracking-widest">Forensic Ledger</h2>
                        </div>
                        <div className="divide-y divide-white/[0.02]">
                            {auditLogs.map(l => (
                                <div key={l.id} className="p-6 flex items-center justify-between hover:bg-white/[0.01] transition-all">
                                    <div className="flex gap-6 items-center">
                                        <div className="p-3 bg-zinc-900 border border-white/5 rounded-xl"><ShieldCheck className="w-4 h-4 text-zinc-600" /></div>
                                        <div>
                                            <p className="text-xs font-black text-white uppercase tracking-widest">{l.action_type}</p>
                                            <p className="text-[10px] text-zinc-600 font-mono mt-1">OPERATOR: {l.actor_role} ({l.actor_user_id?.substring(0,8)})</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-zinc-700 font-mono">{new Date(l.created_at).toLocaleString()}</p>
                                        <p className="text-[9px] text-emerald-500/40 uppercase font-bold mt-1 tracking-tighter">SECURE LOG ENTRY</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'PUBLISH' && (
                <div className="max-w-4xl mx-auto glass-card rounded-2xl border border-white/[0.05] p-10">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20"><FileText className="w-8 h-8 text-blue-500" /></div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight text-white leading-tight">Authorize Transparency Release</h2>
                            <p className="text-zinc-500 text-xs font-mono mt-1 uppercase tracking-widest">Global Protocol CMS</p>
                        </div>
                    </div>
                    <div className="space-y-8">
                        <div>
                            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Target Headline</label>
                            <input className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl p-5 text-white font-black text-lg outline-none focus:ring-1 focus:ring-blue-500 transition-all" value={reportTitle} onChange={e => setReportTitle(e.target.value)} />
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Permanent Slug</label>
                                <input className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl p-5 text-white font-mono text-sm" value={reportSlug} onChange={e => setReportSlug(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Classification</label>
                                <div className="w-full bg-zinc-900/10 border border-white/5 rounded-2xl p-5 text-zinc-700 font-mono text-xs uppercase tracking-widest">Global_Authority_Drop</div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Intelligence Summary</label>
                            <textarea className="w-full h-24 bg-zinc-900/50 border border-white/10 rounded-2xl p-5 text-zinc-400 font-medium outline-none focus:ring-1 focus:ring-blue-500 transition-all resize-none" value={reportSummary} onChange={e => setReportSummary(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Full Report Content (Markdown Enabled)</label>
                            <textarea className="w-full h-64 bg-zinc-900/50 border border-white/10 rounded-2xl p-5 text-white font-mono text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-all" value={reportContent} onChange={e => setReportContent(e.target.value)} />
                        </div>
                        <button onClick={handlePublish} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.3em] py-6 rounded-2xl transition-all shadow-2xl shadow-blue-600/20 flex items-center justify-center gap-4">
                            <Lock className="w-5 h-5" /> Authorize Release
                        </button>
                    </div>
                </div>
            )}
        </>
      )}
    </div>
  );
}
