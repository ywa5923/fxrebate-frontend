'use client'

import { useEffect, useRef } from "react";
import { animate, motion, useInView } from "framer-motion";

import { fadeIn, opacityAnimation } from '@/lib/motions';
import { companyStats } from '@/lib/content';
import { StatProps } from "@/lib/types";

import InViewContainer from './InViewContainer';

const CompanyStats = () => {
  const { title, stats } = companyStats;

  return (
    <InViewContainer
      amount={0.1}
      className="py-[100px] bg-white-200 dark:bg-black"
    >
      <div className='custom-container'>
        <motion.h2
          variants={fadeIn({ direction: "up", delay: 0.25, duration: 1, value: 25, ease: "easeInOut" })}
          className='text-center text-black dark:text-white text-xl sm:text-2xl font-bold leading-[115%] capitalize'
        >
          {title}
        </motion.h2>

        <motion.div
          variants={opacityAnimation({ delay: 0.5, duration: 1.25 })}
          className='flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-10 xl:gap-14 mt-16'
        >
          {stats.map((info, idx) => (
            <Stat
              key={info.id}
              itemsCount={stats.length}
              idx={idx}
              {...info}
            />
          ))}
        </motion.div>
      </div>
    </InViewContainer>
  )
}

const Stat = ({ itemsCount, idx, num, prevSuffix, nextSuffix, decimals = 0, subheading }: StatProps) => {
  const ref = useRef<HTMLHeadingElement | null>(null);
  const hasAnimated = useRef(false);
  const isInView = useInView(ref);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;

    animate(0, num, {
      duration: 2.5,
      onUpdate(value) {
        if (!ref.current) return;

        ref.current.textContent = value.toFixed(decimals);
      },
    });

    hasAnimated.current = true;
  }, [num, decimals, isInView]);

  return (
    <div className='w-full lg:w-auto flex flex-col lg:flex-row items-center gap-10 xl:gap-14'>
      <div className='w-auto text-center'>
        <p className='capitalize text-[40px] sm:text-5xl xl:text-6xl font-bold text-black dark:text-white'>
          <span className="text-black dark:text-white">{prevSuffix}</span>
          <span ref={ref}></span>
          <span className="text-black dark:text-white">{nextSuffix}</span>
        </p>
        <p className='capitalize text-base text-black dark:text-white mt-2'>
          {subheading}
        </p>
      </div>
      {idx !== itemsCount - 1 && (
        <div className='w-full lg:w-px h-px lg:h-24 bg-black/25 dark:bg-white/25' />
      )}
    </div>
  );
};

export default CompanyStats