import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ReactNode, forwardRef } from 'react';

interface ITag {
  containerClassName?: string;
  children: ReactNode;
}

export const Tag = forwardRef<HTMLDivElement, ITag>(({ containerClassName, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("relative flex items-center rounded-lg border border-accent", containerClassName)}
      style={{ background: 'linear-gradient(90deg, rgba(0, 106, 61, 0.5) 0%, rgba(0, 66, 23, 0.5) 100%)' }}
    >
      {children}
    </div>
  )
});

export const MTag = motion.create(Tag);

Tag.displayName = "Tag";
MTag.displayName = "MTag";
