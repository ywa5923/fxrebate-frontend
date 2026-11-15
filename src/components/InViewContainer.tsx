import React from "react";
import { motion } from "framer-motion";

interface IMotionContainer {
  id?: string;
  amount: number;
  once?: boolean;
  className?: string;
  children: React.ReactNode;
}

const InViewContainer = ({
  id,
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
      id={id}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default InViewContainer;
