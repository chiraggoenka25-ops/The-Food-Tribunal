"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Search, ScanLine, ShieldCheck, Database, Zap, FileText } from "lucide-react";
import VerdictBadge from "@/components/VerdictBadge";

const mockCard = {
  name: "Organic Oat Milk",
  brand: "NATURE'S BEST",
  score: 85,
  verdict: "CLEAN" as const,
  risks: [],
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-background to-background -z-10" />
        
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col space-y-8"
          >
            <div className="inline-flex items-center space-x-2 bg-white/[0.05] border border-white/[0.1] rounded-full px-4 py-1.5 w-fit">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">Independent Food Intelligence</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[1.1]">
              Judging What <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-600">You Eat.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-400 max-w-lg leading-relaxed">
              An independent authority system that scans products, analyzes secret ingredients, and delivers an instant health <strong className="text-white">VERDICT</strong>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/search" className="inline-flex items-center justify-center space-x-2 bg-white text-black px-8 py-4 rounded-lg font-bold hover:bg-zinc-200 transition-colors">
                <Search className="w-5 h-5" />
                <span>Search Database</span>
              </Link>
              <Link href="/dashboard" className="inline-flex items-center justify-center space-x-2 bg-white/[0.05] text-white border border-white/[0.1] px-8 py-4 rounded-lg font-bold hover:bg-white/[0.1] transition-colors">
                <ScanLine className="w-5 h-5" />
                <span>Scan a Product</span>
              </Link>
            </div>
          </motion.div>

          {/* Animated Mockup Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:h-[400px] flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent blur-3xl rounded-full" />
            
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="glass-card w-full max-w-sm rounded-2xl p-6 relative z-10 mx-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs font-bold text-zinc-500 tracking-widest">{mockCard.brand}</p>
                  <h3 className="text-xl font-bold text-white mt-1">{mockCard.name}</h3>
                </div>
                <div className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                  92 / 100
                </div>
              </div>
              <div className="pb-6 border-b border-white/10">
                <VerdictBadge verdict={mockCard.verdict} large />
              </div>
              <div className="pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Harmful Additives</span>
                  <span className="text-white font-medium">None</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Nutritional Profile</span>
                  <span className="text-emerald-400 font-medium">Excellent</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CREDIBILITY STRIP */}
      <section className="border-y border-white/[0.05] bg-white/[0.02] py-10">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex items-center space-x-3 text-zinc-400">
            <ShieldCheck className="w-5 h-5 text-white" />
            <span className="font-medium text-sm md:text-base">Unbiased Scoring</span>
          </div>
          <div className="flex items-center space-x-3 text-zinc-400">
            <Database className="w-5 h-5 text-white" />
            <span className="font-medium text-sm md:text-base">Vast Database</span>
          </div>
          <div className="flex items-center space-x-3 text-zinc-400">
            <FileText className="w-5 h-5 text-white" />
            <span className="font-medium text-sm md:text-base">Ingredient Intel</span>
          </div>
          <div className="flex items-center space-x-3 text-zinc-400">
            <Zap className="w-5 h-5 text-white" />
            <span className="font-medium text-sm md:text-base">Instant Analysis</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-32">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-16 uppercase tracking-tight">How the Tribunal Works</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { num: "01", title: "Search or Scan", desc: "Look up any product by name or barcode to initiate a Tribunal review." },
              { num: "02", title: "Deep Analysis", desc: "Our engine breaks down the ingredient list and nutritional values in milliseconds." },
              { num: "03", title: "Receive VERDICT", desc: "We assign a final score and a definitive health verdict to protect your diet." }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-2xl font-black text-white mb-6">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-zinc-400 max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VERDICT CATEGORIES */}
      <section className="py-32 bg-white/[0.02] border-y border-white/[0.05]">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">The Judgment Scale</h2>
            <p className="text-zinc-400 text-lg">We classify every scanned product into three definitive states. No vague answers. Just the truth.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-2xl border-t-2 border-t-emerald-500 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 text-emerald-500 transform group-hover:scale-110 transition-transform">
                <ShieldCheck size={120} />
              </div>
              <VerdictBadge verdict="CLEAN" className="mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Clean & Optimal</h3>
              <p className="text-zinc-400 leading-relaxed">Score: ~80-100. The product is derived from whole ingredients, minimal processing, and possesses a strong nutritional profile.</p>
            </div>
            
            <div className="glass-card p-8 rounded-2xl border-t-2 border-t-amber-500 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 text-amber-500 transform group-hover:scale-110 transition-transform">
                <Zap size={120} />
              </div>
              <VerdictBadge verdict="CAUTION" className="mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Consume with Care</h3>
              <p className="text-zinc-400 leading-relaxed">Score: ~50-79. Contains moderate processing, added sugars, or certain preservatives. Acceptable sparingly.</p>
            </div>
            
            <div className="glass-card p-8 rounded-2xl border-t-2 border-t-red-500 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 text-red-500 transform group-hover:scale-110 transition-transform">
                <AlertTriangle size={120} />
              </div>
              <VerdictBadge verdict="RISK" className="mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">High Risk Profile</h3>
              <p className="text-zinc-400 leading-relaxed">Score: 0-49. Heavily ultra-processed, high in detrimental macros (sugar/trans fats), or packed with artificial additives.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/[0.02] -z-10" />
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight">Demand Transparency</h2>
          <p className="text-xl text-zinc-400 mb-10 leading-relaxed">Join the independent consumer intelligence network. Find out what you are really putting into your body.</p>
          <Link href="/search" className="inline-flex items-center space-x-3 bg-white text-black px-10 py-5 rounded-lg font-bold text-lg hover:bg-zinc-200 transition-colors">
            <span>Access Database</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

// Just to shut up TS about unused AlertTriangle
import { AlertTriangle } from 'lucide-react';
