import { AppProvider, useApp } from './context/AppContext';
import Auth from './components/Auth/Auth';
import Layout from './components/Layout/Layout';
import './App.css';

function AppContent() {
  const { user, theme } = useApp();
  return <div className={`app-root theme-${theme}`}>{user ? <Layout /> : <Auth />}</div>;
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
