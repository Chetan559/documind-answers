import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, X as XIcon, ChevronDown } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
});

const plans = [
  {
    tier: 'Free', price: '$0', period: '/mo', featured: false, cta: 'Get Started',
    details: { pdfs: '3', storage: '50 MB', questions: '20/day', quizzes: '5/mo', multiDoc: false, annotations: false, citations: false, history: '7 days', api: false, support: false, branding: false, sso: false, audit: false },
  },
  {
    tier: 'Pro', price: '$12', period: '/mo', featured: true, cta: 'Start Pro Trial',
    details: { pdfs: 'Unlimited', storage: '10 GB', questions: 'Unlimited', quizzes: 'Unlimited', multiDoc: true, annotations: true, citations: true, history: 'Unlimited', api: true, support: true, branding: false, sso: false, audit: false },
  },
  {
    tier: 'Enterprise', price: 'Custom', period: '', featured: false, cta: 'Contact Sales',
    details: { pdfs: 'Unlimited', storage: 'Unlimited', questions: 'Unlimited', quizzes: 'Unlimited', multiDoc: true, annotations: true, citations: true, history: 'Unlimited', api: true, support: true, branding: true, sso: true, audit: true },
  },
];

const featureRows: { label: string; key: keyof typeof plans[0]['details'] }[] = [
  { label: 'Documents stored', key: 'pdfs' },
  { label: 'Storage', key: 'storage' },
  { label: 'Questions per day', key: 'questions' },
  { label: 'Quiz generation', key: 'quizzes' },
  { label: 'Multi-document chat', key: 'multiDoc' },
  { label: 'Annotations & highlights', key: 'annotations' },
  { label: 'Citation export', key: 'citations' },
  { label: 'Chat history', key: 'history' },
  { label: 'API access', key: 'api' },
  { label: 'Priority support', key: 'support' },
  { label: 'Custom branding', key: 'branding' },
  { label: 'SSO', key: 'sso' },
  { label: 'Audit logs', key: 'audit' },
];

const faqs = [
  { q: 'Can I upgrade or downgrade at any time?', a: 'Yes. You can switch plans at any time from your account settings. Upgrades take effect immediately, and downgrades apply at the end of your current billing period.' },
  { q: 'What happens to my documents if I cancel?', a: 'Your documents remain accessible for 30 days after cancellation. You can download them at any time during this period. After 30 days, they are permanently deleted.' },
  { q: 'Do you offer academic or student discounts?', a: 'Yes. We offer 50% off Pro for verified students and academic researchers. Contact us with your .edu email to get started.' },
  { q: 'Is there a free trial for Pro?', a: 'Yes. Pro comes with a 14-day free trial. No credit card required to start.' },
  { q: 'How is storage calculated?', a: 'Storage is calculated based on the total size of your uploaded PDF files. Annotations, chat history, and quiz data do not count toward your storage limit.' },
  { q: 'Can I use DocuMind for my whole team?', a: 'Yes. Our Enterprise plan supports team workspaces with shared document libraries, role-based access, and centralized billing. Contact sales for details.' },
];

const Pricing = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const renderCell = (val: string | boolean) => {
    if (typeof val === 'boolean') {
      return val
        ? <Check className="w-4 h-4 text-foreground mx-auto" />
        : <XIcon className="w-4 h-4 text-muted-foreground/40 mx-auto" />;
    }
    return <span className="text-foreground text-sm font-body">{val}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 text-center">
        <div className="max-w-[560px] mx-auto px-6">
          <motion.h1 {...fade()} className="font-display text-4xl sm:text-[52px] leading-tight text-foreground mb-4">
            Simple pricing. No surprises.
          </motion.h1>
          <motion.p {...fade(0.1)} className="text-lg text-muted-foreground font-body">
            Start free. Upgrade when you need more.
          </motion.p>
        </div>
        <div className="max-w-7xl mx-auto mt-16 border-t border-border/10" />
      </section>

      {/* Pricing cards */}
      <section className="pb-24">
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto px-6">
          {plans.map((p, i) => (
            <motion.div
              key={p.tier}
              {...fade(i * 0.1)}
              className={`p-6 rounded-2xl border transition-all ${
                p.featured
                  ? 'bg-card border-foreground -translate-y-2 shadow-lg'
                  : 'bg-card border-border/10'
              }`}
            >
              <h3 className="font-display text-lg text-foreground mb-1">{p.tier}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-display text-3xl text-foreground">{p.price}</span>
                <span className="text-sm text-muted-foreground font-body">{p.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {featureRows.slice(0, 8).map((f) => (
                  <li key={f.key} className="flex justify-between text-sm font-body">
                    <span className="text-muted-foreground">{f.label}</span>
                    {renderCell(p.details[f.key])}
                  </li>
                ))}
              </ul>
              <Link
                to="/upload"
                className={`block text-center py-2.5 rounded-xl text-sm transition-all active:scale-95 font-body ${
                  p.featured
                    ? 'bg-foreground text-background hover:opacity-90'
                    : 'border border-border/40 text-foreground hover:bg-card'
                }`}
              >
                {p.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section className="pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <motion.h2 {...fade()} className="font-display text-2xl text-foreground text-center mb-12">
            Full feature comparison
          </motion.h2>
          <div className="overflow-x-auto rounded-2xl border border-border/10">
            <table className="w-full">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-border/10">
                  <th className="text-left py-3 px-4 text-sm text-muted-foreground font-body font-normal">Feature</th>
                  {plans.map((p) => (
                    <th key={p.tier} className="text-center py-3 px-4 text-sm text-foreground font-body font-semibold">{p.tier}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureRows.map((f, i) => (
                  <tr key={f.key} className={`border-b border-border/10 ${i % 2 === 1 ? 'bg-[hsl(0,0%,5.5%)]' : ''}`}>
                    <td className="py-3 px-4 text-sm text-muted-foreground font-body">{f.label}</td>
                    {plans.map((p) => (
                      <td key={p.tier} className="py-3 px-4 text-center">{renderCell(p.details[f.key])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <motion.h2 {...fade()} className="font-display text-2xl text-foreground text-center mb-12">
            Frequently asked questions
          </motion.h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <motion.div key={i} {...fade(i * 0.05)} className="border border-border/10 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm text-foreground font-body">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-sm text-muted-foreground font-body leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-card border border-border/10 rounded-2xl p-8 text-center">
            <h3 className="font-display text-2xl text-foreground mb-3">Need something custom?</h3>
            <p className="text-sm text-muted-foreground font-body mb-6 max-w-md mx-auto">
              Volume licensing, dedicated infrastructure, SSO, audit logs, and custom integrations. Let's talk about what your team needs.
            </p>
            <a href="mailto:sales@documind.app" className="inline-block px-8 py-3 bg-foreground text-background rounded-xl text-sm font-body font-medium hover:opacity-90 transition-opacity">
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
