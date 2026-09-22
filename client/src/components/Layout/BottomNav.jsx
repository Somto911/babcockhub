import { useApp } from '../../context/AppContext';
import Icon from '../Common/Icon';

export default function BottomNav() {
  const { activePage, setActivePage, notifications } = useApp();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const go = (id) => {
    if (id === 'search') {
      setActivePage('feed');
      setTimeout(() => {
        const el = document.querySelector('.tb-search input');
        if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      }, 150);
      return;
    }
    if (id === 'notif') {
      setActivePage('feed');
      setTimeout(() => {
        const btn = document.querySelector('.tb-notif-toggle');
        if (btn) btn.click();
      }, 150);
      return;
    }
    setActivePage(id === 'explore' ? 'groups' : id === 'home' ? 'feed' : id);
  };

  const items = [
    { id: 'home', label: 'Home', icon: 'home', page: 'feed' },
    { id: 'explore', label: 'Explore', icon: 'explore', page: 'groups' },
    { id: 'search', label: 'Search', icon: 'search', page: 'feed' },
    { id: 'chat', label: 'Messages', icon: 'message', page: 'chat' },
    { id: 'notif', label: 'Notifications', icon: 'bell', page: 'feed' },
  ];

  return (
    <nav className="bottom-nav">
      {items.map((i) => (
        <div key={i.id} className={`bnav-item${activePage === i.page && i.id !== 'search' && i.id !== 'notif' ? ' on' : ''}`} onClick={() => go(i.id)} title={i.label}>
          <div className="bnav-ico">
            <Icon name={i.icon} size={22} />
            {i.id === 'notif' && unreadCount > 0 && <span className="bnav-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </div>
          <div className="bnav-lbl">{i.label}</div>
        </div>
      ))}
    </nav>
  );
}