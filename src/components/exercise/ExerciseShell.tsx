import { createPortal } from 'react-dom';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import StepRenderer from './StepRenderer';
import { useExerciseFlow } from '../../hooks/useExerciseFlow';
import type { Exercise, ExerciseDepth } from '../../data/exercises';
import { hapticLight } from '../../lib/haptics';
import styles from './ExerciseShell.module.css';

// ─── Depth badge ─────────────────────────────────────────────────────────────

const DEPTH_LABELS: Record<ExerciseDepth, string> = {
  surface: 'Surface',
  deep: 'Deep',
  abyss: 'Abyss',
};

const DEPTH_CLASS: Record<ExerciseDepth, string> = {
  surface: styles.depthSurface ?? '',
  deep: styles.depthDeep ?? '',
  abyss: styles.depthAbyss ?? '',
};

function DepthBadge({ depth }: { depth: ExerciseDepth }) {
  return (
    <span className={`${styles.depthBadge} ${DEPTH_CLASS[depth]}`}>{DEPTH_LABELS[depth]}</span>
  );
}

// ─── Back arrow SVG ──────────────────────────────────────────────────────────

function BackArrow() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M12 4L6 10L12 16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Close X SVG ─────────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M15 5L5 15M5 5L15 15"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ExerciseShellProps {
  exercise: Exercise;
  onClose: () => void;
  onComplete?: (responses: Record<string, string>) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ExerciseShell({ exercise, onClose, onComplete }: ExerciseShellProps) {
  const flow = useExerciseFlow(exercise);

  function handleAdvance() {
    hapticLight();
    if (flow.phase === 'complete') {
      onComplete?.(flow.responses);
      onClose();
    } else {
      flow.advance();
    }
  }

  function handleBack() {
    hapticLight();
    flow.goBack();
  }

  // ─── Header (shown during steps/reflection) ────────────────────────────────

  const showHeader = flow.phase === 'steps' || flow.phase === 'reflection';

  const stepLabel =
    flow.phase === 'steps'
      ? `Step ${flow.currentStepIndex + 1} of ${flow.totalSteps}`
      : 'Reflection';

  // ─── Render phases ─────────────────────────────────────────────────────────

  const content = (() => {
    if (flow.phase === 'intro') {
      return (
        <div className={styles.intro}>
          <div className={styles.introMeta}>
            <DepthBadge depth={exercise.depth} />
            <span className={styles.duration}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
                style={{ opacity: 0.5 }}
              >
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.25" />
                <path
                  d="M6 3.5V6L7.5 7.5"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                />
              </svg>
              {exercise.estimatedMinutes} min
            </span>
          </div>

          <h1 className={styles.introTitle}>{exercise.title}</h1>
          <p className={styles.introTagline}>{exercise.tagline}</p>
          <p className={styles.introDescription}>{exercise.description}</p>

          <div className={styles.introActions}>
            <Button onClick={handleAdvance} fullWidth size="lg">
              Begin
            </Button>
          </div>
        </div>
      );
    }

    if (flow.phase === 'safety-check') {
      return (
        <div className={styles.safety}>
          <div className={styles.safetyWarning}>
            <div className={styles.safetyIcon}>⚠️</div>
            <h2 className={styles.safetyTitle}>Abyss-Level Exercise</h2>
            <p className={styles.safetyText}>
              This exercise works at the deepest level of the shadow. Before continuing, please
              confirm:
            </p>
            <ul className={styles.safetyList}>
              <li>You are in a safe, private space with uninterrupted time.</li>
              <li>You are not currently in emotional crisis or acute distress.</li>
              <li>You can stop at any time — there is no obligation to continue.</li>
              <li>
                If strong feelings arise, you may pause, breathe, and return to ordinary awareness.
              </li>
            </ul>
            <p className={styles.safetyAck}>
              If you are in crisis, please reach out to a mental health professional or crisis line
              before proceeding.
            </p>
          </div>

          <Button onClick={handleAdvance} fullWidth>
            I understand — continue
          </Button>
        </div>
      );
    }

    if (flow.phase === 'complete') {
      return (
        <div className={styles.complete}>
          <div className={styles.completeIcon}>✦</div>
          <h2 className={styles.completeTitle}>Exercise complete</h2>
          <p className={styles.completeSubtitle}>
            You have done meaningful work. Give yourself a moment before returning.
          </p>
          <div className={styles.completeActions}>
            <Button onClick={handleAdvance} fullWidth size="lg">
              Done
            </Button>
          </div>
        </div>
      );
    }

    // steps or reflection
    if (flow.currentStep === null) return null;

    return (
      <StepRenderer
        step={flow.currentStep}
        responses={flow.responses}
        previousSteps={
          flow.phase === 'reflection'
            ? exercise.steps.slice(0, exercise.steps.length - 1)
            : exercise.steps.slice(0, flow.currentStepIndex)
        }
        onAdvance={flow.advance}
        setResponse={flow.setResponse}
      />
    );
  })();

  return createPortal(
    <div className={styles.shell} role="dialog" aria-modal="true" aria-label={exercise.title}>
      {showHeader ? (
        <div className={styles.header}>
          {flow.canGoBack ? (
            <button
              className={styles.backButton}
              onClick={handleBack}
              aria-label="Go back"
              type="button"
            >
              <BackArrow />
            </button>
          ) : (
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close exercise"
              type="button"
            >
              <CloseIcon />
            </button>
          )}
          <div className={styles.progressWrap}>
            <span className={styles.stepLabel}>{stepLabel}</span>
            <ProgressBar
              value={flow.progress * 100}
              variant="ember"
              aria-label="Exercise progress"
            />
          </div>
          {flow.canGoBack && (
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close exercise"
              type="button"
            >
              <CloseIcon />
            </button>
          )}
        </div>
      ) : (
        <div className={styles.header}>
          <div style={{ flex: 1 }} />
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close exercise"
            type="button"
          >
            <CloseIcon />
          </button>
        </div>
      )}

      <div className={styles.body}>{content}</div>
    </div>,
    document.body,
  );
}
