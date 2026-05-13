import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ini } from '../../utils/helpers';

export default function Topbar({ onMenu }) {
  const { user, setActivePage, showToast, notifications, markNotifRead, markAllNotifRead, setSearchQuery, posts } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const searchResults = searchVal.trim()
    ? posts.filter((p) => p.txt.toLowerCase().includes(searchVal.toLowerCase()) || p.author.toLowerCase().includes(searchVal.toLowerCase())).slice(0, 5)
    : [];

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
      <div className="tb-search" ref={searchRef}>
        <span className="tb-search-ico">🔍</span>
        <input type="text" placeholder="Search posts…" value={searchVal} onChange={(e) => { setSearchVal(e.target.value); setSearchOpen(true); setSearchQuery(e.target.value); }} onFocus={() => searchVal.trim() && setSearchOpen(true)} />
        {searchOpen && searchVal.trim() && (
          <div className="tb-search-dropdown">
            {searchResults.length === 0 && <div className="tb-search-empty">No results found</div>}
            {searchResults.map((p) => (
              <div key={p.id} className="tb-search-item" onClick={() => { setSearchOpen(false); setActivePage('feed'); }}>
                <div className="tb-search-item-av" style={{ background: 'var(--brand)' }}>{ini(p.author)}</div>
                <div className="tb-search-item-body">
                  <div className="tb-search-item-author">{p.author}</div>
                  <div className="tb-search-item-text">{p.txt.slice(0, 60)}{p.txt.length > 60 ? '…' : ''}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="tb-right">
        <div className="tb-btn" onClick={() => setActivePage('chat')} title="Messages">💬</div>
        <div className="tb-btn notif-btn" ref={notifRef} onClick={() => setNotifOpen(!notifOpen)} title="Notifications">
          🔔{unreadCount > 0 && <div className="notif-dot" />}
        </div>
        {notifOpen && (
          <div className="tb-notif-dropdown">
            <div className="tb-notif-header">
              <span>Notifications</span>
              {unreadCount > 0 && <span className="tb-notif-mark" onClick={() => { markAllNotifRead(); showToast('✅ All marked as read'); }}>Mark all read</span>}
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
        <div className="tb-av" onClick={() => setActivePage('profile')}>
          {user ? ini(user.name) : '?'}
        </div>
      </div>
    </div>
  );
}
