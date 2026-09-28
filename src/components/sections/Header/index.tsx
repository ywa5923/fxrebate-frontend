'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'

import { Logo } from '@/components/ui/Logo'
import { Actions } from './components/Actions'
import ThemeToggle from '@/components/ThemeToggle'
import { BurgerButton } from './components/BurgerButton'
import { MobileNav } from './components/MobileNav'
import { LanguageSelector } from './components/LanguageSelector'
import { CustomDesktopMenuBar } from './components/CustomDesktopMenuBar'

import { cn } from '@/lib/utils'
import { useMounted } from '@/lib/hooks'
import type { LanguageItem } from '@/lib/types'
import { SITE_LANGUAGES } from '@/constants'

const Header = () => {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const selectedLanguage = SITE_LANGUAGES.find((language) => language.code === locale) ?? SITE_LANGUAGES[0];

  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const mounted = useMounted()

  const { scrollY } = useScroll();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    document.body.style.overflow = isOpen ? "" : "hidden";
  };

  const selectLanguage = (language: LanguageItem) => {
    setIsOpen(false);
    setVisible(true);
    document.body.style.overflow = "";
    router.push(`/${language.code}`);
  };

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (isOpen) return;

    const previous = scrollY.getPrevious();

    if (latest > previous! && latest > 150) {
      setVisible(false);
    } else {
      setVisible(true);
    }
  });

  if (!mounted) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 1,
          y: visible ? 0 : '-100%',
        }}
        animate={{
          y: visible ? 0 : '-100%',
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 1,
          ease: "easeInOut",
          type: "tween",
        }}
        className={cn('sticky z-[9999] w-full max-w-8xl mx-auto top-6 lg:top-8 lg:px-10', isOpen && "!top-0")}
      >
        <div className={cn("relative flex items-center justify-between gap-8 z-50", isOpen ? "hidden" : "bg-transparent")}>
          <Logo />

          <div className='hidden lg:flex items-center gap-6'>
            <Actions />

            <ThemeToggle />

            <LanguageSelector selectedLanguage={selectedLanguage} setSelectedLanguage={selectLanguage} />
          </div>

          <BurgerButton isOpen={isOpen} toggleMenu={toggleMenu} />
        </div>

        <CustomDesktopMenuBar visible={visible} />

        <MobileNav isOpen={isOpen} selectedLanguage={selectedLanguage} setSelectedLanguage={selectLanguage} toggleMenu={toggleMenu} />
      </motion.div>
    </AnimatePresence>
  )
}

export default Header
