'use client'

import Image from "next/image"
import { FaCheck } from 'react-icons/fa6'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/NavigationMenu"

import { languageItems } from '@/lib/content'
import { LanguageItem } from '@/lib/types'
import { use } from "react"
import { useTranslation } from "@/providers/translations"
import { to } from '../../../../../.next/static/chunks/[root of the server]__f265a1._';

interface ILanguageSelector {
  selectedLanguage: LanguageItem;
  setSelectedLanguage: (language: LanguageItem) => void;
}

export const LanguageSelector = ({ selectedLanguage, setSelectedLanguage }: ILanguageSelector) => {

  const _t=useTranslation();
  return (
    <NavigationMenu viewportContainerClassName='top-14 lg:right-0'>
      <NavigationMenuList>
        <NavigationMenuItem className="h-5">
          <NavigationMenuTrigger className="h-auto">
            <div className='cursor-pointer flex items-center gap-2'>
              <Image
                src={selectedLanguage.flagIcon!}
                alt={selectedLanguage.name!}
                className='w-6 h-auto object-cover'
                width={25}
                height={25}
              />
              <span className='text-black dark:text-white text-sm'>{selectedLanguage.code}</span>
            </div>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="bg-white-500 dark:bg-dark-gray-100 grid p-8 grid-cols-3 xl:grid-cols-4 gap-y-2 gap-x-5 xl:gap-y-5 lg:gap-x-20 w-max">
              {_t.locales.map((item) => (
                <li
                  key={item.id}
                  onClick={() => setSelectedLanguage(item)}
                  className="cursor-pointer min-w-[215px] flex items-center justify-between gap-3 transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5 rounded-md p-2"
                >
                  <button className="flex items-center gap-2">
                   
                    <span className='text-black dark:text-white text-base font-medium'>{item.code.toUpperCase()}</span>
                  </button>
                  {selectedLanguage.id === item.id && <FaCheck className='text-accent' />}
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
