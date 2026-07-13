'use client';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 28, text: 'text-lg', height: 7 },
  md: { icon: 36, text: 'text-xl', height: 9 },
  lg: { icon: 48, text: 'text-3xl', height: 12 },
  xl: { icon: 64, text: 'text-4xl', height: 16 },
};

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const s = sizes[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`lg-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="50%" stopColor="#6D28D9" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <linearGradient id={`gl-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
        </defs>
        {/* Cap brim */}
        <path
          d="M24 12 L44 24 L24 36 L4 24 Z"
          fill={`url(#lg-${size})`}
          opacity="0.9"
        />
        {/* Cap top */}
        <rect x="18" y="6" width="12" height="10" rx="2" fill={`url(#lg-${size})`} />
        {/* Tassel */}
        <line
          x1="24"
          y1="10"
          x2="38"
          y2="4"
          stroke={`url(#gl-${size})`}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="38" cy="4" r="3" fill="#A78BFA" />
        {/* Neural nodes */}
        <circle cx="12" cy="24" r="2.5" fill="white" opacity="0.9" />
        <circle cx="24" cy="24" r="3" fill="white" />
        <circle cx="36" cy="24" r="2.5" fill="white" opacity="0.9" />
        <circle cx="18" cy="16" r="2" fill="white" opacity="0.7" />
        <circle cx="30" cy="16" r="2" fill="white" opacity="0.7" />
        {/* Neural connections */}
        <line x1="12" y1="24" x2="24" y2="24" stroke="white" strokeWidth="1.2" opacity="0.5" />
        <line x1="24" y1="24" x2="36" y2="24" stroke="white" strokeWidth="1.2" opacity="0.5" />
        <line x1="18" y1="16" x2="12" y2="24" stroke="white" strokeWidth="1" opacity="0.4" />
        <line x1="18" y1="16" x2="24" y2="24" stroke="white" strokeWidth="1" opacity="0.4" />
        <line x1="30" y1="16" x2="24" y2="24" stroke="white" strokeWidth="1" opacity="0.4" />
        <line x1="30" y1="16" x2="36" y2="24" stroke="white" strokeWidth="1" opacity="0.4" />
        {/* AI sparkle */}
        <path
          d="M38 32 L40 28 L42 32 L46 34 L42 36 L40 40 L38 36 L34 34 Z"
          fill={`url(#gl-${size})`}
          opacity="0.85"
        />
      </svg>

      {/* Wordmark */}
      {showText && (
        <span
          className={`font-bold tracking-tight ${s.text}`}
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
          <span className="text-gray-900 dark:text-[#EDEDED]">Study</span>
          <span className="text-[#7C3AED]">AI</span>
        </span>
      )}
    </div>
  );
}
