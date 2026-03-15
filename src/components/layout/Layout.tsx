import { useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import styles from './Layout.module.css';

/** Routes that should not render the bottom nav */
const HIDE_NAV_ROUTES = ['/onboarding', '/exercises/'];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const showNav = !HIDE_NAV_ROUTES.some((route) => location.pathname.startsWith(route));

  return (
    <div className={styles.shell}>
      <main className={`${styles.content} ${showNav ? styles.withNav : ''}`}>{children}</main>
      {showNav && <BottomNav />}
    </div>
  );
}
