import { useState } from 'react';
import type { ActivityByDate } from '../../db/hooks';
import styles from './CalendarHeatmap.module.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getIntensityColor(count: number): string {
  if (count === 0) return 'var(--bg-elevated)';
  if (count === 1) return '#3d1212';
  if (count === 2) return '#6b1515';
  if (count === 3) return 'var(--accent-deep)';
  return 'var(--accent-primary)';
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  activityByDate: ActivityByDate;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CalendarHeatmap({ activityByDate }: Props) {
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build cells: null for padding, day number for real days
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1));
  }

  const today = new Date();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  const isFutureMonth =
    year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth());

  return (
    <div className={styles.wrapper}>
      {/* Navigation */}
      <div className={styles.nav}>
        <button className={styles.navBtn} onClick={prevMonth} aria-label="Previous month">
          ‹
        </button>
        <span className={styles.monthLabel}>
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          className={styles.navBtn}
          onClick={nextMonth}
          disabled={isCurrentMonth}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Day headers */}
      <div className={styles.grid}>
        {DAY_LABELS.map((label, i) => (
          <div key={i} className={styles.dayHeader}>
            {label}
          </div>
        ))}

        {/* Day cells */}
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`pad-${i}`} className={styles.cellEmpty} />;
          }

          const dateKey = formatDateKey(year, month, day);
          const count = activityByDate[dateKey] ?? 0;
          const color = getIntensityColor(count);
          const isToday = isCurrentMonth && day === today.getDate() && !isFutureMonth;
          const isFuture = isFutureMonth || (isCurrentMonth && day > today.getDate());

          return (
            <div
              key={dateKey}
              className={`${styles.cell} ${isToday ? styles.cellToday : ''} ${isFuture ? styles.cellFuture : ''}`}
              style={{ backgroundColor: isFuture ? undefined : color }}
              title={
                count > 0
                  ? `${dateKey}: ${count} ${count === 1 ? 'activity' : 'activities'}`
                  : dateKey
              }
              aria-label={`${dateKey}${count > 0 ? `, ${count} ${count === 1 ? 'activity' : 'activities'}` : ''}`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <span className={styles.legendLabel}>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={styles.legendCell}
            style={{ backgroundColor: getIntensityColor(level) }}
          />
        ))}
        <span className={styles.legendLabel}>More</span>
      </div>
    </div>
  );
}
