"use client";

import { useState, useEffect, useMemo } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { API } from '@/lib/api';
import { Product, Analysis } from '@/lib/types';
import ProductCard from '@/components/ProductCard';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, Analysis>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all products on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await API.getProducts();
        setProducts(data || []);
        
        // In a real app with large data, we evaluate per product or fetch joined data
        // Since we need to show verdict, we try to fetch analysis for all.
        // For MVP frontend speed, let's just make parallel calls or just show RISKs if not fetched yet.
        // To be safe and premium, let's fetch them
        const analysesMap: Record<string, Analysis> = {};
        await Promise.all(
          (data || []).map(async (p) => {
            try {
              const an = await API.getAnalysis(p.id);
              analysesMap[p.id] = an;
            } catch {
              // Ignore if not analyzed yet
            }
          })
        );
        setAnalyses(analysesMap);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load database.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!query) return products;
    const lowerQ = query.toLowerCase();
    return products.filter(
      p => p.name.toLowerCase().includes(lowerQ) || 
           p.brand.toLowerCase().includes(lowerQ) || 
           p.barcode.includes(lowerQ)
    );
  }, [query, products]);

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 flex-1">
      <div className="max-w-2xl mx-auto mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">Product Database</h1>
        <p className="text-zinc-400">Search the tribunal&apos;s active known database by name, brand, or exact barcode.</p>
        
        <div className="mt-8 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-500" />
          </div>
          <input
            type="text"
            className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl py-4 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-medium"
            placeholder="Enter product name or barcode..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-zinc-500 animate-spin mb-4" />
          <p className="text-zinc-400 font-medium tracking-widest uppercase text-sm">Querying Database...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-400 bg-red-500/10 rounded-xl border border-red-500/20 max-w-2xl mx-auto">
          {error}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              analysis={analyses[product.id]} 
            />
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-20 text-center flex flex-col items-center glass-card rounded-xl">
              <Search className="w-12 h-12 text-zinc-700 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">No Results in Known Registry</h3>
              <p className="text-zinc-500 max-w-sm mx-auto mb-8">
                The barcode &quot;{query}&quot; has not been judged by the Tribunal yet. Would you like to initiate a deep scan?
              </p>
              {query.length >= 8 && (
                <button 
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const result = await API.scanProduct(query);
                      if (result.product && result.product.barcode) {
                        window.location.href = `/product/${result.product.barcode}`;
                      }
                    } catch (err: any) {
                      setError(err.message || "Engine failure during scan.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="bg-white text-black font-bold uppercase tracking-wider px-8 py-4 rounded-lg hover:bg-zinc-200 transition-all flex items-center gap-2"
                >
                  <Loader2 className={`w-4 h-4 animate-spin ${!loading && 'hidden'}`} />
                  Initiate Intelligence Scan
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
