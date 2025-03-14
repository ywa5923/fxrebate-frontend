'use client'

import Image from 'next/image';
import { useState } from 'react';
import { Actions } from './Actions';
import { FaCheck } from 'react-icons/fa6';

import { cn } from '@/lib/utils';
import { LanguageItem } from '@/lib/types';
import { languageItems } from '@/lib/content';

import { MobileMenuBar } from './MobileMenuBar';
import { BurgerButton } from './BurgerButton';
import { Logo } from '@/components/ui/Logo';
import ThemeToggle from '@/components/ThemeToggle';

interface IMobileNav {
  isOpen: boolean;
  selectedLanguage: LanguageItem;
  setSelectedLanguage: (language: LanguageItem) => void;
  toggleMenu: () => void;
}

export const MobileNav = ({ isOpen, selectedLanguage, setSelectedLanguage, toggleMenu }: IMobileNav) => {
  const [isLanguageSelectorOpen, setIsLanguageSelectorOpen] = useState(false);

  return (
    <div className={cn("relative mb-10 h-screen bg-white-300 dark:bg-black", isOpen ? "block" : "hidden")}>
      <div className="overflow-hidden h-full">
        <div className="overflow-y-auto overflow-x-hidden w-full h-full absolute left-1/2 -translate-x-1/2 flex-col justify-center items-center bg-white-300 dark:bg-black pb-[100px]">
          <div className="sticky top-0 z-50 bg-white-300 dark:bg-black">
            <div className='flex items-center justify-between w-full pt-6'>
              <Logo />

              <BurgerButton isOpen={isOpen} toggleMenu={toggleMenu} />
            </div>
          </div>

          <MobileMenuBar />

          <Actions />

          <div className='relative max-w-[380px] w-full flex items-center justify-between mx-auto mt-7 px-6'>
            <ThemeToggle />

            <div className='flex items-center gap-2'>
              <button onClick={() => setIsLanguageSelectorOpen(!isLanguageSelectorOpen)} className='cursor-pointer flex items-center gap-2'>
                <Image
                  src={selectedLanguage.flagIcon!}
                  alt={selectedLanguage.name!}
                  width={25}
                  height={25}
                  className='object-cover'
                />
                <span className='text-black dark:text-white text-sm'>{selectedLanguage.code}</span>
              </button>
            </div>
          </div>

          {isLanguageSelectorOpen && (
            <div className="px-6 mt-4">
              <div className="w-full flex items-center justify-center dark:bg-dark-brown-100 bg-white-600 p-3 border border-white-400 dark:border-dark-green-200 rounded-xl">
                <ul className="w-full max-h-[300px] overflow-y-auto grid xxs:grid-cols-2 sm:grid-cols-3 items-center xxs:justify-center gap-3">
                  {languageItems.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-3 transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5 rounded-md p-2">
                      <button className="cursor-pointer flex items-center gap-2" onClick={() => setSelectedLanguage(item)}>
                        <Image
                          src={item.flagIcon!}
                          alt={item.name!}
                          width={25}
                          height={25}
                          className='object-cover'
                        />
                        <span className='text-black dark:text-white text-base text-left font-medium'>{item.name}</span>
                      </button>
                      {selectedLanguage.id === item.id && <FaCheck className='text-accent' />}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
