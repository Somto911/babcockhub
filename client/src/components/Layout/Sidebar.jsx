import { useApp } from '../../context/AppContext';
import { ini } from '../../utils/helpers';

export default function Sidebar({ showNav, onClose }) {
  const { user, setActivePage, activePage, logout, showToast, theme, toggleTheme, activeUsers } = useApp();

  const go = (page) => { setActivePage(page); onClose && onClose(); };

  const items = [
    { id: 'feed', label: 'Home Feed', icon: 'H' },
    { id: 'groups', label: 'Groups', icon: 'G', badge: '5' },
    { id: 'events', label: 'Events', icon: 'E' },
    { id: 'chat', label: 'Messages', icon: 'M' },
    { id: 'profile', label: 'My Profile', icon: 'P' },
  ];

  const campusItems = [
    { id: 'conf', label: 'Anonymous', icon: 'A' },
    { id: 'memes', label: 'Meme Hub', icon: 'M' },
    { id: 'polls', label: 'Polls & Trends', icon: 'T' },
  ];

  return (
    <>
      <nav className={`sidebar${showNav ? ' show' : ''}`}>
        <div className="sidebar-me" onClick={() => go('profile')}>
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
            onClick={() => go(i.id)}
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
            onClick={() => go(i.id)}
          >
            <span className="nav-ico">{i.icon}</span>
            {i.label}
          </div>
        ))}

        {user?.email === 'admin.babcock.edu.ng' && (
          <div className={`nav${activePage === 'admin' ? ' on' : ''}`} onClick={() => go('admin')}>
            <span className="nav-ico">A</span>Admin Panel
          </div>
        )}

        <div className="sidebar-online">
          <div className="sidebar-online-dot" />
          <span>{activeUsers} active user{activeUsers !== 1 ? 's' : ''}</span>
        </div>
        <div className="sid-lbl">Account</div>
        <div className="nav" onClick={toggleTheme} style={{ color: 'var(--text2)' }}>
          <span className="nav-ico">{theme === 'dark' ? 'L' : 'D'}</span>
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </div>
        <div className="nav" onClick={logout} style={{ color: 'var(--text2)' }}>
          <span className="nav-ico">↗</span>Sign Out
        </div>
      </nav>
    </>
  );
}
