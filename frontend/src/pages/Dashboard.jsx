import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Layers, LogOut, Sun, Moon, Plus, FileText, Search, Copy, Check,
  Edit2, BarChart3, Trash2, ExternalLink, RefreshCw, AlertCircle,
  HelpCircle, ChevronLeft, ChevronRight, CheckCircle2, Loader2, X,
  QrCode, Download
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Dialog } from '../components/ui/Dialog';
import { Logo } from '../components/ui/Logo';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, authFetch } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();

  // Dashboard Stats
  const [stats, setStats] = useState({
    totalLinks: 0,
    activeLinks: 0,
    totalClicks: 0,
    recentActivity: [],
    clickTrend: []
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // URLs Table State
  const [urls, setUrls] = useState([]);
  const [urlsLoading, setUrlsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [copiedId, setCopiedId] = useState(null);

  // Modals Open State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);

  // Create Form State
  const [longUrl, setLongUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isPublicAnalytics, setIsPublicAnalytics] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Edit Form State
  const [editId, setEditId] = useState('');
  const [editLongUrl, setEditLongUrl] = useState('');
  const [editCustomAlias, setEditCustomAlias] = useState('');
  const [editExpiryDate, setEditExpiryDate] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editIsPublicAnalytics, setEditIsPublicAnalytics] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Bulk Form State
  const [csvText, setCsvText] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  // QR Code Modal State
  const [selectedUrl, setSelectedUrl] = useState(null);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const data = await authFetch('/analytics/summary');
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load stats');
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchUrls = async () => {
    try {
      setUrlsLoading(true);
      const data = await authFetch(`/urls?page=${page}&limit=7&search=${search}`);
      if (data.success) {
        setUrls(data.urls);
        setTotalPages(data.pages);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load urls');
    } finally {
      setUrlsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUrls();
  }, [page, search]);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!longUrl) return;

    setCreateLoading(true);
    try {
      const data = await authFetch('/urls', {
        method: 'POST',
        body: JSON.stringify({
          longUrl,
          customAlias: customAlias.trim() || undefined,
          expiryDate: expiryDate || undefined,
          isPublicAnalytics
        })
      });

      if (data.success) {
        toast.success('Short link generated successfully!');
        setIsCreateOpen(false);
        setLongUrl('');
        setCustomAlias('');
        setExpiryDate('');
        setIsPublicAnalytics(false);
        fetchUrls();
        fetchStats();
      } else {
        toast.error(data.error || 'Failed to shorten URL');
      }
    } catch (err) {
      toast.error('Failed to communicate with server');
    } finally {
      setCreateLoading(false);
    }
  };

  const openEditModal = (url) => {
    setEditId(url._id);
    setEditLongUrl(url.longUrl);
    setEditCustomAlias(url.customAlias || '');
    setEditExpiryDate(url.expiryDate ? url.expiryDate.split('T')[0] : '');
    setEditIsActive(url.isActive);
    setEditIsPublicAnalytics(url.isPublicAnalytics || false);
    setIsEditOpen(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const data = await authFetch(`/urls/${editId}`, {
        method: 'PUT',
        body: JSON.stringify({
          longUrl: editLongUrl,
          customAlias: editCustomAlias.trim() || null,
          expiryDate: editExpiryDate || null,
          isActive: editIsActive,
          isPublicAnalytics: editIsPublicAnalytics
        })
      });

      if (data.success) {
        toast.success('Short link updated successfully!');
        setIsEditOpen(false);
        fetchUrls();
        fetchStats();
      } else {
        toast.error(data.error || 'Failed to update URL');
      }
    } catch (err) {
      toast.error('Server error updating URL');
    } finally {
      setEditLoading(false);
    }
  };

  const toggleLinkStatus = async (url) => {
    try {
      const data = await authFetch(`/urls/${url._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          isActive: !url.isActive
        })
      });
      if (data.success) {
        toast.success(`Link ${!url.isActive ? 'activated' : 'deactivated'} successfully!`);
        fetchUrls();
        fetchStats();
      } else {
        toast.error(data.error || 'Failed to toggle status');
      }
    } catch (err) {
      toast.error('Server error updating status');
    }
  };

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const data = await authFetch(`/urls/${deleteId}`, {
        method: 'DELETE'
      });
      if (data.success) {
        toast.success('Link deleted successfully');
        setIsDeleteOpen(false);
        fetchUrls();
        fetchStats();
      } else {
        toast.error(data.error || 'Failed to delete URL');
      }
    } catch (err) {
      toast.error('Server error deleting URL');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvText(event.target.result);
      toast.success('CSV loaded. Please review content.');
    };
    reader.readAsText(file);
  };

  const handleBulk = async (e) => {
    e.preventDefault();
    if (!csvText) {
      toast.error('Please import a CSV file or write CSV rows');
      return;
    }

    setBulkLoading(true);
    try {
      const data = await authFetch('/urls/bulk', {
        method: 'POST',
        body: JSON.stringify({ csvText })
      });

      if (data.success) {
        const successes = data.results.filter(r => r.success).length;
        const total = data.results.length;
        toast.success(`Successfully shortened ${successes}/${total} URLs!`);
        setIsBulkOpen(false);
        setCsvText('');
        fetchUrls();
        fetchStats();
      } else {
        toast.error(data.error || 'Bulk shortening failed');
      }
    } catch (err) {
      toast.error('Server error bulk processing');
    } finally {
      setBulkLoading(false);
    }
  };

  const openQrModal = (url) => {
    setSelectedUrl(url);
    setIsQrOpen(true);
  };

  const copyQrImage = async (base64DataUrl) => {
    if (!base64DataUrl) return;
    try {
      const response = await fetch(base64DataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      toast.success('QR Code image copied to clipboard!');
    } catch (err) {
      console.error('Copy QR image error:', err);
      toast.error('Copy failed. You can right-click the QR image to copy.');
    }
  };

  const downloadQrCode = (qrCodeBase64, filename) => {
    if (!qrCodeBase64) return;
    const link = document.createElement('a');
    link.href = qrCodeBase64;
    link.download = filename || 'qr-code.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR Code downloaded!');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground transition-colors duration-300 pb-16">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <Logo size={28} />
            <span>ZyLink</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-muted-foreground hidden md:inline bg-secondary px-3 py-1 rounded-full border border-border">
              Workspace: {user?.username}
            </span>
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2">
              <LogOut size={14} /> <span className="hidden md:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <main className="max-w-7xl mx-auto px-6 pt-10">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Welcome, {user?.username}!</h1>
            <p className="text-sm text-muted-foreground">Manage your links and view visitor performance reports.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button onClick={() => setIsBulkOpen(true)} variant="outline" className="flex-1 md:flex-none gap-2">
              <FileText size={16} /> Bulk Upload
            </Button>
            <Button onClick={() => setIsCreateOpen(true)} variant="primary" className="flex-1 md:flex-none gap-2">
              <Plus size={16} /> Create Link
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {/* Card 1: Total Links */}
          <Card className="relative overflow-hidden border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Total Links</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Layers size={16} />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-8 w-24 bg-secondary animate-pulse rounded-md" />
              ) : (
                <div className="text-2xl font-bold">{stats.totalLinks}</div>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Total Clicks */}
          <Card className="relative overflow-hidden border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Total Clicks</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center">
                <BarChart3 size={16} />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-8 w-24 bg-secondary animate-pulse rounded-md" />
              ) : (
                <div className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>

          {/* Card 3: Active Links */}
          <Card className="relative overflow-hidden border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Active Links</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 size={16} />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-8 w-24 bg-secondary animate-pulse rounded-md" />
              ) : (
                <div className="text-2xl font-bold">
                  {stats.totalLinks > 0
                    ? `${Math.round((stats.activeLinks / stats.totalLinks) * 100)}%`
                    : '0%'}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 4: QR Generated */}
          <Card className="relative overflow-hidden border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">QR Generated</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                <QrCode size={16} />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-8 w-24 bg-secondary animate-pulse rounded-md" />
              ) : (
                <div className="text-2xl font-bold">{stats.totalLinks}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Click Trend AreaChart Middle Section */}
        <div className="grid grid-cols-1 gap-6 mb-10">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-foreground">Click Activity Trend (Last 14 Days)</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              {statsLoading ? (
                <div className="h-full w-full bg-secondary/30 animate-pulse rounded-xl flex items-center justify-center text-xs text-muted-foreground">
                  Analyzing click trends...
                </div>
              ) : stats.clickTrend && stats.clickTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.clickTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dashboardClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="rgb(139, 92, 246)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="rgb(139, 92, 246)" stopOpacity={0}/>
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
                    <Area type="monotone" dataKey="clicks" stroke="rgb(139, 92, 246)" strokeWidth={2} fillOpacity={1} fill="url(#dashboardClicks)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  No visit data recorded yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Table & Filtering */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
            <h2 className="text-lg font-bold w-full md:w-auto text-left">Your Links</h2>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input
                placeholder="Search by long url, short code or alias..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 bg-background/50 border-border h-9 text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-secondary/40 border-b border-border text-xs text-muted-foreground font-semibold">
                  <th className="p-4">Original URL</th>
                  <th className="p-4">Short URL</th>
                  <th className="p-4">Created</th>
                  <th className="p-4">Clicks</th>
                  <th className="p-4">Last Visited</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {urlsLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={idx} className="border-b border-border text-xs">
                      <td className="p-4"><div className="h-4 bg-secondary animate-pulse rounded w-48" /></td>
                      <td className="p-4"><div className="h-4 bg-secondary animate-pulse rounded w-36" /></td>
                      <td className="p-4"><div className="h-4 bg-secondary animate-pulse rounded w-16" /></td>
                      <td className="p-4"><div className="h-4 bg-secondary animate-pulse rounded w-8" /></td>
                      <td className="p-4"><div className="h-4 bg-secondary animate-pulse rounded w-20" /></td>
                      <td className="p-4"><div className="h-4 bg-secondary animate-pulse rounded w-12" /></td>
                      <td className="p-4 text-right"><div className="h-6 bg-secondary animate-pulse rounded w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : urls.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle size={32} className="text-slate-400" />
                        <p className="text-sm font-semibold">No shortened links found.</p>
                        <p className="text-xs max-w-xs leading-relaxed">Create a shortened URL or load sample lists using the Bulk CSV upload tool.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  urls.map((url) => (
                    <tr key={url._id} className="border-b border-border text-xs hover:bg-secondary/20 transition-all">
                      <td className="p-4 max-w-xs truncate font-medium">
                        <a href={url.longUrl} target="_blank" rel="noreferrer" className="hover:text-primary hover:underline flex items-center gap-1.5 truncate">
                          {url.longUrl} <ExternalLink size={12} className="shrink-0" />
                        </a>
                      </td>
                      <td className="p-4 font-semibold text-primary">
                        <div className="flex items-center gap-2">
                          {url.qrCode && (
                            <button
                              onClick={() => openQrModal(url)}
                              className="p-1 hover:bg-secondary rounded border border-border flex items-center justify-center bg-white dark:bg-slate-900 shrink-0 shadow-sm"
                              title="Click to view QR Code"
                            >
                              <img src={url.qrCode} alt="QR" className="w-5 h-5" />
                            </button>
                          )}
                          <a
                            href={url.shortUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline truncate"
                          >
                            {url.shortUrl}
                          </a>
                          <button
                            onClick={() => handleCopy(url._id, url.shortUrl)}
                            className="p-1 hover:bg-secondary rounded text-slate-400 hover:text-foreground transition-colors shrink-0"
                          >
                            {copiedId === url._id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{formatDate(url.createdAt)}</td>
                      <td className="p-4 font-mono font-bold text-foreground">{url.clickCount}</td>
                      <td className="p-4 text-muted-foreground">{formatDate(url.lastVisitedAt)}</td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleLinkStatus(url)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none relative ${
                            url.isActive ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                              url.isActive ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          {url.qrCode && (
                            <Button
                              onClick={() => openQrModal(url)}
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-cyan-500 hover:text-cyan-600 hover:bg-cyan-500/10"
                              title="QR Code Options"
                            >
                              <QrCode size={12} />
                            </Button>
                          )}
                          <Button
                            onClick={() => navigate(`/analytics/${url._id}`)}
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Analytics"
                          >
                            <BarChart3 size={12} />
                          </Button>
                          <Button
                            onClick={() => openEditModal(url)}
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Edit"
                          >
                            <Edit2 size={12} />
                          </Button>
                          <Button
                            onClick={() => openDeleteModal(url._id)}
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!urlsLoading && totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <span className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  variant="outline"
                  size="sm"
                  className="h-8 px-2"
                >
                  <ChevronLeft size={16} /> Previous
                </Button>
                <Button
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  variant="outline"
                  size="sm"
                  className="h-8 px-2"
                >
                  Next <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>

      {/* CREATE MODAL */}
      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Short Link">
        <form onSubmit={handleCreate} className="space-y-4 text-left">
          <div>
            <label className="text-xs font-semibold block mb-1">Original URL *</label>
            <Input
              type="url"
              placeholder="https://example.com/very/long/destination/url"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1">Custom Alias (Optional)</label>
            <Input
              type="text"
              placeholder="e.g. portfolio"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1">Expiry Date (Optional)</label>
            <Input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl border border-border">
            <input
              type="checkbox"
              id="isPublicAnalytics"
              checked={isPublicAnalytics}
              onChange={(e) => setIsPublicAnalytics(e.target.checked)}
              className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
            />
            <label htmlFor="isPublicAnalytics" className="text-xs font-semibold cursor-pointer">
              Enable public analytics page
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-6 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createLoading}>
              Shorten
            </Button>
          </div>
        </form>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Short Link">
        <form onSubmit={handleEdit} className="space-y-4 text-left">
          <div>
            <label className="text-xs font-semibold block mb-1">Original URL *</label>
            <Input
              type="url"
              placeholder="https://example.com/very/long/destination/url"
              value={editLongUrl}
              onChange={(e) => setEditLongUrl(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1">Custom Alias</label>
            <Input
              type="text"
              placeholder="e.g. portfolio"
              value={editCustomAlias}
              onChange={(e) => setEditCustomAlias(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1">Expiry Date</label>
            <Input
              type="date"
              value={editExpiryDate}
              onChange={(e) => setEditExpiryDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3 p-3 bg-secondary/30 rounded-xl border border-border space-y-1">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="editIsActive"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
              />
              <label htmlFor="editIsActive" className="text-xs font-semibold cursor-pointer">
                Link Active (redirects visitors)
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="editIsPublicAnalytics"
                checked={editIsPublicAnalytics}
                onChange={(e) => setEditIsPublicAnalytics(e.target.checked)}
                className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
              />
              <label htmlFor="editIsPublicAnalytics" className="text-xs font-semibold cursor-pointer">
                Enable public analytics page
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={editLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Dialog>

      {/* BULK CSV MODAL */}
      <Dialog isOpen={isBulkOpen} onClose={() => setIsBulkOpen(false)} title="Bulk URL Shortener via CSV">
        <form onSubmit={handleBulk} className="space-y-4 text-left">
          <div className="bg-secondary/40 p-4 rounded-xl border border-border text-xs mb-4">
            <p className="font-semibold mb-1">Instructions:</p>
            <p className="text-muted-foreground leading-relaxed">
              Upload a CSV file or paste rows inside the text box. The CSV should not contain headings, and follow the layout below:
            </p>
            <code className="block bg-slate-950 text-emerald-400 p-2 rounded mt-2 font-mono">
              url,customAlias,expiryDate<br />
              https://mywebsite.com/projects,my-project,2026-12-31<br />
              https://github.com/dharshini,dharshini-git,<br />
            </code>
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5">Upload CSV file</label>
            <Input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="cursor-pointer file:cursor-pointer"
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1">CSV Text Data</label>
            <textarea
              placeholder="https://example.com/long-url,my-alias,2026-12-31"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows="6"
              className="w-full text-xs font-mono p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => setIsBulkOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={bulkLoading}>
              Shorten Bulk
            </Button>
          </div>
        </form>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete shortened link">
        <div className="text-left space-y-4">
          <p className="text-sm">
            Are you sure you want to delete this link? This action is irreversible. All visit metrics and analytics log files associated with this link will be permanently purged.
          </p>

          <div className="flex justify-end gap-3 mt-6 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={handleDelete} isLoading={deleteLoading}>
              Delete Permanently
            </Button>
          </div>
        </div>
      </Dialog>

      {/* QR CODE OPTIONS DIALOG */}
      <Dialog isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} title="QR Code Options">
        <div className="text-center space-y-6 pb-2">
          <p className="text-xs text-muted-foreground text-left">
            Scan this code to directly navigate to your shortened URL, or choose an option below to copy the image to your clipboard or download it as a PNG file.
          </p>
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-inner flex items-center justify-center max-w-[240px] mx-auto">
            {selectedUrl?.qrCode ? (
              <img src={selectedUrl.qrCode} alt="QR Code" className="w-48 h-48" />
            ) : (
              <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                Generating QR...
              </div>
            )}
          </div>

          <div className="text-xs font-semibold text-primary truncate max-w-xs mx-auto p-2.5 bg-secondary/40 rounded-lg border border-border">
            {selectedUrl?.shortUrl}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6 border-t border-border pt-4">
            <Button
              onClick={() => copyQrImage(selectedUrl?.qrCode)}
              variant="outline"
              className="gap-2 text-xs h-10 w-full"
            >
              Copy Image
            </Button>
            <Button
              onClick={() => downloadQrCode(selectedUrl?.qrCode, `qr-${selectedUrl?.customAlias || selectedUrl?.shortCode}.png`)}
              variant="primary"
              className="gap-2 text-xs h-10 w-full"
            >
              <Download size={14} /> Download PNG
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
