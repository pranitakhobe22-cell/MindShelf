import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function Logo({ 
  size = 'md', 
  showSubtitle = true, 
  className = '',
  onClick
}: LogoProps) {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl',
  };

  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      {/* Crafted Brand Emblem */}
      <div className={`${iconSizes[size]} shrink-0 relative flex items-center justify-center`}>
        <svg 
          viewBox="0 0 44 44" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_8px_rgba(136,19,55,0.25)] transition-transform group-hover:scale-105"
        >
          <defs>
            {/* Rich Oxford Crimson Gradient */}
            <linearGradient id="crestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#881337" />
              <stop offset="50%" stopColor="#700f2b" />
              <stop offset="100%" stopColor="#4c0519" />
            </linearGradient>

            {/* Subtle Gold Ribbon Gradient */}
            <linearGradient id="goldRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>

            {/* Foil Page Border Gradient */}
            <linearGradient id="foilBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Shield / Crest Rounded Badge */}
          <rect 
            x="1" 
            y="1" 
            width="42" 
            height="42" 
            rx="12" 
            fill="url(#crestGrad)" 
            stroke="#9f1239" 
            strokeWidth="1"
          />

          {/* Inner Foil Keyline */}
          <rect 
            x="2.5" 
            y="2.5" 
            width="39" 
            height="39" 
            rx="10.5" 
            fill="none" 
            stroke="url(#foilBorder)" 
            strokeWidth="1"
          />

          {/* Architectural Open Folio / Book Pages */}
          {/* Left Page (Layer 1 Base) */}
          <path 
            d="M22 13.5 C17 11.5 13 12.5 9 13.8 V28.8 C13 27.5 17 26.5 22 28.5 Z" 
            fill="#ffffff" 
            fillOpacity="0.2" 
          />
          {/* Right Page (Layer 1 Base) */}
          <path 
            d="M22 13.5 C27 11.5 31 12.5 35 13.8 V28.8 C31 27.5 27 26.5 22 28.5 Z" 
            fill="#ffffff" 
            fillOpacity="0.2" 
          />

          {/* Main Top Left Page */}
          <path 
            d="M22 12 C17.2 10 13.2 11 9.5 12.2 C9.2 12.3 9 12.6 9 12.9 V27.2 C9 27.6 9.3 27.9 9.7 27.8 C13.3 26.6 17.2 25.7 22 27.5 Z" 
            fill="#ffffff" 
          />

          {/* Main Top Right Page */}
          <path 
            d="M22 12 C26.8 10 30.8 11 34.5 12.2 C34.8 12.3 35 12.6 35 12.9 V27.2 C35 27.6 34.7 27.9 34.3 27.8 C30.7 26.6 26.8 25.7 22 27.5 Z" 
            fill="#ffffff" 
          />

          {/* Center Spine Shadow Line */}
          <line 
            x1="22" 
            y1="12" 
            x2="22" 
            y2="28" 
            stroke="#e2e8f0" 
            strokeWidth="1" 
          />

          {/* Academic Gold Bookmark Ribbon Dropping Below Folio */}
          <path 
            d="M20.5 12.5 H23.5 V32 L22 30.5 L20.5 32 Z" 
            fill="url(#goldRibbon)" 
            stroke="#78350f" 
            strokeWidth="0.5" 
          />

          {/* Little Star / Spark of Knowledge at Top of Crest */}
          <circle cx="22" cy="7.5" r="1.2" fill="#fef3c7" />
        </svg>
      </div>

      {/* Brand Typography Lockup */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-2">
          <span className={`font-serif font-black tracking-tight text-stone-950 ${titleSizes[size]} leading-none`}>
            MindShelf
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-stone-100 text-[#881337] border border-stone-200">
            Atelier
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] uppercase font-semibold tracking-[0.18em] text-stone-500 mt-1">
            Academic Assistant
          </span>
        )}
      </div>
    </div>
  );
}
