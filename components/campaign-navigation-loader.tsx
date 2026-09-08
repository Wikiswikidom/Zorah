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

  useEffect(() => setLoading(false), [pathname])

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
      <style jsx>{`
        .zorah-navigation-loader { position: fixed; inset: 0; z-index: 10000; display: grid; place-items: center; pointer-events: none; background: rgba(247,243,236,.42); backdrop-filter: blur(3px); }
        .zorah-navigation-spinner { width: 30px; height: 30px; border: 2px solid rgba(23,61,50,.22); border-top-color: #173d32; border-radius: 50%; animation: zorah-navigation-spin .7s linear infinite; box-shadow: 0 4px 18px rgba(17,17,17,.12); }
        @keyframes zorah-navigation-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
