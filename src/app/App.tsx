import { useState, useEffect } from 'react';
import { AuthPage } from '@/app/components/auth-page';
import { Dashboard } from '@/app/components/dashboard';
import { Toaster } from '@/app/components/ui/sonner';

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(savedUser);
    }
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
        <Dashboard username={currentUser} onLogout={handleLogout} />
      ) : (
        <AuthPage onLogin={handleLogin} />
      )}
      <Toaster position="top-center" />
    </>
  );
}
