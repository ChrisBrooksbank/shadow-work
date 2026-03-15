import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  padded?: boolean;
  className?: string;
}

export default function Card({ children, onClick, padded = true, className }: CardProps) {
  const classes = [
    styles.card,
    padded ? styles.padded : '',
    onClick ? styles.clickable : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  if (onClick) {
    return (
      <div className={classes} onClick={onClick} role="button" tabIndex={0}>
        {children}
      </div>
    );
  }

  return <div className={classes}>{children}</div>;
}
