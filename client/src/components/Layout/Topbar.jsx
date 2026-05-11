import { useApp } from '../../context/AppContext';
import { ini } from '../../utils/helpers';

export default function Topbar({ onMenu }) {
  const { user, setActivePage, showToast } = useApp();

  return (
    <div className="topbar">
      <div className="tb-mobile-menu" onClick={onMenu}>☰</div>
      <div className="tb-logo" onClick={() => setActivePage('feed')}>
        <div className="tb-icon">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            <text x="12" y="16.5" textAnchor="middle" fontSize="11" fontWeight="bold" fill="currentColor">Bu</text>
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
