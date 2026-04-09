"use client";

import { useEffect, useState } from 'react';
import { API } from '@/lib/api';
import { Product, Analysis } from '@/lib/types';
import { Activity, ShieldCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function WatchlistPage() {
  const [risky, setRisky] = useState<Analysis[]>([]);
  const [clean, setClean] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await API.getTrending();
        setRisky(data.riskyProducts || []);
        setClean(data.certifiedProducts || []);
      } catch {
        // Background products might fail temporarily
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 flex-1 max-w-6xl">
      <div className="flex items-center gap-4 border-b border-white/[0.05] pb-8 mb-12">
        <Activity className="w-10 h-10 text-emerald-500" />
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight">Public Watchlist</h1>
          <p className="text-zinc-400">Live tribunal analytics keeping brands accountable globally.</p>
        </div>
      </div>

      {loading ? (
         <div className="text-center text-zinc-500 py-12 font-mono">Compiling regional health telemetry...</div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Risky Pillar */}
          <div>
            <div className="flex items-center gap-3 mb-6 bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
               <AlertTriangle className="w-6 h-6 text-red-500" />
               <h2 className="text-xl font-bold uppercase tracking-widest text-red-400">Most Risky Products</h2>
            </div>
            
            <div className="space-y-4">
              {risky.map((item: Analysis) => (
                <Link key={item.id} href={`/product/${item.products?.barcode}`} className="block">
                  <div className="glass-card p-6 rounded-xl border border-white/[0.05] hover:border-red-500/30 transition-colors flex justify-between items-center group">
                    <div>
                      <p className="text-xs uppercase text-zinc-500 font-bold mb-1">{item.products?.brand}</p>
                      <p className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">{item.products?.name}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-red-500/30 flex items-center justify-center font-bold text-red-400 text-sm">
                      {item.score}
                    </div>
                  </div>
                </Link>
              ))}
              {risky.length === 0 && <p className="text-zinc-500 text-sm">No risky data compiled yet.</p>}
            </div>
          </div>

          {/* Clean Pillar */}
          <div>
            <div className="flex items-center gap-3 mb-6 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
               <ShieldCheck className="w-6 h-6 text-emerald-500" />
               <h2 className="text-xl font-bold uppercase tracking-widest text-emerald-400">Newly Certified</h2>
            </div>
            
            <div className="space-y-4">
              {clean.map((item: Product) => (
                <Link key={item.id} href={`/product/${item.barcode}`} className="block">
                  <div className="glass-card p-6 rounded-xl border border-white/[0.05] hover:border-emerald-500/30 transition-colors flex justify-between items-center group">
                    <div>
                      <p className="text-xs uppercase text-zinc-500 font-bold mb-1">{item.brand}</p>
                      <p className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{item.name}</p>
                    </div>
                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 text-xs font-bold uppercase tracking-wider">
                      Certified
                    </div>
                  </div>
                </Link>
              ))}
              {clean.length === 0 && <p className="text-zinc-500 text-sm">No certified brands found yet.</p>}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
