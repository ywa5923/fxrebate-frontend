'use client'

import { useState } from 'react';
import { Actions } from './Actions';
import { Check } from 'lucide-react';
import { Flag } from '@/components/Flag';

import { cn } from '@/lib/utils';
import type { LanguageItem } from '@/lib/types';
import { SITE_LANGUAGES } from '@/constants';

import { MobileMenuBar } from './MobileMenuBar';
import { BurgerButton } from './BurgerButton';
import { Logo } from '@/components/ui/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import type { BrokerShortList } from './useBrokerShortList';

interface IMobileNav {
  brokerList: BrokerShortList;
  isOpen: boolean;
  selectedLanguage: LanguageItem;
  setSelectedLanguage: (language: LanguageItem) => void;
  toggleMenu: () => void;
}

export const MobileNav = ({ isOpen, selectedLanguage, setSelectedLanguage, toggleMenu, brokerList }: IMobileNav) => {
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

          <MobileMenuBar key={String(isOpen)} onNavigate={toggleMenu} brokerList={brokerList} />

          <Actions />

          <div className='relative max-w-[380px] w-full flex items-center justify-between mx-auto mt-7 px-6'>
            <ThemeToggle />

            <div className='flex items-center gap-2'>
              <button
                type="button"
                aria-label={`Language: ${selectedLanguage.name}`}
                aria-expanded={isLanguageSelectorOpen}
                onClick={() => setIsLanguageSelectorOpen(!isLanguageSelectorOpen)}
                className='cursor-pointer flex items-center gap-2'
              >
                <span aria-hidden="true"><Flag country={selectedLanguage.countryCode} className="rounded-sm text-lg" /></span>
                <span className='w-6 text-center text-sm text-black dark:text-white'>{selectedLanguage.code.toUpperCase()}</span>
              </button>
            </div>
          </div>

          {isLanguageSelectorOpen && (
            <div className="px-6 mt-4">
              <div className="w-full rounded-lg border border-white-400 bg-white-600 p-2 dark:border-dark-green-200 dark:bg-dark-brown-100">
                <ul className="grid w-full max-h-[300px] gap-1 overflow-y-auto sm:grid-cols-2">
                  {SITE_LANGUAGES.map((item) => (
                    <li key={item.id} className="min-w-0">
                      <button
                        type="button"
                        aria-pressed={selectedLanguage.code === item.code}
                        className="flex w-full min-w-0 cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                        onClick={() => {
                          setSelectedLanguage(item);
                          setIsLanguageSelectorOpen(false);
                        }}
                      >
                        <span aria-hidden="true"><Flag country={item.countryCode} className="rounded-sm text-lg" /></span>
                        <span className='min-w-0 flex-1 break-words text-sm font-medium text-black dark:text-white'>{item.name}</span>
                        <span className="text-xs text-muted-foreground">{item.code.toUpperCase()}</span>
                        <Check className={`h-4 w-4 shrink-0 text-accent ${selectedLanguage.code === item.code ? '' : 'invisible'}`} aria-hidden="true" />
                      </button>
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
