import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, hover = true, onClick }: GlassCardProps) {
  return (
    <motion.div 
      onClick={onClick}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={cn(
      "bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl overflow-hidden transition-all duration-300",
      hover && "hover:bg-card/60 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5",
      className
    )}>
      {children}
    </motion.div>
  );
}
