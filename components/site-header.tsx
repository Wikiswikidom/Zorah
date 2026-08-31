"use client";

import { useState } from "react";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const links = [["Shop", "/shop"], ["Collections", "/collections"], ["Custom", "/custom-orders"], ["Our Story", "/our-story"], ["Journal", "/journal"]];

  return <>
    <div className="announcement">Complimentary delivery on selected Zorah pieces · Crafted in Lagos</div>
    <header className="header">
      <nav className="nav" aria-label="Primary navigation">
        <button className="mobile-toggle" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}><span aria-hidden="true">☰</span></button>
        <div className="nav-links">{links.map(([label, href]) => <a className="nav-link" href={href} key={label}>{label}</a>)}</div>
        <a className="wordmark" href="/" aria-label="Zorah home"><img src="/brand/zorah-wordmark.svg" alt="Zorah" width="126" height="30" style={{ display: "block", width: 126, height: "auto" }} /></a>
        <div className="nav-actions"><a className="nav-link hide-mobile" href="/search">Search</a><a className="nav-link hide-mobile" href="/wishlist">Wishlist</a><a className="nav-link" href="/cart">Bag (0)</a></div>
      </nav>
      {open && <div className="mobile-menu"><div>{[...links, ["Search", "/search"], ["Wishlist", "/wishlist"], ["Bag", "/cart"]].map(([label, href]) => <a key={label} href={href} onClick={() => setOpen(false)}>{label}</a>)}</div></div>}
    </header>
  </>;
}
