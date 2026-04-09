"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Info, AlertTriangle, CheckCircle, Share2 } from 'lucide-react';
import { API } from '@/lib/api';
import { ScanResult, User } from '@/lib/types';
import VerdictBadge from '@/components/VerdictBadge';
import ScoreRing from '@/components/ScoreRing';
import RiskPill from '@/components/RiskPill';
import VerdictCertifiedBadge from '@/components/VerdictCertifiedBadge';
import ExposurePanel from '@/components/ExposurePanel';

const TELEMETRY_STEPS = [
    "Identifying product in registry...",
    "Parsing ingredients...",
    "Evaluating nutrition profile...",
    "Calculating VERDICT...",
    "Preparing tribunal report..."
];

export default function ProductVerdictPage() {
  const { barcode } = useParams() as { barcode: string };
  const [data, setData] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [telemetryIndex, setTelemetryIndex] = useState(0);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isCertified, setIsCertified] = useState(false);

  useEffect(() => {
    setUser(API.getCurrentUser());
    
    const performScan = async () => {
      try {
        setLoading(true);
        setTelemetryIndex(0);
        const result = await API.scanProduct(barcode);
        setData(result);
        if (result.product.verdict_certified) setIsCertified(true);
      } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Failed to retrieve product verdict.';
          setError(errorMsg);
      } finally {
        // We delay the finish slightly so user sees the final step
        setTimeout(() => setLoading(false), 800);
      }
    };

    performScan();
  }, [barcode]);

  // Branded Telemetry Loop
  useEffect(() => {
    if (loading && telemetryIndex < TELEMETRY_STEPS.length - 1) {
        const timer = setTimeout(() => setTelemetryIndex(i => i + 1), 1200);
        return () => clearTimeout(timer);
    }
  }, [loading, telemetryIndex]);

  const handleApply = async () => {
    if (!user || !data?.product.id) return alert("Forbidden: Login required.");
    try {
      await API.applyForCertification(data.product.id, data.product.brand);
      alert("AUTHORITY ALERT: Application received. Product is now under PENDING investigation.");
    } catch (err) { alert(err instanceof Error ? err.message : 'Error applying'); }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] bg-black">
        <div className="relative w-24 h-24 mb-10">
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-t-2 border-emerald-500 rounded-full"
            />
            <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 border-b-2 border-zinc-800 rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <ShieldAlert className="w-8 h-8 text-zinc-700" />
            </div>
        </div>
        <AnimatePresence mode="wait">
            <motion.div 
                key={telemetryIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center"
            >
                <h2 className="text-xl font-black uppercase tracking-[0.3em] text-white">TRIBUNAL SCAN</h2>
                <p className="text-emerald-500 font-mono text-xs mt-3">{TELEMETRY_STEPS[telemetryIndex]}</p>
            </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <ShieldAlert className="w-20 h-20 text-zinc-800 mb-6" />
        <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Record Missing</h2>
        <p className="text-zinc-500 max-w-md">{error || 'This product is not verified in our registry.'}</p>
      </div>
    );
  }

  const { product, analysis } = data;
  const isRisk = analysis?.verdict === 'RISK';

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 flex-1 max-w-5xl">
      {isRisk && (
        <div className="mb-8 border border-red-500/30 bg-red-500/10 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4">
          <AlertTriangle className="w-10 h-10 text-red-500" />
          <div>
            <h3 className="text-red-500 font-black uppercase tracking-widest text-lg">Public Health Warning</h3>
            <p className="text-red-100/60 text-sm mt-1">Found ultra-processed or harmful ingredients. Usage strictly discouraged by the Tribunal.</p>
          </div>
        </div>
      )}

      {analysis.analysis_source === 'fallback_rule_engine' && (
          <div className="mb-8 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-center gap-3">
              <Info className="w-5 h-5 text-amber-500" />
              <p className="text-xs text-amber-500/80 font-mono uppercase tracking-widest">
                  Preliminary assessment generated using rule-based analysis while advanced intelligence is temporarily unavailable.
              </p>
          </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <p className="text-zinc-500 font-bold uppercase text-xs mb-2 tracking-[0.2em]">{product.brand}</p>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">{product.name}</h1>
          <div className="flex items-center gap-4 mb-8">
             <VerdictBadge verdict={analysis.verdict} large />
             {isCertified && <VerdictCertifiedBadge certificateId={product.certificate_id} />}
          </div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-lg mb-12">
              <button 
                onClick={handleApply}
                disabled={isCertified}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-50 text-emerald-400 border border-emerald-500/20 py-4 rounded-xl flex items-center justify-center gap-2 font-bold uppercase text-xs tracking-widest transition-all"
              >
                 <ShieldAlert className="w-4 h-4" />
                 {isCertified ? 'Case Approved' : 'Apply Certification'}
              </button>
              <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 py-4 rounded-xl flex items-center justify-center gap-2 font-bold uppercase text-xs tracking-widest transition-all">
                 <Share2 className="w-4 h-4" /> Share Verdict
              </button>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center border border-white/[0.05]">
           <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-8">Health Authority Score</p>
           <ScoreRing score={analysis.score} verdict={analysis.verdict} size={180} strokeWidth={14} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-12">
        <div className="glass-card rounded-2xl p-8 border border-white/[0.05]">
          <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
             <AlertTriangle className="w-4 h-4 text-zinc-600" /> Forensic Flags
          </h3>
          <div className="flex flex-wrap gap-3">
              {analysis.risks.map((r, i) => <RiskPill key={i} label={r} type="risk" />)}
              {analysis.additives.map((a, i) => <RiskPill key={i} label={a} type="additive" />)}
              {analysis.risks.length === 0 && <span className="text-emerald-500 flex items-center gap-2 text-sm font-bold uppercase"><CheckCircle className="w-4 h-4" /> No immediate risk flags found in scanned records.</span>}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 border border-white/[0.05]">
           <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Info className="w-4 h-4 text-zinc-600" /> Nutritional Summary
           </h3>
           <div className="grid grid-cols-2 gap-6">
              {Object.entries(product.nutrition).map(([k, v]) => (
                  <div key={k}>
                      <p className="text-[10px] uppercase text-zinc-600 font-black">{k}</p>
                      <p className="text-xl font-mono text-white">{v}</p>
                  </div>
              ))}
           </div>
        </div>

        <div className="md:col-span-2 glass-card rounded-2xl p-8 border border-white/[0.05]">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6">Full Ingredient Analysis</h3>
            <div className="flex flex-wrap gap-2">
                {product.ingredients.split(',').map((ing, i) => (
                    <span key={i} className="px-3 py-1.5 bg-white/[0.03] border border-white/[0.05] rounded text-zinc-400 text-xs font-medium">{ing.trim()}</span>
                ))}
            </div>
        </div>
      </div>

      <ExposurePanel productId={product.id} user={user} />
    </div>
  );
}
