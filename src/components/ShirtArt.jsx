export function ShirtArt({ kind = 'navy' }) {
  const isSky = kind === 'sky'
  const primaryColor = isSky ? '#0284c7' : '#1e3a8a'
  const shadowColor = isSky ? '#0369a1' : '#172554'
  const highlightColor = isSky ? '#38bdf8' : '#3b82f6'
  const collarColor = isSky ? '#075985' : '#0f172a'
  const bgGradient = isSky ? 'from-sky-50 to-blue-100/50' : 'from-slate-100 to-indigo-50/50'

  return (
    <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-b ${bgGradient} p-6 shadow-inner border border-slate-200/60 overflow-hidden group`}>
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />
      <svg viewBox="0 0 200 200" className="h-44 w-full drop-shadow-md transition-transform duration-300 group-hover:scale-105">
        <defs>
          <linearGradient id={`shirt-grad-${kind}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={highlightColor} />
            <stop offset="50%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={shadowColor} />
          </linearGradient>
          <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* T-Shirt Body */}
        <path
          d="M62 48 L80 40 Q100 46 120 40 L138 48 L170 76 L150 102 L136 88 L136 165 C136 168 134 170 131 170 L69 170 C66 170 64 168 64 165 L64 88 L50 102 L30 76 Z"
          fill={`url(#shirt-grad-${kind})`}
          filter="url(#soft-shadow)"
        />

        {/* Sleeve hems */}
        <path d="M30 76 L50 102 L44 107 L24 81 Z" fill={shadowColor} opacity="0.3" />
        <path d="M170 76 L150 102 L156 107 L176 81 Z" fill={shadowColor} opacity="0.3" />

        {/* Collar Neck */}
        <path
          d="M80 40 Q100 66 120 40 Q100 48 80 40 Z"
          fill={collarColor}
        />
        {/* Collar Inner Tag */}
        <path
          d="M86 42 Q100 36 114 42 Q100 52 86 42 Z"
          fill="#475569"
          opacity="0.6"
        />

        {/* Chest Crest / Logo */}
        <circle cx="82" cy="85" r="9" fill="#ffffff" opacity="0.9" />
        <circle cx="82" cy="85" r="7" fill={collarColor} />
        <text x="82" y="87.5" textAnchor="middle" fill="#f8fafc" fontSize="5.5" fontWeight="bold" fontFamily="sans-serif">26</text>

        {/* Subtle center graphic */}
        <text x="100" y="112" textAnchor="middle" fill="#ffffff" opacity="0.75" fontSize="7.5" fontWeight="bold" letterSpacing="1.5">REUNION</text>
        <line x1="82" y1="117" x2="118" y2="117" stroke="#ffffff" strokeWidth="1" opacity="0.5" />
        <text x="100" y="125" textAnchor="middle" fill="#ffffff" opacity="0.6" fontSize="5" letterSpacing="1">ALUMNI 2026</text>

        {/* Bottom Hem */}
        <line x1="65" y1="165" x2="135" y2="165" stroke={shadowColor} strokeWidth="1.5" opacity="0.4" strokeDasharray="3 2" />
      </svg>
      <div className="absolute bottom-2 right-2 rounded-md bg-white/80 backdrop-blur px-2 py-0.5 text-[10px] font-semibold text-slate-600 shadow-sm border border-slate-200/50">
        {isSky ? 'Sky Blue' : 'Navy Blue'}
      </div>
    </div>
  )
}
