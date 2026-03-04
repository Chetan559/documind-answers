import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface Props {
  selected: number | null;
  isAnswered: boolean;
  correctIndex: number;
  onSelect: (i: number) => void;
}

const TrueFalseCard = ({ selected, isAnswered, correctIndex, onSelect }: Props) => {
  const items = [
    { label: 'True', icon: Check, index: 0 },
    { label: 'False', icon: X, index: 1 },
  ];

  return (
    <div className="grid grid-cols-2 gap-4" role="radiogroup" aria-label="True or False">
      {items.map(({ label, icon: Icon, index }) => {
        const isSelected = selected === index;
        const isCorrect = isAnswered && index === correctIndex;
        const isWrong = isAnswered && isSelected && index !== correctIndex;
        const dimmed = isAnswered && !isCorrect && !isWrong;

        let border = 'border-border/40';
        let bg = 'bg-surface';
        if (isCorrect) { border = 'border-green-400'; bg = 'bg-green-400/[0.08]'; }
        else if (isWrong) { border = 'border-red-400'; bg = 'bg-red-400/[0.08]'; }
        else if (isSelected && !isAnswered) { border = 'border-primary'; bg = 'bg-primary/5'; }

        return (
          <motion.button
            key={label}
            onClick={() => !isAnswered && onSelect(index)}
            disabled={isAnswered}
            className={`flex flex-col items-center gap-3 py-8 rounded-xl border transition-all font-body ${border} ${bg} ${
              dimmed ? 'opacity-40' : ''
            } ${!isAnswered ? 'hover:border-foreground/60 cursor-pointer' : 'cursor-default'}`}
            whileHover={!isAnswered ? { scale: 1.02 } : {}}
            whileTap={!isAnswered ? { scale: 0.98 } : {}}
            role="radio"
            aria-checked={isSelected}
            aria-label={label}
          >
            <Icon className={`w-8 h-8 ${
              isCorrect ? 'text-green-400' :
              isWrong ? 'text-red-400' :
              isSelected ? 'text-primary' :
              'text-muted-foreground'
            }`} />
            <span className="text-lg font-medium text-foreground">{label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default TrueFalseCard;
