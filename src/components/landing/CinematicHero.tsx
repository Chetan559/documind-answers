import { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { Link } from "react-router-dom";
import { MessageSquare, BookOpen, Layers } from "lucide-react";
import { AppPreviewMockup } from "./AppPreviewMockup";

// ── Easing helpers ────────────────────────────────────────
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const easedProgress = (v: number, from: number, to: number) => {
  const t = Math.max(0, Math.min(1, (v - from) / (to - from)));
  return easeInOutCubic(t);
};

// ── Mobile detection ──────────────────────────────────────
const getIsMobile = () =>
  typeof window !== "undefined" && window.innerWidth < 768;

// ── scrollYProgress breakpoints (mapped over 300vh) ───────
// Act 1  static:        0.00 → 0.06
// Act 2  emergence:     0.06 → 0.42
// Act 3  immersion:     0.42 → 0.62
// Act 4  collapse:      0.62 → 0.82
// Act 5  features rise: 0.78 → 1.00  (overlaps Act 4 tail)
const BP = {
  act1End: 0.06,
  leftFadeOut: 0.25, // left col done fading by here
  leftOpFade: 0.22,
  overlayIn: 0.3, // overlay peaks at this
  act2End: 0.42, // card fully expanded
  act3Start: 0.42,
  act3End: 0.62,
  collapseStart: 0.62,
  cardOpStart: 0.66,
  collapseEnd: 0.82,
  featStart: 0.72,
  featEnd: 0.92,
  hintIn: 0.44,
  hintPeak: 0.52,
  hintOut: 0.58,
  hintGone: 0.63,
};

// ──────────────────────────────────────────────────────────
//  CinematicHero
// ──────────────────────────────────────────────────────────
const CinematicHero = () => {
  const [isMobile, setIsMobile] = useState(getIsMobile);
  const [isImmersed, setIsImmersed] = useState(false);

  const scrollContainer = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const [restRect, setRestRect] = useState({ x: 0, y: 0, w: 0, h: 0 });

  // 300vh container — smooth cinematic with minimal dead zone
  const { scrollYProgress } = useScroll({
    target: scrollContainer,
    offset: ["start start", "end end"],
  });

  // ── Measure right-column rest position ────────────────
  useEffect(() => {
    const measure = () => {
      if (!rightColRef.current) return;
      const r = rightColRef.current.getBoundingClientRect();
      setRestRect({ x: r.left, y: r.top, w: r.width, h: r.height });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // ── Mobile listener ───────────────────────────────────
  useEffect(() => {
    const onResize = () => setIsMobile(getIsMobile());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Immersion + navbar hide ────────────────────────────
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setIsImmersed(v > BP.act3Start && v < BP.act3End);

    // Hide navbar by stamping a class on <html> during cinematic
    if (v > BP.act1End && v < BP.collapseEnd) {
      document.documentElement.classList.add("cinematic-active");
    } else {
      document.documentElement.classList.remove("cinematic-active");
    }
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.documentElement.classList.remove("cinematic-active");
    };
  }, []);

  // ── Left column ───────────────────────────────────────
  const leftColX = useTransform(scrollYProgress, (v) => {
    const e = easedProgress(v, BP.act1End, BP.leftFadeOut);
    return `${e * -8}%`;
  });
  const leftColOpacity = useTransform(scrollYProgress, (v) => {
    const e = easedProgress(v, BP.act1End, BP.leftOpFade);
    return 1 - e;
  });

  // ── Background overlay ────────────────────────────────
  // Uses absolute positioning so it stays inside the sticky container
  // — it won't bleed through to cover the navbar.
  const overlayOpacity = useTransform(scrollYProgress, (v) => {
    if (v <= BP.act1End) return 0;
    if (v <= BP.overlayIn)
      return easedProgress(v, BP.act1End, BP.overlayIn) * 0.9;
    if (v <= BP.collapseStart) return 0.9;
    return 0.9 * (1 - easedProgress(v, BP.collapseStart, BP.collapseEnd));
  });

  // ── Card dimensions ───────────────────────────────────
  const cardWidth = useTransform(scrollYProgress, (v) => {
    if (v < BP.act1End) return `${restRect.w}px`;
    if (v >= BP.act2End) return "100vw";
    const e = easedProgress(v, BP.act1End, BP.act2End);
    return `${restRect.w + e * (window.innerWidth - restRect.w)}px`;
  });

  const cardHeight = useTransform(scrollYProgress, (v) => {
    if (v < BP.act1End) return `${restRect.h}px`;
    if (v >= BP.act2End) return "100vh";
    const e = easedProgress(v, BP.act1End, BP.act2End);
    return `${restRect.h + e * (window.innerHeight - restRect.h)}px`;
  });

  const cardX = useTransform(scrollYProgress, (v) => {
    const halfVW = window.innerWidth / 2;
    const restX = restRect.x - halfVW + restRect.w / 2;
    if (v < BP.act1End) return `${restX}px`;
    if (v >= BP.act2End) return "-50vw";
    const e = easedProgress(v, BP.act1End, BP.act2End);
    return `${restX + e * (-halfVW - restX)}px`;
  });

  const cardY = useTransform(scrollYProgress, (v) => {
    const halfVH = window.innerHeight / 2;
    const restY = restRect.y - halfVH + restRect.h / 2;

    if (v < BP.act1End) return `${restY}px`;

    if (v >= BP.act2End && v < BP.collapseStart) return "-50vh";

    if (v >= BP.collapseStart) {
      // Card flies up off screen during Act 4
      const e = easedProgress(v, BP.collapseStart, BP.collapseEnd);
      return `${-50 + e * -65}vh`; // -50vh → -115vh
    }

    // Act 2: interpolate from rest → -50vh
    const e = easedProgress(v, BP.act1End, BP.act2End);
    return `${restY + e * (-halfVH - restY)}px`;
  });

  const cardBorderRadius = useTransform(scrollYProgress, (v) => {
    if (v < BP.act1End) return 16;
    if (v >= BP.act2End) return 0;
    return 16 * (1 - easedProgress(v, BP.act1End, BP.act2End));
  });

  const cardBorderOpacity = useTransform(scrollYProgress, (v) =>
    Math.max(0, 1 - easedProgress(v, BP.act1End, BP.act2End)),
  );

  // Act 3 — parallax inside card
  const innerContentY = useTransform(scrollYProgress, (v) => {
    if (v < BP.act3Start || v > BP.act3End) return "0%";
    return `${easedProgress(v, BP.act3Start, BP.act3End) * -3}%`;
  });

  // Act 4 — card exit
  const cardOpacity = useTransform(scrollYProgress, (v) => {
    if (v < BP.cardOpStart) return 1;
    return 1 - easedProgress(v, BP.cardOpStart, BP.collapseEnd);
  });

  const cardScale = useTransform(scrollYProgress, (v) => {
    if (v < BP.collapseStart) return 1;
    return 1 - easedProgress(v, BP.collapseStart, BP.collapseEnd) * 0.12;
  });

  // Scroll hint
  const scrollHintOpacity = useTransform(scrollYProgress, (v) => {
    if (v < BP.hintIn) return 0;
    if (v <= BP.hintPeak) return easedProgress(v, BP.hintIn, BP.hintPeak);
    if (v <= BP.hintOut) return 1;
    return 1 - easedProgress(v, BP.hintOut, BP.hintGone);
  });

  // Features section inside sticky — rises during Act 4 tail
  const featuresY = useTransform(scrollYProgress, (v) => {
    if (v < BP.featStart) return "60px";
    if (v >= BP.featEnd) return "0px";
    return `${60 * (1 - easedProgress(v, BP.featStart, BP.featEnd))}px`;
  });
  const featuresOpacity = useTransform(scrollYProgress, (v) => {
    if (v < BP.featStart) return 0;
    if (v >= BP.featEnd) return 1;
    return easedProgress(v, BP.featStart, BP.featEnd);
  });

  // ── Mobile fallback ───────────────────────────────────
  if (isMobile) {
    return (
      <section className="relative min-h-screen flex items-center noise-bg overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-16 flex flex-col gap-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <HeroText />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full rounded-2xl border border-[#c8c8c9]/20 overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
            style={{ height: 340 }}
          >
            <AppPreviewMockup isImmersed={false} />
          </motion.div>
        </div>
      </section>
    );
  }

  // ── Desktop — cinematic sticky container ──────────────
  return (
    <div ref={scrollContainer} style={{ height: "300vh" }} className="relative">
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
        }}
        className="relative bg-background noise-bg"
      >
        {/* ── Dark overlay — ABSOLUTE so it stays clipped to the sticky ── */}
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 bg-[#111111] pointer-events-none z-[5]"
        />

        {/* ── Two-column hero layout ── */}
        <div className="absolute inset-0 flex items-center z-[15] pointer-events-none">
          <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-2 gap-16 items-center pt-16">
            {/* Left column */}
            <motion.div
              style={{ x: leftColX, opacity: leftColOpacity }}
              className="pointer-events-auto"
            >
              <HeroText />
            </motion.div>

            {/* Invisible right-column placeholder — gives us the bounding rect */}
            <div ref={rightColRef} className="w-full" style={{ height: 520 }} />
          </div>
        </div>

        {/* ── Features section — rises during Act 4, inside sticky ── */}
        <motion.div
          style={{ y: featuresY, opacity: featuresOpacity }}
          className="absolute inset-0 flex items-center justify-center z-[12] pointer-events-none"
        >
          <div className="max-w-5xl mx-auto px-6 w-full">
            <p className="font-display text-3xl text-primary text-center mb-10">
              Intelligent by design
            </p>
            <div className="grid grid-cols-3 gap-5">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="p-5 bg-surface/80 backdrop-blur-sm rounded-xl border border-border/20"
                >
                  <div className="w-10 h-10 bg-background rounded-lg border border-border/20 flex items-center justify-center mb-3">
                    <f.icon className="w-4 h-4 text-foreground" />
                  </div>
                  <h3 className="font-display text-base text-primary mb-1.5">
                    {f.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-body">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Fixed preview card ── */}
        {restRect.w > 0 && (
          <motion.div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              width: cardWidth,
              height: cardHeight,
              x: cardX,
              y: cardY,
              borderRadius: cardBorderRadius,
              opacity: cardOpacity,
              scale: cardScale,
              zIndex: 20,
              overflow: "hidden",
              willChange: "transform",
            }}
          >
            {/* Border fade */}
            <motion.div
              style={{ opacity: cardBorderOpacity }}
              className="absolute inset-0 rounded-[inherit] border border-[#c8c8c9]/40 pointer-events-none z-10"
            />
            {/* Shadow */}
            <div
              className="absolute inset-0 rounded-[inherit] pointer-events-none z-10"
              style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}
            />

            {/* Inner with Act 3 parallax */}
            <motion.div style={{ y: innerContentY }} className="w-full h-full">
              <AppPreviewMockup isImmersed={isImmersed} />
            </motion.div>

            {/* Scroll hint */}
            <motion.div
              style={{ opacity: scrollHintOpacity }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none z-20"
            >
              <span className="text-[11px] text-[#828282] uppercase tracking-widest">
                Scroll to continue
              </span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 3v10M4 9l4 4 4-4"
                  stroke="#828282"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// ── Feature data (mirrors Landing.tsx) ────────────────────
const FEATURES = [
  {
    icon: MessageSquare,
    title: "Semantic PDF Chat",
    desc: "Ask in plain English. RAG pipeline retrieves exact passages for grounded answers.",
  },
  {
    icon: BookOpen,
    title: "Auto Quiz Generation",
    desc: "Generate MCQ, true/false, and short-answer questions calibrated to difficulty.",
  },
  {
    icon: Layers,
    title: "Multi-Document AI",
    desc: "Organize PDFs in folders. Chat across your entire knowledge base at once.",
  },
];

// ── Hero text (shared mobile + desktop) ───────────────────
const HeroText = () => (
  <div>
    <motion.h1
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-primary leading-[1.05] tracking-tight"
    >
      Your Documents.
      <br />
      Answered.
    </motion.h1>
    <motion.p
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className="mt-6 text-lg text-foreground font-body max-w-lg leading-relaxed"
    >
      Upload any PDF. Ask anything. DocuMind delivers precise, source-grounded
      answers — and builds your quiz in seconds.
    </motion.p>
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="mt-8 flex flex-wrap gap-4"
    >
      <Link
        to="/upload"
        className="px-7 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-body hover:bg-primary/90 transition-all active:scale-95"
      >
        Upload a PDF
      </Link>
      <a
        href="#features"
        className="px-7 py-3 border border-border/40 text-foreground rounded-lg text-sm font-body hover:bg-surface transition-all active:scale-95"
      >
        See How It Works
      </a>
    </motion.div>
  </div>
);

export default CinematicHero;
