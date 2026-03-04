import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  score: number;
  total: number;
}

const ScoreCircle = ({ score, total }: Props) => {
  const pct = total > 0 ? (score / total) * 100 : 0;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let frame = 0;
    const totalFrames = 40;
    const interval = setInterval(() => {
      frame++;
      setDisplayScore(Math.round((frame / totalFrames) * score));
      if (frame >= totalFrames) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [score]);

  return (
    <div className="relative w-44 h-44 mx-auto" aria-label={`Score: ${score} out of ${total}, ${Math.round(pct)}%`}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
        <circle
          cx="80" cy="80" r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="6"
        />
        <motion.circle
          cx="80" cy="80" r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl text-foreground">{displayScore}/{total}</span>
        <span className="text-sm text-muted-foreground font-body">{Math.round(pct)}%</span>
      </div>
    </div>
  );
};

export default ScoreCircle;
