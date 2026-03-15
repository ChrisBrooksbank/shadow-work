import Button from '../ui/Button';
import styles from './StepRenderer.module.css';
import type { InstructionStep as InstructionStepType } from '../../data/exercises';

interface Props {
  step: InstructionStepType;
  onContinue: () => void;
}

export default function InstructionStep({ step, onContinue }: Props) {
  return (
    <div className={styles.container}>
      {step.title && <h2 className={styles.title}>{step.title}</h2>}
      <p className={styles.body}>{step.body}</p>
      <div className={styles.actions}>
        <Button onClick={onContinue} fullWidth>
          Continue
        </Button>
      </div>
    </div>
  );
}
