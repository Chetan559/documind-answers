import { motion } from "framer-motion";

interface Props {
  index: number;
  text: string;
  isSelected: boolean;
  onSelect: () => void;
}

const AnswerOption = ({ index, text, isSelected, onSelect }: Props) => {
  const letter = String.fromCharCode(65 + index);

  return (
    <motion.button
      onClick={onSelect}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border text-left transition-all font-body hover:border-foreground/60 hover:bg-accent/50 cursor-pointer ${
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border/40 bg-surface"
      }`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      role="radio"
      aria-checked={isSelected}
      aria-label={`Option ${letter}: ${text}`}
    >
      <span
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium shrink-0 ${
          isSelected
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {letter}
      </span>
      <span className="flex-1 text-sm text-foreground">{text}</span>
    </motion.button>
  );
};

export default AnswerOption;
