import { AppProvider, useApp } from './context/AppContext';
import Auth from './components/Auth/Auth';
import Layout from './components/Layout/Layout';
import './App.css';

function AppContent() {
  const { user } = useApp();
  return user ? <Layout /> : <Auth />;
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
