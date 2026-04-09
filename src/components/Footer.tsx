import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-black/40 mt-auto">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 opacity-50">
          <Shield className="w-5 h-5" />
          <span className="font-semibold text-sm uppercase tracking-wider">The Food Tribunal</span>
        </div>
        
        <p className="text-zinc-500 text-xs">
          &copy; {new Date().getFullYear()} The Food Tribunal. Independent Consumer Intelligence.
        </p>
      </div>
    </footer>
  );
}
