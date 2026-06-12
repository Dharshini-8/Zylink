import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RedirectLoader = () => {
  const { username, code } = useParams();
  const { API_BASE } = useAuth();

  useEffect(() => {
    // Strip '/api' from 'http://localhost:5000/api' to get base backend domain
    const backendBase = API_BASE.replace('/api', '');
    const redirectUrl = `${backendBase}/${username}/${code}`;
    
    // Redirect instantly to backend handler
    window.location.href = redirectUrl;
  }, [username, code, API_BASE]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-foreground">
      <div className="flex flex-col items-center gap-4 text-center">
        <RefreshCw className="animate-spin text-primary" size={36} />
        <h1 className="text-lg font-bold tracking-tight">Redirecting you...</h1>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
          Please wait while we log metrics and forward you to your target destination.
        </p>
      </div>
    </div>
  );
};
