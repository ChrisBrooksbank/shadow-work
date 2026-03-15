import Button from '../ui/Button';
import { hapticTap } from '../../lib/haptics';
import styles from './StepRenderer.module.css';
import type { ChoiceStep as ChoiceStepType } from '../../data/exercises';

interface Props {
  step: ChoiceStepType;
  value: string;
  onChange: (value: string) => void;
  onContinue: () => void;
}

export default function ChoiceStep({ step, value, onChange, onContinue }: Props) {
  const handleSelect = (option: string) => {
    hapticTap();
    onChange(option);
  };

  return (
    <div className={styles.container}>
      <p className={styles.question}>{step.question}</p>
      <div className={styles.options}>
        {step.options.map((option) => (
          <button
            key={option}
            className={[styles.option, value === option ? styles.optionSelected : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => handleSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <div className={styles.actions}>
        <Button onClick={onContinue} fullWidth disabled={!value}>
          Continue
        </Button>
      </div>
    </div>
  );
}
