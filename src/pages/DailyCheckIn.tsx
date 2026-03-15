import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import TextArea from '../components/ui/TextArea';
import ProgressBar from '../components/ui/ProgressBar';
import { db } from '../db/index';
import { recalculateStreak } from '../db/streak';
import { queryTodaysCheckIn, todayDateString } from '../db/hooks';
import { hapticLight, hapticMedium } from '../lib/haptics';
import styles from './DailyCheckIn.module.css';

// ─── Constants ────────────────────────────────────────────────────────────────

const PRESENCE_LABELS = ['distant', 'foggy', 'here', 'grounded', 'fully\npresent'];

const EMOTIONS = [
  'anxious',
  'angry',
  'sad',
  'numb',
  'curious',
  'hopeful',
  'confused',
  'ashamed',
  'calm',
  'overwhelmed',
  'grateful',
  'lonely',
  'restless',
  'content',
  'bitter',
  'tender',
  'fearful',
  'awe',
];

const SHADOW_QUOTES = [
  '"Until you make the unconscious conscious, it will direct your life and you will call it fate." — Carl Jung',
  '"Everything that irritates us about others can lead us to an understanding of ourselves." — Carl Jung',
  '"Your visions will become clear only when you can look into your own heart." — Carl Jung',
  '"The most terrifying thing is to accept oneself completely." — Carl Jung',
  '"In each of us there is another whom we do not know." — Carl Jung',
  '"The privilege of a lifetime is to become who you truly are." — Carl Jung',
  '"What you resist, persists." — Carl Jung',
  '"The shadow is a moral problem that challenges the whole ego-personality." — Carl Jung',
];

// ─── Step types ───────────────────────────────────────────────────────────────

type Step = 'presence' | 'emotion' | 'trigger' | 'freewrite' | 'complete' | 'already-done';

const STEPS: Step[] = ['presence', 'emotion', 'trigger', 'freewrite', 'complete'];
const STEP_LABELS: Record<Step, string> = {
  presence: 'Step 1 of 4',
  emotion: 'Step 2 of 4',
  trigger: 'Step 3 of 4',
  freewrite: 'Step 4 of 4',
  complete: 'Complete',
  'already-done': '',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function DailyCheckIn() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('presence');
  const [presenceLevel, setPresenceLevel] = useState<number>(0);
  const [emotion, setEmotion] = useState<string>('');
  const [triggered, setTriggered] = useState<boolean | null>(null);
  const [triggerNote, setTriggerNote] = useState<string>('');
  const [freewrite, setFreewrite] = useState<string>('');
  const [quote] = useState<string>(
    () => SHADOW_QUOTES[Math.floor(Math.random() * SHADOW_QUOTES.length)]!,
  );
  const [loading, setLoading] = useState(true);

  // Check if already done today
  useEffect(() => {
    queryTodaysCheckIn().then((existing) => {
      if (existing) {
        setStep('already-done');
      }
      setLoading(false);
    });
  }, []);

  const stepIndex = STEPS.indexOf(step);
  const progressPct = stepIndex >= 0 ? (stepIndex / 4) * 100 : 100;

  async function saveCheckIn() {
    const entry = {
      id: crypto.randomUUID(),
      date: todayDateString(),
      presenceLevel,
      emotion,
      triggered: triggered ?? false,
      triggerNote: triggerNote.trim() || undefined,
      freewrite: freewrite.trim() || undefined,
      createdAt: new Date(),
    };

    try {
      await db.dailyCheckIns.add(entry);
      await recalculateStreak();
    } catch {
      // Unique constraint: check-in already exists for today — ignore
    }
  }

  function advanceTo(nextStep: Step) {
    hapticLight();
    setStep(nextStep);
  }

  function handlePresenceSelect(level: number) {
    setPresenceLevel(level);
    hapticLight();
  }

  function handleEmotionSelect(e: string) {
    setEmotion(e);
    hapticLight();
  }

  function handleTriggerSelect(val: boolean) {
    setTriggered(val);
    hapticLight();
  }

  async function handleFinish() {
    await saveCheckIn();
    hapticMedium();
    setStep('complete');
  }

  if (loading) return null;

  // ─── Already done ───────────────────────────────────────
  if (step === 'already-done') {
    return (
      <div className={styles.alreadyDone}>
        <p className={styles.alreadyDoneTitle}>You&apos;ve already checked in today.</p>
        <p className={styles.alreadyDoneText}>The work is done. Rest in that.</p>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Back to home
        </Button>
      </div>
    );
  }

  // ─── Completion screen ──────────────────────────────────
  if (step === 'complete') {
    return (
      <div className={styles.completionPage}>
        <div className={styles.completionIcon}>◈</div>
        <p className={styles.completionTitle}>You showed up.</p>
        <blockquote className={styles.completionQuote}>{quote}</blockquote>
        <Button fullWidth onClick={() => navigate('/')}>
          Return home
        </Button>
      </div>
    );
  }

  // ─── Steps ──────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.progress}>
        <span className={styles.stepLabel}>{STEP_LABELS[step]}</span>
        <ProgressBar value={progressPct} variant="ember" />
      </div>

      {step === 'presence' && (
        <div className={styles.step}>
          <h1 className={styles.question}>How present do you feel right now?</h1>
          <div className={styles.presenceGrid}>
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                className={`${styles.presenceOption} ${presenceLevel === level ? styles.selected : ''}`}
                onClick={() => handlePresenceSelect(level)}
                aria-pressed={presenceLevel === level}
              >
                <span className={styles.presenceNumber}>{level}</span>
                <span className={styles.presenceLabel}>{PRESENCE_LABELS[level - 1]}</span>
              </button>
            ))}
          </div>
          <div className={styles.actions}>
            <Button fullWidth disabled={presenceLevel === 0} onClick={() => advanceTo('emotion')}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 'emotion' && (
        <div className={styles.step}>
          <h1 className={styles.question}>What emotion is closest to the surface?</h1>
          <div className={styles.emotionGrid}>
            {EMOTIONS.map((e) => (
              <button
                key={e}
                className={`${styles.emotionOption} ${emotion === e ? styles.selected : ''}`}
                onClick={() => handleEmotionSelect(e)}
                aria-pressed={emotion === e}
              >
                {e}
              </button>
            ))}
          </div>
          <div className={styles.actions}>
            <Button fullWidth disabled={!emotion} onClick={() => advanceTo('trigger')}>
              Continue
            </Button>
            <Button variant="ghost" fullWidth onClick={() => advanceTo('presence')}>
              Back
            </Button>
          </div>
        </div>
      )}

      {step === 'trigger' && (
        <div className={styles.step}>
          <h1 className={styles.question}>Did anything trigger you today?</h1>
          <div className={styles.triggerButtons}>
            <button
              className={`${styles.triggerBtn} ${triggered === true ? styles.selected : ''}`}
              onClick={() => handleTriggerSelect(true)}
              aria-pressed={triggered === true}
            >
              Yes
            </button>
            <button
              className={`${styles.triggerBtn} ${triggered === false ? styles.selected : ''}`}
              onClick={() => handleTriggerSelect(false)}
              aria-pressed={triggered === false}
            >
              No
            </button>
          </div>
          {triggered === true && (
            <div className={styles.triggerNoteWrapper}>
              <span className={styles.noteHint}>What happened? (optional)</span>
              <TextArea
                value={triggerNote}
                onChange={(e) => setTriggerNote(e.target.value)}
                placeholder="Briefly describe what triggered you..."
                rows={3}
              />
            </div>
          )}
          <div className={styles.actions}>
            <Button fullWidth disabled={triggered === null} onClick={() => advanceTo('freewrite')}>
              Continue
            </Button>
            <Button variant="ghost" fullWidth onClick={() => advanceTo('emotion')}>
              Back
            </Button>
          </div>
        </div>
      )}

      {step === 'freewrite' && (
        <div className={styles.step}>
          <h1 className={styles.question}>One thing you noticed about yourself today.</h1>
          <p className={styles.frewriteHint}>Optional — write freely, no judgment.</p>
          <TextArea
            value={freewrite}
            onChange={(e) => setFreewrite(e.target.value)}
            placeholder="Something I noticed..."
            rows={5}
          />
          <div className={styles.actions}>
            <Button fullWidth onClick={handleFinish}>
              Complete check-in
            </Button>
            <Button variant="ghost" fullWidth onClick={() => advanceTo('trigger')}>
              Back
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
