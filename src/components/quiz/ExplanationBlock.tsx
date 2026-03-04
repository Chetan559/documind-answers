import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

interface Props {
  explanation: string;
  sourcePage: number;
}

const ExplanationBlock = ({ explanation, sourcePage }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.15 }}
    className="flex gap-3 p-4 bg-surface border-l-[3px] border-l-primary rounded-r-xl"
    aria-live="polite"
  >
    <Lightbulb className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
    <div>
      <p className="text-sm text-foreground font-body leading-relaxed">{explanation}</p>
      <p className="text-xs text-muted-foreground font-body mt-2 italic">
        Source: Page {sourcePage} of your document
      </p>
    </div>
  </motion.div>
);

export default ExplanationBlock;
