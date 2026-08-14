interface SigoLogoMarkProps {
  size?: number;
  className?: string;
  structureColor?: string;
  accentColor?: string;
}

export function SigoLogoMark({
  size = 40,
  className,
  structureColor = '#1A237E',
  accentColor = '#FF6D00',
}: SigoLogoMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      <line x1="16" y1="52" x2="38" y2="52" stroke={structureColor} strokeWidth={5} strokeLinecap="round" />
      <line x1="27" y1="52" x2="27" y2="12" stroke={structureColor} strokeWidth={5} strokeLinecap="round" />
      <line x1="10" y1="12" x2="52" y2="12" stroke={structureColor} strokeWidth={4.5} strokeLinecap="round" />
      <rect x="9" y="8" width="8" height="8" rx="1.5" fill={structureColor} />
      <line x1="48" y1="12" x2="48" y2="30" stroke={accentColor} strokeWidth={2.5} strokeLinecap="round" />
      <rect x="44" y="30" width="8" height="8" rx="1.5" fill={accentColor} />
    </svg>
  );
}

interface SigoLogoBadgeProps {
  size?: number;
  className?: string;
  structureColor?: string;
  accentColor?: string;
  borderColor?: string;
}

export function SigoLogoBadge({
  size = 96,
  className,
  structureColor = '#1A237E',
  accentColor = '#FF6D00',
  borderColor = '#1A237E',
}: SigoLogoBadgeProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-[22px] border bg-white dark:bg-[var(--bg-card)] shrink-0 ${className ?? ''}`}
      style={{ width: size, height: size, borderColor }}
    >
      <SigoLogoMark size={size * 0.6} structureColor={structureColor} accentColor={accentColor} />
    </div>
  );
}
