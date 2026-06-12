import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link as LinkIcon, BarChart3, QrCode, Sparkles, Clock, Globe, ArrowRight,
  Shield, Check, Play, Sun, Moon, Copy, HelpCircle, Plus, ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Logo } from '../components/ui/Logo';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Shortener Demo State
  const [demoInput, setDemoInput] = useState('');
  const [demoAlias, setDemoAlias] = useState('');
  const [demoResult, setDemoResult] = useState(null);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDemoShorten = (e) => {
    e.preventDefault();
    if (!demoInput) return;
    setIsDemoLoading(true);

    setTimeout(() => {
      const alias = demoAlias.trim() || Math.random().toString(36).substring(2, 7);
      setDemoResult({
        original: demoInput,
        short: `https://zylink.app/guest/${alias}`,
        alias: alias
      });
      setIsDemoLoading(false);
    }, 1200);
  };

  const copyDemoLink = () => {
    if (!demoResult) return;
    navigator.clipboard.writeText(demoResult.short);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <Logo size={28} />
            <span>ZyLink</span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {token ? (
              <Button onClick={() => navigate('/dashboard')} variant="primary" size="sm">
                Dashboard <ArrowRight size={14} />
              </Button>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">
                  Sign In
                </Link>
                <Button onClick={() => navigate('/register')} variant="primary" size="sm">
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        {/* Decorative Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight md:leading-none mb-6">
              Shorten Links. <br className="hidden md:inline" />
              <span className="bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">Track Performance.</span> <br />
              Share Smarter.
            </h1>
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              ZyLink allows you to convert long URLs into short, shareable links, customize aliases, generate QR codes, and analyze real-time visitor insights.
            </p>
          </motion.div>

          {/* Interactive Shortening Demo Widget */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto mb-16"
          >
            <Card className="p-6 md:p-8 glass-panel shadow-xl border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-left mb-4 flex items-center gap-2">
                <LinkIcon size={18} className="text-primary" /> Try shortening a link
              </h2>
              <form onSubmit={handleDemoShorten} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      type="url"
                      placeholder="Paste your long URL (e.g. https://example.com/project)..."
                      value={demoInput}
                      onChange={(e) => setDemoInput(e.target.value)}
                      required
                      className="bg-background/50 h-11 border-slate-300 dark:border-slate-700"
                    />
                  </div>
                  <div className="w-full md:w-48">
                    <Input
                      type="text"
                      placeholder="custom-alias"
                      value={demoAlias}
                      onChange={(e) => setDemoAlias(e.target.value)}
                      className="bg-background/50 h-11 border-slate-300 dark:border-slate-700"
                    />
                  </div>
                  <Button type="submit" variant="primary" className="h-11 shrink-0" isLoading={isDemoLoading}>
                    Shorten
                  </Button>
                </div>
              </form>

              {/* Demo Results Panel */}
              <AnimatePresence>
                {demoResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 border-t border-border pt-6 text-left"
                  >
                    <div className="bg-secondary/40 p-4 rounded-xl flex items-center justify-between border border-border">
                      <div className="truncate pr-4">
                        <span className="text-xs text-muted-foreground block mb-0.5">Short URL</span>
                        <span className="text-sm font-semibold text-primary truncate block">{demoResult.short}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={copyDemoLink} className="h-9">
                          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          {copied ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <BarChart3 size={18} />
                        </div>
                        <div>
                          <span className="text-xs font-bold block text-foreground">Analytics Panel Mockup unlocked!</span>
                          <span className="text-xs text-muted-foreground block">Sign up to view location, browser and device distribution data.</span>
                        </div>
                      </div>
                      <Button onClick={() => navigate('/register')} variant="ghost" size="sm" className="text-xs text-primary font-bold hover:text-primary/80">
                        View Demo <ArrowRight size={12} className="ml-1" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-border bg-secondary/10 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">
              Packed with powerful features.
            </h2>
            <p className="text-muted-foreground">
              Everything you need to manage your URLs, track traffic trends, and build customized share flows.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="p-6 flex flex-col gap-4 bg-background">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <LinkIcon size={20} />
              </div>
              <h3 className="text-lg font-bold">Custom Branded Alias</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Replace generic, randomly generated links with custom branded suffixes (e.g. `zylink.app/username/portfolio`).
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 flex flex-col gap-4 bg-background">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center">
                <BarChart3 size={20} />
              </div>
              <h3 className="text-lg font-bold">Real-time Analytics</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Track browser types, operating systems, devices, locations (country/city), and referrers with dynamic visual charts.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6 flex flex-col gap-4 bg-background">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <QrCode size={20} />
              </div>
              <h3 className="text-lg font-bold">Instant QR Codes</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Generate high-resolution vector QR Codes instantly for printed media and physical sharing. Easily download them.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="p-6 flex flex-col gap-4 bg-background">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                <Clock size={20} />
              </div>
              <h3 className="text-lg font-bold">Link Expiration Dates</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Set active expiry dates for temporary links. Once the date passes, the link automatically turns inactive.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="p-6 flex flex-col gap-4 bg-background">
              <div className="w-10 h-10 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center">
                <Globe size={20} />
              </div>
              <h3 className="text-lg font-bold">Public Analytics Sharing</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Choose to keep your stats private or share a public analytics link with your clients or audience for transparency.
              </p>
            </Card>

            {/* Feature 6 */}
            <Card className="p-6 flex flex-col gap-4 bg-background">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <LinkIcon size={20} />
              </div>
              <h3 className="text-lg font-bold">Bulk Shortening via CSV</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Shorten multiple long URLs simultaneously by uploading a standard CSV file or listing them in our input sheet.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Analytics Preview mock component */}
      <section className="py-20 bg-background overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 text-left">
              <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-2">Beautiful Dashboard</span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6">
                Understand your visitors like never before.
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our dashboard converts complex logs into highly readable charts. Filter clicks over time, study geographical distribution, and inspect referrers to optimize your social reach.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <Check size={12} />
                  </div>
                  <span className="text-sm font-semibold">Device, Browser, Referrer and Location distribution charts</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <Check size={12} />
                  </div>
                  <span className="text-sm font-semibold">Daily click trend interactive curves</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <Check size={12} />
                  </div>
                  <span className="text-sm font-semibold">Detailed chronological visit logs</span>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/20 to-indigo-500/0 rounded-3xl blur-2xl pointer-events-none" />
              <Card className="p-6 bg-slate-900 border-slate-800 text-slate-100 shadow-2xl rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-xs text-slate-400">zylink.app/dashboard</span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6 text-left">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-xs font-semibold block mb-1">Total Links</span>
                    <span className="text-xl font-bold block text-slate-100">1,248</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-xs font-semibold block mb-1">Total Clicks</span>
                    <span className="text-xl font-bold block text-slate-100 font-mono">48.2k</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-xs font-semibold block mb-1">Active Links</span>
                    <span className="text-xl font-bold block text-slate-100">94.8%</span>
                  </div>
                </div>

                {/* Simulated Chart lines */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-xs font-semibold block mb-4 text-left">Visitor Daily Trend</span>
                  <div className="h-28 flex items-end justify-between gap-2 pt-2">
                    {[35, 45, 20, 60, 50, 75, 40, 85, 95, 65, 80, 55, 90, 100].map((val, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-gradient-to-t from-violet-600 to-indigo-500 rounded-t-sm"
                          style={{ height: `${val}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-violet-900/10 to-indigo-900/5 border-t border-border relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Start tracking your links today
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-sm md:text-base leading-relaxed">
            Create an account in seconds and unlock custom aliases, high-resolution QR codes, bulk imports, and real-time visitor demographics.
          </p>
          <Button onClick={() => navigate('/register')} variant="primary" size="lg" className="h-12 px-8 font-semibold shadow-lg shadow-violet-500/20">
            Get Started For Free <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-background">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-base">
            <Logo size={24} />
            <span>ZyLink</span>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            &copy; 2026 ZyLink. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/login" className="hover:text-foreground">Login</Link>
            <Link to="/register" className="hover:text-foreground">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
