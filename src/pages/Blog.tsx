import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
});

const posts = [
  { title: 'How RAG Actually Works — And Why It Matters for Document Q&A', category: 'Engineering', excerpt: 'A deep dive into retrieval-augmented generation, vector embeddings, and why keyword search falls apart on complex documents. We break down the architecture behind DocuMind\'s chat engine.', author: 'Priya Nair', date: 'Jan 10, 2025' },
  { title: 'Why We Store Highlights as Percentages, Not Pixels', category: 'Engineering', excerpt: 'Pixel-based annotations break at every zoom level. Here\'s how percentage-based coordinate systems make highlights resolution-independent.', author: 'Marcus Webb', date: 'Jan 5, 2025' },
  { title: 'The Problem with Citation Managers (And How We\'re Fixing It)', category: 'Product', excerpt: 'Most citation tools treat formatting as the whole problem. We think the real issue starts earlier — at the point of discovery.', author: 'Aisha Kamara', date: 'Dec 28, 2024' },
  { title: 'Building a Quiz Engine That Doesn\'t Just Test Memorization', category: 'Research', excerpt: 'How we calibrate question difficulty and ensure quiz questions test comprehension, not just recall. Includes our evaluation methodology.', author: 'Priya Nair', date: 'Dec 20, 2024' },
  { title: 'What We Learned From 10,000 PDF Uploads', category: 'Product', excerpt: 'Patterns in how people use document AI — what they ask, how they organize, and where existing tools fail them.', author: 'Alex Chen', date: 'Dec 15, 2024' },
  { title: 'Designing for Trust: How We Show Sources in DocuMind', category: 'Design', excerpt: 'When an AI gives you an answer, you need to know where it came from. Here\'s our design philosophy for source citations.', author: 'Aisha Kamara', date: 'Dec 8, 2024' },
];

const categories = ['All', 'Product', 'Engineering', 'Research', 'Design'];

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const filtered = activeCategory === 'All' ? posts : posts.filter((p) => p.category === activeCategory);
  const featured = posts[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 text-center">
        <div className="max-w-[560px] mx-auto px-6">
          <motion.h1 {...fade()} className="font-display text-4xl sm:text-[52px] leading-tight text-foreground mb-4">
            Thinking about documents.
          </motion.h1>
          <motion.p {...fade(0.1)} className="text-lg text-muted-foreground font-body">
            Ideas, research, and product updates from the DocuMind team.
          </motion.p>
        </div>
        <div className="max-w-7xl mx-auto mt-16 border-t border-border/10" />
      </section>

      {/* Featured */}
      <section className="pb-12">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div {...fade()} className="bg-card border border-border/10 rounded-2xl p-8 hover:border-border/20 hover:-translate-y-1 transition-all cursor-pointer">
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-body">{featured.category}</span>
            <h2 className="font-display text-2xl sm:text-3xl text-foreground mt-2 mb-3">{featured.title}</h2>
            <p className="text-sm text-muted-foreground font-body leading-relaxed mb-4 max-w-2xl">{featured.excerpt}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-body">{featured.author} · {featured.date}</span>
              <span className="flex items-center gap-1 text-xs text-foreground font-body">Read <ArrowRight className="w-3 h-3" /></span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category filter */}
      <section className="pb-8">
        <div className="max-w-4xl mx-auto px-6 flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-4 py-1.5 rounded-full text-xs font-body transition-colors ${
                activeCategory === c
                  ? 'bg-foreground text-background'
                  : 'border border-border/15 text-muted-foreground hover:border-border/30'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Posts grid */}
      <section className="pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map((p, i) => (
              <motion.div
                key={p.title}
                {...fade(i * 0.05)}
                className="bg-card border border-border/10 rounded-2xl p-5 hover:border-border/20 hover:-translate-y-1 transition-all cursor-pointer"
              >
                <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-body">{p.category}</span>
                <h3 className="font-display text-lg text-foreground mt-2 mb-2 leading-snug">{p.title}</h3>
                <p className="text-xs text-muted-foreground font-body leading-relaxed mb-3">{p.excerpt.slice(0, 120)}...</p>
                <span className="text-[10px] text-muted-foreground font-body">{p.author} · {p.date}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pagination */}
      <section className="pb-24">
        <div className="flex justify-center gap-3">
          <button className="px-4 py-2 border border-border/15 text-muted-foreground rounded-xl text-xs font-body hover:border-border/30 transition-colors flex items-center gap-1">
            <ChevronLeft className="w-3 h-3" /> Prev
          </button>
          <button className="px-4 py-2 border border-border/15 text-muted-foreground rounded-xl text-xs font-body hover:border-border/30 transition-colors flex items-center gap-1">
            Next <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
