import Topbar from './Topbar';
import Sidebar from './Sidebar';
import RightRail from './RightRail';
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
import { useApp } from '../../context/AppContext';

export default function Layout() {
  const { activePage } = useApp();

  return (
    <div id="app">
      <Topbar />
      <div className="layout">
        <Sidebar />
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
      </div>
      <Toast />
    </div>
  );
}
