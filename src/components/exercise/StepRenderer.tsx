import type { ExerciseStep } from '../../data/exercises';
import InstructionStep from './InstructionStep';
import PromptStep from './PromptStep';
import FreewriteStep from './FreewriteStep';
import TimedPauseStep from './TimedPauseStep';
import ChoiceStep from './ChoiceStep';
import ReflectionStep from './ReflectionStep';

interface Props {
  step: ExerciseStep;
  responses: Record<string, string>;
  /** Steps that came before this one — used by reflection to show a summary. */
  previousSteps: ExerciseStep[];
  onAdvance: () => void;
  setResponse: (stepId: string, value: string) => void;
}

export default function StepRenderer({
  step,
  responses,
  previousSteps,
  onAdvance,
  setResponse,
}: Props) {
  const value = responses[step.id] ?? '';
  const handleChange = (v: string) => setResponse(step.id, v);

  switch (step.type) {
    case 'instruction':
      return <InstructionStep step={step} onContinue={onAdvance} />;

    case 'prompt':
      return (
        <PromptStep step={step} value={value} onChange={handleChange} onContinue={onAdvance} />
      );

    case 'freewrite':
      return (
        <FreewriteStep step={step} value={value} onChange={handleChange} onContinue={onAdvance} />
      );

    case 'timed-pause':
      return <TimedPauseStep step={step} onComplete={onAdvance} />;

    case 'choice':
      return (
        <ChoiceStep step={step} value={value} onChange={handleChange} onContinue={onAdvance} />
      );

    case 'reflection':
      return (
        <ReflectionStep
          step={step}
          value={value}
          onChange={handleChange}
          responses={responses}
          previousSteps={previousSteps}
          onContinue={onAdvance}
        />
      );
  }
}
