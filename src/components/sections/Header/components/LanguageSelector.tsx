'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Flag } from '@/components/Flag'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/NavigationMenu"

import { SITE_LANGUAGES } from '@/constants'
import type { LanguageItem } from '@/lib/types'

interface ILanguageSelector {
  selectedLanguage: LanguageItem;
  setSelectedLanguage: (language: LanguageItem) => void;
}

export const LanguageSelector = ({ selectedLanguage, setSelectedLanguage }: ILanguageSelector) => {

  const [openMenu, setOpenMenu] = useState('');
  return (
    <NavigationMenu value={openMenu} onValueChange={setOpenMenu} viewportContainerClassName='top-14 lg:right-0'>
      <NavigationMenuList>
        <NavigationMenuItem value="languages" className="h-5">
          <NavigationMenuTrigger className="h-auto" aria-label={`Language: ${selectedLanguage.name}`}>
            <div className='cursor-pointer flex items-center gap-2'>
              <span aria-hidden="true"><Flag country={selectedLanguage.countryCode} className="rounded-sm text-lg" /></span>
              <span className='w-6 text-center text-sm text-black dark:text-white'>{selectedLanguage.code.toUpperCase()}</span>
            </div>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="w-64 max-w-[calc(100vw-2rem)] space-y-1 bg-white-500 p-2 dark:bg-dark-gray-100">
              {SITE_LANGUAGES.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-pressed={selectedLanguage.code === item.code}
                    onClick={() => {
                      setSelectedLanguage(item);
                      setOpenMenu('');
                    }}
                    className="flex w-full min-w-0 cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <span aria-hidden="true"><Flag country={item.countryCode} className="rounded-sm text-lg" /></span>
                    <span className='min-w-0 flex-1 break-words text-sm font-medium text-black dark:text-white'>{item.name}</span>
                    <span className="text-xs text-muted-foreground">{item.code.toUpperCase()}</span>
                    <Check className={`h-4 w-4 shrink-0 text-accent ${selectedLanguage.code === item.code ? '' : 'invisible'}`} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
