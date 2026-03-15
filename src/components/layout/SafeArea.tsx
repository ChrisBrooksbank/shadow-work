import styles from './SafeArea.module.css';

interface SafeAreaProps {
  children: React.ReactNode;
  className?: string;
}

export default function SafeArea({ children, className }: SafeAreaProps) {
  const classes = [styles.safeArea, className ?? ''].filter(Boolean).join(' ');
  return <div className={classes}>{children}</div>;
}
