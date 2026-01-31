import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { TrendingUp } from 'lucide-react';

interface AuthPageProps {
  onLogin: (username: string) => void;
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = JSON.parse(localStorage.getItem('stockSimUsers') || '{}');
    
    if (!users[loginUsername]) {
      setError('User not found');
      return;
    }
    
    if (users[loginUsername].password !== loginPassword) {
      setError('Incorrect password');
      return;
    }

    onLogin(loginUsername);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (signupUsername.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (signupPassword.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    const users = JSON.parse(localStorage.getItem('stockSimUsers') || '{}');
    
    if (users[signupUsername]) {
      setError('Username already exists');
      return;
    }

    users[signupUsername] = {
      password: signupPassword,
      balance: 10000,
      portfolio: {}
    };

    localStorage.setItem('stockSimUsers', JSON.stringify(users));
    onLogin(signupUsername);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-950 to-teal-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/50">
              <TrendingUp className="w-6 h-6 text-slate-900" />
            </div>
          </div>
          <h1 className="text-4xl mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Stock Kidz</h1>
          <p className="text-slate-300">Learn to invest and have fun!</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back!</CardTitle>
                <CardDescription>Login to continue trading stocks</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username</Label>
                    <Input
                      id="login-username"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  {error && <p className="text-destructive text-sm">{error}</p>}
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Start with $10,000 to invest!</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <Input
                      id="signup-username"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      placeholder="Choose a username"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Choose a password"
                      required
                    />
                  </div>
                  {error && <p className="text-destructive text-sm">{error}</p>}
                  <Button type="submit" className="w-full">
                    Create Account
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}