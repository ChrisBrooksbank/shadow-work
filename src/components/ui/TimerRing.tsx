import styles from './TimerRing.module.css';

interface TimerRingProps {
  /** 0–1 progress fraction (0 = empty, 1 = full) */
  progress: number;
  /** Diameter in pixels */
  size?: number;
  /** Stroke width in pixels */
  strokeWidth?: number;
  /** Elapsed seconds to display in centre (omit to hide) */
  elapsed?: number;
  /** Total duration in seconds (used to format remaining time) */
  duration?: number;
  className?: string;
  label?: string;
}

export default function TimerRing({
  progress,
  size = 160,
  strokeWidth = 6,
  elapsed,
  duration,
  className,
  label,
}: TimerRingProps) {
  const clamped = Math.min(1, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped);
  const cx = size / 2;

  const remaining =
    duration !== undefined && elapsed !== undefined ? Math.max(0, duration - elapsed) : undefined;

  const formatSeconds = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    if (m > 0) return `${m}:${String(sec).padStart(2, '0')}`;
    return `${String(sec)}s`;
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={[styles.ring, className ?? ''].filter(Boolean).join(' ')}
      role="progressbar"
      aria-valuenow={Math.round(clamped * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? 'Timer progress'}
    >
      {/* Background track */}
      <circle
        cx={cx}
        cy={cx}
        r={radius}
        fill="none"
        stroke="var(--bg-elevated)"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc — starts at top (−90°) */}
      <circle
        cx={cx}
        cy={cx}
        r={radius}
        fill="none"
        stroke="var(--accent-primary)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cx})`}
        className={styles.arc}
      />
      {/* Centre label */}
      {remaining !== undefined && (
        <text x={cx} y={cx} dominantBaseline="middle" textAnchor="middle" className={styles.label}>
          {formatSeconds(remaining)}
        </text>
      )}
    </svg>
  );
}
