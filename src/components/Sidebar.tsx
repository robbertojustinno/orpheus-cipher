import { navigation } from '../data/mockData';
import type { NavItem } from '../types';
import { Icon } from './Icon';
import styles from './Sidebar.module.css';

const badgeNavigation: NavItem = { label: 'Distintivo', icon: 'report' };

export function Sidebar({
  active,
  onNavigate,
  open,
  onClose,
  showBadge = false,
}: {
  active: string;
  onNavigate: (s: string) => void;
  open: boolean;
  onClose: () => void;
  showBadge?: boolean;
}) {
  const items = showBadge ? [...navigation, badgeNavigation] : navigation;

  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
      <div className={styles.mobileHead}>
        <span>ORPHEUS</span>
        <button onClick={onClose}>
          <Icon name="close" />
        </button>
      </div>
      <div className={styles.sectionLabel}>NAVEGAÇÃO PRINCIPAL</div>
      <nav>
        {items.map((item) => (
          <button
            key={item.label}
            className={`${styles.item} ${active === item.label ? styles.active : ''}`}
            onClick={() => {
              onNavigate(item.label);
              onClose();
            }}
          >
            <Icon name={item.icon} size={17} />
            <span>{item.label}</span>
            {item.alert && <i className={styles.alertDot} />}{' '}
            {item.badge && <b>{item.badge}</b>}
          </button>
        ))}
      </nav>
      <div className={styles.connection}>
        <div>
          <i /> CONEXÃO
        </div>
        <strong>ORPHEUS NETWORK</strong>
        <span>NÓ ATIVO: BR-SAO-09</span>
        <em>
          <i />
          <i />
          <i />
          <i />
        </em>
      </div>
    </aside>
  );
}
