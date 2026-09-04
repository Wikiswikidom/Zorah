"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type CmsSection = {
  id?: string;
  section_key: string;
  section_type: string;
  eyebrow?: string | null;
  title?: string | null;
  body?: string | null;
  primary_cta_label?: string | null;
  primary_cta_href?: string | null;
  secondary_cta_label?: string | null;
  secondary_cta_href?: string | null;
  media_path?: string | null;
  media_url?: string | null;
  theme?: string | null;
  is_enabled?: boolean;
};

type HeroSlide = {
  key: string;
  title: string;
  tone: "green" | "tan" | "ink";
  eyebrow: string;
  body: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  media?: string;
};

const fallbackHero: HeroSlide[] = [
  { key: "hero-01", title: "Carry your point of view.", tone: "green", eyebrow: "ZORAH HANDBAGS · LAGOS", body: "Leather handbags made in Lagos, designed for the life you actually live.", primaryLabel: "Shop handbags", primaryHref: "/shop", secondaryLabel: "Explore", secondaryHref: "#collections" },
  { key: "hero-02", title: "Beautiful bags, made for you.", tone: "tan", eyebrow: "THE ZORAH EDIT", body: "Thoughtful shapes, considered materials and a finish made to be carried often.", primaryLabel: "Shop the edit", primaryHref: "/shop", secondaryLabel: "Our story", secondaryHref: "/our-story" },
  { key: "hero-03", title: "Made to move with you.", tone: "ink", eyebrow: "CRAFTED IN LAGOS", body: "A strong everyday bag should look good, work hard and last.", primaryLabel: "View collection", primaryHref: "/shop", secondaryLabel: "The craft", secondaryHref: "#craft" },
];

function toneFor(value?: string | null): HeroSlide["tone"] {
  const v = (value ?? "").toLowerCase();
  if (v === "leather" || v === "brown" || v === "tan") return "tan";
  if (v === "dark" || v === "black") return "ink";
  return "green";
}

function CmsMedia({ src, alt, className }: { src?: string | null; alt: string; className?: string }) {
  return src ? <img src={src} alt={alt} className={className ?? ""} /> : null;
}

export function EditorialMotion({ sections = [], logoUrl }: { sections?: CmsSection[]; logoUrl?: string | null }) {
  const enabled = useMemo(() => sections.filter((s) => s.is_enabled !== false), [sections]);
  const byKey = (key: string) => enabled.find((s) => s.section_key === key);
  const heroSlides = useMemo<HeroSlide[]>(() => {
    const cmsHeroes = enabled.filter((s) => s.section_type === "hero" && s.section_key !== "site-logo").slice(0, 5);
    if (!cmsHeroes.length) return fallbackHero;
    return cmsHeroes.map((s, index) => {
      const fallback = fallbackHero[index % fallbackHero.length];
      return {
        key: s.section_key,
        title: s.title?.trim() || fallback.title,
        tone: toneFor(s.theme),
        eyebrow: s.eyebrow?.trim() || fallback.eyebrow,
        body: s.body?.trim() || fallback.body,
        primaryLabel: s.primary_cta_label?.trim() || fallback.primaryLabel,
        primaryHref: s.primary_cta_href || fallback.primaryHref,
        secondaryLabel: s.secondary_cta_label?.trim() || fallback.secondaryLabel,
        secondaryHref: s.secondary_cta_href || fallback.secondaryHref,
        media: s.media_url || s.media_path || undefined,
      };
    });
  }, [enabled]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % heroSlides.length), 5000);
    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".zorah-reveal", { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: "power3.out" });
      gsap.utils.toArray<HTMLElement>(".zorah-scroll-reveal").forEach((el) => gsap.fromTo(el, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } }));
    });
    return () => ctx.revert();
  }, []);

  const activeHero = heroSlides[active] ?? heroSlides[0];
  const craft = byKey("craft");
  const editorial = byKey("editorial");
  const editorialA = byKey("editorial-a");
  const editorialB = byKey("editorial-b");
  const journalA = byKey("journal-01");
  const journalB = byKey("journal-02");
  const cta = byKey("cta");
  const collectionSections = enabled.filter((s) => ["collections", "product_rail"].includes(s.section_type)).slice(0, 8);

  return <div className="zorah-site">
    <header className="zorah-header"><div className="zorah-header-inner"><nav className="zorah-nav"><a href="/shop">Shop</a><a href="/collections">Collections</a><a href="#craft">Craft</a></nav><a href="/" className="zorah-logo" aria-label="Zorah Handbags"><img src={logoUrl || "/brand/zorah-logo.webp"} alt="Zorah Handbags" /></a><nav className="zorah-nav zorah-nav-right"><a href="/account">Account</a><a className="zorah-shop-link" href="/cart">Bag <span>→</span></a></nav></div></header>
    <main>
      <section className="zorah-hero" aria-labelledby="zorah-title"><div className="zorah-hero-image" aria-hidden="true">{heroSlides.map((slide,index)=><div key={slide.key} className={`hero-slide hero-slide-${slide.tone} ${index===active?"is-active":""}`}>{slide.media?<CmsMedia src={slide.media} alt="" className="hero-cms-image"/>:null}</div>)}</div><div className="zorah-hero-overlay"/><div className="zorah-hero-inner"><div className="zorah-hero-copy"><p className="zorah-eyebrow zorah-reveal">{activeHero.eyebrow}</p><h1 id="zorah-title" className="zorah-display zorah-reveal">{activeHero.title}</h1><p className="zorah-lede zorah-reveal">{activeHero.body}</p><div className="zorah-actions zorah-reveal"><a className="zorah-btn zorah-btn-dark" href={activeHero.primaryHref}>{activeHero.primaryLabel}<span>→</span></a>{activeHero.secondaryLabel&&<a className="zorah-link" href={activeHero.secondaryHref}>{activeHero.secondaryLabel}</a>}</div></div><div className="hero-slide-controls zorah-reveal"><div className="hero-slide-count"><strong>0{active+1}</strong><span>/ 0{heroSlides.length}</span></div><div className="hero-dots">{heroSlides.map((slide,index)=><button key={slide.key} className={index===active?"is-active":""} onClick={()=>setActive(index)} aria-label={`Show slide ${index+1}`}><span/></button>)}</div></div></div></section>
      <section id="collections" className="zorah-collection-strip"><div className="collection-head"><h2 className="zorah-display zorah-scroll-reveal">The pieces<br/><em>people notice.</em></h2><a className="zorah-underlink zorah-scroll-reveal" href="/shop">Shop all bags <span>→</span></a></div><div className="collection-rail" role="list">{(collectionSections.length?collectionSections:heroSlides).map((item: CmsSection|HeroSlide,index)=>{const isCms="section_key" in item;const title=isCms?item.title||`Collection ${index+1}`:item.title;const media=isCms?item.media_url||item.media_path:item.media;const href=isCms?item.primary_cta_href||"/shop":item.primaryHref;return <a className="collection-card zorah-scroll-reveal" href={href} role="listitem" key={isCms?item.section_key:item.key}><div className={`collection-image collection-image-${isCms?toneFor(item.theme):item.tone}`}>{media?<CmsMedia src={media} alt={title} className="cms-fill-image"/>:null}</div><div className="collection-card-copy"><strong>{title}</strong><span>{isCms?item.body||"Explore the collection":"Zorah handbags"}</span></div></a>})}</div></section>
      <section id="craft" className="zorah-story-grid"><div className="story-image zorah-image-drift">{craft?.media_url||craft?.media_path?<CmsMedia src={craft.media_url||craft.media_path} alt="Zorah craftsmanship in Lagos" className="story-cms-image"/>:null}</div><div className="story-copy"><p className="zorah-eyebrow zorah-scroll-reveal">{craft?.eyebrow||"The making"}</p><h2 className="zorah-display zorah-scroll-reveal">{craft?.title||"Made in Lagos."}</h2><p className="zorah-body zorah-scroll-reveal">{craft?.body||"Cut, assembled and finished with an eye for the details you feel before you notice them."}</p>{craft?.primary_cta_label&&<a className="zorah-underlink zorah-scroll-reveal" href={craft.primary_cta_href||"/our-story"}>{craft.primary_cta_label}<span>→</span></a>}</div></section>
      {(editorialA||editorialB||editorial)&&<section className="zorah-editorial-band"><div className="editorial-copy"><p className="zorah-eyebrow">{editorial?.eyebrow||"The Zorah woman"}</p><h2 className="zorah-display">{editorial?.title||"One bag. Many lives."}</h2><p className="zorah-body">{editorial?.body||"Designed to move between the moments that make up your day."}</p></div>{[editorialA,editorialB].map((item,index)=><div key={item?.section_key||index} className={`editorial-photo editorial-photo-${index===0?"a":"b"} zorah-image-drift`}>{item?.media_url||item?.media_path?<CmsMedia src={item.media_url||item.media_path} alt="Zorah handbag editorial" className="cms-fill-image"/>:null}</div>)}</section>}
      {(journalA||journalB)&&<section id="journal" className="zorah-journal"><div className="zorah-section-meta"><span>Journal</span><a href="/journal">View journal ↗</a></div><div className="journal-grid">{[journalA,journalB].filter(Boolean).map(item=><a className="journal-feature zorah-scroll-reveal" href={item?.primary_cta_href||"/journal"} key={item!.section_key}><div className="journal-image journal-image-green">{item?.media_url||item?.media_path?<CmsMedia src={item.media_url||item.media_path} alt={item.title||"Zorah journal"} className="cms-fill-image"/>:null}</div><div><small>JOURNAL</small><h3>{item?.title||"The Zorah journal."}</h3><p className="zorah-body">{item?.body||"Stories from the house."}</p></div></a>)}</div></section>}
      <section className="zorah-cta-section"><p className="zorah-eyebrow">{cta?.eyebrow||"Zorah"}</p><h2 className="zorah-display">{cta?.title||"Find the one that feels like you."}</h2><p className="zorah-body">{cta?.body||"Explore the collection and choose a bag made for your everyday."}</p><div className="zorah-actions"><a className="zorah-btn zorah-btn-light" href={cta?.primary_cta_href||"/shop"}>{cta?.primary_cta_label||"Shop handbags"}<span>→</span></a></div></section>
    </main>
    <footer className="zorah-footer"><img src={logoUrl||"/brand/zorah-logo.webp"} alt="Zorah Handbags"/><div><span>Lagos · Nigeria</span><a href="/account">Account</a><a href="/our-story">Our story</a><a href="/journal">Journal</a><a href="/cart">Bag</a></div><small>© {new Date().getFullYear()} Zorah Handbags</small></footer>
  </div>;
}
