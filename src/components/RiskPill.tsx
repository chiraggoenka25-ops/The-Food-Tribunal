import { cn } from '@/lib/utils';
import { AlertTriangle, Info } from 'lucide-react';

interface RiskPillProps {
  label: string;
  type?: 'risk' | 'additive' | 'info';
  className?: string;
}

export default function RiskPill({ label, type = 'risk', className }: RiskPillProps) {
  const styles = {
    risk: 'bg-red-500/10 text-red-400 border-red-500/20',
    additive: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  const Icon = type === 'risk' || type === 'additive' ? AlertTriangle : Info;

  return (
    <div className={cn("inline-flex items-center space-x-1 px-2.5 py-1 text-xs rounded border backdrop-blur-sm font-medium", styles[type], className)}>
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </div>
  );
}
