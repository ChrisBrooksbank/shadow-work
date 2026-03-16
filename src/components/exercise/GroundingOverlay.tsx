import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { groundingTechniques } from '../../data/safety';
import type { GroundingTechnique } from '../../data/safety';
import { hapticLight } from '../../lib/haptics';
import styles from './GroundingOverlay.module.css';

// ─── Props ────────────────────────────────────────────────────────────────────

interface GroundingOverlayProps {
  onClose: () => void;
}

// ─── Technique selection screen ───────────────────────────────────────────────

function TechniqueSelect({
  onSelect,
  onClose,
}: {
  onSelect: (t: GroundingTechnique) => void;
  onClose: () => void;
}) {
  return (
    <div className={styles.screen}>
      <div className={styles.topBar}>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close grounding"
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M15 5L5 15M5 5L15 15"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.anchor}>⚓</div>
        <h2 className={styles.title}>Ground yourself</h2>
        <p className={styles.subtitle}>
          Take a moment to return to your body. Choose a technique below.
        </p>

        <div className={styles.techniqueList}>
          {groundingTechniques.map((t) => (
            <button
              key={t.id}
              className={styles.techniqueCard}
              onClick={() => {
                hapticLight();
                onSelect(t);
              }}
              type="button"
            >
              <span className={styles.techniqueName}>{t.title}</span>
              <span className={styles.techniqueDesc}>{t.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Per-step timer (remounts via key to auto-reset state) ───────────────────

function StepTimer({ durationSeconds }: { durationSeconds: number }) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [running, setRunning] = useState(false);

  const timerDone = secondsLeft === 0;

  // Countdown
  useEffect(() => {
    if (!running || secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [running, secondsLeft]);

  if (timerDone) {
    return (
      <div className={styles.timerDone} aria-live="polite">
        Done ✓
      </div>
    );
  }

  if (running) {
    return (
      <div
        className={styles.timerCount}
        aria-live="polite"
        aria-label={`${secondsLeft} seconds remaining`}
      >
        {secondsLeft}
      </div>
    );
  }

  return (
    <button
      className={styles.timerStart}
      onClick={() => {
        hapticLight();
        setRunning(true);
      }}
      type="button"
    >
      Start timer ({durationSeconds}s)
    </button>
  );
}

// ─── Step-through screen ──────────────────────────────────────────────────────

function TechniqueGuide({
  technique,
  onBack,
  onClose,
}: {
  technique: GroundingTechnique;
  onBack: () => void;
  onClose: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);

  const currentStep = technique.steps[stepIndex]!;
  const isLast = stepIndex === technique.steps.length - 1;

  function handleNext() {
    hapticLight();
    if (isLast) {
      onClose();
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  return (
    <div className={styles.screen}>
      <div className={styles.topBar}>
        <button
          className={styles.backBtn}
          onClick={onBack}
          aria-label="Back to technique selection"
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M12 4L6 10L12 16"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <span className={styles.techTitle}>{technique.title}</span>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close grounding"
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M15 5L5 15M5 5L15 15"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.stepCounter}>
          Step {stepIndex + 1} of {technique.steps.length}
        </div>

        <p className={styles.stepInstruction}>{currentStep.instruction}</p>

        {currentStep.durationSeconds != null && (
          <div className={styles.timerArea}>
            <StepTimer key={stepIndex} durationSeconds={currentStep.durationSeconds} />
          </div>
        )}

        <button className={styles.nextBtn} onClick={handleNext} type="button">
          {isLast ? 'Return to exercise' : 'Next'}
        </button>
      </div>

      <div className={styles.stepDots}>
        {technique.steps.map((_, i) => (
          <span
            key={i}
            className={`${styles.dot} ${i === stepIndex ? styles.dotActive : ''} ${i < stepIndex ? styles.dotDone : ''}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GroundingOverlay({ onClose }: GroundingOverlayProps) {
  const [selected, setSelected] = useState<GroundingTechnique | null>(null);

  // Trap Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return createPortal(
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Grounding techniques"
    >
      {selected === null ? (
        <TechniqueSelect onSelect={setSelected} onClose={onClose} />
      ) : (
        <TechniqueGuide technique={selected} onBack={() => setSelected(null)} onClose={onClose} />
      )}
    </div>,
    document.body,
  );
}
