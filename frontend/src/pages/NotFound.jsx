import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Logo } from '../components/ui/Logo';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-foreground transition-colors duration-300 relative overflow-hidden">
      {/* Decorative background gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tight">
            <Logo size={32} />
            <span>ZyLink</span>
          </div>
        </div>

        {/* Card */}
        <Card className="p-8 text-center border-border bg-card shadow-xl rounded-2xl glass-panel relative overflow-hidden text-left">
          <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6">
            <AlertCircle size={32} />
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight mb-3 text-center">404 - Page Not Found</h1>
          <p className="text-sm text-muted-foreground mb-8 text-center leading-relaxed">
            The link you followed may be broken, or the page may have been moved. Double check the address or try again.
          </p>

          <div className="space-y-3">
            <Button onClick={() => navigate('/')} variant="primary" className="w-full h-11">
              Go to Landing Page
            </Button>
            <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full h-11 gap-2">
              <ArrowLeft size={16} /> Dashboard
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
