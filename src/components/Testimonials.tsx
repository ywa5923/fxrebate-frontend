'use client'

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

import { testimonials } from '@/lib/content';
import { generateRandomId } from '@/lib/utils';
import { fadeIn, opacityAnimation } from '@/lib/motions';
import { Marquee } from './ui/Marquee';

import InViewContainer from './InViewContainer';

const Testimonials = () => {
  const { resolvedTheme } = useTheme();
  const { title, items } = testimonials;
  const [clonedTestimonials, setClonedTestimonials] = useState<typeof items>([]);

  useEffect(() => {
    const clonedTestimonialsContent = Array.from(items);

    clonedTestimonialsContent.forEach((item) => {
      const duplicatedItem = { ...item, id: generateRandomId() };
      clonedTestimonialsContent.push(duplicatedItem);
    });

    setClonedTestimonials(clonedTestimonialsContent);
  }, [resolvedTheme]);

  return (
    <InViewContainer amount={0.1} className="custom-container my-36">
      <motion.h3
        variants={fadeIn({ direction: "up", delay: 0.25, duration: 1, value: 25, ease: "easeInOut" })}
        className="max-w-[920px] mx-auto section-title leading-[115%]"
      >
        {title}
      </motion.h3>
      <motion.div
        variants={opacityAnimation({ delay: 0.5, duration: 1.25 })}
        className="mt-24 w-full antialiased overflow-hidden"
      >
        <Marquee
          maskImage
          pauseOnHover
          className="gap-4"
          itemClassName="gap-4"
          style={{ "--duration": "70s" }}
        >
          {clonedTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="min-w-[428px] w-[428px] h-full py-8 px-6 backdrop-blur-lg rounded-xlg border bg-white-200 border-white-400 dark:bg-dark-green-100 dark:border-[#232F2B]"
            >
              <div className="flex flex-col justify-between h-full gap-[18px]">
                <p className="h-full text-sm dark:text-white text-black">{testimonial.quote}</p>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-4">
                    <Image
                      src={testimonial.userImage}
                      alt={testimonial.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex flex-col gap-1.5">
                      <h4 className="dark:text-white/50 text-black/50 text-xs font-medium capitalize">
                        {testimonial.name}
                      </h4>
                      <div className='flex items-center gap-1'>
                        <Image
                          src='/assets/icons/stars.png'
                          alt='stars'
                          className='w-18 h-auto object-cover'
                          width={72}
                          height={15}
                        />
                        <p className='dark:text-white/50 text-black/50 text-xs font-medium capitalize underline'>
                          {testimonial.rating}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="dark:text-white/50 text-black/50 text-xs font-medium capitalize">
                    {testimonial.date}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Marquee>
      </motion.div>
    </InViewContainer>
  )
}

export default Testimonials