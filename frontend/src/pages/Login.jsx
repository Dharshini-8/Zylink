import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Logo } from '../components/ui/Logo';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrUsername || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const result = await login(emailOrUsername, password);
    setIsLoading(false);

    if (result.success) {
      toast.success('Welcome back to ZyLink!');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-foreground transition-colors duration-300 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-md">
        {/* Brand Logo */}
        <div className="flex flex-col items-center justify-center mb-8 text-center">
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight mb-2">
            <Logo size={36} />
            <span>ZyLink</span>
          </Link>
          <p className="text-muted-foreground text-sm">Shorten links, track clicks, optimize engagement</p>
        </div>

        {/* Card */}
        <Card className="p-6 md:p-8 bg-card border-border shadow-xl rounded-2xl glass-panel text-left">
          <h2 className="text-xl font-bold mb-1">Welcome back</h2>
          <p className="text-xs text-muted-foreground mb-6">Enter your credentials below to log into your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Email or Username</label>
              <Input
                type="text"
                placeholder="you@example.com or username"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
                className="bg-background/50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-foreground">Password</label>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-2 h-10" isLoading={isLoading}>
              Sign In <ArrowRight size={14} className="ml-1" />
            </Button>
          </form>

          <div className="mt-6 border-t border-border pt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
