import { useState, useEffect } from 'react';
import { AuthPage } from '@/app/components/auth-page';
import { Dashboard } from '@/app/components/dashboard';
import { Accounts } from '@/app/components/accounts';
import { StockNews } from '@/app/components/StockNews';
import { Toaster } from '@/app/components/ui/sonner';


export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'accounts' | 'StockNews'>('dashboard');

  useEffect(() => {
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) setCurrentUser(savedUser);
  }, []);

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    sessionStorage.setItem('currentUser', username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('currentUser');
  };

  return (
    <>
      {currentUser ? (
  currentView === 'dashboard' ? (
    <Dashboard
      username={currentUser}
      onLogout={handleLogout}
      onAccount={() => setCurrentView('accounts')}
      onLeaderboard={() => {}}
      onNews={() => setCurrentView('StockNews')}
    />
  ) : currentView === 'accounts' ? (
    <Accounts
      username={currentUser}
      onBack={() => setCurrentView('dashboard')}
    />
  ) : (
    <StockNews
      username={currentUser}
      onBack={() => setCurrentView('dashboard')}
    />
  )
) : (
  <AuthPage onLogin={handleLogin} />
)}
      <Toaster position="top-center" />
    </>
  );
}

