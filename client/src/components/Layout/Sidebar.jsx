import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ini } from '../../utils/helpers';

export default function Sidebar({ showNav, onClose }) {
  const { user, setActivePage, activePage, logout, showToast, theme, toggleTheme, activeUsers, notifications, markNotifRead, markAllNotifRead } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const go = (page) => { setActivePage(page); setNotifOpen(false); onClose && onClose(); };

  const items = [
    { id: 'feed', label: 'Home', icon: '🏠' },
    { id: 'groups', label: 'Groups', icon: '👥' },
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'chat', label: 'Messages', icon: '💬' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'conf', label: 'Anonymous', icon: 'A' },
    { id: 'memes', label: 'Memes', icon: '😂' },
    { id: 'polls', label: 'Polls', icon: '📊' },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <nav className={`sidebar${showNav ? ' show' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">Bu</div>
          <span className="sidebar-logo-text">BuSocial</span>
        </div>

        <div className="sidebar-me" onClick={() => go('profile')}>
          <div className="sm-av">{user ? ini(user.name) : '?'}</div>
          <div>
            <div className="sm-name">{user?.name || 'User'}</div>
            <div className="sm-dept">{user?.dept?.split(' ')[0] || ''} · {user?.lvl || ''}L</div>
          </div>
        </div>

        {items.map((i) => (
          <div
            key={i.id}
            className={`nav${activePage === i.id ? ' on' : ''}`}
            onClick={() => go(i.id)}
          >
            <span className="nav-ico">{i.icon}</span>
            <span className="nav-text">{i.label}</span>
          </div>
        ))}

        <div className="nav" ref={notifRef} onClick={() => setNotifOpen(!notifOpen)} style={{ position: 'relative' }}>
          <span className="nav-ico">🔔</span>
          <span className="nav-text">Notifications</span>
          {unreadCount > 0 && <span className="nbadge">{unreadCount}</span>}
          {notifOpen && (
            <div className="tb-notif-dropdown" style={{ position: 'absolute', left: '100%', top: 0, marginLeft: 8 }} onClick={(e) => e.stopPropagation()}>
              <div className="tb-notif-header">
                <span>Notifications</span>
                {unreadCount > 0 && <span className="tb-notif-mark" onClick={() => { markAllNotifRead(); showToast('All marked as read'); }}>Mark all read</span>}
              </div>
              <div className="tb-notif-list">
                {notifications.length === 0 && <div className="tb-notif-empty">No notifications</div>}
                {notifications.map((n) => (
                  <div key={n.id} className={`tb-notif-item${n.read ? '' : ' unread'}`} onClick={() => { if (!n.read) { markNotifRead(n.id); } setNotifOpen(false); }}>
                    <div className="tb-notif-ico">{n.type === 'like' ? '❤️' : n.type === 'comment' ? '💬' : '👤'}</div>
                    <div className="tb-notif-body">
                      <div className="tb-notif-msg">{n.message}</div>
                      <div className="tb-notif-time">{n.time}</div>
                    </div>
                    {!n.read && <div className="tb-notif-unread-dot" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {user?.email === 'admin.babcock.edu.ng' && (
          <div className={`nav${activePage === 'admin' ? ' on' : ''}`} onClick={() => go('admin')}>
            <span className="nav-ico">🛡️</span>
            <span className="nav-text">Admin</span>
          </div>
        )}

        <div className="sidebar-online">
          <div className="sidebar-online-dot" />
          <span>{activeUsers} online</span>
        </div>

        <div className="sidebar-bottom">
          <div className="nav" onClick={toggleTheme}>
            <span className="nav-ico">{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span className="nav-text">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </div>
          <div className="nav" onClick={logout}>
            <span className="nav-ico">🚪</span>
            <span className="nav-text">Sign out</span>
          </div>
        </div>
      </nav>
    </>
  );
}
