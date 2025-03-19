'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'
import { IoIosArrowForward } from 'react-icons/io'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { navItems } from '@/lib/content'
import { useMounted, useWindowSize } from '@/lib/hooks'
import {Translations, useTranslation} from "@/providers/translations";


interface ICustomDesktopMenuBar {
  visible: boolean;
}

export const CustomDesktopMenuBar = ({ visible }: ICustomDesktopMenuBar) => {
  const _t:Translations = useTranslation();
  const { resolvedTheme } = useTheme();
  const { width } = useWindowSize();
  const mounted = useMounted();

  const [openedMenu, setOpenedMenu] = useState<string | number | null>(null);
  const [openedSubMenu, setOpenedSubMenu] = useState<string | number | null>(null);

  const submenuRefs = useRef<Record<number | string, HTMLDivElement | null>>({});
  const [submenuPositions, setSubMenuPositions] = useState<Record<number | string, string>>({});
  const [isSubMenuRepositioned, setIsSubMenuRepositioned] = useState<Record<string | number, boolean>>({});


  const handleOpenMenu = (menuId: string | number) => {
    setOpenedMenu(menuId);
    document.addEventListener('mousedown', handleClickOutside);
  }

  const handleCloseMenu = () => {
    setOpenedMenu(null);
    document.removeEventListener('mousedown', handleClickOutside);
  }

  const handleOpenSubMenu = (subMenuId: string | number) => {
    setOpenedSubMenu(subMenuId);
    document.addEventListener('mousedown', handleClickOutside);
  }

  const handleCloseSubMenu = () => {
    setOpenedSubMenu(null);
    document.removeEventListener('mousedown', handleClickOutside);
  }

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest(`[data-menu-id="${openedMenu}"]`) && !target.closest(`[data-menu-item]`) && !target.closest(`[data-menu-button]`)) {
      setOpenedMenu(null);
      document.removeEventListener('mousedown', handleClickOutside);
    }
  };

  useEffect(() => {
    setOpenedMenu(null);
    setOpenedSubMenu(null);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible]);


  const adjustSubMenuPosition = (subMenuId: string | number) => {
    const submenu = submenuRefs.current[subMenuId];
    if (submenu) {
      const rect = submenu.getBoundingClientRect();

      if (isSubMenuRepositioned[subMenuId]) {
        if (width && width - rect.right > 400) {
          setSubMenuPositions((prev) => ({
            ...prev,
            [subMenuId]: '',
          }));
        }
      }

      if (width && rect.right + 20 > width) {
        setSubMenuPositions((prev) => ({
          ...prev,
          [subMenuId]: `-${rect.width}px`,
        }));

        setIsSubMenuRepositioned((prev) => ({
          ...prev,
          [subMenuId]: true,
        }));
      }
    }
  };

  useEffect(() => {
    if (openedSubMenu !== null) {
      adjustSubMenuPosition(openedSubMenu);
    }

    const handleResize = () => {
      if (openedSubMenu !== null) {
        adjustSubMenuPosition(openedSubMenu);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [openedSubMenu, width]);


  if (!mounted) return null;

  return (
    <div className="hidden lg:flex items-center justify-start gap-3 bg-white-300 dark:bg-white/5 backdrop-blur-xs rounded-xl p-3.75 mt-5">
      {navItems.map((item) => (
        <div key={item.id}>
          {(item.lightIcon || item.darkIcon) ? (
            <Link href={item.href || '#'} onMouseEnter={() => handleCloseMenu()}>
              <Image
                src={resolvedTheme === "light" ? item.lightIcon! : item.darkIcon!}
                alt={item.name}
                className='object-cover hover:scale-110 hover:-rotate-4 transition-all duration-300'
                width={25}
                height={25}
              />
            </Link>
          ) : item.href ? (
            <Link href={item.href || '#'} onMouseEnter={() => handleCloseMenu()}>
              <span className='block hover:text-white hover:bg-green-700 px-2.5 py-1 rounded-sm transition-colors duration-200'>{_t[item.name] || item.name}</span>
            </Link>
          ) : (
            <div className='relative'>
              <button
                onMouseEnter={() => handleOpenMenu(item.id)}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  'hover:text-white hover:bg-green-700 px-2.5 py-1 rounded-sm transition-colors duration-200',
                  openedMenu === item.id ? "bg-green-700 text-white" : ""
                )}
                data-menu-button
              >
                {_t[item.name] || item.name}
              </button>
              {openedMenu === item.id && item.subItems && (
                <motion.div
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0.5 }}
                  transition={{ duration: 0.25, type: "tween", ease: "easeInOut" }}
                  className='hidden lg:block absolute top-14 z-50 w-max min-w-[12rem] rounded-md bg-white-500 dark:bg-dark-gray-100 p-2.5'
                  onClick={(e) => e.stopPropagation()}
                  data-menu-item
                >
                  {item.subItems.map((subItem) => (
                    <div key={subItem.id}>
                      {subItem.linksList ? (
                        <div className='relative' onMouseLeave={handleCloseSubMenu}>
                          <button
                            className={cn(
                              "w-full flex items-center rounded-sm py-1.5 text-sm outline-none px-2.5 hover:bg-green-700",
                              openedSubMenu === subItem.id ? "bg-green-700 text-white" : ""
                            )}
                            onMouseEnter={() => handleOpenSubMenu(subItem.id)}
                            onClick={() => handleOpenSubMenu(subItem.id)}
                          >
                            {_t[subItem.name] || subItem.name}
                            <IoIosArrowForward className='ml-auto h-4 w-4' />
                          </button>
                          {openedSubMenu === subItem.id && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              transition={{ duration: 0.25, delay: 0.05, type: "tween", ease: "easeInOut" }}
                              style={{ left: submenuPositions[subItem.id] || '' }}
                              ref={el => { submenuRefs.current[subItem.id] = el }}
                              className='absolute top-0 left-full z-50 w-full min-w-[13rem] rounded-md bg-white-500 dark:bg-dark-gray-100 p-4'
                            >
                              <p className="font-bold text-base text-black dark:text-white pb-2 whitespace-nowrap">{_t[subItem.name] || subItem.name}</p>
                              <div className="flex flex-col">
                                {subItem.linksList.map((link) => (
                                  <Link
                                    key={link.id}
                                    href={link.href || '#'}
                                    target={link.external ? '_blank' : '_self'}
                                    rel={link.external ? 'noopener noreferrer' : ''}
                                    className='text-sm font-medium dark:text-white/80 hover:text-white hover:bg-green-700 rounded-sm px-2.5 py-1.5'
                                  >
                                    {_t[link.name] || link.name}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      ) : subItem.itemsList ? (
                        <div className='relative' onMouseLeave={handleCloseSubMenu}>
                          <button
                            className={cn(
                              "w-full flex items-center rounded-sm py-1.5 text-sm outline-none px-2.5 hover:bg-green-700",
                              openedSubMenu === subItem.id ? "bg-green-700 text-white" : ""
                            )}
                            onMouseEnter={() => handleOpenSubMenu(subItem.id)}
                          >
                            {_t[subItem.name] || subItem.name}
                            <IoIosArrowForward className='ml-auto h-4 w-4' />
                          </button>
                          {openedSubMenu === subItem.id && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              transition={{ duration: 0.2, delay: 0.05, type: "tween", ease: "easeInOut" }}
                              className='absolute pl-4 pr-2.5 py-4 left-full top-0 mb-3 grid grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1.5 xl:gap-4 w-max bg-white-500 dark:bg-dark-gray-100 max-h-[550px] overflow-y-auto'
                            >
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
                                      <span className='text-black dark:text-white text-sm font-medium capitalize'>{_t[item.brokerName] || item.brokerName}</span>
                                    </Link>
                                  </li>
                                </ul>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={subItem.href || '#'}
                          target={subItem.external ? '_blank' : '_self'}
                          rel={subItem.external ? 'noopener noreferrer' : ''}
                          className='w-full flex items-center rounded-sm py-1.5 text-sm outline-none px-2.5 hover:bg-green-700 hover:text-white'
                        >
                          {_t[subItem.name] || subItem.name}
                        </Link>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
