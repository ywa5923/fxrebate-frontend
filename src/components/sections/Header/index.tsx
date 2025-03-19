'use client'

import { useState } from 'react'
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
import { LanguageItem } from '@/lib/types'
import { languageItems } from '@/lib/content'

const Header = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageItem>(languageItems[0]);

  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const mounted = useMounted()

  const { scrollY } = useScroll();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    document.body.style.overflow = isOpen ? "" : "hidden";
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

            <LanguageSelector selectedLanguage={selectedLanguage} setSelectedLanguage={setSelectedLanguage} />
          </div>

          <BurgerButton isOpen={isOpen} toggleMenu={toggleMenu} />
        </div>

        <CustomDesktopMenuBar visible={visible} />

        <MobileNav isOpen={isOpen} selectedLanguage={selectedLanguage} setSelectedLanguage={setSelectedLanguage} toggleMenu={toggleMenu} />
      </motion.div>
    </AnimatePresence>
  )
}

export default Header