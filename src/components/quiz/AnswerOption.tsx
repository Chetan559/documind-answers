import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface Props {
  index: number;
  text: string;
  isSelected: boolean;
  isAnswered: boolean;
  isCorrect: boolean;
  isUserChoice: boolean;
  onSelect: () => void;
}

const AnswerOption = ({ index, text, isSelected, isAnswered, isCorrect, isUserChoice, onSelect }: Props) => {
  const letter = String.fromCharCode(65 + index);

  let borderColor = 'border-border/40';
  let bg = 'bg-surface';
  let opacity = '';
  let icon = null;

  if (isAnswered) {
    if (isCorrect) {
      borderColor = 'border-green-400';
      bg = 'bg-green-400/[0.08]';
      icon = <Check className="w-4 h-4 text-green-400" />;
    } else if (isUserChoice && !isCorrect) {
      borderColor = 'border-red-400';
      bg = 'bg-red-400/[0.08]';
      icon = <X className="w-4 h-4 text-red-400" />;
    } else {
      opacity = 'opacity-40';
    }
  } else if (isSelected) {
    borderColor = 'border-primary';
    bg = 'bg-primary/5';
  }

  return (
    <motion.button
      onClick={onSelect}
      disabled={isAnswered}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border text-left transition-all font-body ${borderColor} ${bg} ${opacity} ${
        !isAnswered ? 'hover:border-foreground/60 hover:bg-accent/50 cursor-pointer' : 'cursor-default'
      }`}
      whileHover={!isAnswered ? { scale: 1.01 } : {}}
      whileTap={!isAnswered ? { scale: 0.99 } : {}}
      role="radio"
      aria-checked={isSelected}
      aria-label={`Option ${letter}: ${text}`}
    >
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium shrink-0 ${
        isAnswered && isCorrect ? 'bg-green-400/20 text-green-400' :
        isAnswered && isUserChoice && !isCorrect ? 'bg-red-400/20 text-red-400' :
        isSelected ? 'bg-primary/10 text-primary' :
        'bg-muted text-muted-foreground'
      }`}>
        {letter}
      </span>
      <span className="flex-1 text-sm text-foreground">{text}</span>
      {icon && <span className="shrink-0">{icon}</span>}
    </motion.button>
  );
};

export default AnswerOption;
