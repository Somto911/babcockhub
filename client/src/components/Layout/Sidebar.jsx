import { useApp } from '../../context/AppContext';
import { ini } from '../../utils/helpers';

export default function Sidebar() {
  const { user, setActivePage, activePage, logout, showToast } = useApp();

  const items = [
    { id: 'feed', label: 'Home Feed', icon: '🏠' },
    { id: 'groups', label: 'Groups', icon: '👥', badge: '5' },
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'chat', label: 'Messages', icon: '💬' },
    { id: 'profile', label: 'My Profile', icon: '👤' },
  ];

  const campusItems = [
    { id: 'conf', label: 'Confession Wall', icon: '👻' },
    { id: 'memes', label: 'Meme Hub', icon: '😂' },
    { id: 'polls', label: 'Polls & Trends', icon: '📊' },
  ];

  return (
    <>
      <nav className="sidebar">
        <div className="sidebar-me" onClick={() => { setActivePage('profile'); }}>
          <div className="sm-av">{user ? ini(user.name) : '?'}</div>
          <div>
            <div className="sm-name">{user?.name || 'User'}</div>
            <div className="sm-dept">{user?.dept?.split(' ')[0] || ''} · {user?.lvl || ''}L</div>
          </div>
        </div>

        <div className="sid-lbl">Main</div>
        {items.map((i) => (
          <div
            key={i.id}
            className={`nav${activePage === i.id ? ' on' : ''}`}
            onClick={() => setActivePage(i.id)}
          >
            <span className="nav-ico">{i.icon}</span>
            {i.label}
            {i.badge && <span className="nbadge blue">{i.badge}</span>}
          </div>
        ))}

        <div className="sid-lbl">Campus</div>
        {campusItems.map((i) => (
          <div
            key={i.id}
            className={`nav${activePage === i.id ? ' on' : ''}`}
            onClick={() => setActivePage(i.id)}
          >
            <span className="nav-ico">{i.icon}</span>
            {i.label}
          </div>
        ))}

        {user?.email === 'admin.babcock.edu.ng' && (
          <div className={`nav${activePage === 'admin' ? ' on' : ''}`} onClick={() => setActivePage('admin')}>
            <span className="nav-ico">🛡️</span>Admin Panel
          </div>
        )}

        <div className="sid-lbl">Account</div>
        <div className="nav" onClick={logout} style={{ color: 'var(--text2)' }}>
          <span className="nav-ico">↗</span>Sign Out
        </div>
      </nav>
    </>
  );
}
