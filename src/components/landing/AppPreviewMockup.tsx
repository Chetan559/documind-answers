import { useEffect, useState } from "react";
import { FileText, Send, ChevronLeft, ChevronRight } from "lucide-react";

interface AppPreviewMockupProps {
  isImmersed: boolean;
}

const FILES = [
  { name: "vanka.pdf", pages: 7, active: true },
  { name: "research_report.pdf", pages: 14, active: false },
  { name: "lecture_notes.pdf", pages: 22, active: false },
];

const AI_RESPONSE =
  "The central theme revolves around the psychological and moral transformation of the protagonist under social pressure. Tolstoy illustrates how societal expectations erode individual identity, leaving characters trapped between duty and authentic desire.";

const STREAM_DELAY_MS = 28; // ms per character during streaming

const TypingDots = () => (
  <div className="flex items-center gap-1 px-3 py-2">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-[#828282] typing-dot"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
);

export const AppPreviewMockup = ({ isImmersed }: AppPreviewMockupProps) => {
  const [streamedText, setStreamedText] = useState("");
  const [showTyping, setShowTyping] = useState(false);
  const [streamDone, setStreamDone] = useState(false);

  useEffect(() => {
    if (!isImmersed) {
      // Reset when leaving immersion
      setStreamedText("");
      setShowTyping(false);
      setStreamDone(false);
      return;
    }

    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;

    setShowTyping(true);
    setStreamedText("");
    setStreamDone(false);

    // After 900ms of typing dots, stream the response
    t1 = setTimeout(() => {
      setShowTyping(false);
      let i = 0;
      const stream = () => {
        if (i <= AI_RESPONSE.length) {
          setStreamedText(AI_RESPONSE.slice(0, i));
          i++;
          t2 = setTimeout(stream, STREAM_DELAY_MS);
        } else {
          setStreamDone(true);
        }
      };
      stream();
    }, 900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isImmersed]);

  return (
    <div
      className="w-full h-full flex overflow-hidden bg-[#111111] rounded-[inherit]"
      style={{ fontFamily: "var(--font-body, DM Sans, sans-serif)" }}
    >
      {/* ── Sidebar ─────────────────────────────────────── */}
      <div className="w-[180px] shrink-0 border-r border-[#1e1e1e] bg-[#0d0d0d] flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#1e1e1e]">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#828282]" />
            <span className="text-[11px] text-[#828282] uppercase tracking-widest font-semibold">
              Library
            </span>
          </div>
        </div>

        {/* File list */}
        <div className="flex-1 overflow-hidden py-2">
          {FILES.map((f) => (
            <div
              key={f.name}
              className={`flex items-center gap-2 px-3 py-2 mx-1 rounded-md cursor-default transition-colors ${
                f.active
                  ? "bg-[#1a1a1a] border border-[#2a2a2a]"
                  : "hover:bg-[#161616]"
              }`}
            >
              <FileText
                className={`w-3.5 h-3.5 shrink-0 ${f.active ? "text-[#e3e3e3]" : "text-[#828282]"}`}
              />
              <div className="min-w-0">
                <p
                  className={`text-[11px] truncate leading-tight ${
                    f.active ? "text-[#e3e3e3]" : "text-[#828282]"
                  }`}
                >
                  {f.name}
                </p>
                <p className="text-[9px] text-[#414141] mt-0.5">
                  {f.pages} pages
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* New upload hint */}
        <div className="px-3 py-3 border-t border-[#1e1e1e]">
          <div className="w-full text-center py-1.5 rounded-md border border-dashed border-[#2a2a2a] text-[10px] text-[#414141]">
            + Add PDF
          </div>
        </div>
      </div>

      {/* ── Chat Panel ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="px-4 py-3 border-b border-[#1e1e1e] flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#3a3a3a] shrink-0" />
          <span className="text-[11px] text-[#828282] truncate">
            vanka.pdf — Chat
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden px-4 py-4 space-y-4">
          {/* User message */}
          <div className="flex justify-end">
            <div className="max-w-[80%] px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl rounded-br-sm">
              <p className="text-[12px] text-[#e3e3e3] leading-relaxed">
                What is the main theme of this document?
              </p>
            </div>
          </div>

          {/* AI response */}
          <div className="flex justify-start">
            <div className="max-w-[88%]">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-4 h-4 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
                  <span className="text-[7px] text-[#e3e3e3] font-bold">D</span>
                </div>
                <span className="text-[9px] text-[#414141] uppercase tracking-wider">
                  DocuMind
                </span>
              </div>
              <div className="px-3 py-2 bg-[#141414] border border-[#1e1e1e] rounded-xl rounded-bl-sm">
                {showTyping && !streamDone && <TypingDots />}
                {!showTyping && (
                  <p className="text-[12px] text-[#c8c8c9] leading-relaxed min-h-[18px]">
                    {streamedText}
                    {!streamDone && isImmersed && (
                      <span className="inline-block w-0.5 h-3 bg-[#828282] ml-0.5 cursor-blink" />
                    )}
                  </p>
                )}
              </div>
              {streamDone && (
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-[9px] text-[#414141]">
                    Source: vanka.pdf · p.12
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input bar */}
        <div className="px-4 py-3 border-t border-[#1e1e1e]">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#141414] border border-[#2a2a2a] rounded-lg">
            <input
              readOnly
              placeholder="Ask anything about vanka.pdf..."
              className="flex-1 bg-transparent text-[11px] text-[#828282] placeholder-[#414141] outline-none cursor-default"
            />
            <button className="w-6 h-6 rounded-md bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center shrink-0">
              <Send className="w-3 h-3 text-[#828282]" />
            </button>
          </div>
        </div>
      </div>

      {/* ── PDF Viewer ──────────────────────────────────── */}
      <div className="w-[160px] shrink-0 border-l border-[#1e1e1e] bg-[#0d0d0d] flex flex-col">
        {/* PDF nav */}
        <div className="px-3 py-2.5 border-b border-[#1e1e1e] flex items-center justify-between">
          <button className="text-[#414141] hover:text-[#828282] transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-[#414141]">1 / 7</span>
          <button className="text-[#414141] hover:text-[#828282] transition-colors">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* PDF page thumb — scrolls slowly when immersed */}
        <div className="flex-1 overflow-hidden relative">
          <div
            className={`px-3 pt-3 space-y-1.5 ${isImmersed ? "pdf-scroll-loop" : ""}`}
          >
            {/* Simulate page lines */}
            <div className="h-[6px] bg-[#1e1e1e] rounded w-full" />
            <div className="h-[6px] bg-[#1e1e1e] rounded w-5/6" />
            <div className="h-[6px] bg-[#1e1e1e] rounded w-full" />
            <div className="h-[6px] bg-[#1a1a1a] rounded w-4/5" />
            <div className="h-[6px] bg-[#1e1e1e] rounded w-full" />
            <div className="h-[6px] bg-[#1e1e1e] rounded w-3/4" />
            <div className="mt-3 h-[8px] bg-[#1a1a1a] rounded w-2/3" />
            <div className="h-[6px] bg-[#1e1e1e] rounded w-full" />
            <div className="h-[6px] bg-[#1e1e1e] rounded w-5/6" />
            <div className="h-[6px] bg-[#1e1e1e] rounded w-full" />
            <div className="h-[6px] bg-[#1a1a1a] rounded w-3/5" />
            <div className="mt-2 h-[6px] bg-[#1e1e1e] rounded w-full" />
            <div className="h-[6px] bg-[#1e1e1e] rounded w-4/5" />
            <div className="h-[6px] bg-[#1e1e1e] rounded w-full" />
            <div className="h-[6px] bg-[#1a1a1a] rounded w-5/6" />
            <div className="mt-3 h-[8px] bg-[#1a1a1a] rounded w-1/2" />
            <div className="h-[6px] bg-[#1e1e1e] rounded w-full" />
            <div className="h-[6px] bg-[#1e1e1e] rounded w-3/4" />
            <div className="h-[6px] bg-[#1e1e1e] rounded w-full" />
            <div className="h-[6px] bg-[#1a1a1a] rounded w-4/6" />
          </div>
        </div>

        {/* Highlight indicator */}
        <div className="px-3 py-2.5 border-t border-[#1e1e1e]">
          <div className="text-[9px] text-[#414141] uppercase tracking-wider mb-1">
            Highlight
          </div>
          <div className="h-[5px] bg-[#2a2a2a] rounded w-full" />
          <div className="h-[5px] bg-[#2a2a2a] rounded w-3/4 mt-1" />
        </div>
      </div>
    </div>
  );
};

export default AppPreviewMockup;
