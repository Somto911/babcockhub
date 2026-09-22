import Sidebar from './Sidebar';
import Topbar from './Topbar';
import RightRail from './RightRail';
import BottomNav from './BottomNav';
import Feed from '../Feed/Feed';
import Chat from '../Chat/Chat';
import Profile from '../Profile/Profile';
import Confessions from '../Confessions/Confessions';
import Memes from '../Memes/Memes';
import Polls from '../Polls/Polls';
import Admin from '../Admin/Admin';
import Groups from '../Groups/Groups';
import Events from '../Events/Events';
import Toast from '../Common/Toast';
import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function Layout() {
  const { activePage } = useApp();
  const [showNav, setShowNav] = useState(false);

  return (
    <div id="app">
      <div className={`nav-backdrop${showNav ? ' show' : ''}`} onClick={() => setShowNav(false)} />
      <Topbar onMenu={() => setShowNav((s) => !s)} />
      <Sidebar showNav={showNav} onClose={() => setShowNav(false)} />
      <main className="main">
        {activePage === 'feed' && <Feed />}
        {activePage === 'chat' && <Chat />}
        {activePage === 'profile' && <Profile />}
        {activePage === 'conf' && <Confessions />}
        {activePage === 'memes' && <Memes />}
        {activePage === 'polls' && <Polls />}
        {activePage === 'admin' && <Admin />}
        {activePage === 'groups' && <Groups />}
        {activePage === 'events' && <Events />}
        {!['feed', 'chat', 'profile', 'conf', 'memes', 'polls', 'admin', 'groups', 'events'].includes(activePage) && <Feed />}
      </main>
      <RightRail />
      <BottomNav />
      <Toast />
    </div>
  );
}
