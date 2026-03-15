import Button from '../ui/Button';
import TextArea from '../ui/TextArea';
import styles from './StepRenderer.module.css';
import type { PromptStep as PromptStepType } from '../../data/exercises';

interface Props {
  step: PromptStepType;
  value: string;
  onChange: (value: string) => void;
  onContinue: () => void;
}

export default function PromptStep({ step, value, onChange, onContinue }: Props) {
  return (
    <div className={styles.container}>
      <p className={styles.question}>{step.question}</p>
      <TextArea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={step.placeholder}
        rows={6}
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
