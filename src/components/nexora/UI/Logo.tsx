import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'default' | 'watermark' | 'loading' | 'startup';
}

export function Logo({ className = '', size = 32, variant = 'default' }: LogoProps) {
  if (variant === 'watermark') {
    return (
      <div className={`opacity-10 pointer-events-none select-none ${className}`}>
        <h1 className="font-black tracking-tighter" style={{ fontSize: size }}>
          NX
        </h1>
      </div>
    );
  }

  if (variant === 'loading' || variant === 'startup') {
    const isStartup = variant === 'startup';
    
    return (
      <div className={`flex flex-col items-center justify-center space-y-8 ${className}`}>
        <div className="relative">
          {/* Energy Ripple Effect */}
          <motion.div
            animate={{
              scale: [1, 1.5, 2],
              opacity: [0.3, 0.1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
            className="absolute inset-0 rounded-2xl bg-primary/30 blur-xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1.8],
              opacity: [0.5, 0.2, 0],
            }}
            transition={{
              duration: 2,
              delay: 0.5,
              repeat: Infinity,
              ease: "easeOut"
            }}
            className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-lg"
          />
          
          {/* Main Logo Body */}
          <motion.div
            animate={isStartup ? {
              scale: [0.8, 1.1, 1],
              rotate: [0, 90, 0],
              filter: ["blur(0px)", "blur(2px)", "blur(0px)"],
            } : {
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: isStartup ? 3 : 2,
              repeat: isStartup ? 0 : Infinity,
              ease: "easeInOut"
            }}
            className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary via-primary/80 to-blue-600 shadow-2xl shadow-primary/40 flex items-center justify-center overflow-hidden"
          >
            {/* Inner Breathing Glow */}
            <motion.div 
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-white/10"
            />
            <span className="text-3xl font-black text-white tracking-tighter">NX</span>
          </motion.div>
        </div>

        {isStartup && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="flex flex-col items-center space-y-2"
          >
            <h1 className="text-3xl font-black tracking-[0.4em] text-foreground bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent ml-[0.4em]">
              NEXORA
            </h1>
            <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
              System Core v1.0
            </span>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 group ${className}`}>
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="rounded-lg bg-gradient-to-tr from-primary to-blue-600 shadow-lg shadow-primary/20 flex items-center justify-center overflow-hidden"
        style={{ width: size, height: size }}
      >
        <div className="w-full h-full flex items-center justify-center bg-white/10 backdrop-blur-sm">
           <span className="text-white font-black leading-none" style={{ fontSize: size * 0.5 }}>NX</span>
        </div>
      </motion.div>
      <h1 className="font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent" style={{ fontSize: size * 0.65 }}>
        Nexora
      </h1>
    </div>
  );
}
