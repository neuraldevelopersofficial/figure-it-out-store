import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface MotionCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: delay * 0.1,
      duration: 0.5,
      ease: 'easeOut'
    }
  }),
  hover: {
    y: -10,
    transition: {
      duration: 0.3,
      ease: 'easeInOut'
    }
  }
};

export function MotionCard({ children, className = '', delay = 0 }: MotionCardProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
      custom={delay}
    >
      {children}
    </motion.div>
  );
}