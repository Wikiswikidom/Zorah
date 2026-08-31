import { SiteHeader } from "@/components/site-header";
import { ProductCard } from "@/components/product-card";
import { PromoSlot } from "@/components/promo-slot";

const products = [
  { name: "The Aurelia", price: "₦—", tone: "brown" as const },
  { name: "The Zorah Tote", price: "₦—", tone: "green" as const },
  { name: "The Mini Edit", price: "₦—", tone: "ivory" as const },
  { name: "The Classic", price: "₦—", tone: "black" as const },
];

export default function Home() {
  return <main id="top" className="site-shell">
    <SiteHeader />
    <section className="hero" aria-labelledby="hero-title"><div className="hero-art" aria-hidden="true" /><div className="hero-content"><p className="eyebrow">The Zorah house · Lagos</p><h1 id="hero-title">Crafted to be carried.</h1><p className="hero-copy">Contemporary leather handbags shaped with intention, made for the rhythm of everyday life.</p><a className="button" href="/shop">Shop the collection →</a></div></section>
    <PromoSlot eyebrow="The Zorah edit" title="A considered sale, never a noisy one." description="Campaigns, private offers and new drops can be managed from the Zorah admin workspace." cta="Explore" />
    <section id="shop" className="section" aria-labelledby="shop-title"><div className="section-head"><h2 id="shop-title" className="section-title">The signature edit</h2><p className="section-note">A focused selection of leather pieces designed around form, function and quiet confidence.</p></div><div className="product-grid">{products.map((product) => <ProductCard key={product.name} {...product} />)}</div><div style={{ marginTop: 30 }}><a className="text-link" href="/shop">View all handbags →</a></div></section>
    <section id="story" className="craft" aria-labelledby="craft-title"><div className="craft-grid"><div className="craft-visual" role="img" aria-label="Editorial placeholder for Zorah leather craftsmanship photography" /><div className="craft-copy"><p className="eyebrow">The hand behind the bag</p><h2 id="craft-title" className="section-title">Made with patience.</h2><p>Zorah treats the handbag as an object to live with: considered proportions, tactile leather, useful interiors and details that reward a closer look.</p><a className="button" href="/our-story">Discover our story →</a></div></div></section>
    <section id="collections" className="section"><div className="section-head"><h2 className="section-title">Designed for the day.</h2><p className="section-note">From compact silhouettes to carry-everything shapes, discover pieces built around how you actually move.</p></div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>{["Everyday", "Statement", "Custom"].map((name, index) => <a key={name} href={name === "Custom" ? "/custom-orders" : "/collections"} style={{ minHeight: 320, padding: 24, display: "flex", alignItems: "flex-end", background: ["#e5ddd1", "#5a3524", "#173d32"][index], color: index === 0 ? "#111" : "#f7f3ec" }}><span style={{ fontFamily: "var(--font-display), Georgia, serif", fontSize: 42 }}>{name} →</span></a>)}</div></section>
    <section id="custom" className="section" style={{ background: "var(--white)" }}><div className="section-head"><h2 className="section-title">Create your Zorah.</h2><p className="section-note">A future custom-order experience will let customers request silhouette, leather, colour, hardware and finishing details.</p></div><a className="button button-dark" href="/custom-orders">Start a custom request →</a></section>
    <footer className="footer"><div className="footer-grid"><div><h2 className="footer-title">ZORAH<span className="wordmark-dot" /></h2><p>Contemporary leather handbags, crafted with intention.</p></div><div><p className="footer-label">Shop</p><div className="footer-links"><a href="/shop">All handbags</a><a href="/collections">Collections</a><a href="/custom-orders">Custom orders</a></div></div><div><p className="footer-label">House</p><div className="footer-links"><a href="/our-story">Our story</a><a href="/journal">Journal</a><a href="/help">Care & help</a></div></div><div><p className="footer-label">Help</p><div className="footer-links"><a href="/help">Delivery & returns</a><a href="/search">Search</a><a href="/cart">Bag</a></div></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Zorah</span><span>Lagos · Nigeria</span></div></footer>
  </main>;
}
