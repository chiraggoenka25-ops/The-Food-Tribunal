"use client";

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { VerdictStatus } from '@/lib/types';

interface ScoreRingProps {
  score: number;
  verdict: VerdictStatus;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export default function ScoreRing({ score, verdict, size = 120, strokeWidth = 8, className }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const dashoffset = circumference - (score / 100) * circumference;

  const colorMap = {
    CLEAN: '#10b981',
    CAUTION: '#f59e0b',
    RISK: '#ef4444',
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/10"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={colorMap[verdict]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashoffset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <motion.span 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-4xl font-black tracking-tighter text-white font-mono"
        >
          {score}
        </motion.span>
      </div>
    </div>
  );
}
