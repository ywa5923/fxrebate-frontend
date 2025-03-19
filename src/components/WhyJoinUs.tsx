'use client';

import { useRef } from "react";
import { motion, MotionValue, useScroll, useTransform } from "framer-motion";

import { MTag } from "./ui/Tag";
import { MButton } from "./ui/MButton";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { fadeIn } from "@/lib/motions";
import { CardType } from "@/lib/types";
import { whyJoinUs } from "@/lib/content";

import InViewContainer from "./InViewContainer";
import { Translations,useTranslation } from "@/providers/translations";

const WhyJoinUs = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  return (
    <div ref={ref}>
      {whyJoinUs.map((item, idx) => (
        <Card
          key={item.id}
          card={item}
          scrollYProgress={scrollYProgress}
          position={idx + 1}
        />
      ))}
    </div>
  );
};

interface CardProps {
  position: number;
  card: CardType;
  scrollYProgress: MotionValue;
}

const Card = ({ position, card, scrollYProgress }: CardProps) => {
  const scaleFromPct = (position - 1) / whyJoinUs.length;
  const y = useTransform(scrollYProgress, [scaleFromPct, 1], [0, 0]);
  const _t:Translations= useTranslation();

  return (
    <motion.div
      style={{
        y: position === whyJoinUs.length ? undefined : y,
      }}
      className={cn(
        "sticky top-0 h-auto flex flex-col items-center justify-center w-full origin-top px-4 py-24 sm:py-32 md:py-36 text-center",
        card.className
      )}
    >
      <InViewContainer amount={0.2} className="flex flex-col items-center justify-center h-auto">
        {card.tagContent && (
          <MTag
            variants={fadeIn({ direction: "up", duration: 1, value: 25, ease: "easeInOut" })}
            containerClassName="gap-1 py-2 pl-2 pr-3 mb-4"
          >
            <Image src="/assets/icons/whyJoinUs.svg" alt="tag" width={16} height={16} />

            <span className="text-sm font-medium text-white">{_t[card.tagContent]||card.tagContent}</span>
            
          </MTag>
        )}
        <motion.h3
          variants={fadeIn({ direction: "up", delay: 0.25, duration: 1, value: 25, ease: "easeInOut" })}
          className="max-w-[915px] mx-auto  text-[32px] sm:text-5xl md:text-[64px] leading-[115%] font-bold mb-8"
        >
          {_t[card.title]||card.title}
        </motion.h3>
        <motion.p
          variants={fadeIn({ direction: "up", delay: 0.5, duration: 1, value: 25, ease: "easeInOut" })}
          className="section-description max-w-2xl mx-auto"
        >
          {_t[card.description]||card.description}
        </motion.p>
        {card.button && (
          <MButton
            variants={fadeIn({ direction: "up", delay: 0.75, duration: 1, value: 25, type: "tween" })}
            buttonContainerClassName="mt-8"
            text={_t[card.button.text]||card.button.text}
            iconImage={card.button.iconImage}
            href={card.button.href}
          />
        )}
      </InViewContainer>
    </motion.div>
  );
};

export default WhyJoinUs;