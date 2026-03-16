import { useParams, useNavigate, Link } from 'react-router-dom';
import { conceptBySlug, getNextConcept } from '../data/concepts';
import { exercises } from '../data/exercises';
import styles from './LearnTopic.module.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Find an exercise title by its ID */
function getExerciseTitle(id: string): string {
  const exercise = exercises.find((e) => e.id === id);
  return exercise?.title ?? id;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LearnTopic() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const concept = slug ? conceptBySlug[slug] : undefined;

  if (!concept) {
    return (
      <main className={styles.page}>
        <p className={styles.notFound}>Topic not found.</p>
        <button className={styles.backBtn} onClick={() => navigate('/learn')}>
          ← Back to Learn
        </button>
      </main>
    );
  }

  const nextConcept = getNextConcept(concept.slug);

  return (
    <main className={styles.page}>
      {/* ─── Back nav ────────────────────────────────────────── */}
      <button className={styles.backBtn} onClick={() => navigate('/learn')}>
        ← Learn
      </button>

      {/* ─── Header ──────────────────────────────────────────── */}
      <header className={styles.header}>
        <h1 className={styles.title}>{concept.title}</h1>
        <p className={styles.meta}>{concept.readingTime} min read</p>
        <p className={styles.summary}>{concept.summary}</p>
      </header>

      {/* ─── Sections ────────────────────────────────────────── */}
      <div className={styles.content}>
        {concept.sections.map((section) => (
          <section key={section.heading} className={styles.section}>
            <h2 className={styles.sectionHeading}>{section.heading}</h2>
            <div className={styles.sectionBody}>{renderBody(section.body)}</div>
          </section>
        ))}
      </div>

      {/* ─── Related exercises ───────────────────────────────── */}
      {concept.relatedExerciseIds.length > 0 && (
        <aside className={styles.exercises}>
          <h3 className={styles.exercisesHeading}>Try this</h3>
          <ul className={styles.exerciseList}>
            {concept.relatedExerciseIds.map((id) => (
              <li key={id}>
                <Link to={`/exercises/${id}`} className={styles.exerciseLink}>
                  {getExerciseTitle(id)} →
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}

      {/* ─── Next topic ──────────────────────────────────────── */}
      {nextConcept && (
        <nav className={styles.nextTopic}>
          <p className={styles.nextLabel}>Next topic</p>
          <button className={styles.nextBtn} onClick={() => navigate(`/learn/${nextConcept.slug}`)}>
            <span className={styles.nextTitle}>{nextConcept.title}</span>
            <span className={styles.nextArrow}>→</span>
          </button>
        </nav>
      )}
    </main>
  );
}

// ─── Body renderer ────────────────────────────────────────────────────────────

/**
 * Renders body text with simple markdown-like bold support.
 * Splits on double newlines to create paragraphs; **text** becomes <strong>.
 */
function renderBody(body: string): React.ReactNode {
  const paragraphs = body.split('\n\n');
  return paragraphs.map((para, i) => (
    <p key={i} className={styles.para}>
      {renderInline(para)}
    </p>
  ));
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
