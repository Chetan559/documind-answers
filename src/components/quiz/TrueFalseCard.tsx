import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface Props {
  selected: number | null;
  onSelect: (i: number) => void;
}

const TrueFalseCard = ({ selected, onSelect }: Props) => {
  const items = [
    { label: "True", icon: Check, index: 0 },
    { label: "False", icon: X, index: 1 },
  ];

  return (
    <div
      className="grid grid-cols-2 gap-4"
      role="radiogroup"
      aria-label="True or False"
    >
      {items.map(({ label, icon: Icon, index }) => {
        const isSelected = selected === index;
        const border = isSelected ? "border-primary" : "border-border/40";
        const bg = isSelected ? "bg-primary/5" : "bg-surface";

        return (
          <motion.button
            key={label}
            onClick={() => onSelect(index)}
            className={`flex flex-col items-center gap-3 py-8 rounded-xl border transition-all font-body hover:border-foreground/60 cursor-pointer ${border} ${bg}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            role="radio"
            aria-checked={isSelected}
            aria-label={label}
          >
            <Icon
              className={`w-8 h-8 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
            />
            <span className="text-lg font-medium text-foreground">{label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default TrueFalseCard;
