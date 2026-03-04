import { motion } from 'framer-motion';

interface Props {
  question: string;
}

const QuestionCard = ({ question }: Props) => (
  <motion.h2
    className="font-display text-2xl sm:text-3xl text-foreground text-center leading-relaxed max-w-[620px] mx-auto"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    {question}
  </motion.h2>
);

export default QuestionCard;
