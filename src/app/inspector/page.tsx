"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API } from '@/lib/api';
import { User, Certification } from '@/lib/types';
import { ClipboardList, Send } from 'lucide-react';


export default function InspectorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    const u = API.getCurrentUser();
    if (!u || !['INSPECTOR', 'ADMIN'].includes(u.role)) {
      router.push('/');
    } else {
      setUser(u);
      loadData();
    }
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await API.getAssignedCertifications();
      setCerts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotesChange = (id: string, val: string) => {
    setNotes(prev => ({ ...prev, [id]: val }));
  };

  const handleSubmit = async (certId: string) => {
    const note = notes[certId];
    if (!note) return alert("Please enter inspection notes before submitting.");

    try {
      await API.submitReview(certId, note);
      alert("Review submitted to Admin.");
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error submitting review');
    }
  };

  if (!user || !['INSPECTOR', 'ADMIN'].includes(user.role)) return null;

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 flex-1 max-w-4xl">
      <div className="flex items-center gap-4 border-b border-white/[0.05] pb-8 mb-12">
        <ClipboardList className="w-10 h-10 text-purple-500" />
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight">Inspector Desk</h1>
          <p className="text-zinc-400">Review pending certifications and submit your findings.</p>
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="text-zinc-500 text-center py-10 tracking-widest uppercase text-sm font-bold">Fetching assignments...</div>
        ) : certs.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-2xl border-dashed border-2 border-white/5">
            <ClipboardList className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No Active Assignments</h3>
            <p className="text-zinc-500">You are cleared for now. Waiting for Admin dispatch.</p>
          </div>
        ) : (
          certs.map(cert => (
            <div key={cert.id} className="glass-card rounded-2xl p-6 border border-white/[0.05]">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs text-purple-400 uppercase tracking-widest font-bold mb-1">Assigned Case</p>
                  <h3 className="text-xl font-bold text-white">{cert.products?.name}</h3>
                  <p className="text-zinc-400 text-sm">Brand: {cert.brand_name} • Barcode: {cert.products?.barcode}</p>
                </div>
                <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm text-zinc-300 font-mono">
                  {cert.status}
                </div>
              </div>

              {cert.status === 'ASSIGNED' ? (
                <div className="mt-4">
                  <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wide mb-2">Inspection Notes & Recommendation</label>
                  <textarea 
                    className="w-full h-32 bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 resize-none"
                    placeholder="E.g., I have reviewed the ingredients. Recommend APPROVAL."
                    value={notes[cert.id] || ''}
                    onChange={(e) => handleNotesChange(cert.id, e.target.value)}
                  />
                  <div className="mt-4 flex justify-end">
                    <button 
                      onClick={() => handleSubmit(cert.id)}
                      className="flex items-center gap-2 bg-purple-500 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      <Send className="w-4 h-4" /> Submit Report
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-sm font-bold text-zinc-500 uppercase tracking-wide mb-2">Your Submitted Notes</p>
                  <p className="text-zinc-300">{cert.inspector_notes}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
