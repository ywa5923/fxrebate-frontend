'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/MenuBar"

import { cn } from '@/lib/utils'
import { navItems } from '@/lib/content'
import { useMounted } from '@/lib/hooks'


interface IDesktopMenuBar {
  visible: boolean;
}

export const DesktopMenuBar = ({ visible }: IDesktopMenuBar) => {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) return null;

  return (
    <Menubar>
      {navItems.map((item) => (
        <MenubarMenu key={item.id}>
          {(item.lightIcon || item.darkIcon) ? (
            <Link href={item.href || '#'}>
              <Image
                src={resolvedTheme === "light" ? item.lightIcon! : item.darkIcon!}
                alt={item.name}
                className='object-cover hover:scale-110 hover:-rotate-4 transition-all duration-300'
                width={25}
                height={25}
              />
            </Link>
          ) : item.href ? (
            <Link href={item.href || '#'}>
              <span className='block text-black dark:text-white text-base font-medium hover:text-white hover:bg-accent px-2.5 py-1 rounded-sm transition-colors duration-200'>{item.name}</span>
            </Link>
          ) : (
            <MenubarTrigger className='hover:text-white hover:bg-accent rounded-sm transition-colors duration-200'>{item.name}</MenubarTrigger>
          )}

          {item.subItems && (
            <MenubarContent className={cn(!visible ? '!hidden' : '')}>
              <p className="font-bold text-base text-black dark:text-white pl-2.5 pb-2">{item.name}</p>
              {item.subItems.map((subItem) => (
                <div key={subItem.id}>
                  {subItem.linksList ? (
                    <MenubarSub>
                      <MenubarSubTrigger>{subItem.name}</MenubarSubTrigger>
                      <MenubarSubContent>
                        <p className="font-bold text-base text-black dark:text-white pb-2">{subItem.name}</p>
                        {subItem.linksList.map((link) => (
                          <MenubarItem className='hover:text-white/80' key={link.id}>
                            <Link
                              href={link.href || '#'}
                              target={link.external ? '_blank' : '_self'}
                              rel={link.external ? 'noopener noreferrer' : ''}
                              className='text-sm font-medium dark:text-white/80'
                            >
                              {link.name}
                            </Link>
                          </MenubarItem>
                        ))}
                      </MenubarSubContent>
                    </MenubarSub>
                  ) : subItem.itemsList ? (
                    <MenubarSub>
                      <MenubarSubTrigger>{subItem.name}</MenubarSubTrigger>
                      <MenubarSubContent className='mb-3 grid grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 xl:gap-5 w-max bg-white-500 dark:bg-dark-gray-100 max-h-[550px] overflow-y-auto'>
                        {subItem.itemsList.map((item) => (
                          <ul key={item.id} className="">
                            <li className="flex items-center justify-between gap-3 transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5 rounded-md p-2">
                              <Link href={item.href || '#'} target='_blank' className="cursor-pointer flex items-center gap-2">
                                <Image
                                  src={item.brokerLogo}
                                  alt={item.brokerName}
                                  className='object-cover w-8 h-8 rounded-full'
                                  width={32}
                                  height={32}
                                />
                                <span className='text-black dark:text-white text-sm font-medium capitalize'>{item.brokerName}</span>
                              </Link>
                            </li>
                          </ul>
                        ))}
                      </MenubarSubContent>
                    </MenubarSub>
                  ) : (
                    <MenubarItem className='hover:text-white/80' key={subItem.id}>
                      <Link
                        href={subItem.href || '#'}
                        target={subItem.external ? '_blank' : '_self'}
                        rel={subItem.external ? 'noopener noreferrer' : ''}
                        className='text-sm font-medium dark:text-white/80'
                      >
                        {subItem.name}
                      </Link>
                    </MenubarItem>
                  )}
                </div>
              ))}
            </MenubarContent>
          )}
        </MenubarMenu>
      ))}
    </Menubar>
  )
}
