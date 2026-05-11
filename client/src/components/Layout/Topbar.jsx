import { useApp } from '../../context/AppContext';
import { ini } from '../../utils/helpers';

export default function Topbar({ onMenu }) {
  const { user, setActivePage, showToast } = useApp();

  return (
    <div className="topbar">
      <div className="tb-mobile-menu" onClick={onMenu}>☰</div>
      <div className="tb-logo" onClick={() => setActivePage('feed')}>
        <div className="tb-icon">
          <svg viewBox="0 0 28 28" width="28" height="28" fill="none">
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28">
                <stop offset="0%" stopColor="#4f7fff" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="24" height="24" rx="7" fill="url(#logoGrad)" />
            <text x="14" y="19" textAnchor="middle" fontSize="13" fontWeight="900" fill="#fff" fontFamily="'Archivo Black',sans-serif">Bu</text>
          </svg>
        </div>
        <span className="tb-name">BuSocial</span>
      </div>
      <div className="tb-search">
        <span className="tb-search-ico">🔍</span>
        <input type="text" placeholder="Search students, groups, events…" />
      </div>
      <div className="tb-right">
        <div className="tb-btn" onClick={() => setActivePage('chat')} title="Messages">💬</div>
        <div className="tb-btn" onClick={() => showToast('🔔 3 new notifications')} title="Notifications">
          🔔<div className="notif-dot" />
        </div>
        <div className="tb-av" onClick={() => setActivePage('profile')}>
          {user ? ini(user.name) : '?'}
        </div>
      </div>
    </div>
  );
}
