"use client";

import Link from 'next/link';
import { Product, Analysis } from '@/lib/types';
import VerdictBadge from './VerdictBadge';
import VerdictCertifiedBadge from './VerdictCertifiedBadge';
import { ChevronRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  analysis?: Analysis; // Optional if not fetched yet, though in MVP usually fetched together.
}

export default function ProductCard({ product, analysis }: ProductCardProps) {
  // If no analysis is provided directly in the prop, fallback to Risk (just for UI safety)
  const verdict = analysis ? analysis.verdict : 'RISK';
  const score = analysis ? analysis.score : 0;
  
  return (
    <Link href={`/product/${product.barcode}`} className="block group">
      <div className="glass-card rounded-xl p-5 border border-white/[0.05] hover:border-white/20 transition-all duration-300 relative overflow-hidden">
        
        {/* Subtle glow background */}
        <div className={`absolute -right-20 -top-20 w-40 h-40 blur-[80px] opacity-20 rounded-full transition-opacity group-hover:opacity-40
          ${verdict === 'CLEAN' ? 'bg-emerald-500' : verdict === 'CAUTION' ? 'bg-amber-500' : 'bg-red-500'}
        `} />

        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-1 truncate">{product.brand}</p>
            <h3 className="text-lg font-bold text-white truncate">{product.name}</h3>
            
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <VerdictBadge verdict={verdict} />
              {product.verdict_certified && <VerdictCertifiedBadge />}
            </div>

            {analysis && (analysis.risks.length > 0 || analysis.additives.length > 0) && (
              <p className="text-sm text-zinc-400 mt-3 line-clamp-1">
                Flags: {analysis.risks.concat(analysis.additives).join(', ')}
              </p>
            )}
          </div>
          
          <div className="flex flex-col items-end">
            <div className="text-2xl font-black font-mono text-white tracking-tighter">
              {score}<span className="text-sm text-zinc-600">/100</span>
            </div>
            <div className="mt-6 text-zinc-600 group-hover:text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
