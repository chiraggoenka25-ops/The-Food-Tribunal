"use client";

import { useState, useEffect, useCallback } from 'react';
import { API } from '@/lib/api';
import { Review, Discussion, User } from '@/lib/types';
import { MessageSquare, Star, AlertOctagon, Send, ShieldAlert, Loader2 } from 'lucide-react';

interface ExposurePanelProps {
  productId: string;
  user: User | null;
}

export default function ExposurePanel({ productId, user }: ExposurePanelProps) {
  const [activeTab, setActiveTab] = useState<'REVIEWS' | 'DISCUSSIONS'>('REVIEWS');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewAggregate, setReviewAggregate] = useState({ total: 0, average: '0.0' });
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [reportCount, setReportCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [discussionContent, setDiscussionContent] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [reportType, setReportType] = useState('MISLEADING_LABEL');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [revData, repCount, discData] = await Promise.all([
        API.getReviews(productId).catch(() => ({ reviews: [], aggregate: { total: 0, average: '0' }})),
        API.getReportCount(productId).catch(() => 0),
        API.getDiscussions(productId).catch(() => [])
      ]);
      setReviews(revData.reviews || []);
      setReviewAggregate(revData.aggregate || { total: 0, average: '0.0' });
      setReportCount(repCount || 0);
      setDiscussions(discData || []);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePostReview = async () => {
    if (!reviewText || submitting) return;
    try {
      setSubmitting(true);
      await API.postReview(productId, ratingInput, 'Consumer Sentiment', reviewText);
      setReviewText('');
      await loadData();
    } catch (err) { alert(err instanceof Error ? err.message : 'Error'); }
    finally { setSubmitting(false); }
  };

  const handlePostDiscussion = async () => {
    if (!discussionContent || submitting) return;
    try {
      setSubmitting(true);
      await API.postDiscussion(productId, 'Investigation Topic', discussionContent);
      setDiscussionContent('');
      await loadData();
    } catch (err) { alert(err instanceof Error ? err.message : 'Error'); }
    finally { setSubmitting(false); }
  };

  const handleReport = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      await API.postReport(productId, reportType, 'Reported via Tribunal Authority Interface');
      alert("TRIBUNAL ALERT: Report filed securely and logged for investigation.");
      setShowReport(false);
      await loadData();
    } catch (err) { alert(err instanceof Error ? err.message : 'Error'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-800 mx-auto" /></div>;

  return (
    <div className="mt-20 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/[0.05] pb-10 mb-10 gap-6">
        <div>
           <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Public Exposure</h2>
           <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Crowdsourced Accountability Registry</p>
        </div>
        <div className="flex gap-4 items-center">
            <div className="px-5 py-2.5 bg-red-500/5 border border-red-500/20 text-red-500 rounded-lg flex items-center gap-3 font-black text-xs uppercase tracking-widest">
               <AlertOctagon className="w-4 h-4" />
               Investigations: {reportCount}
            </div>
            <button onClick={() => setShowReport(true)} className="text-white hover:text-red-500 text-xs font-black uppercase tracking-widest transition-all">Report Misconduct</button>
        </div>
      </div>

      {showReport && (
        <div className="mb-10 p-8 glass-card border border-red-500/20 rounded-2xl max-w-2xl">
           <div className="flex items-center gap-3 mb-6">
              <ShieldAlert className="w-6 h-6 text-red-500" />
              <h3 className="text-red-400 font-black uppercase tracking-widest">Official Misconduct Report</h3>
           </div>
           <select className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-white font-bold mb-6" value={reportType} onChange={e => setReportType(e.target.value)}>
             <option value="MISLEADING_LABEL">Misleading Label / Deceptive Branding</option>
             <option value="HIDDEN_SUGAR">Hidden Sugars / Artificial Sweeteners</option>
             <option value="INGREDIENT_DOUBT">Undisclosed / Hidden Ingredients</option>
             <option value="CHILD_UNSAFE">Found Harmful for Children</option>
             <option value="OTHER">Other Public Health Risk</option>
           </select>
           <div className="flex justify-end gap-6 items-center">
              <button onClick={() => setShowReport(false)} className="text-zinc-500 font-bold uppercase text-xs">Retract</button>
              <button onClick={handleReport} disabled={submitting} className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all">Authorize Filing</button>
           </div>
        </div>
      )}

      <div className="flex gap-10 mb-10 border-b border-white/[0.05]">
        <button onClick={() => setActiveTab('REVIEWS')} className={`pb-5 font-black uppercase tracking-widest text-xs transition-all border-b-4 ${activeTab === 'REVIEWS' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-700'}`}>Consumer Sentiment ({reviewAggregate.total})</button>
        <button onClick={() => setActiveTab('DISCUSSIONS')} className={`pb-5 font-black uppercase tracking-widest text-xs transition-all border-b-4 ${activeTab === 'DISCUSSIONS' ? 'border-purple-500 text-purple-400' : 'border-transparent text-zinc-700'}`}>Open Inquiries ({discussions.length})</button>
      </div>

      {activeTab === 'REVIEWS' && (
        <div className="space-y-10">
           {user && (
             <div className="glass-card p-8 rounded-2xl border border-white/5 bg-zinc-900/40">
                <div className="flex gap-2 mb-6">
                   {[1,2,3,4,5].map(s => <Star key={s} onClick={() => setRatingInput(s)} className={`w-8 h-8 cursor-pointer transition-all ${s <= ratingInput ? 'text-amber-400 fill-amber-400 scale-110' : 'text-zinc-800 hover:text-zinc-600'}`} />)}
                </div>
                <textarea className="w-full h-32 bg-black/50 border border-white/10 rounded-2xl p-6 text-white text-lg placeholder-zinc-700 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" placeholder="Enter witness testimony or findings..." value={reviewText} onChange={e => setReviewText(e.target.value)} />
                <button onClick={handlePostReview} disabled={submitting} className="mt-6 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-50 text-emerald-400 border border-emerald-500/20 px-10 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all">{submitting ? 'Registering...' : 'Seal Verdict'}</button>
             </div>
           )}

           {reviews.length === 0 ? (
               <div className="py-20 text-center glass-card rounded-2xl border border-white/5 border-dashed">
                   <Star className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                   <p className="text-zinc-600 font-black uppercase tracking-widest text-sm">No Consumer Record Found</p>
                   <p className="text-zinc-700 text-xs mt-2 uppercase">Your witness could be the first in our registry.</p>
               </div>
           ) : (
                <div className="grid md:grid-cols-2 gap-8">
                    {reviews.map(rev => (
                    <div key={rev.id} className="p-8 bg-zinc-900/40 border border-white/[0.05] rounded-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <p className="font-black text-white text-xs uppercase tracking-widest">{rev.users?.name}</p>
                            <div className="flex gap-1 text-amber-500">
                                {[...Array(rev.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500" />)}
                            </div>
                        </div>
                        <p className="text-zinc-400 italic text-sm leading-relaxed px-4 border-l-2 border-white/5">&quot;{rev.comment}&quot;</p>
                    </div>
                    ))}
                </div>
           )}
        </div>
      )}

      {activeTab === 'DISCUSSIONS' && (
        <div className="space-y-10">
           {user && (
             <div className="flex gap-6 items-end">
               <div className="flex-1">
                <input className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 text-white placeholder-zinc-700 focus:ring-1 focus:ring-purple-500 outline-none mb-4" placeholder="Initiate a public interrogation..." value={discussionContent} onChange={e => setDiscussionContent(e.target.value)} />
                <p className="text-[10px] text-zinc-700 uppercase font-bold tracking-widest ml-1">PUBLIC RECORDS NOTICE: ALL CONTENT IS LOGGED IN THE TRIBUNAL DATABASE.</p>
               </div>
               <button onClick={handlePostDiscussion} disabled={submitting} className="h-[64px] bg-purple-500/10 hover:bg-purple-500/20 disabled:opacity-50 text-purple-400 border border-purple-500/20 px-10 rounded-2xl flex items-center justify-center transition-all">
                  <Send className="w-6 h-6" />
               </button>
             </div>
           )}

           {discussions.length === 0 ? (
               <div className="py-20 text-center glass-card rounded-2xl border border-white/5 border-dashed">
                   <MessageSquare className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                   <p className="text-zinc-600 font-black uppercase tracking-widest text-sm">No Active Investigations</p>
                   <p className="text-zinc-700 text-xs mt-2 uppercase">Initiate a public inquiry to hold this brand accountable.</p>
               </div>
           ) : (
               <div className="space-y-6">
                   {discussions.map(disc => (
                       <div key={disc.id} className="p-8 bg-zinc-900/40 border border-white/[0.05] rounded-2xl">
                           <div className="flex items-center gap-4 mb-6">
                               <MessageSquare className="w-5 h-5 text-purple-500" />
                               <span className="font-black text-white text-xs uppercase tracking-widest">{disc.users?.name}</span>
                               <span className="text-[10px] text-zinc-600 font-mono italic">REGISTRY_ID: {disc.id.substring(0,8)}</span>
                           </div>
                           <p className="text-zinc-300 leading-relaxed mb-6">{disc.content}</p>
                           {disc.replies && disc.replies.length > 0 && (
                               <div className="pl-8 border-l-2 border-white/10 space-y-6 mt-8">
                                   {disc.replies.map(rep => (
                                       <div key={rep.id}>
                                           <div className="flex items-center gap-2 mb-2">
                                               <span className="font-black text-zinc-500 text-[10px] uppercase">{rep.users?.name}</span>
                                               <span className="text-[9px] text-zinc-700 font-mono">SUPP: {rep.id.substring(0,8)}</span>
                                           </div>
                                           <p className="text-zinc-500 text-sm">{rep.content}</p>
                                       </div>
                                   ))}
                               </div>
                           )}
                       </div>
                   ))}
               </div>
           )}
        </div>
      )}
    </div>
  );
}
