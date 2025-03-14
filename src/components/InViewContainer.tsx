import React from "react";
import { motion } from "framer-motion";

interface IMotionContainer {
  amount: number;
  once?: boolean;
  className?: string;
  children: React.ReactNode;
}

const InViewContainer = ({
  amount,
  children,
  className,
  once = true,
}: IMotionContainer) => {
  return (
    <motion.div
      initial="hidden"
      exit="hidden"
      whileInView="show"
      viewport={{ amount: amount, once: once }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default InViewContainer;
