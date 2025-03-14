'use client'

import { useMemo } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

import { fadeIn, opacityAnimation } from '@/lib/motions';
import { ImageSlider } from '@/lib/types';
import { generateRandomId } from '@/lib/utils';
import { useMounted } from '@/lib/hooks';

import Link from 'next/link';
import InViewContainer from "./InViewContainer";
import { Marquee } from './ui/Marquee';

interface InfiniteImageScrollProps {
  images: ImageSlider[];
  sectionTitle?: string;
}

const InfiniteImageScroll = ({ images, sectionTitle }: InfiniteImageScrollProps) => {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted()

  const clonedImages = useMemo(() => {
    const clonedImagesContent = [...images];

    images.forEach((item) => {
      const duplicatedItem = {
        ...item,
        id: generateRandomId()
      };
      clonedImagesContent.push(duplicatedItem);
    });

    return clonedImagesContent;
  }, [images]);

  if (!mounted) return null;

  return (
    <InViewContainer amount={0.1} className="custom-container">
      {sectionTitle && (
        <motion.h3
          variants={fadeIn({ direction: "up", delay: 0.25, duration: 1, value: 25, ease: "easeInOut" })}
          className="dark:text-white text-black text-center capitalize text-2xl leading-6 font-bold"
        >
          {sectionTitle}
        </motion.h3>
      )}
      <motion.div
        variants={opacityAnimation({ delay: 0.5, duration: 1.25 })}
        className="flex antialiased items-center justify-center overflow-hidden mt-8"
      >
        <Marquee
          maskImage
          pauseOnHover
          className="items-center gap-8 sm:gap-22"
          itemClassName="gap-8 sm:gap-22"
          style={{ "--duration": "20s" }}
        >
          {clonedImages.map((image) => (
            <Link key={image.id} href={image.href} className="flex items-center justify-center">
              <Image
                src={image.darkIcon && resolvedTheme === 'dark' ? image.darkIcon : image.lightIcon}
                alt={image.name}
                width={100}
                height={150}
                className="w-auto h-auto max-h-[38px] sm:max-h-[60px] cursor-pointer"
              />
            </Link>
          ))}
        </Marquee>
      </motion.div>
    </InViewContainer>
  )
}

export default InfiniteImageScroll