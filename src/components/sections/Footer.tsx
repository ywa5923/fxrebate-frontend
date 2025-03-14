"use client"

import Link from 'next/link'

import { Logo } from '@/components/ui/Logo'
import { footerContent, socialItems } from '@/lib/content'

const Footer = () => {
  const { disclaimer, navItems } = footerContent

  return (
    <footer className="mt-[150px] pb-[120px]">
      <div className='border-t border-b border-black/15 dark:border-white/15 pt-12 lg:pt-[86px] pb-12'>
        <div className="custom-container lg:px-10">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-20">
            {/* Logo and Social Icons */}
            <div>
              <Logo />
              <div className="flex items-center gap-[14px] mt-3.75 ml-1.5">
                {socialItems.map((item) => (
                  <Link key={item.id} href="#" className='w-[24px] h-[24px] flex items-center justify-center'>
                    {item.icon}
                  </Link>
                ))}
              </div>
            </div>

            {/* Nav Items */}
            <ul className='flex flex-wrap items-start gap-x-22 gap-y-12 md:gap-26 xl:gap-[150px]'>
              {navItems.map((item) => (
                <li key={item.title}>
                  <span className="text-black dark:text-white text-lg font-medium">{item.title}</span>

                  <ul className='flex flex-col gap-3 mt-6'>
                    {item.items.map((elm) => (
                      <li key={elm.name}>
                        <Link href={elm.href} className='text-black dark:text-white/70 hover:text-black dark:hover:text-white transition-colors duration-200 text-lg font-normal'>
                          {elm.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div className='bg-white-200 dark:bg-dark-green-100 border border-white-400 dark:border-dark-brown-100 rounded-lg py-[26px] px-[12.5px] md:px-10 mt-12'>
            <p className='text-black dark:text-white text-sm font-medium'>
              <span className='font-bold'>Disclaimer: </span> {disclaimer}
            </p>
          </div>

        </div>
      </div>

      {/* Copyright */}
      <p className='text-black dark:text-white text-base font-normal text-center mt-8'>@ All copy rights are reserved</p>
    </footer>
  )
}

export default Footer