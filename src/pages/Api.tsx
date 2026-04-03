import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
});

const endpoints = [
  { method: 'POST', path: '/auth/login', desc: 'Authenticate and receive a Bearer token', color: 'hsl(140,20%,40%)' },
  { method: 'POST', path: '/auth/register', desc: 'Create a new user account', color: 'hsl(140,20%,40%)' },
  { method: 'POST', path: '/documents/upload', desc: 'Upload a PDF document', color: 'hsl(140,20%,40%)' },
  { method: 'GET', path: '/documents/:id', desc: 'Get document metadata and status', color: 'hsl(210,15%,50%)' },
  { method: 'DELETE', path: '/documents/:id', desc: 'Delete a document permanently', color: 'hsl(0,30%,50%)' },
  { method: 'POST', path: '/sessions', desc: 'Create a new chat session', color: 'hsl(140,20%,40%)' },
  { method: 'GET', path: '/sessions', desc: 'List all chat sessions', color: 'hsl(210,15%,50%)' },
  { method: 'POST', path: '/sessions/:id/messages', desc: 'Send a message and get AI response', color: 'hsl(140,20%,40%)' },
  { method: 'GET', path: '/sessions/:id/messages', desc: 'Get full message history', color: 'hsl(210,15%,50%)' },
  { method: 'POST', path: '/quiz/generate', desc: 'Generate quiz from a document', color: 'hsl(140,20%,40%)' },
  { method: 'GET', path: '/search', desc: 'Semantic search across documents', color: 'hsl(210,15%,50%)' },
  { method: 'POST', path: '/share', desc: 'Create a shareable chatbot link', color: 'hsl(140,20%,40%)' },
];

const sdks = [
  { lang: 'JavaScript / TypeScript', install: 'npm install @documind/sdk', desc: 'Full-featured SDK for Node.js and browser environments.' },
  { lang: 'Python', install: 'pip install documind', desc: 'Pythonic client with async support and type hints.' },
  { lang: 'REST', install: 'curl https://api.documind.app/v1/...', desc: 'Use any HTTP client. All endpoints return JSON.' },
];

const rateLimits = [
  { tier: 'Free', rpm: '10', docsDay: '3', questionsDay: '20' },
  { tier: 'Pro', rpm: '120', docsDay: 'Unlimited', questionsDay: 'Unlimited' },
  { tier: 'Enterprise', rpm: 'Custom', docsDay: 'Unlimited', questionsDay: 'Unlimited' },
];

const Api = () => (
  <div className="min-h-screen bg-background">
    <Navbar />

    {/* Hero */}
    <section className="pt-28 pb-16 text-center">
      <div className="max-w-[560px] mx-auto px-6">
        <motion.h1 {...fade()} className="font-display text-4xl sm:text-[52px] leading-tight text-foreground mb-4">
          Build with DocuMind.
        </motion.h1>
        <motion.p {...fade(0.1)} className="text-lg text-muted-foreground font-body">
          A clean REST API for developers who want to bring document intelligence into their own products.
        </motion.p>
      </div>
      <div className="max-w-7xl mx-auto mt-16 border-t border-border/10" />
    </section>

    {/* Overview */}
    <section className="pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <motion.span {...fade()} className="block text-[9px] text-muted-foreground uppercase tracking-widest mb-6">— OVERVIEW —</motion.span>
        <motion.p {...fade(0.05)} className="text-base text-muted-foreground font-body leading-relaxed mb-4">
          The DocuMind API lets you upload PDFs, run semantic queries, generate quizzes, and export citations — all programmatically. Authentication uses Bearer tokens, all responses are JSON, and rate limits are clearly documented per tier.
        </motion.p>
      </div>
    </section>

    {/* Base URL & Auth */}
    <section className="pb-20 bg-[hsl(0,0%,5.5%)]">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <motion.span {...fade()} className="block text-[9px] text-muted-foreground uppercase tracking-widest mb-6">— AUTHENTICATION —</motion.span>
        <motion.h2 {...fade(0.05)} className="font-display text-2xl text-foreground mb-6">Base URL & Auth</motion.h2>
        <motion.div {...fade(0.1)} className="bg-[hsl(0,0%,5.5%)] border border-border/10 rounded-xl p-5 font-mono text-sm mb-4 overflow-x-auto">
          <p className="text-muted-foreground mb-2"># Base URL</p>
          <p className="text-foreground">https://api.documind.app/v1</p>
          <p className="text-muted-foreground mt-4 mb-2"># Example request</p>
          <p><span className="text-muted-foreground">GET</span> <span className="text-foreground">/documents</span></p>
          <p><span className="text-muted-foreground">Authorization:</span> <span className="text-foreground">Bearer your_api_key_here</span></p>
          <p><span className="text-muted-foreground">Content-Type:</span> <span className="text-foreground">application/json</span></p>
        </motion.div>
      </div>
    </section>

    {/* Endpoints */}
    <section className="py-20">
      <div className="max-w-3xl mx-auto px-6">
        <motion.span {...fade()} className="block text-[9px] text-muted-foreground uppercase tracking-widest mb-6">— ENDPOINTS —</motion.span>
        <motion.h2 {...fade(0.05)} className="font-display text-2xl text-foreground mb-8">Core Endpoints</motion.h2>
        <div className="overflow-x-auto rounded-xl border border-border/10">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/10">
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-body font-normal">Method</th>
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-body font-normal">Endpoint</th>
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-body font-normal">Description</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((e, i) => (
                <tr key={i} className={`border-b border-border/10 ${i % 2 === 1 ? 'bg-[hsl(0,0%,5.5%)]' : ''}`}>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold" style={{ color: e.color, border: `1px solid ${e.color}40` }}>
                      {e.method}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground font-mono">{e.path}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground font-body">{e.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>

    {/* SDKs */}
    <section className="py-20 bg-[hsl(0,0%,5.5%)]">
      <div className="max-w-3xl mx-auto px-6">
        <motion.span {...fade()} className="block text-[9px] text-muted-foreground uppercase tracking-widest mb-6">— SDKS —</motion.span>
        <motion.h2 {...fade(0.05)} className="font-display text-2xl text-foreground mb-8">SDKs & Libraries</motion.h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {sdks.map((s, i) => (
            <motion.div key={s.lang} {...fade(i * 0.1)} className="bg-card border border-border/10 rounded-2xl p-5">
              <h3 className="text-sm text-foreground font-body font-semibold mb-2">{s.lang}</h3>
              <p className="text-xs text-muted-foreground font-body mb-3">{s.desc}</p>
              <div className="bg-[hsl(0,0%,5.5%)] rounded-lg p-2 font-mono text-[11px] text-foreground overflow-x-auto">{s.install}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Rate Limits */}
    <section className="py-20">
      <div className="max-w-3xl mx-auto px-6">
        <motion.span {...fade()} className="block text-[9px] text-muted-foreground uppercase tracking-widest mb-6">— RATE LIMITS —</motion.span>
        <motion.h2 {...fade(0.05)} className="font-display text-2xl text-foreground mb-8">Rate Limits</motion.h2>
        <div className="overflow-x-auto rounded-xl border border-border/10">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/10">
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-body font-normal">Tier</th>
                <th className="text-center py-3 px-4 text-xs text-muted-foreground font-body font-normal">Requests/min</th>
                <th className="text-center py-3 px-4 text-xs text-muted-foreground font-body font-normal">Docs/day</th>
                <th className="text-center py-3 px-4 text-xs text-muted-foreground font-body font-normal">Questions/day</th>
              </tr>
            </thead>
            <tbody>
              {rateLimits.map((r, i) => (
                <tr key={r.tier} className={`border-b border-border/10 ${i % 2 === 1 ? 'bg-[hsl(0,0%,5.5%)]' : ''}`}>
                  <td className="py-3 px-4 text-sm text-foreground font-body font-semibold">{r.tier}</td>
                  <td className="py-3 px-4 text-sm text-foreground font-body text-center">{r.rpm}</td>
                  <td className="py-3 px-4 text-sm text-foreground font-body text-center">{r.docsDay}</td>
                  <td className="py-3 px-4 text-sm text-foreground font-body text-center">{r.questionsDay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>

    {/* Webhooks */}
    <section className="py-20 bg-[hsl(0,0%,5.5%)]">
      <div className="max-w-3xl mx-auto px-6">
        <motion.span {...fade()} className="block text-[9px] text-muted-foreground uppercase tracking-widest mb-6">— WEBHOOKS —</motion.span>
        <motion.h2 {...fade(0.05)} className="font-display text-2xl text-foreground mb-4">Webhooks</motion.h2>
        <motion.p {...fade(0.1)} className="text-sm text-muted-foreground font-body mb-6">
          Subscribe to events like <code className="text-foreground">document.ready</code>, <code className="text-foreground">document.failed</code>, and <code className="text-foreground">message.done</code>. We POST a JSON payload to your configured URL.
        </motion.p>
        <motion.div {...fade(0.15)} className="bg-[hsl(0,0%,5.5%)] border border-border/10 rounded-xl p-5 font-mono text-sm overflow-x-auto">
          <pre className="text-foreground">{`{
  "event": "document.ready",
  "document_id": "abc-123",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": {
    "name": "report.pdf",
    "page_count": 42,
    "status": "ready"
  }
}`}</pre>
        </motion.div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-24 text-center">
      <motion.h2 {...fade()} className="font-display text-2xl text-foreground mb-6">Get your API key</motion.h2>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link to="/login" className="px-8 py-3 bg-foreground text-background rounded-xl text-sm font-body font-medium hover:opacity-90 transition-opacity">
          Sign Up
        </Link>
        <a href="#" className="px-8 py-3 border border-border/20 text-foreground rounded-xl text-sm font-body hover:border-border/40 transition-colors">
          Full API Docs →
        </a>
      </div>
    </section>

    <Footer />
  </div>
);

export default Api;
