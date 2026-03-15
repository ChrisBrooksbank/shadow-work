import { useNavigate } from 'react-router-dom';
import { exercises, type ExerciseDepth, type ExerciseStage } from '../data/exercises';
import styles from './Exercises.module.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DEPTH_LABELS: Record<ExerciseDepth, string> = {
  surface: 'Surface',
  deep: 'Deep',
  abyss: 'Abyss',
};

const STAGE_LABELS: Record<ExerciseStage, string> = {
  recognition: 'Recognition',
  encounter: 'Encounter',
  dialogue: 'Dialogue',
  integration: 'Integration',
  ongoing: 'Ongoing',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Exercises() {
  const navigate = useNavigate();

  return (
    <main className={styles.page}>
      {/* ─── Header ─────────────────────────────────────────── */}
      <div className={styles.header}>
        <h1 className={styles.title}>Exercises</h1>
        <p className={styles.subtitle}>Guided shadow work practices</p>
      </div>

      {/* ─── Exercise grid ───────────────────────────────────── */}
      <div className={styles.grid}>
        {exercises.map((exercise) => (
          <div
            key={exercise.id}
            className={styles.card}
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/exercises/${exercise.id}`)}
            onKeyDown={(e) => e.key === 'Enter' && navigate(`/exercises/${exercise.id}`)}
            aria-label={`Start ${exercise.title}`}
          >
            {/* Depth badge */}
            <span className={`${styles.depthBadge} ${styles[`depth-${exercise.depth}`]}`}>
              {DEPTH_LABELS[exercise.depth]}
            </span>

            <h2 className={styles.cardTitle}>{exercise.title}</h2>
            <p className={styles.cardTagline}>{exercise.tagline}</p>

            {/* Meta row: stage + duration */}
            <div className={styles.meta}>
              <span className={styles.metaStage}>{STAGE_LABELS[exercise.stage]}</span>
              <span className={styles.metaDuration}>{exercise.estimatedMinutes} min</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
