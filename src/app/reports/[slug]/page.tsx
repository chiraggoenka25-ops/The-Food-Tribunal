"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API } from '@/lib/api';
import { FileText, ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';
import { TransparencyReport } from '@/lib/types';

export default function TransparencyReportDetailPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const [report, setReport] = useState<TransparencyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    API.getTransparencyReportBySlug(slug)
       .then(res => setReport(res))
       .catch(() => setError('Document classified or not found.'))
       .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="text-center py-20 text-zinc-500 font-mono">Decrypting file...</div>;
  
  if (error || !report) return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <FileText className="w-20 h-20 text-zinc-700 mb-6" />
      <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Report Not Found</h2>
      <p className="text-zinc-400">{error}</p>
      <button onClick={() => router.back()} className="mt-8 text-blue-400 font-bold uppercase hover:text-blue-300">Return</button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 flex-1 max-w-3xl">
      <Link href="/reports" className="inline-flex items-center text-sm font-bold tracking-widest uppercase text-zinc-500 hover:text-white transition-colors mb-12 group">
         <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
         Back to Archive
      </Link>

      <div className="mb-12">
         <p className="text-blue-500 font-bold tracking-widest uppercase text-sm mb-4">
            Published {new Date(report.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
         </p>
         <h1 className="text-4xl md:text-5xl font-black text-white leading-[1.1] mb-6">{report.title}</h1>
         
         <div className="flex items-center gap-3 text-zinc-400 border-b border-white/[0.05] pb-8 mb-8">
            <div className="bg-white/10 p-2 rounded-full">
               <User className="w-4 h-4 text-white" />
            </div>
            <div>
               <p className="text-xs uppercase font-bold tracking-wider">Author</p>
               <p className="text-white">{report.users?.name || 'Tribunal Administration'}</p>
            </div>
         </div>
         
         <div className="prose prose-invert prose-blue max-w-none">
            <p className="text-xl text-zinc-300 leading-relaxed font-medium pb-8 border-b border-white/[0.05] mb-8">
               {report.summary}
            </p>
            <div className="text-zinc-400 leading-loose whitespace-pre-wrap">
               {report.content}
            </div>
         </div>
      </div>
    </div>
  );
}
