"use client";

import { useState } from "react";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="announcement">Complimentary delivery on selected Zorah pieces · Crafted in Lagos</div>
      <header className="header">
        <nav className="nav" aria-label="Primary navigation">
          <button className="mobile-toggle" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
            <span aria-hidden="true">☰</span>
          </button>
          <div className="nav-links">
            <a className="nav-link" href="#shop">Shop</a>
            <a className="nav-link" href="#collections">Collections</a>
            <a className="nav-link" href="#custom">Custom</a>
            <a className="nav-link" href="#story">Our Story</a>
            <a className="nav-link" href="#journal">Journal</a>
          </div>
          <a className="wordmark" href="#top" aria-label="Zorah home">
            <img src="/brand/zorah-wordmark.svg" alt="Zorah" width="126" height="30" style={{ display: "block", width: 126, height: "auto" }} />
          </a>
          <div className="nav-actions">
            <a className="nav-link hide-mobile" href="#search">Search</a>
            <a className="nav-link hide-mobile" href="#wishlist">Wishlist</a>
            <a className="nav-link" href="#bag">Bag (0)</a>
          </div>
        </nav>
        {open && (
          <div style={{ borderTop: "1px solid var(--line)", padding: "22px 18px 30px", background: "var(--ivory)" }}>
            <div style={{ display: "grid", gap: 16, fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase" }}>
              {["Shop", "Collections", "Custom Orders", "Our Story", "Journal", "Search", "Wishlist", "Bag"].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replaceAll(" ", "-")}`} onClick={() => setOpen(false)}>{item}</a>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
