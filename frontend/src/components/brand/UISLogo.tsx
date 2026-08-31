import React from 'react';

interface UISLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'badge' | 'white';
  showSubtitle?: boolean;
}

export const UISLogo: React.FC<UISLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  showSubtitle = true,
}) => {
  const sizeMap = {
    sm: { icon: 32, text: 'text-base', sub: 'text-[10px]' },
    md: { icon: 42, text: 'text-lg', sub: 'text-xs' },
    lg: { icon: 56, text: 'text-2xl', sub: 'text-sm' },
    xl: { icon: 72, text: 'text-3xl', sub: 'text-base' },
  };

  const currentSize = sizeMap[size];

  // Modern UIS Health Lab Brand Mark SVG
  // Incorporating:
  // 1. Three stylized graduate figures with graduation caps (inspired by UIS logo)
  // 2. Open knowledge book arcs with royal blue and vivid red contours
  // 3. Central healthcare medical cross & gentle vital pulse line symbolizing Health/Nursing Lab
  const LogoIcon = (
    <svg
      width={currentSize.icon}
      height={currentSize.icon}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
    >
      <defs>
        <linearGradient id="uisBlueGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0284c7" />
          <stop offset="1" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id="uisCyanGrad" x1="0" y1="0" x2="0" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06b6d4" />
          <stop offset="1" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="uisRedGrad" x1="0" y1="0" x2="120" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e11d48" />
          <stop offset="1" stopColor="#be123c" />
        </linearGradient>
        <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0284c7" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Outer subtle shield container */}
      <rect x="6" y="6" width="108" height="108" rx="28" fill="white" stroke="#e2e8f0" strokeWidth="1.5" filter="url(#softGlow)" />

      {/* Open Book Arch Wings (University Symbolism) */}
      {/* Blue upper knowledge wing */}
      <path
        d="M18 78C30 68 46 64 60 72C74 64 90 68 102 78"
        stroke="url(#uisBlueGrad)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Red lower active wing (UIS accent) */}
      <path
        d="M20 84C32 74 46 71 60 78C74 71 88 74 100 84"
        stroke="url(#uisRedGrad)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Graduation Cap Top Center (Academic Excellence) */}
      <path
        d="M60 22L76 29L60 36L44 29L60 22Z"
        fill="#0284c7"
      />
      {/* Cap tassel & band */}
      <path
        d="M48 31V37C48 40.5 53.5 43 60 43C66.5 43 72 40.5 72 37V31"
        stroke="#0284c7"
        strokeWidth="2"
        fill="#e0f2fe"
      />
      <path
        d="M74 30L78 37V42"
        stroke="#e11d48"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Two smaller academic wings left and right */}
      <path d="M38 29L48 33.5L38 38L28 33.5L38 29Z" fill="#38bdf8" />
      <path d="M82 29L92 33.5L82 38L72 33.5L82 29Z" fill="#38bdf8" />

      {/* Central Medical Cross & Pulse (Health Lab Symbolism) */}
      <g transform="translate(60, 58)">
        {/* Healthcare Cross */}
        <rect x="-4" y="-12" width="8" height="24" rx="2" fill="#06b6d4" />
        <rect x="-12" y="-4" width="24" height="8" rx="2" fill="#06b6d4" />
        {/* White heartbeat pulse in center */}
        <path
          d="M-10 0H-4L-2 -5L1 5L3 -2L5 0H10"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Mini indicator dots */}
      <circle cx="28" cy="94" r="2.5" fill="#0284c7" />
      <circle cx="60" cy="94" r="2.5" fill="#e11d48" />
      <circle cx="92" cy="94" r="2.5" fill="#06b6d4" />
    </svg>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{LogoIcon}</div>;
  }

  const isWhite = variant === 'white';

  return (
    <div className={`group inline-flex items-center gap-3 select-none ${className}`}>
      {LogoIcon}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-heading font-extrabold tracking-tight ${currentSize.text} ${
              isWhite ? 'text-white' : 'text-slate-900'
            }`}
          >
            UIS <span className="text-cyan-600 font-bold">Health Lab</span>
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-100 text-cyan-800 border border-cyan-200 uppercase tracking-wider">
            Ners
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`font-medium tracking-wide mt-1 ${currentSize.sub} ${
              isWhite ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            Universitas Ichsan Satya
          </span>
        )}
      </div>
    </div>
  );
};
