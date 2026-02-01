import { useState, useEffect } from 'react';
import { AuthPage } from '@/app/components/auth-page';
import { Dashboard } from '@/app/components/dashboard';
import { Accounts } from '@/app/components/accounts';
import { Toaster } from '@/app/components/ui/sonner';

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'accounts'>('dashboard');

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
            onAccount={() => setCurrentView('accounts')} // Switch to Accounts page
            onLeaderboard={() => {}} // Optional: implement leaderboard later
          />
        ) : (
          <Accounts
            username={currentUser}
            onBack={() => setCurrentView('dashboard')} // Back to Dashboard
          />
        )
      ) : (
        <AuthPage onLogin={handleLogin} />
      )}
      <Toaster position="top-center" />
    </>
  );
}