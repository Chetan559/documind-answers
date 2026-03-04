import { motion } from 'framer-motion';

interface Props {
  current: number;
  total: number;
}

const ProgressBar = ({ current, total }: Props) => {
  const pct = ((current) / total) * 100;

  return (
    <div className="w-full">
      <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-end mt-2">
        <span
          className="text-xs text-muted-foreground font-body uppercase tracking-wider"
          aria-live="polite"
        >
          Question {current} of {total}
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;
