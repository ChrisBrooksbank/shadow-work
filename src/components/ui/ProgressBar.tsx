import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'default' | 'ember';
  thick?: boolean;
  className?: string;
  label?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  variant = 'default',
  thick = false,
  className,
  label,
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  const trackClass = [styles.track, thick ? styles.thick : '', className ?? '']
    .filter(Boolean)
    .join(' ');

  const fillClass = [styles.fill, variant === 'ember' ? styles.ember : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={trackClass}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <div className={fillClass} style={{ width: `${pct}%` }} />
    </div>
  );
}
