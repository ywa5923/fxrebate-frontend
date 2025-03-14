import Link from 'next/link';
import Image from 'next/image';
import React, { forwardRef } from 'react'
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils'

interface IButton {
  text: string;
  iconImage: string;
  buttonContainerClassName?: string;
  buttonClassName?: string;
  href: string;
}

export const Button = forwardRef<HTMLDivElement, IButton>(({ text, iconImage, href, buttonContainerClassName, buttonClassName }, ref) => {
  return (
    <div ref={ref} className={cn("", buttonContainerClassName)}>
      <Link
        href={href}
        className={cn("group min-w-3xs relative flex items-center justify-between gap-3.5 rounded-lg border hover:!border-green-400 border-accent pl-6 py-2 pr-2 transition-all duration-300", buttonClassName)}
        style={{ background: 'linear-gradient(90deg, rgba(0, 106, 61, 0.70) 0%, rgba(0, 66, 23, 0.70) 99.99%)' }}
      >
        <span className="text-white text-sm sm:text-base font-medium ">
          {text}
        </span>
        <div className="p-1 bg-accent rounded-[5px] min-h-8 min-w-8 flex items-center justify-center">
          <Image
            src={iconImage}
            alt="icon"
            className="h-auto group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300"
            width={20}
            height={18}
          />
        </div>
      </Link>
    </div>
  )
});

export const MButton = motion.create(Button);

Button.displayName = "Button";
MButton.displayName = "MButton";
