export function HourglassIllustration() {
  return (
    <svg viewBox="0 0 320 300" className="w-full max-w-sm" role="presentation" aria-hidden="true">
      <text x="40" y="40" fontSize="28" className="fill-brand-300">
        +
      </text>
      <circle cx="270" cy="60" r="4" className="fill-brand-300" />
      <text x="250" y="120" fontSize="22" className="fill-brand-300">
        +
      </text>

      <rect x="20" y="210" width="280" height="10" rx="2" className="fill-slate-500" />
      <rect x="45" y="220" width="6" height="55" className="fill-slate-400" />
      <rect x="255" y="220" width="6" height="55" className="fill-slate-400" />
      <rect x="150" y="220" width="6" height="55" className="fill-slate-400" />

      <rect x="60" y="150" width="80" height="60" rx="6" className="fill-slate-200" />

      <g transform="translate(120,20)">
        <rect x="0" y="0" width="60" height="10" rx="3" className="fill-brand-300" />
        <rect x="0" y="170" width="60" height="10" rx="3" className="fill-brand-300" />
        <path
          d="M6 10 H54 L34 90 L54 170 H6 L26 90 Z"
          className="fill-brand-50 stroke-brand-300"
          strokeWidth="2"
        />
        <circle cx="30" cy="55" r="9" className="fill-white stroke-slate-700" strokeWidth="2" />
        <circle cx="26" cy="52" r="1.6" className="fill-slate-800" />
        <circle cx="34" cy="52" r="1.6" className="fill-slate-800" />
        <path d="M25 60 Q30 64 35 60" className="stroke-slate-800" strokeWidth="1.6" fill="none" />
        <path
          d="M20 70 Q10 90 20 110 Q28 118 38 112"
          className="stroke-slate-500"
          strokeWidth="2"
          fill="none"
        />
      </g>
    </svg>
  )
}
