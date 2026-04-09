"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Search, Shield, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { API } from '@/lib/api';
import type { User as UserType } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    setUser(API.getCurrentUser());
  }, [pathname]); // Refresh on route change

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <Shield className="w-6 h-6 text-white group-hover:text-gray-300 transition-colors" />
          <span className="font-bold text-lg tracking-tight uppercase">The Food Tribunal</span>
        </Link>
        
        <div className="flex items-center space-x-6 text-sm font-medium">
          <Link 
            href="/search" 
            className={cn(
              "flex items-center space-x-1.5 transition-colors hover:text-white",
              pathname === '/search' ? 'text-white' : 'text-zinc-400'
            )}
          >
            <Search className="w-4 h-4" />
            <span>Database</span>
          </Link>
          
          <Link 
            href="/watch" 
            className={cn(
              "flex items-center space-x-1.5 transition-colors hover:text-white",
              pathname === '/watch' ? 'text-emerald-400' : 'text-zinc-400'
            )}
          >
            <span>Watchlist</span>
          </Link>

          <Link 
            href="/reports" 
            className={cn(
              "flex items-center space-x-1.5 transition-colors hover:text-white",
              pathname.startsWith('/reports') ? 'text-blue-400' : 'text-zinc-400'
            )}
          >
            <span>Reports</span>
          </Link>
          
          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link 
                  href="/admin"
                  className={cn(
                    "flex items-center space-x-1.5 transition-colors text-amber-500 hover:text-amber-400",
                    pathname === '/admin' ? 'opacity-100' : 'opacity-80'
                  )}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              )}
              {['ADMIN', 'INSPECTOR'].includes(user.role) && (
                <Link 
                  href="/inspector"
                  className={cn(
                    "flex items-center space-x-1.5 transition-colors text-purple-500 hover:text-purple-400",
                    pathname === '/inspector' ? 'opacity-100' : 'opacity-80'
                  )}
                >
                  <User className="w-4 h-4" />
                  <span>Inspector</span>
                </Link>
              )}
              <Link 
                href="/dashboard"
                className={cn(
                  "flex items-center space-x-1.5 transition-colors hover:text-white",
                  pathname === '/dashboard' ? 'text-white' : 'text-zinc-400'
                )}
              >
                <Activity className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            </>
          ) : (
             <Link 
              href="/auth/login"
              className={cn(
                "flex items-center space-x-1.5 transition-colors hover:text-white",
                pathname === '/auth/login' || pathname === '/auth/signup' ? 'text-white' : 'text-zinc-400'
              )}
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
