import styles from './TextArea.module.css';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export default function TextArea({ label, hint, id, className, ...props }: TextAreaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={styles.wrapper}>
      {label && (
        <label className={styles.label} htmlFor={textareaId}>
          {label}
        </label>
      )}
      <textarea id={textareaId} className={`${styles.textarea} ${className ?? ''}`} {...props} />
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}
