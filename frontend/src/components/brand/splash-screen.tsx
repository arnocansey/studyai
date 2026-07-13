'use client';

import { motion } from 'framer-motion';

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030303] overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-indigo-600/5 blur-[80px]" />
        <div className="absolute top-1/4 right-1/4 w-[200px] h-[200px] rounded-full bg-violet-600/5 blur-[60px]" />
      </div>

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `
          linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        {/* Icon */}
        <motion.svg
          width="120"
          height="120"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          initial={{ opacity: 0, rotate: -10 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <defs>
            <linearGradient id="splashLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="50%" stopColor="#6D28D9" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
            <linearGradient id="splashGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="100%" stopColor="#818CF8" />
            </linearGradient>
          </defs>
          <path d="M24 12 L44 24 L24 36 L4 24 Z" fill="url(#splashLogoGrad)" opacity="0.9" />
          <rect x="18" y="6" width="12" height="10" rx="2" fill="url(#splashLogoGrad)" />
          <line x1="24" y1="10" x2="38" y2="4" stroke="url(#splashGlowGrad)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="38" cy="4" r="3" fill="#A78BFA" />
          <circle cx="12" cy="24" r="2.5" fill="white" opacity="0.9" />
          <circle cx="24" cy="24" r="3" fill="white" />
          <circle cx="36" cy="24" r="2.5" fill="white" opacity="0.9" />
          <circle cx="18" cy="16" r="2" fill="white" opacity="0.7" />
          <circle cx="30" cy="16" r="2" fill="white" opacity="0.7" />
          <line x1="12" y1="24" x2="24" y2="24" stroke="white" strokeWidth="1.2" opacity="0.5" />
          <line x1="24" y1="24" x2="36" y2="24" stroke="white" strokeWidth="1.2" opacity="0.5" />
          <line x1="18" y1="16" x2="12" y2="24" stroke="white" strokeWidth="1" opacity="0.4" />
          <line x1="18" y1="16" x2="24" y2="24" stroke="white" strokeWidth="1" opacity="0.4" />
          <line x1="30" y1="16" x2="24" y2="24" stroke="white" strokeWidth="1" opacity="0.4" />
          <line x1="30" y1="16" x2="36" y2="24" stroke="white" strokeWidth="1" opacity="0.4" />
          <path d="M38 32 L40 28 L42 32 L46 34 L42 36 L40 40 L38 36 L34 34 Z" fill="url(#splashGlowGrad)" opacity="0.85" />
        </motion.svg>

        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-5xl font-bold tracking-tight"
        >
          <span className="text-white">Study</span>
          <span className="text-[#7C3AED]">AI</span>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-sm text-gray-500 tracking-[0.3em] uppercase"
        >
          Interactive Tech Education
        </motion.p>

        {/* Loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="mt-8 flex gap-1.5"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-purple-500"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
