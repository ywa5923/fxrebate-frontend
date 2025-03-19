"use client"

import { motion } from 'framer-motion';
import { BentoGrid, BentoCard } from './ui/BentoGrid';
import { whyUs } from '@/lib/content';
import { fadeIn, opacityAnimation } from '@/lib/motions';

import InViewContainer from './InViewContainer';
import { Translations, useTranslation } from '@/providers/translations';

const WhyUs = () => {
  const { title, description, features } = whyUs;
  const _t:Translations=useTranslation();

  return (
    <InViewContainer amount={0.1}>
      <div className='custom-container pt-20'>
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center text-center">
          <motion.h2
            variants={fadeIn({ direction: "up", delay: 0.25, duration: 1, value: 25, ease: "easeInOut" })}
            className='section-title mb-8'
          >
            {_t[title]||title}
          </motion.h2>
          <motion.p
            variants={fadeIn({ direction: "up", delay: 0.5, duration: 1, value: 25, ease: "easeInOut" })}
            className='section-description text-black dark:text-white'
          >
            {_t[description]||description}
          </motion.p>
        </div>
        <motion.div
          variants={opacityAnimation({ delay: 0.5, duration: 1.25 })}
        >
          <BentoGrid className='mt-20'>
            {features.map((feature, idx) => (
              <BentoCard
                key={idx}
                title={_t[feature.title]||feature.title}
                description={_t[feature.description]||feature.description}
                darkBgImage={feature.darkBgImage}
                lightBgImage={feature.lightBgImage}
                containerClassName={(idx === 1 || idx === 2) ? 'md:col-span-2' : ''}
              />
            ))}
          </BentoGrid>
        </motion.div>
      </div>
    </InViewContainer>
  )
}

export default WhyUs