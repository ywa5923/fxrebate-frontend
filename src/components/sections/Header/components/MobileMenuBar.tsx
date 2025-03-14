import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useTheme } from 'next-themes'
import { IoIosArrowDown } from 'react-icons/io'

import { navItems } from '@/lib/content'
import { useMounted } from '@/lib/hooks'
import { cn } from '@/lib/utils'

export const MobileMenuBar = () => {
  const [selectedSubMenu, setSelectedSubMenu] = useState<number | string | null>(null);
  const [selectedSubItem, setSelectedSubItem] = useState<number | string | null>(null);

  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  const handleSubMenuClick = (id: number | string) => {
    setSelectedSubMenu(prevId => (prevId === id ? null : id));
    setSelectedSubItem(null);
  };

  const handleSubItemClick = (id: number | string) => {
    setSelectedSubItem(prevId => (prevId === id ? null : id));
  };

  if (!mounted) return null;

  return (
    <div className='w-full flex flex-col items-center gap-6 sm:gap-8 mt-12'>
      {navItems.map((item) => (
        <div key={item.id} className='w-full flex flex-col items-center justify-center'>
          {(item.lightIcon || item.darkIcon) ? (
            <Link href={item.href || '#'}>
              <Image
                src={resolvedTheme === "light" ? item.lightIcon! : item.darkIcon!}
                alt={item.name!}
                className='object-cover'
                width={25}
                height={25}
              />
            </Link>
          ) : item.href ? (
            <Link
              href={item.href || '#'}
              target={item.external ? '_blank' : '_self'}
              rel={item.external ? 'noopener noreferrer' : ''}
              className='text-black dark:text-white text-base font-medium'
            >
              {item.name}
            </Link>
          ) : (
            <button onClick={() => handleSubMenuClick(item.id)} className='flex items-center gap-2 text-black dark:text-white text-base font-medium'>
              {item.name}
              <IoIosArrowDown className={cn('text-lg transition-all duration-300', selectedSubMenu === item.id && 'rotate-180')} />
            </button>
          )}

          {selectedSubMenu === item.id && item.subItems && (
            <div className='w-full flex flex-col items-center justify-center gap-4 dark:bg-dark-brown-100 bg-white py-8 mt-6'>
              {item.subItems.map((subItem) => (
                <div key={subItem.id} className="w-full flex flex-col items-center justify-center">
                  {subItem.linksList ? (
                    <div className='w-full flex flex-col items-center justify-center'>
                      <button onClick={() => handleSubItemClick(subItem.id)} className='outline-none flex items-center gap-2 text-black/80 dark:text-white/80 text-base font-medium'>
                        {subItem.name}
                        <IoIosArrowDown className={cn('text-lg transition-all duration-300', selectedSubItem === subItem.id && 'rotate-180')} />
                      </button>

                      {selectedSubItem === subItem.id && (
                        <div className="w-full flex flex-col items-center justify-center gap-3 mt-2 bg-white-400 dark:bg-white/5 py-5">
                          {subItem.linksList.map((link) => (
                            <Link
                              key={link.id}
                              href={link.href || '#'}
                              target={link.external ? '_blank' : '_self'}
                              rel={link.external ? 'noopener noreferrer' : ''}
                              className='text-black/80 dark:text-white/80 text-base font-medium'
                            >
                              {link.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : subItem.itemsList ? (
                    <div className='relative w-full flex flex-col items-center justify-center'>
                      <button onClick={() => handleSubItemClick(subItem.id)} className='outline-none flex items-center gap-2 text-black/80 dark:text-white/80 text-base font-medium'>
                        {subItem.name}
                        <IoIosArrowDown className={cn('text-lg transition-all duration-300', selectedSubItem === subItem.id && 'rotate-180')} />
                      </button>

                      {selectedSubItem === subItem.id && (
                        <div className="absolute top-10 w-[90%] max-h-[300px] overflow-y-auto grid xxs:grid-cols-2 sm:grid-cols-3 items-center xxs:justify-center gap-3 dark:bg-dark-brown-100 bg-white-600 px-3 py-5 border border-white-400 dark:border-dark-green-200 rounded-xl">
                          {subItem.itemsList.map((item) => (
                            <li key={item.id} className="flex items-center justify-between gap-3 transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5 rounded-md p-2">
                              <Link href={item.href || '#'} target='_blank' className="cursor-pointer flex items-center gap-2">
                                <Image
                                  src={item.brokerLogo}
                                  alt={item.brokerName}
                                  className='object-cover w-8 h-8 rounded-full'
                                  width={32}
                                  height={32}
                                />
                                <span className='text-black/80 dark:text-white/80 text-sm font-medium capitalize'>{item.brokerName}</span>
                              </Link>
                            </li>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={subItem.href || '#'}
                      target={subItem.external ? '_blank' : '_self'}
                      rel={subItem.external ? 'noopener noreferrer' : ''}
                      className='text-black/80 dark:text-white/80 text-base font-medium'
                    >
                      {subItem.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
