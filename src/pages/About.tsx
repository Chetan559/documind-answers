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

const principles = [
  { title: 'Source-grounded answers', desc: 'Every response cites the page it came from. No hallucination, no guessing.' },
  { title: 'Privacy first', desc: "Documents are yours. They're not used for training. They're deleted when you delete them." },
  { title: 'Precision over speed', desc: "We'd rather give you one accurate answer than five fast guesses." },
  { title: 'Built for depth', desc: 'Designed for people who need to understand documents deeply, not skim them.' },
];

const developer = {
  name: 'Chetan Sharma',
  role: 'Creator & Solo Developer',
  bio: 'Full-stack Data Scientist intern at Bacancy. Built DocuMind end-to-end — from AI pipeline to frontend.',
  portfolio: 'https://chetansharma.live',
};

const About = () => (
  <div className="min-h-screen bg-background">
    <Navbar />

    {/* Hero */}
    <section className="pt-28 pb-16 text-center">
      <div className="max-w-[560px] mx-auto px-6">
        <motion.h1 {...fade()} className="font-display text-4xl sm:text-[52px] leading-tight text-foreground mb-4">
          We believe documents shouldn't be hard to understand.
        </motion.h1>
        <motion.p {...fade(0.1)} className="text-lg text-muted-foreground font-body">
          DocuMind was built for the people who read more than anyone — and still never have enough time.
        </motion.p>
      </div>
      <div className="max-w-7xl mx-auto mt-16 border-t border-border/10" />
    </section>

    {/* The Problem */}
    <section className="pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <motion.span {...fade()} className="block text-[9px] text-muted-foreground uppercase tracking-widest mb-6">— THE PROBLEM —</motion.span>
        <motion.p {...fade(0.05)} className="text-base text-muted-foreground font-body leading-relaxed mb-4">
          The average knowledge worker reads hundreds of pages a week. Researchers, lawyers, students, analysts — they all share the same problem. The information is in the documents. Finding it, connecting it, and retaining it is what takes all the time.
        </motion.p>
        <motion.p {...fade(0.1)} className="text-base text-muted-foreground font-body leading-relaxed mb-4">
          Existing tools either ignore the document entirely or just let you Ctrl+F. That's not enough. When you're reading a 200-page contract or a stack of academic papers, you need something that understands the content — not just matches keywords.
        </motion.p>
        <motion.p {...fade(0.15)} className="text-base text-muted-foreground font-body leading-relaxed">
          DocuMind treats the document as the source of truth. Every answer traces back to a specific page. Every quiz question cites its origin. Every highlight persists exactly where you placed it.
        </motion.p>
      </div>
    </section>

    <div className="max-w-3xl mx-auto border-t border-border/10" />

    {/* What We're Building */}
    <section className="py-20">
      <div className="max-w-3xl mx-auto px-6">
        <motion.span {...fade()} className="block text-[9px] text-muted-foreground uppercase tracking-widest mb-6">— WHAT WE'RE BUILDING —</motion.span>
        <motion.p {...fade(0.05)} className="text-base text-muted-foreground font-body leading-relaxed mb-4">
          Not just a chatbot on top of a PDF. A document intelligence layer — semantic search, structured quiz generation, annotation workflows, and citation management. Built for professionals who need to trust the answers they get.
        </motion.p>
        <motion.p {...fade(0.1)} className="text-base text-muted-foreground font-body leading-relaxed">
          We're building the tool we wished existed when we were in grad school, when we were reviewing contracts, when we were preparing for exams. Something that respects the document and respects your time.
        </motion.p>
      </div>
    </section>

    <div className="max-w-3xl mx-auto border-t border-border/10" />

    {/* Principles */}
    <section className="py-20">
      <div className="max-w-3xl mx-auto px-6">
        <motion.span {...fade()} className="block text-[9px] text-muted-foreground uppercase tracking-widest mb-6">— OUR PRINCIPLES —</motion.span>
        <div className="grid sm:grid-cols-2 gap-4">
          {principles.map((p, i) => (
            <motion.div key={p.title} {...fade(i * 0.1)} className="bg-card border border-border/10 rounded-2xl p-5">
              <h3 className="text-sm text-foreground font-body font-semibold mb-2">{p.title}</h3>
              <p className="text-xs text-muted-foreground font-body leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    <div className="max-w-3xl mx-auto border-t border-border/10" />

    {/* Developer */}
    <section className="py-20">
      <div className="max-w-3xl mx-auto px-6">
        <motion.span {...fade()} className="block text-[9px] text-muted-foreground uppercase tracking-widest mb-6">— THE DEVELOPER —</motion.span>
        <motion.div {...fade(0.1)} className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-card border border-border/10 flex items-center justify-center mb-4">
            <span className="text-xl text-foreground font-body font-semibold">CS</span>
          </div>
          <h3 className="text-base text-foreground font-body font-semibold">{developer.name}</h3>
          <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider mb-2">{developer.role}</p>
          <p className="text-sm text-muted-foreground font-body max-w-xs mb-3">{developer.bio}</p>
          <a href={developer.portfolio} target="_blank" rel="noopener noreferrer" className="text-xs text-foreground font-body underline underline-offset-4 hover:opacity-70 transition-opacity">
            chetansharma.live
          </a>
        </motion.div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-24 text-center">
      <motion.h2 {...fade()} className="font-display text-2xl text-foreground mb-6">Join us in building it</motion.h2>
      <Link to="/careers" className="inline-block px-8 py-3 bg-foreground text-background rounded-xl text-sm font-body font-medium hover:opacity-90 transition-opacity">
        View Open Roles
      </Link>
    </section>

    <Footer />
  </div>
);

export default About;
