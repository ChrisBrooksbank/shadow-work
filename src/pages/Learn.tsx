import { useNavigate } from 'react-router-dom';
import { concepts } from '../data/concepts';
import styles from './Learn.module.css';

export default function Learn() {
  const navigate = useNavigate();

  return (
    <main className={styles.page}>
      {/* ─── Header ─────────────────────────────────────────── */}
      <div className={styles.header}>
        <h1 className={styles.title}>Learn</h1>
        <p className={styles.subtitle}>Understand the psychology behind shadow work</p>
      </div>

      {/* ─── Concept grid ────────────────────────────────────── */}
      <div className={styles.grid}>
        {concepts.map((concept) => (
          <div
            key={concept.slug}
            className={styles.card}
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/learn/${concept.slug}`)}
            onKeyDown={(e) => e.key === 'Enter' && navigate(`/learn/${concept.slug}`)}
            aria-label={`Read ${concept.title}`}
          >
            <h2 className={styles.cardTitle}>{concept.title}</h2>
            <p className={styles.cardSummary}>{concept.summary}</p>
            <div className={styles.meta}>
              <span className={styles.metaReading}>{concept.readingTime} min read</span>
              <span className={styles.metaArrow}>→</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
