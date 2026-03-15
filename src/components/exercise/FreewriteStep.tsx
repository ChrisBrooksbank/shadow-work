import { useState, useEffect } from 'react';
import Button from '../ui/Button';
import TextArea from '../ui/TextArea';
import TimerRing from '../ui/TimerRing';
import styles from './StepRenderer.module.css';
import type { FreewriteStep as FreewriteStepType } from '../../data/exercises';

interface Props {
  step: FreewriteStepType;
  value: string;
  onChange: (value: string) => void;
  onContinue: () => void;
}

export default function FreewriteStep({ step, value, onChange, onContinue }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!step.durationSeconds) return;
    const id = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= step.durationSeconds!) {
          clearInterval(id);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [step.durationSeconds]);

  const hasDuration = Boolean(step.durationSeconds);
  const progress = hasDuration ? Math.min(1, elapsed / step.durationSeconds!) : 0;

  return (
    <div className={styles.container}>
      <p className={styles.question}>{step.prompt}</p>
      {hasDuration && (
        <div className={styles.timerRow}>
          <TimerRing
            progress={progress}
            elapsed={elapsed}
            duration={step.durationSeconds}
            size={80}
            label="Freewrite timer"
          />
        </div>
      )}
      <TextArea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={step.placeholder}
        rows={8}
        autoFocus
      />
      <div className={styles.actions}>
        <Button onClick={onContinue} fullWidth>
          Continue
        </Button>
      </div>
    </div>
  );
}
