import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { db } from '../db/index';
import Button from '../components/ui/Button';
import styles from './Onboarding.module.css';

// ─── Card definitions ─────────────────────────────────────────────────────────

interface OnboardingCard {
  id: string;
  label: string;
  title: string;
  body: string;
}

const CARDS: OnboardingCard[] = [
  {
    id: 'shadow',
    label: '01',
    title: 'Something lives in your shadow.',
    body: "Every part of yourself you've buried — the rage you swallowed, the grief you never showed, the desires you called wrong — they don't disappear. They shape every decision, every reaction, every pattern you can't explain. Shadow work is the practice of meeting what you've hidden from yourself.",
  },
  {
    id: 'practice',
    label: '02',
    title: 'A daily practice for what\u2019s beneath the surface.',
    body: "Daily check-ins. Guided exercises rooted in Jungian psychology. A private journal that holds what you can't say out loud. No advice. No algorithms. Just you and the parts of yourself you've been avoiding.",
  },
  {
    id: 'private',
    label: '03',
    title: 'Your data never leaves this device.',
    body: 'No accounts. No servers. No cloud sync. Everything you write stays on your device, stored in local browser storage. This is your space — sealed and private.',
  },
];

// ─── Animation variants ───────────────────────────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

const slideTransition = {
  duration: 0.32,
  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Onboarding() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const card = CARDS[index] ?? CARDS[0]!;
  const isLast = index === CARDS.length - 1;

  function goTo(next: number) {
    if (next < 0 || next >= CARDS.length) return;
    setDirection(next > index ? 1 : -1);
    setIndex(next);
  }

  async function handleBegin() {
    await db.userSettings.put({
      key: 'settings',
      onboardingComplete: true,
      notificationsEnabled: false,
    });
    navigate('/', { replace: true });
  }

  // ─── Drag handling ──────────────────────────────────────────────────────────

  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    const threshold = 60;
    if (info.offset.x < -threshold && !isLast) {
      goTo(index + 1);
    } else if (info.offset.x > threshold && index > 0) {
      goTo(index - 1);
    }
  }

  return (
    <div className={styles.page}>
      {/* ─── Card area ──────────────────────────────────────── */}
      <div className={styles.cardArea}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={card.id}
            className={styles.card}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
          >
            <span className={styles.cardLabel}>{card.label}</span>
            <h1 className={styles.cardTitle}>{card.title}</h1>
            <p className={styles.cardBody}>{card.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── Bottom controls ─────────────────────────────────── */}
      <div className={styles.controls}>
        {/* Dot indicators */}
        <div className={styles.dots} role="tablist" aria-label="Onboarding step">
          {CARDS.map((c, i) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={i === index}
              aria-label={`Step ${i + 1}`}
              className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        {/* Action button */}
        {isLast ? (
          <Button fullWidth onClick={handleBegin}>
            Begin
          </Button>
        ) : (
          <Button fullWidth onClick={() => goTo(index + 1)}>
            Next
          </Button>
        )}

        {/* Skip link on first card */}
        {index === 0 && (
          <button className={styles.skip} onClick={handleBegin}>
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
