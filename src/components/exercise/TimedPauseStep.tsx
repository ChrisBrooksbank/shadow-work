import { useState, useEffect } from 'react';
import TimerRing from '../ui/TimerRing';
import Button from '../ui/Button';
import { hapticMedium } from '../../lib/haptics';
import styles from './StepRenderer.module.css';
import type { TimedPauseStep as TimedPauseStepType } from '../../data/exercises';

interface Props {
  step: TimedPauseStepType;
  onComplete: () => void;
}

export default function TimedPauseStep({ step, onComplete }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const done = elapsed >= step.durationSeconds;

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= step.durationSeconds) {
          clearInterval(id);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [step.durationSeconds]);

  useEffect(() => {
    if (done) hapticMedium();
  }, [done]);

  const progress = Math.min(1, elapsed / step.durationSeconds);

  return (
    <div className={styles.timedPause}>
      <p className={styles.pauseLabel}>{step.label}</p>
      <TimerRing
        progress={progress}
        elapsed={elapsed}
        duration={step.durationSeconds}
        size={160}
        label={step.label}
      />
      {done && (
        <Button onClick={onComplete} fullWidth>
          Continue
        </Button>
      )}
    </div>
  );
}
