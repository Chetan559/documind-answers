import { useState } from "react";

interface Props {
  onSubmit: (answer: string) => void;
  value?: string;
}

const ShortAnswerInput = ({ onSubmit, value }: Props) => {
  const [text, setText] = useState(value || "");

  const handleBlur = () => {
    if (text.trim()) onSubmit(text.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter (without Shift for newline)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (text.trim()) onSubmit(text.trim());
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          maxLength={500}
          placeholder="Type your answer here..."
          className="w-full min-h-[96px] bg-surface border border-border/30 rounded-xl px-4 py-3 text-sm text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          aria-label="Your answer"
        />
        <span className="absolute bottom-2 right-3 text-xs text-muted-foreground font-body">
          {text.length} / 500
        </span>
      </div>
    </div>
  );
};

export default ShortAnswerInput;
