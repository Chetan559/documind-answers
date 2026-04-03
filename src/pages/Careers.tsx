import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
});

const values = [
  { label: 'Deep work over meetings', desc: 'We protect focus time. Most communication is async.' },
  { label: 'Writing over slides', desc: 'Ideas are shared as written documents, not presentations.' },
  { label: 'Shipping over planning', desc: 'We iterate fast and learn from real usage.' },
  { label: 'Curiosity over credentials', desc: 'What you can build matters more than where you studied.' },
];

const roles = [
  { title: 'Senior Full-Stack Engineer', dept: 'Engineering', location: 'Remote', type: 'Full-time' },
  { title: 'AI/ML Engineer', dept: 'AI', location: 'Remote', type: 'Full-time' },
  { title: 'Technical Writer', dept: 'Content', location: 'Remote', type: 'Full-time' },
  { title: 'Product Designer', dept: 'Design', location: 'Remote', type: 'Full-time' },
];

const Careers = () => (
  <div className="min-h-screen bg-background">
    <Navbar />

    {/* Hero */}
    <section className="pt-28 pb-16 text-center">
      <div className="max-w-[560px] mx-auto px-6">
        <motion.h1 {...fade()} className="font-display text-4xl sm:text-[52px] leading-tight text-foreground mb-4">
          Build tools that make people smarter.
        </motion.h1>
        <motion.p {...fade(0.1)} className="text-lg text-muted-foreground font-body">
          We're a small team working on a hard problem. If that sounds interesting, read on.
        </motion.p>
      </div>
      <div className="max-w-7xl mx-auto mt-16 border-t border-border/10" />
    </section>

    {/* How we work */}
    <section className="pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <motion.span {...fade()} className="block text-[9px] text-muted-foreground uppercase tracking-widest mb-6">— HOW WE WORK —</motion.span>
        <motion.p {...fade(0.05)} className="text-base text-muted-foreground font-body leading-relaxed mb-4">
          We're remote-first and async by default. Most of our communication happens in writing — long-form docs, not Slack threads. We believe deep work produces the best results, and we structure our days to protect it.
        </motion.p>
        <motion.p {...fade(0.1)} className="text-base text-muted-foreground font-body leading-relaxed mb-4">
          Our team is small by design. Everyone owns a significant part of the product. There are no layers of management between you and the work.
        </motion.p>
        <motion.p {...fade(0.15)} className="text-base text-muted-foreground font-body leading-relaxed">
          We ship weekly. We demo to each other on Fridays. We use our own product every day.
        </motion.p>
      </div>
    </section>

    <div className="max-w-3xl mx-auto border-t border-border/10" />

    {/* Values */}
    <section className="py-20">
      <div className="max-w-3xl mx-auto px-6">
        <motion.span {...fade()} className="block text-[9px] text-muted-foreground uppercase tracking-widest mb-6">— WHAT WE VALUE —</motion.span>
        <div className="space-y-4">
          {values.map((v, i) => (
            <motion.div key={v.label} {...fade(i * 0.1)} className="flex items-start gap-4">
              <span className="text-sm text-foreground font-body font-semibold min-w-[200px]">{v.label}</span>
              <span className="text-sm text-muted-foreground font-body">{v.desc}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    <div className="max-w-3xl mx-auto border-t border-border/10" />

    {/* Open roles */}
    <section className="py-20">
      <div className="max-w-3xl mx-auto px-6">
        <motion.span {...fade()} className="block text-[9px] text-muted-foreground uppercase tracking-widest mb-6">— OPEN ROLES —</motion.span>
        <div className="space-y-3">
          {roles.map((r, i) => (
            <motion.div
              key={r.title}
              {...fade(i * 0.1)}
              className="group flex items-center justify-between bg-card border border-border/10 rounded-2xl px-5 py-4 hover:border-border/20 transition-all cursor-pointer"
            >
              <div>
                <h3 className="text-sm text-foreground font-body font-semibold">{r.title}</h3>
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground font-body px-2 py-0.5 bg-background rounded">{r.dept}</span>
                  <span className="text-[10px] text-muted-foreground font-body px-2 py-0.5 bg-background rounded">{r.location}</span>
                  <span className="text-[10px] text-muted-foreground font-body px-2 py-0.5 bg-background rounded">{r.type}</span>
                </div>
              </div>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-foreground font-body">
                Apply <ArrowRight className="w-3 h-3" />
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Speculative */}
    <section className="pb-24">
      <div className="max-w-3xl mx-auto px-6">
        <div className="bg-card border border-dashed border-border/15 rounded-2xl p-6 text-center">
          <p className="text-sm text-muted-foreground font-body mb-2">Don't see a fit? Send us a note anyway.</p>
          <a href="mailto:careers@documind.app" className="text-sm text-foreground font-body underline underline-offset-4 hover:opacity-80 transition-opacity">
            careers@documind.app
          </a>
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default Careers;
