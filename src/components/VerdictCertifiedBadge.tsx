import { CheckCircle, ShieldCheck } from 'lucide-react';

export default function VerdictCertifiedBadge({ className = '', certificateId }: { className?: string, certificateId?: string }) {
  return (
    <div className={`group relative inline-flex flex-col items-center ${className}`}>
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.15)]`}>
        <CheckCircle className="w-3.5 h-3.5" />
        <span>Verdict Certified</span>
      </div>
      
      {certificateId && (
        <div className="absolute top-full mt-2 left-0 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
          <div className="bg-zinc-900 border border-emerald-500/20 px-3 py-2 rounded-lg text-[10px] font-mono text-emerald-400 flex items-center gap-2 shadow-2xl">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span className="uppercase tracking-widest">ID: {certificateId}</span>
          </div>
        </div>
      )}
    </div>
  );
}
