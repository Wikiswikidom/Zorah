"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function EditorialMotion() {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (reduce) return;
      gsap.fromTo(".fashion-reveal", { y: 42, opacity: 0 }, { y: 0, opacity: 1, duration: 1.05, stagger: 0.1, ease: "power3.out" });
      gsap.to(".fashion-hero-mark", { yPercent: -14, rotate: -2, ease: "none", scrollTrigger: { trigger: ".fashion-hero", start: "top top", end: "bottom top", scrub: 1 } });
      gsap.to(".fashion-hero-card", { yPercent: 10, rotate: 1.5, ease: "none", scrollTrigger: { trigger: ".fashion-hero", start: "top top", end: "bottom top", scrub: 1.2 } });
      gsap.to(".fashion-hero-slice", { yPercent: -22, ease: "none", scrollTrigger: { trigger: ".fashion-hero", start: "top top", end: "bottom top", scrub: 1.4 } });
      gsap.utils.toArray<HTMLElement>(".fashion-story-media").forEach((media) => {
        gsap.fromTo(media, { y: 30, scale: 1.035 }, { y: -20, scale: 1, ease: "none", scrollTrigger: { trigger: media, start: "top bottom", end: "bottom top", scrub: 1 } });
      });
      gsap.utils.toArray<HTMLElement>(".fashion-reveal-on-scroll").forEach((item) => {
        gsap.fromTo(item, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: item, start: "top 84%", once: true } });
      });
      gsap.utils.toArray<HTMLElement>(".fashion-line").forEach((line) => {
        gsap.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "power3.out", transformOrigin: "left", scrollTrigger: { trigger: line, start: "top 86%", once: true } });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="fashion-landing">
      <header className="fashion-header">
        <div className="fashion-header-inner">
          <a href="#story" className="fashion-header-link">The house</a>
          <a href="#craft" className="fashion-header-link">Craft</a>
          <a href="/" className="fashion-header-logo" aria-label="Zorah home"><img src="/brand/zorah-logo.webp" alt="Zorah Handbags" /></a>
          <a href="/login" className="fashion-header-link">Account</a>
          <a href="/shop" className="fashion-header-shop">Shop <span>↗</span></a>
        </div>
      </header>

      <main>
        <section className="fashion-hero" aria-labelledby="hero-title">
          <div className="fashion-hero-grid" aria-hidden="true">
            <div className="fashion-hero-card fashion-hero-card--brown"><span>ZORAH</span><b>01</b></div>
            <div className="fashion-hero-card fashion-hero-card--green"><span>HANDCRAFTED</span><b>02</b></div>
            <div className="fashion-hero-slice"><span>LAGOS</span></div>
          </div>
          <div className="fashion-hero-copy">
            <p className="fashion-kicker fashion-reveal">ZORAH HANDBAGS · LAGOS</p>
            <h1 id="hero-title" className="fashion-title fashion-reveal">Made for<br /><em>your moment.</em></h1>
            <p className="fashion-hero-lede fashion-reveal">Leather handbags with presence, proportion and a point of view. Designed in Lagos for the way life moves now.</p>
            <div className="fashion-hero-actions fashion-reveal"><a className="fashion-button fashion-button--dark" href="/shop">Discover Zorah <span>→</span></a><a className="fashion-text-link" href="#story">Our story</a></div>
          </div>
          <div className="fashion-hero-mark" aria-hidden="true">Z</div>
          <div className="fashion-hero-foot"><span>Scroll to explore</span><span className="fashion-scroll-line" /></div>
        </section>

        <section id="story" className="fashion-intro">
          <div className="fashion-intro-top fashion-reveal-on-scroll"><span>01 — The house</span><span>Lagos, Nigeria</span></div>
          <div className="fashion-intro-grid">
            <h2 className="fashion-display fashion-reveal-on-scroll">A new expression<br /><em>of leather.</em></h2>
            <div className="fashion-intro-copy fashion-reveal-on-scroll"><p>Zorah is a Lagos handbag house built around the belief that everyday pieces can still feel extraordinary.</p><p>We balance rich leather, considered hardware and clean silhouettes to create bags that become part of your rhythm—not just part of an outfit.</p><a href="/our-story" className="fashion-underlined">Read our story <span>↗</span></a></div>
          </div>
        </section>

        <section className="fashion-campaign">
          <div className="fashion-campaign-media fashion-story-media">
            <div className="campaign-bag-shape" aria-hidden="true"><i /><b /><span /></div>
            <div className="campaign-label"><span>THE SIGNATURE</span><strong>Deep green / gold</strong></div>
          </div>
          <div className="fashion-campaign-copy">
            <p className="fashion-kicker fashion-reveal-on-scroll">02 — The signature</p>
            <h2 className="fashion-display fashion-reveal-on-scroll">Colour that<br /><em>speaks softly.</em></h2>
            <p className="fashion-body fashion-reveal-on-scroll">Deep Zorah green. Warm leather. Muted gold. A palette drawn from the materials, streets and evenings that shape Lagos.</p>
            <a href="/shop" className="fashion-underlined fashion-reveal-on-scroll">Explore the collection <span>→</span></a>
          </div>
        </section>

        <section id="craft" className="fashion-craft">
          <div className="fashion-craft-head fashion-reveal-on-scroll"><p className="fashion-kicker">03 — The making</p><h2 className="fashion-display">The details are<br /><em>the design.</em></h2></div>
          <div className="fashion-craft-grid">
            <article className="craft-item fashion-reveal-on-scroll"><span>01</span><h3>Material</h3><p>Leather selected for texture, character and the way it ages with you.</p></article>
            <article className="craft-item fashion-reveal-on-scroll"><span>02</span><h3>Hardware</h3><p>Quiet metallic details that catch light without taking over the silhouette.</p></article>
            <article className="craft-item fashion-reveal-on-scroll"><span>03</span><h3>Function</h3><p>Openings, handles and interiors designed around how a bag is actually carried.</p></article>
          </div>
          <div className="fashion-line" />
        </section>

        <section className="fashion-editorial">
          <div className="fashion-editorial-image fashion-story-media"><div className="editorial-frame"><span>ZORAH</span><strong>Crafted<br />to be<br />carried.</strong><small>Lagos · 2026</small></div></div>
          <div className="fashion-editorial-copy">
            <p className="fashion-kicker fashion-reveal-on-scroll">04 — In Lagos</p>
            <h2 className="fashion-display fashion-reveal-on-scroll">Rooted here.<br /><em>Ready anywhere.</em></h2>
            <p className="fashion-body fashion-reveal-on-scroll">Our point of view begins in Lagos—its colour, pace, architecture and creative energy. The result is a modern Nigerian handbag brand with an unmistakable sense of place.</p>
            <a href="/our-story" className="fashion-underlined fashion-reveal-on-scroll">Meet the house <span>↗</span></a>
          </div>
        </section>

        <section className="fashion-final">
          <div className="fashion-final-inner">
            <p className="fashion-kicker fashion-reveal-on-scroll">05 — Your collection</p>
            <h2 className="fashion-display fashion-reveal-on-scroll">Carry something<br /><em>worth remembering.</em></h2>
            <div className="fashion-final-actions fashion-reveal-on-scroll"><a className="fashion-button fashion-button--light" href="/shop">Enter the shop <span>→</span></a><a className="fashion-text-link fashion-text-link--light" href="/login">Sign in / create account</a></div>
          </div>
        </section>
      </main>

      <footer className="fashion-footer"><div><img src="/brand/zorah-logo.webp" alt="Zorah Handbags" /></div><div><span>Lagos · Nigeria</span><a href="/shop">Shop</a><a href="/login">Account</a><a href="/our-story">Our story</a></div><small>© {new Date().getFullYear()} Zorah Handbags</small></footer>
    </div>
  );
}
