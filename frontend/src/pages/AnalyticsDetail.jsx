import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Calendar, BarChart3, QrCode, Globe,
  Shield, Check, Copy, ExternalLink, RefreshCw, Smartphone, Monitor,
  Tablet, Clock, Compass, Chrome, Laptop, Download, Info
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Logo } from '../components/ui/Logo';

export const AnalyticsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`/analytics/url/${id}`);
      if (res.success) {
        setData(res.data);
      } else {
        toast.error(res.error || 'Failed to load analytics');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error('Network error loading analytics');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const copyQrImage = async () => {
    if (!data?.urlInfo?.qrCode) return;
    try {
      const response = await fetch(data.urlInfo.qrCode);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      toast.success('QR Code image copied to clipboard!');
    } catch (err) {
      console.error(err);
      toast.error('Copy failed. You can right-click the QR image to copy.');
    }
  };

  const downloadQr = () => {
    if (!data?.urlInfo?.qrCode) return;
    const link = document.createElement('a');
    link.href = data.urlInfo.qrCode;
    link.download = `qr-code-${data.urlInfo.customAlias || data.urlInfo.shortCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper to calculate percentages
  const getPercentage = (count, total) => {
    if (!total) return '0%';
    return `${Math.round((count / total) * 100)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-primary" size={32} />
          <p className="text-sm font-semibold text-muted-foreground">Gathering analytics logs...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { urlInfo, metrics } = data;
  const totalClicks = metrics.totalClicks;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground transition-colors duration-300 pb-16">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <Logo size={28} />
            <span>ZyLink</span>
          </Link>
          <Button onClick={() => navigate('/dashboard')} variant="outline" size="sm" className="gap-2">
            <ArrowLeft size={14} /> Back to Dashboard
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-10 text-left">
        {/* Header Metadata Info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-border pb-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest block">URL Performance Report</span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight truncate max-w-xl">
              /{urlInfo.customAlias || urlInfo.shortCode}
            </h1>
            <p className="text-sm text-muted-foreground truncate max-w-xl">
              Destination: <a href={urlInfo.longUrl} target="_blank" rel="noreferrer" className="underline hover:text-foreground inline-flex items-center gap-1">{urlInfo.longUrl} <ExternalLink size={12} /></a>
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <Button onClick={() => handleCopy(urlInfo.shortUrl)} variant="outline" className="flex-1 md:flex-none gap-2 h-10 text-xs">
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              {copied ? 'Copied URL' : 'Copy Short URL'}
            </Button>
            {urlInfo.isPublicAnalytics && (
              <a
                href={`/public/${data.urlInfo.shortUrl.split('/').slice(-2).join('/')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 border border-border rounded-lg bg-secondary/50 text-xs font-semibold hover:bg-secondary gap-1.5"
              >
                Public Page <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        {/* Dashboard quick cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <div className="text-sm font-semibold">{formatDate(urlInfo.createdAt).split(',')[0]}</div>
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
                {urlInfo.lastVisitedAt ? formatDate(urlInfo.lastVisitedAt).split(',')[0] : 'Never'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Link Expiry</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Clock size={16} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-semibold">
                {urlInfo.expiryDate ? formatDate(urlInfo.expiryDate).split(',')[0] : 'No Expiry'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Chart */}
          <Card className="lg:col-span-2">
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

          {/* QR Code Container */}
          <Card className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-base font-bold">QR Code</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pb-6">
              {urlInfo.qrCode ? (
                <div className="bg-white p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center mb-4">
                  <img src={urlInfo.qrCode} alt="QR Code" className="w-40 h-40" />
                </div>
              ) : (
                <div className="w-40 h-40 bg-secondary flex items-center justify-center rounded-xl mb-4 text-xs text-muted-foreground">No QR Code</div>
              )}
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <Button onClick={copyQrImage} variant="outline" size="sm" className="flex-1 text-xs">
                  Copy Image
                </Button>
                <Button onClick={downloadQr} variant="primary" size="sm" className="flex-1 text-xs gap-1">
                  <Download size={12} /> Download PNG
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visitor Demographics breakdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
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

          {/* Browsers */}
          <Card>
            <CardHeader><CardTitle className="text-sm font-bold">Web Browsers</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {metrics.browsers.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No browser logs found.</p>
              ) : (
                metrics.browsers.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{item._id || 'Unknown'}</span>
                      <span className="font-mono text-muted-foreground">{item.count} ({getPercentage(item.count, totalClicks)})</span>
                    </div>
                    <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: getPercentage(item.count, totalClicks) }} />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Device types */}
          <Card>
            <CardHeader><CardTitle className="text-sm font-bold">Devices</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {metrics.devices.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No device logs found.</p>
              ) : (
                metrics.devices.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{item._id || 'Desktop'}</span>
                      <span className="font-mono text-muted-foreground">{item.count} ({getPercentage(item.count, totalClicks)})</span>
                    </div>
                    <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: getPercentage(item.count, totalClicks) }} />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Raw visitor logs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Recent Visitor Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto border border-border rounded-xl">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-xs text-muted-foreground font-semibold">
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Browser</th>
                    <th className="p-4">OS</th>
                    <th className="p-4">Device</th>
                    <th className="p-4">Referrer</th>
                    <th className="p-4">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.recentVisits.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-xs text-muted-foreground">
                        No click visits logged for this link yet.
                      </td>
                    </tr>
                  ) : (
                    metrics.recentVisits.map((visit) => (
                      <tr key={visit._id} className="border-b border-border text-xs hover:bg-secondary/20 transition-all">
                        <td className="p-4 text-muted-foreground">{formatDate(visit.timestamp)}</td>
                        <td className="p-4 font-semibold">{visit.browser || 'Unknown'}</td>
                        <td className="p-4 font-semibold">{visit.os || 'Unknown'}</td>
                        <td className="p-4 text-muted-foreground">{visit.device || 'Desktop'}</td>
                        <td className="p-4 text-muted-foreground truncate max-w-[120px]">{visit.referrer || 'Direct'}</td>
                        <td className="p-4 font-semibold text-primary">
                          {visit.location?.city ? `${visit.location.city}, ${visit.location.country}` : 'Unknown'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
