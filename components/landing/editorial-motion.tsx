"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function EditorialMotion() {
  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".zorah-reveal", { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: "power3.out" });
      gsap.utils.toArray<HTMLElement>(".zorah-scroll-reveal").forEach((el) => {
        gsap.fromTo(el, { y: 55, opacity: 0 }, { y: 0, opacity: 1, duration: 0.95, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 84%", once: true } });
      });
      gsap.utils.toArray<HTMLElement>(".zorah-parallax").forEach((el) => {
        gsap.to(el, { yPercent: -10, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1.2 } });
      });
      gsap.to(".hero-orbit-a", { yPercent: -18, rotate: 5, ease: "none", scrollTrigger: { trigger: ".zorah-hero", start: "top top", end: "bottom top", scrub: 1 } });
      gsap.to(".hero-orbit-b", { yPercent: 12, rotate: -4, ease: "none", scrollTrigger: { trigger: ".zorah-hero", start: "top top", end: "bottom top", scrub: 1.2 } });
      gsap.utils.toArray<HTMLElement>(".zorah-line").forEach((el) => gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 1, transformOrigin: "left", ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } }));
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="zorah-site">
      <header className="zorah-header">
        <div className="zorah-header-inner">
          <nav className="zorah-nav"><a href="#house">House</a><a href="#craft">Craft</a><a href="#journal">Journal</a></nav>
          <a href="/" className="zorah-logo" aria-label="Zorah Handbags"><img src="/brand/zorah-logo.webp" alt="Zorah Handbags" /></a>
          <nav className="zorah-nav zorah-nav-right"><a href="/login">Account</a><a className="zorah-shop-link" href="/shop">Shop <span>↗</span></a></nav>
        </div>
      </header>

      <main>
        <section className="zorah-hero" aria-labelledby="zorah-title">
          <div className="hero-orbit hero-orbit-a" aria-hidden="true"><span>HANDCRAFTED</span><i /></div>
          <div className="hero-orbit hero-orbit-b" aria-hidden="true"><span>LAGOS · NIGERIA</span><i /></div>
          <div className="zorah-hero-watermark" aria-hidden="true">Z</div>
          <div className="zorah-hero-inner">
            <div className="zorah-hero-copy">
              <p className="zorah-eyebrow zorah-reveal">ZORAH HANDBAGS · LAGOS</p>
              <h1 id="zorah-title" className="zorah-display zorah-reveal">Designed to be<br /><em>remembered.</em></h1>
              <p className="zorah-lede zorah-reveal">A contemporary handbag house shaped in Lagos. Rich leather, expressive colour and details made for the rhythm of real life.</p>
              <div className="zorah-actions zorah-reveal"><a className="zorah-btn zorah-btn-dark" href="/shop">Discover the collection <span>→</span></a><a className="zorah-link" href="#house">The house</a></div>
            </div>
            <div className="zorah-hero-art" aria-hidden="true">
              <div className="hero-panel hero-panel-green"><span>01</span><strong>ZORAH</strong><small>Deep green · gold</small><div className="mini-bag mini-bag-green"><b /><i /><em /></div></div>
              <div className="hero-panel hero-panel-tan"><span>02</span><strong>LEATHER</strong><small>Warm tan · hand finished</small><div className="mini-bag mini-bag-tan"><b /><i /><em /></div></div>
            </div>
          </div>
          <div className="zorah-scroll"><span>Scroll to enter</span><i /></div>
        </section>

        <section id="house" className="zorah-house">
          <div className="zorah-section-meta zorah-scroll-reveal"><span>01 — The house</span><span>Lagos, Nigeria</span></div>
          <div className="zorah-house-grid">
            <h2 className="zorah-display zorah-scroll-reveal">The everyday,<br /><em>elevated.</em></h2>
            <div className="zorah-copy zorah-scroll-reveal"><p>Zorah makes handbags for women who want beauty with a reason. Each silhouette balances presence and practicality without losing its sense of occasion.</p><p>Our language is simple: distinctive colour, tactile leather, polished hardware and proportions that feel good in the hand.</p><a className="zorah-underlink" href="/our-story">Discover the Zorah story <span>↗</span></a></div>
          </div>
        </section>

        <section className="zorah-feature">
          <div className="feature-visual zorah-parallax">
            <div className="feature-card"><span>THE SIGNATURE</span><strong>Green<br />with<br /><em>intention.</em></strong><small>Zorah palette / 01</small><div className="feature-bag"><b /><i /><em /></div></div>
          </div>
          <div className="feature-copy"><p className="zorah-eyebrow zorah-scroll-reveal">02 — The signature</p><h2 className="zorah-display zorah-scroll-reveal">Colour has<br /><em>a point of view.</em></h2><p className="zorah-body zorah-scroll-reveal">From deep green to warm leather and controlled gold, our palette is designed to feel considered in daylight and unforgettable at night.</p><a className="zorah-underlink zorah-scroll-reveal" href="/shop">See the collection <span>→</span></a></div>
        </section>

        <section id="craft" className="zorah-craft">
          <div className="zorah-craft-head zorah-scroll-reveal"><p className="zorah-eyebrow">03 — The making</p><h2 className="zorah-display">Made slowly.<br /><em>Worn often.</em></h2></div>
          <div className="craft-steps">
            <article className="craft-step zorah-scroll-reveal"><span>01</span><h3>Leather</h3><p>Selected for grain, touch and the character it gains with time.</p></article>
            <article className="craft-step zorah-scroll-reveal"><span>02</span><h3>Construction</h3><p>Clean lines, strong handles and hardware placed with restraint.</p></article>
            <article className="craft-step zorah-scroll-reveal"><span>03</span><h3>Purpose</h3><p>Beautiful from across the room. Thoughtful when you open it.</p></article>
          </div>
          <div className="zorah-line" />
        </section>

        <section id="journal" className="zorah-lagos">
          <div className="lagos-art zorah-parallax"><div className="lagos-frame"><span>LAGOS / 06°27′N</span><strong>Rooted<br /><em>here.</em></strong><small>Ready anywhere.</small></div></div>
          <div className="lagos-copy"><p className="zorah-eyebrow zorah-scroll-reveal">04 — In Lagos</p><h2 className="zorah-display zorah-scroll-reveal">A local<br /><em>point of view.</em></h2><p className="zorah-body zorah-scroll-reveal">The city gives us our energy: colour, movement, texture and a confidence that refuses to be quiet. Zorah brings that spirit to the modern handbag.</p><a className="zorah-underlink zorah-scroll-reveal" href="/our-story">Meet the house <span>↗</span></a></div>
        </section>

        <section className="zorah-cta-section"><p className="zorah-eyebrow zorah-scroll-reveal">05 — Your collection</p><h2 className="zorah-display zorah-scroll-reveal">Carry the<br /><em>point of view.</em></h2><div className="zorah-actions zorah-scroll-reveal"><a className="zorah-btn zorah-btn-light" href="/shop">Enter the shop <span>→</span></a><a className="zorah-link zorah-link-light" href="/login">Sign in / create account</a></div></section>
      </main>

      <footer className="zorah-footer"><img src="/brand/zorah-logo.webp" alt="Zorah Handbags" /><div><span>Lagos · Nigeria</span><a href="/shop">Shop</a><a href="/login">Account</a><a href="/our-story">Our story</a></div><small>© {new Date().getFullYear()} Zorah Handbags</small></footer>
    </div>
  );
}
