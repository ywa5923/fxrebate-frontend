'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useMounted } from '@/lib/hooks'

export const Logo = () => {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) return null;

  return (
    <Link href="/" className="pl-6 lg:pl-0 relative z-50">
      {resolvedTheme === "light" ? (
        <Image src="/assets/darkFxRebate-logo.svg" alt="logo" className='max-w-40 sm:max-w-fit object-cover' width={200} height={40} loading='lazy' />
      ) : (
        <Image src="/assets/lightFxRebate-logo.svg" alt="logo" className='max-w-40 sm:max-w-fit object-cover' width={200} height={40} loading='lazy' />
      )}
    </Link>
  )
}
