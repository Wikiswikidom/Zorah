"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type HeroSlide = { number: string; title: string; tone: "green" | "tan" | "ink"; label: string };

const heroSlides: HeroSlide[] = [
  { number: "01", title: "The Zorah Edit", tone: "green", label: "Deep green / signature" },
  { number: "02", title: "Warm Leather", tone: "tan", label: "Hand-finished / Lagos" },
  { number: "03", title: "Made to Move", tone: "ink", label: "Everyday / elevated" },
];

const wearSlides = [
  { name: "The everyday edit", meta: "Lagos · 01", tone: "green" },
  { name: "After dark", meta: "Lagos · 02", tone: "tan" },
  { name: "Weekend in colour", meta: "Lagos · 03", tone: "rose" },
  { name: "The signature", meta: "Lagos · 04", tone: "ink" },
];

function BagIllustration({ tone = "green", small = false }: { tone?: string; small?: boolean }) {
  return <div className={`fashion-bag fashion-bag-${tone} ${small ? "fashion-bag-small" : ""}`} aria-hidden="true"><span /><b /><i /></div>;
}

export function EditorialMotion() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % heroSlides.length), 5000);
    return () => window.clearInterval(timer);
  }, []);

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".zorah-reveal", { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.07, ease: "power3.out" });
      gsap.utils.toArray<HTMLElement>(".zorah-scroll-reveal").forEach((el) => gsap.fromTo(el, { y: 45, opacity: 0 }, { y: 0, opacity: 1, duration: 0.85, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 86%", once: true } }));
      gsap.utils.toArray<HTMLElement>(".zorah-image-drift").forEach((el) => gsap.to(el, { yPercent: -7, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1.2 } }));
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="zorah-site">
      <header className="zorah-header"><div className="zorah-header-inner">
        <nav className="zorah-nav"><a href="#collections">Collections</a><a href="#craft">Craft</a><a href="#journal">Journal</a></nav>
        <a href="/" className="zorah-logo" aria-label="Zorah Handbags"><img src="/brand/zorah-logo.webp" alt="Zorah Handbags" /></a>
        <nav className="zorah-nav zorah-nav-right"><a href="/login">Account</a><a className="zorah-shop-link" href="/shop">Shop <span>↗</span></a></nav>
      </div></header>

      <main>
        <section className="zorah-hero" aria-labelledby="zorah-title">
          <div className="zorah-hero-image" aria-hidden="true">{heroSlides.map((slide, index) => <div key={slide.number} className={`hero-slide hero-slide-${slide.tone} ${index === active ? "is-active" : ""}`}><div className="hero-slide-placeholder"><span>IMAGE SLOT · HERO CAMPAIGN</span><BagIllustration tone={slide.tone} /><small>{slide.label}</small></div></div>)}</div>
          <div className="zorah-hero-overlay" />
          <div className="zorah-hero-inner">
            <div className="zorah-hero-copy"><p className="zorah-eyebrow zorah-reveal">ZORAH HANDBAGS · LAGOS</p><h1 id="zorah-title" className="zorah-display zorah-reveal">Carry your<br /><em>point of view.</em></h1><p className="zorah-lede zorah-reveal">Leather handbags made in Lagos, designed for the life you actually live.</p><div className="zorah-actions zorah-reveal"><a className="zorah-btn zorah-btn-dark" href="/shop">Shop the collection <span>→</span></a><a className="zorah-link" href="#collections">Explore Zorah</a></div></div>
            <div className="hero-slide-controls zorah-reveal"><div className="hero-slide-count"><strong>0{active + 1}</strong><span>/ 0{heroSlides.length}</span></div><div className="hero-dots">{heroSlides.map((slide, index) => <button key={slide.number} className={index === active ? "is-active" : ""} onClick={() => setActive(index)} aria-label={`Show ${slide.title}`}><span /></button>)}</div></div>
          </div>
          <div className="zorah-scroll"><span>Scroll</span><i /></div>
        </section>

        <section id="collections" className="zorah-collection-strip"><div className="zorah-section-meta zorah-scroll-reveal"><span>01 — The edit</span><span>Swipe to discover</span></div><div className="collection-head"><h2 className="zorah-display zorah-scroll-reveal">The pieces<br /><em>people notice.</em></h2><a className="zorah-underlink zorah-scroll-reveal" href="/shop">View all bags <span>→</span></a></div><div className="collection-rail" role="list">{heroSlides.map((slide, index) => <a className="collection-card zorah-scroll-reveal" href="/shop" role="listitem" key={slide.number}><div className={`collection-image collection-image-${slide.tone}`}><span>0{index + 1}</span><BagIllustration tone={slide.tone} small /></div><div className="collection-card-copy"><strong>{slide.title}</strong><span>{slide.label}</span></div></a>)}</div></section>

        <section className="zorah-wear-section"><div className="zorah-wear-intro"><p className="zorah-eyebrow zorah-scroll-reveal">02 — As seen in Lagos</p><h2 className="zorah-display zorah-scroll-reveal">Worn<br /><em>your way.</em></h2><a className="zorah-underlink zorah-scroll-reveal" href="/shop">Shop the edit <span>↗</span></a></div><div className="wear-rail" role="list">{wearSlides.map((item, index) => <article className="wear-card zorah-scroll-reveal" role="listitem" key={item.name}><div className={`wear-image wear-image-${item.tone}`}><span>IMAGE SLOT</span><BagIllustration tone={item.tone} small /><b>0{index + 1}</b></div><div className="wear-copy"><strong>{item.name}</strong><span>{item.meta}</span></div></article>)}</div></section>

        <section id="craft" className="zorah-story-grid"><div className="story-image zorah-image-drift"><div className="story-image-placeholder"><span>IMAGE SLOT · CRAFT</span><BagIllustration tone="green" /><small>Replace with atelier / maker photography</small></div></div><div className="story-copy"><p className="zorah-eyebrow zorah-scroll-reveal">03 — The making</p><h2 className="zorah-display zorah-scroll-reveal">Made in Lagos.<br /><em>Made to last.</em></h2><p className="zorah-body zorah-scroll-reveal">Cut, assembled and finished with an eye for the details you feel before you notice them.</p><div className="craft-mini-grid zorah-scroll-reveal"><span><b>01</b>Leather</span><span><b>02</b>Form</span><span><b>03</b>Finish</span></div><a className="zorah-underlink zorah-scroll-reveal" href="/our-story">Discover the craft <span>→</span></a></div></section>

        <section className="zorah-editorial-band"><div className="editorial-copy"><p className="zorah-eyebrow zorah-scroll-reveal">04 — The Zorah woman</p><h2 className="zorah-display zorah-scroll-reveal">One bag.<br /><em>Many lives.</em></h2></div><div className="editorial-photo editorial-photo-a zorah-image-drift"><span>IMAGE SLOT</span><BagIllustration tone="tan" /></div><div className="editorial-photo editorial-photo-b zorah-image-drift"><span>IMAGE SLOT</span><BagIllustration tone="rose" /></div></section>

        <section id="journal" className="zorah-journal"><div className="zorah-section-meta zorah-scroll-reveal"><span>05 — Journal</span><a href="/journal">View journal ↗</a></div><div className="journal-grid"><a className="journal-feature zorah-scroll-reveal" href="/journal"><div className="journal-image journal-image-green"><span>IMAGE SLOT · JOURNAL</span><BagIllustration tone="green" /></div><div><small>THE CITY EDIT</small><h3>Inside the rhythm of Lagos.</h3></div></a><a className="journal-feature zorah-scroll-reveal" href="/journal"><div className="journal-image journal-image-tan"><span>IMAGE SLOT · JOURNAL</span><BagIllustration tone="tan" /></div><div><small>THE CRAFT EDIT</small><h3>What makes a Zorah bag feel different.</h3></div></a></div></section>

        <section className="zorah-cta-section"><p className="zorah-eyebrow zorah-scroll-reveal">06 — Your collection</p><h2 className="zorah-display zorah-scroll-reveal">Find the one<br /><em>that feels like you.</em></h2><div className="zorah-actions zorah-scroll-reveal"><a className="zorah-btn zorah-btn-light" href="/shop">Enter the shop <span>→</span></a></div></section>
      </main>
      <footer className="zorah-footer"><img src="/brand/zorah-logo.webp" alt="Zorah Handbags" /><div><span>Lagos · Nigeria</span><a href="/shop">Shop</a><a href="/login">Account</a><a href="/our-story">Our story</a><a href="/journal">Journal</a></div><small>© {new Date().getFullYear()} Zorah Handbags</small></footer>
    </div>
  );
}
