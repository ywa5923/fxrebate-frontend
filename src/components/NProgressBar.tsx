"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import NProgress from "nprogress"

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.1,
})

export default function NProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    NProgress.done()
  }, [pathname, searchParams])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest("a")
      if (!anchor) return

      const href = anchor.getAttribute("href")
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return
      }

      const url = new URL(href, window.location.origin)
      if (url.origin !== window.location.origin) return
      if (url.pathname === pathname && url.search === window.location.search) return

      NProgress.start()
    }

    document.addEventListener("click", handleClick, true)
    return () => document.removeEventListener("click", handleClick, true)
  }, [pathname])

  return (
    <style jsx global>{`
      #nprogress {
        pointer-events: none;
      }
      #nprogress .bar {
        background: #166534;
        position: fixed;
        z-index: 99999;
        top: 0;
        left: 0;
        width: 100%;
        height: 5px;
      }
      .dark #nprogress .bar {
        background: #4ade80;
      }
      #nprogress .peg {
        display: block;
        position: absolute;
        right: 0px;
        width: 100px;
        height: 100%;
        box-shadow: 0 0 10px #166534, 0 0 5px #166534;
        opacity: 1;
        transform: rotate(3deg) translate(0px, -4px);
      }
      .dark #nprogress .peg {
        box-shadow: 0 0 10px #4ade80, 0 0 5px #4ade80;
      }
    `}</style>
  )
}
