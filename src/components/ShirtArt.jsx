export function ShirtArt({ kind = 'navy' }) {
  const fill = kind === 'sky' ? '#38bdf8' : '#1e3a8a'
  return (
    <svg viewBox="0 0 200 200" className="h-40 w-full">
      <rect width="200" height="200" rx="16" fill="#f1f5f9" />
      <path d="M40 70 L70 50 L85 65 L115 65 L130 50 L160 70 L150 95 L135 88 L135 150 L65 150 L65 88 L50 95 Z" fill={fill} />
    </svg>
  )
}
