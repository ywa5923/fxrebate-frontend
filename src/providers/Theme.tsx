'use client'

import { ThemeProvider } from 'next-themes'

// next-themes renders an inline <script> to set the theme before hydration
// (prevents dark-mode flicker). React 19 warns about script tags inside
// components, but the script runs fine during SSR — the warning is a false
// positive, so we silence just that message in development.
// See https://github.com/pacocoursey/next-themes/issues/385
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Encountered a script tag')
    )
      return
    originalError.apply(console, args)
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme='system' enableSystem>
      {children}
    </ThemeProvider>
  )
}