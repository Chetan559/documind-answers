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

const sections = [
  {
    label: 'CHAT',
    title: 'PDF Chat',
    paragraphs: [
      'DocuMind uses a Retrieval-Augmented Generation (RAG) pipeline to answer your questions with precision. When you ask a question, the system searches through your document using semantic vector embeddings — not keyword matching — to find the most relevant passages.',
      "Every answer is grounded in your document. The AI never guesses. If the information isn't in the PDF, it tells you. Every response includes the exact page number and passage it drew from, so you can verify instantly.",
      'This approach means DocuMind works equally well on dense academic papers, scanned legal contracts, and sprawling financial reports.',
    ],
    bullets: [
      'Supports scanned PDFs and OCR-processed documents',
      'Works with handwritten notes and annotations',
      'Handles academic papers, legal documents, and financial reports',
      'Page-level source citations on every response',
      'Context-aware follow-up questions',
    ],
  },
  {
    label: 'MULTI-DOC',
    title: 'Multi-Document Intelligence',
    paragraphs: [
      "Upload an entire library of PDFs and query across all of them simultaneously. DocuMind's multi-document engine synthesizes information from multiple sources, identifying connections and contradictions you might miss.",
      'Organize your documents into folders for different projects, courses, or cases. When you chat with a folder, the AI searches every document inside it and weaves together a comprehensive answer.',
    ],
    bullets: [
      'Query across unlimited documents in a single session',
      'Folder-based organization for projects and topics',
      'Cross-document synthesis and comparison',
      'Reconciles conflicting information across sources',
      'Identifies themes and patterns across your library',
    ],
  },
  {
    label: 'QUIZ',
    title: 'Quiz Generation',
    paragraphs: [
      'Instantly generate quizzes from any document. DocuMind creates multiple-choice, true/false, and short-answer questions calibrated to your chosen difficulty level — Easy, Medium, or Hard.',
      "Questions are delivered one at a time with immediate feedback, source citations, and detailed explanations. It's not just testing memorization — the quiz engine targets comprehension and critical thinking.",
    ],
    bullets: [
      'Multiple choice, true/false, and short-answer formats',
      'Three difficulty levels with intelligent calibration',
      'One-question-at-a-time Gemini-style experience',
      'Immediate feedback with source citations',
      'Explanations reference specific passages',
    ],
  },
  {
    label: 'ANNOTATIONS',
    title: 'Annotations & Highlights',
    paragraphs: [
      'Select any text in the PDF viewer and highlight it in one of five colors. Attach notes to any highlight and save them to named collections for organized review.',
      'Highlights are stored as percentage-based coordinates, which means they reposition correctly at any zoom level and survive across sessions. Your annotations are always exactly where you left them.',
    ],
    bullets: [
      'Five highlight colors: yellow, blue, green, red, purple',
      'Attach notes to any highlight',
      'Named collections for organized review',
      'Percentage-based positioning survives zoom changes',
      'Persistent across sessions and page refreshes',
    ],
  },
  {
    label: 'SESSIONS',
    title: 'Chat Sessions',
    paragraphs: [
      'Every conversation is saved as a session. Come back to any session and pick up exactly where you left off — full message history, attached documents, and source citations all preserved.',
      'Pin important sessions, rename them, and attach multiple documents to a single conversation. Session titles are auto-generated from your first message.',
    ],
    bullets: [
      'Full message history with inline source citations',
      'Pin and rename sessions',
      'Multi-document sessions',
      'Auto-generated session titles',
      'Session search and filtering',
    ],
  },
  {
    label: 'CITATIONS',
    title: 'Citation Export',
    paragraphs: [
      'Export properly formatted citations in APA 7th, MLA 9th, Chicago, or BibTeX. The metadata editor lets you fill in authors, DOIs, journal names, and more — ensuring your citations are accurate.',
      'Preview citations live as you switch formats, then download as .txt, .bib, or .docx with a single click.',
    ],
    bullets: [
      'APA 7th, MLA 9th, Chicago, and BibTeX formats',
      'Built-in metadata editor for authors, DOI, journal info',
      'Live preview updates as you switch formats',
      'Download as .txt, .bib, or .docx',
      'Page references and excerpt inclusion options',
    ],
  },
];

const Features = () => (
  <div className="min-h-screen bg-background">
    <Navbar />

    {/* Hero */}
    <section className="pt-28 pb-16 text-center">
      <div className="max-w-[560px] mx-auto px-6">
        <motion.h1
          {...fade()}
          className="font-display text-4xl sm:text-[52px] leading-tight text-foreground mb-4"
        >
          Everything you need to understand any document.
        </motion.h1>
        <motion.p {...fade(0.1)} className="text-lg text-muted-foreground font-body">
          A complete breakdown of what DocuMind can do — and how it works under the hood.
        </motion.p>
      </div>
      <div className="max-w-7xl mx-auto mt-16 border-t border-border/10" />
    </section>

    {/* Feature sections */}
    {sections.map((s, i) => (
      <section
        key={s.label}
        className={`py-20 ${i % 2 === 1 ? 'bg-surface' : 'bg-background'}`}
      >
        <div className="max-w-3xl mx-auto px-6">
          <motion.span
            {...fade()}
            className="block text-[9px] text-muted-foreground uppercase tracking-widest mb-6 text-center"
          >
            — {s.label} —
          </motion.span>
          <motion.h2
            {...fade(0.05)}
            className="font-display text-3xl sm:text-4xl text-foreground text-center mb-8"
          >
            {s.title}
          </motion.h2>
          {s.paragraphs.map((p, j) => (
            <motion.p
              key={j}
              {...fade(0.1 + j * 0.05)}
              className="text-base text-muted-foreground font-body leading-relaxed mb-4"
            >
              {p}
            </motion.p>
          ))}
          <motion.ul {...fade(0.2)} className="mt-6 space-y-2">
            {s.bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-foreground font-body">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
                {b}
              </li>
            ))}
          </motion.ul>
        </div>
        {i < sections.length - 1 && (
          <div className="max-w-7xl mx-auto mt-20 border-t border-border/10" />
        )}
      </section>
    ))}

    {/* Bottom CTA */}
    <section className="py-24 bg-background text-center">
      <motion.h2 {...fade()} className="font-display text-3xl text-foreground mb-6">
        Ready to try it?
      </motion.h2>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/upload"
          className="px-8 py-3 bg-foreground text-background rounded-xl text-sm font-body font-medium hover:opacity-90 transition-opacity"
        >
          Upload a PDF
        </Link>
        <Link
          to="/pricing"
          className="px-8 py-3 border border-border/20 text-foreground rounded-xl text-sm font-body hover:border-border/40 transition-colors"
        >
          View Pricing
        </Link>
      </div>
    </section>

    <Footer />
  </div>
);

export default Features;
