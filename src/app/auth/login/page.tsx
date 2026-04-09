"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API } from '@/lib/api';
import { Loader2, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await API.login(email, password);
      router.push('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 to-background -z-10" />
      
      <div className="glass-card w-full max-w-lg p-8 md:p-12 rounded-2xl relative">
        <div className="absolute -top-6 -left-6 text-zinc-800/30">
          <Shield size={120} />
        </div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-black uppercase text-white mb-2">Access Portal</h1>
          <p className="text-zinc-400 mb-8">Enter your credentials to access your personal Tribunal records.</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full bg-white/[0.03] border border-white/[0.1] rounded-lg p-3 text-white focus:outline-none focus:border-white/30"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Password</label>
              <input
                type="password"
                required
                className="w-full bg-white/[0.03] border border-white/[0.1] rounded-lg p-3 text-white focus:outline-none focus:border-white/30"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <div className="text-red-400 text-sm font-medium">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-bold uppercase tracking-wider rounded-lg py-4 hover:bg-zinc-200 transition-colors flex justify-center items-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authenticate'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-500">
            No access clearance? <Link href="/auth/signup" className="text-white font-medium hover:underline">Apply here</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
