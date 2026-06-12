import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar, BarChart3, Globe, ExternalLink, RefreshCw, Clock, Download, Shield
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Logo } from '../components/ui/Logo';

export const PublicAnalytics = () => {
  const { username, code } = useParams();
  const navigate = useNavigate();
  const { API_BASE } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/analytics/public/${username}/${code}`);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        setErrorMsg(result.error || 'Failed to fetch public analytics');
      }
    } catch (err) {
      setErrorMsg('Could not establish connection to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [username, code]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPercentage = (count, total) => {
    if (!total) return '0%';
    return `${Math.round((count / total) * 100)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-primary" size={32} />
          <p className="text-sm font-semibold text-muted-foreground">Fetching public reports...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-foreground p-6">
        <Card className="max-w-md w-full p-8 text-center glass-panel border-border shadow-xl">
          <Shield className="mx-auto text-rose-500 mb-4" size={40} />
          <h1 className="text-xl font-bold mb-2">Access Restrict</h1>
          <p className="text-sm text-muted-foreground mb-6">{errorMsg}</p>
          <Button onClick={() => navigate('/')} variant="primary" className="w-full">
            Return to Landing Page
          </Button>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const { urlInfo, metrics } = data;
  const totalClicks = metrics.totalClicks;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground transition-colors duration-300 pb-16">
      {/* Navbar */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <Logo size={28} />
            <span>ZyLink</span>
          </Link>
          <span className="text-xs font-semibold px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full">
            Public Statistics Page
          </span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-10 text-left">
        {/* Header Metadata Info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-border pb-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest block">Branded Link statistics</span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight truncate max-w-xl">
              /{urlInfo.customAlias || urlInfo.shortCode}
            </h1>
            <p className="text-sm text-muted-foreground truncate max-w-xl">
              Destination: <a href={urlInfo.longUrl} target="_blank" rel="noreferrer" className="underline hover:text-foreground inline-flex items-center gap-1">{urlInfo.longUrl} <ExternalLink size={12} /></a>
            </p>
          </div>
        </div>

        {/* Dashboard quick cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Total Clicks</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <BarChart3 size={16} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{totalClicks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Created Date</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Calendar size={16} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-semibold">{formatDate(urlInfo.createdAt)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Last Visited</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center">
                <Clock size={16} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-semibold">
                {urlInfo.lastVisitedAt ? formatDate(urlInfo.lastVisitedAt) : 'Never'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic Charts Section */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Clicks Over Time (14 Days)</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgb(124, 58, 237)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="rgb(124, 58, 237)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                    tickFormatter={(str) => {
                      const d = new Date(str);
                      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Area type="monotone" dataKey="clicks" stroke="rgb(124, 58, 237)" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Visitor Demographics breakdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Referrers */}
          <Card>
            <CardHeader><CardTitle className="text-sm font-bold">Traffic Referrers</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {metrics.referrers.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No referrer data recorded.</p>
              ) : (
                metrics.referrers.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{item._id || 'Direct'}</span>
                      <span className="font-mono text-muted-foreground">{item.count} clicks ({getPercentage(item.count, totalClicks)})</span>
                    </div>
                    <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: getPercentage(item.count, totalClicks) }} />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Location Country */}
          <Card>
            <CardHeader><CardTitle className="text-sm font-bold">Geographical Distribution</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {metrics.locations.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No geographical data recorded.</p>
              ) : (
                metrics.locations.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{item._id || 'Unknown'}</span>
                      <span className="font-mono text-muted-foreground">{item.count} ({getPercentage(item.count, totalClicks)})</span>
                    </div>
                    <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: getPercentage(item.count, totalClicks) }} />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
