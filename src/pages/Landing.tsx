import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  BookOpen,
  Layers,
  Star,
  Check,
  X as XIcon,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CinematicHero from "@/components/landing/CinematicHero";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
});

const Landing = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "Semantic PDF Chat",
      desc: "Ask questions in plain English. Our RAG pipeline retrieves the exact passages and generates grounded, accurate answers.",
    },
    {
      icon: BookOpen,
      title: "Auto Quiz Generation",
      desc: "Instantly generate Quizlet-style multiple choice, true/false, and short-answer questions calibrated to Easy, Medium, or Hard.",
    },
    {
      icon: Layers,
      title: "Multi-Document Intelligence",
      desc: "Organize PDFs in folders. Chat across all documents at once. Your entire knowledge base, unified.",
    },
  ];

  const reviews = [
    {
      quote:
        "DocuMind cut my research time in half. The answers are precise and always cite the right page.",
      name: "Priya S.",
      role: "PhD Researcher",
    },
    {
      quote:
        "The quiz generator is extraordinary. I uploaded my textbook and had 50 questions in under a minute.",
      name: "Marcus T.",
      role: "Medical Student",
    },
    {
      quote:
        "Finally a tool that respects my documents. No hallucinations — it sticks to what's in the PDF.",
      name: "Aisha K.",
      role: "Legal Analyst",
    },
  ];

  const pricing = [
    {
      tier: "Free",
      price: "$0",
      period: "/mo",
      pdfs: "3",
      questions: "20/day",
      quizzes: "5/mo",
      multiDoc: false,
      support: false,
      cta: "Get Started",
      featured: false,
    },
    {
      tier: "Pro",
      price: "$12",
      period: "/mo",
      pdfs: "Unlimited",
      questions: "Unlimited",
      quizzes: "Unlimited",
      multiDoc: true,
      support: true,
      cta: "Start Pro Trial",
      featured: true,
    },
    {
      tier: "Enterprise",
      price: "Custom",
      period: "",
      pdfs: "Unlimited",
      questions: "Unlimited",
      quizzes: "Unlimited",
      multiDoc: true,
      support: true,
      cta: "Contact Sales",
      featured: false,
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Upload your PDF",
      desc: "Drag and drop any PDF document",
    },
    {
      num: "02",
      title: "Ask your question",
      desc: "Type naturally, like talking to an expert",
    },
    {
      num: "03",
      title: "Get instant answers + quiz",
      desc: "Source-grounded answers and auto-generated quizzes",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Cinematic Hero (5-act scroll sequence) ── */}
      <CinematicHero />

      {/* Features */}
      <section id="features" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            {...fade()}
            className="font-display text-3xl sm:text-4xl text-primary text-center mb-16"
          >
            Intelligent by design
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                {...fade(i * 0.1)}
                className="group p-6 bg-surface rounded-xl border border-border/20 hover:border-primary/60 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-background rounded-lg border border-border/20 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="font-display text-lg text-primary mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-foreground leading-relaxed font-body">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-surface/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            {...fade()}
            className="font-display text-3xl sm:text-4xl text-primary text-center mb-16"
          >
            Three steps to clarity
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                {...fade(i * 0.1)}
                className="relative text-center"
              >
                <span className="font-display text-[120px] leading-none text-surface select-none absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4">
                  {s.num}
                </span>
                <div className="relative z-10 pt-16">
                  <h3 className="font-display text-xl text-primary mb-2">
                    {s.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-body">
                    {s.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            {...fade()}
            className="font-display text-3xl sm:text-4xl text-primary text-center mb-16"
          >
            Trusted by researchers & students
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((r, i) => (
              <motion.div
                key={r.name}
                {...fade(i * 0.1)}
                className="p-6 bg-surface rounded-xl border border-border/20"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 fill-foreground text-foreground"
                    />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed font-body italic mb-4">
                  "{r.quote}"
                </p>
                <div>
                  <p className="text-sm text-foreground font-body font-semibold">
                    {r.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">
                    {r.role}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-surface/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            {...fade()}
            className="font-display text-3xl sm:text-4xl text-primary text-center mb-16"
          >
            Simple, transparent pricing
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pricing.map((p, i) => (
              <motion.div
                key={p.tier}
                {...fade(i * 0.1)}
                className={`p-6 rounded-xl border transition-all ${
                  p.featured
                    ? "bg-surface border-primary -translate-y-2 shadow-lg shadow-primary/5"
                    : "bg-surface border-border/20"
                }`}
              >
                <h3 className="font-display text-lg text-primary mb-1">
                  {p.tier}
                </h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-display text-3xl text-primary">
                    {p.price}
                  </span>
                  <span className="text-sm text-muted-foreground font-body">
                    {p.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    ["PDFs", p.pdfs],
                    ["Questions", p.questions],
                    ["Quiz Generation", p.quizzes],
                  ].map(([label, val]) => (
                    <li
                      key={label}
                      className="flex justify-between text-sm font-body"
                    >
                      <span className="text-muted-foreground">{label}</span>
                      <span className="text-foreground">{val}</span>
                    </li>
                  ))}
                  <li className="flex justify-between text-sm font-body">
                    <span className="text-muted-foreground">
                      Multi-doc Chat
                    </span>
                    {p.multiDoc ? (
                      <Check className="w-4 h-4 text-foreground" />
                    ) : (
                      <XIcon className="w-4 h-4 text-muted-foreground/40" />
                    )}
                  </li>
                  <li className="flex justify-between text-sm font-body">
                    <span className="text-muted-foreground">
                      Priority Support
                    </span>
                    {p.support ? (
                      <Check className="w-4 h-4 text-foreground" />
                    ) : (
                      <XIcon className="w-4 h-4 text-muted-foreground/40" />
                    )}
                  </li>
                </ul>
                <Link
                  to="/upload"
                  className={`block text-center py-2.5 rounded-lg text-sm transition-all active:scale-95 font-body ${
                    p.featured
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border/40 text-foreground hover:bg-surface"
                  }`}
                >
                  {p.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
