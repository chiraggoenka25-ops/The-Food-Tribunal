"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Activity, BarChart2, ShieldAlert } from 'lucide-react';
import { API } from '@/lib/api';
import { User } from '@/lib/types';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const u = API.getCurrentUser();
    if (!u) {
      router.push('/auth/login');
    } else {
      setUser(u);
    }
  }, [router]);

  const handleLogout = () => {
    API.logout();
    router.push('/');
  };

  if (!user) return null; // Avoid hydration mismatch or flash before redirect

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 flex-1 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-white/[0.05] pb-8">
        <div>
          <p className="text-emerald-400 font-bold uppercase tracking-widest text-sm mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Clearance Verified
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">Intelligence Hub</h1>
          <p className="text-zinc-400 mt-2 text-lg">Welcome back, {user.name}.</p>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.1] px-5 py-3 rounded-lg text-white font-medium hover:bg-white/[0.1] transition-colors self-start md:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Revoke Access</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Mock Stats Cards since API doesn't expose aggregate stats yet */}
        <div className="glass-card p-6 rounded-xl border border-white/[0.05]">
          <Activity className="w-6 h-6 text-zinc-400 mb-4" />
          <h3 className="text-3xl font-black text-white">0</h3>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">Total Scans</p>
        </div>
        
        <div className="glass-card p-6 rounded-xl border-t-2 border-t-emerald-500">
          <BarChart2 className="w-6 h-6 text-emerald-400 mb-4" />
          <h3 className="text-3xl font-black text-white">0</h3>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">Clean Products</p>
        </div>

        <div className="glass-card p-6 rounded-xl border-t-2 border-t-amber-500">
           <ShieldAlert className="w-6 h-6 text-amber-500 mb-4" />
          <h3 className="text-3xl font-black text-white">0</h3>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">Caution Products</p>
        </div>

        <div className="glass-card p-6 rounded-xl border-t-2 border-t-red-500">
           <ShieldAlert className="w-6 h-6 text-red-500 mb-4" />
          <h3 className="text-3xl font-black text-white">0</h3>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">Risk Products</p>
        </div>
      </div>

      <div className="glass-card min-h-[40vh] rounded-2xl flex flex-col items-center justify-center p-8 text-center">
         <Activity className="w-16 h-16 text-zinc-800 mb-6" />
         <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">No Scan History</h3>
         <p className="text-zinc-500 max-w-md mx-auto mb-8">
           You have not activated the Tribunal engine for any products yet. Scan a barcode to build your intelligence profile.
         </p>
         <Link href="/search" className="bg-white text-black font-bold uppercase tracking-wider px-8 py-4 rounded-lg hover:bg-zinc-200 transition-colors">
            Initiate Scan
         </Link>
      </div>

    </div>
  );
}
