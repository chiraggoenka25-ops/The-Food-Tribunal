import { cn } from '@/lib/utils';
import { VerdictStatus } from '@/lib/types';

interface VerdictBadgeProps {
  verdict: VerdictStatus;
  className?: string;
  large?: boolean;
}

export default function VerdictBadge({ verdict, className, large = false }: VerdictBadgeProps) {
  const styles = {
    CLEAN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 glow-clean',
    CAUTION: 'bg-amber-500/10 text-amber-400 border-amber-500/20 glow-caution',
    RISK: 'bg-red-500/10 text-red-500 border-red-500/20 glow-risk',
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center font-bold tracking-widest uppercase border backdrop-blur-md",
        large ? "px-6 py-2.5 text-lg rounded-xl shadow-lg" : "px-3 py-1 text-[10px] rounded-full",
        styles[verdict],
        className
      )}
    >
      VERDICT: {verdict}
    </div>
  );
}
