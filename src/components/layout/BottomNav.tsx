import { useLocation, useNavigate } from 'react-router-dom';
import { hapticTap } from '../../lib/haptics';
import { useTextareaFocus } from '../../hooks/useTextareaFocus';
import styles from './BottomNav.module.css';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  matchPaths: string[];
}

function IconHome() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconExercises() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 8V12L14.5 14.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconJournal() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 8H16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M8 12H16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M8 16H12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconProfile() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M4 20C4 16.686 7.582 14 12 14C16.418 14 20 16.686 20 20"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Home',
    path: '/',
    icon: <IconHome />,
    matchPaths: ['/', '/check-in'],
  },
  {
    label: 'Exercises',
    path: '/exercises',
    icon: <IconExercises />,
    matchPaths: ['/exercises'],
  },
  {
    label: 'Journal',
    path: '/journal',
    icon: <IconJournal />,
    matchPaths: ['/journal'],
  },
  {
    label: 'Profile',
    path: '/progress',
    icon: <IconProfile />,
    matchPaths: ['/progress', '/settings'],
  },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const textareaFocused = useTextareaFocus();

  if (textareaFocused) {
    return null;
  }

  function isActive(item: NavItem): boolean {
    return item.matchPaths.some(
      (p) => location.pathname === p || location.pathname.startsWith(p + '/'),
    );
  }

  function handleTap(path: string) {
    hapticTap();
    navigate(path);
  }

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.path}
          className={`${styles.item} ${isActive(item) ? styles.active : ''}`}
          onClick={() => handleTap(item.path)}
          aria-label={item.label}
          aria-current={isActive(item) ? 'page' : undefined}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
