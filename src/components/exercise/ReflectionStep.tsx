import Button from '../ui/Button';
import TextArea from '../ui/TextArea';
import styles from './StepRenderer.module.css';
import type {
  ReflectionStep as ReflectionStepType,
  ExerciseStep,
  PromptStep,
  FreewriteStep,
} from '../../data/exercises';

interface Props {
  step: ReflectionStepType;
  value: string;
  onChange: (value: string) => void;
  responses: Record<string, string>;
  previousSteps: ExerciseStep[];
  onContinue: () => void;
}

type TextualStep = PromptStep | FreewriteStep;

function isTextualStep(s: ExerciseStep): s is TextualStep {
  return s.type === 'prompt' || s.type === 'freewrite';
}

function getStepLabel(s: TextualStep): string {
  return s.type === 'prompt' ? s.question : s.prompt;
}

export default function ReflectionStep({
  step,
  value,
  onChange,
  responses,
  previousSteps,
  onContinue,
}: Props) {
  const textualSteps = previousSteps.filter(
    (s): s is TextualStep => isTextualStep(s) && Boolean(responses[s.id]),
  );

  return (
    <div className={styles.container}>
      {textualSteps.length > 0 && (
        <div className={styles.responses}>
          <p className={styles.responsesHeading}>Your responses</p>
          {textualSteps.map((s) => (
            <div key={s.id} className={styles.responseItem}>
              <p className={styles.responseLabel}>{getStepLabel(s)}</p>
              <p className={styles.responseText}>{responses[s.id]}</p>
            </div>
          ))}
        </div>
      )}
      <p className={styles.question}>{step.prompt}</p>
      <TextArea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={step.placeholder}
        rows={6}
        autoFocus
      />
      <div className={styles.actions}>
        <Button onClick={onContinue} fullWidth>
          Complete
        </Button>
      </div>
    </div>
  );
}
