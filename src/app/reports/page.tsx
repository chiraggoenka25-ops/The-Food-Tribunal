"use strict";
"use client";

import { useEffect, useState } from 'react';
import { API } from '@/lib/api';
import { TransparencyReport } from '@/lib/types';
import { FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function TransparencyReportsPage() {
  const [reports, setReports] = useState<TransparencyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.getTransparencyReports()
       .then(res => setReports(res || []))
       .catch(console.error)
       .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 flex-1 max-w-4xl">
      <div className="flex items-center gap-4 border-b border-white/[0.05] pb-8 mb-12">
        <FileText className="w-10 h-10 text-blue-500" />
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight">Transparency Reports</h1>
          <p className="text-zinc-400">Official tribunal investigations and industry exposés.</p>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-zinc-500 py-12">Retrieving archives...</p>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 border border-white/[0.05] rounded-2xl bg-white/[0.01]">
           <FileText className="w-12 h-12 mx-auto text-zinc-700 mb-4" />
           <p className="text-zinc-400 font-bold uppercase tracking-widest">No reports published yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
           {reports.map((report) => (
             <Link key={report.id} href={`/reports/${report.slug}`} className="block group">
               <div className="glass-card p-8 rounded-2xl border border-white/[0.05] hover:border-blue-500/30 transition-all duration-300">
                  <p className="text-xs text-blue-400 font-bold tracking-widest uppercase mb-2">
                     {new Date(report.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <h2 className="text-2xl font-black text-white mb-3 group-hover:text-blue-400 transition-colors">{report.title}</h2>
                  <p className="text-zinc-400 line-clamp-2 leading-relaxed mb-6">{report.summary}</p>
                  <div className="flex items-center text-white text-sm font-bold tracking-wider uppercase group-hover:gap-2 transition-all">
                     Read Full Report <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
               </div>
             </Link>
           ))}
        </div>
      )}
    </div>
  );
}
