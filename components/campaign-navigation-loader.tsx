"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

function isInternalNavigation(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute("href")
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false
  if (anchor.target && anchor.target !== "_self") return false
  if (anchor.hasAttribute("download")) return false
  const url = new URL(anchor.href, window.location.href)
  return url.origin === window.location.origin && url.pathname + url.search !== window.location.pathname + window.location.search
}

export default function CampaignNavigationLoader() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(false)
  }, [pathname])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest("a")
      if (anchor instanceof HTMLAnchorElement && isInternalNavigation(anchor)) setLoading(true)
    }

    document.addEventListener("click", handleClick, true)
    return () => document.removeEventListener("click", handleClick, true)
  }, [])

  if (!loading) return null

  return (
    <div className="zorah-navigation-loader" role="status" aria-live="polite" aria-label="Loading page">
      <span className="zorah-navigation-spinner" aria-hidden="true" />
    </div>
  )
}
