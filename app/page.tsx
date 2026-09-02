import { LandingThemeToggle } from "@/components/landing/theme-toggle";
import { ThreeBagStory } from "@/components/landing/three-bag-story";

export default function Home() {
  return (
    <main className="landing-page" id="top">
      <header className="landing-header">
        <nav className="landing-nav" aria-label="Zorah landing navigation">
          <div className="landing-nav-left">
            <a href="#story">The house</a>
            <a href="#craft">Craft</a>
          </div>
          <a href="/" aria-label="Zorah home"><img className="landing-logo" src="/brand/zorah-wordmark.svg" alt="Zorah" /></a>
          <div className="landing-nav-right">
            <a href="/login">Sign in</a>
            <a className="landing-pill" href="/shop">Enter shop <span aria-hidden="true">↗</span></a>
            <LandingThemeToggle />
          </div>
        </nav>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-inner">
          <div className="landing-hero-copy">
            <span className="landing-kicker">The Zorah house · Lagos · 2026</span>
            <h1 id="landing-title">Carry <em>your</em> story.</h1>
            <p className="landing-hero-lede">Zorah makes contemporary leather handbags with a Lagos point of view—quiet in attitude, considered in every detail, and designed for the rhythm of real life.</p>
            <div className="landing-actions">
              <a className="landing-button landing-button--solid" href="/shop">Enter the collection</a>
              <a className="landing-button" href="#story">Discover Zorah</a>
            </div>
          </div>
          <div className="landing-hero-art" aria-hidden="true" />
        </div>
        <div className="landing-scroll-cue"><span /> Scroll to enter the story</div>
      </section>

      <ThreeBagStory />

      <section id="story" className="landing-editorial">
        <div className="landing-editorial-inner">
          <p className="landing-overline">The house</p>
          <h2 className="landing-editorial-title">Not made to shout.<br /><em>Made to stay.</em></h2>
          <div className="landing-editorial-grid">
            <p className="landing-editorial-copy">Zorah sits at the meeting point of craft and contemporary life. We make leather handbags that feel beautiful in the hand, useful in the day, and unmistakably themselves. Every silhouette begins with how it will be carried—not simply how it will be photographed.</p>
            <div className="landing-stat-list" aria-label="Zorah principles">
              <div className="landing-stat"><span>Point of view</span><strong>Lagos</strong></div>
              <div className="landing-stat"><span>Approach</span><strong>Considered</strong></div>
              <div className="landing-stat"><span>Material</span><strong>Leather</strong></div>
              <div className="landing-stat"><span>Purpose</span><strong>Every day</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section id="craft" className="landing-green">
        <div className="landing-green-grid">
          <div><p className="landing-kicker">The hand behind the bag</p><h2>Craft is the quiet part you feel.</h2></div>
          <div className="landing-green-copy">
            <p><strong>We design around use.</strong> The weight of a handle. The opening of a zip. The pocket you reach for without thinking. The way leather changes with time.</p>
            <p>That is why the details matter. Zorah brings structure, proportion and tactile material together so the finished piece feels effortless—not overworked.</p>
            <div className="landing-chip-row"><span className="landing-chip">Leather</span><span className="landing-chip">Hand finished</span><span className="landing-chip">Lagos</span><span className="landing-chip">Built to live with</span></div>
          </div>
        </div>
      </section>

      <section className="landing-editorial" aria-labelledby="journey-title">
        <div className="landing-editorial-inner">
          <p className="landing-overline">A slower way to shop</p>
          <h2 id="journey-title" className="landing-editorial-title">Meet the bag.<br /><em>Then make it yours.</em></h2>
          <div className="landing-editorial-grid">
            <p className="landing-editorial-copy">The story ends where shopping begins. Explore the collection by silhouette, discover the details inside each piece, save what you love, and move into a focused checkout when you are ready.</p>
            <div className="landing-actions"><a className="landing-button landing-button--solid" style={{ background: "#111", color: "#f7f3ec", borderColor: "#111" }} href="/shop">Shop Zorah</a><a className="landing-button" style={{ color: "#111", borderColor: "#111" }} href="/login">Sign in / create account</a></div>
          </div>
        </div>
      </section>

      <section className="landing-final">
        <div className="landing-final-content">
          <p className="landing-overline">Zorah · Lagos</p>
          <h2>The next chapter is yours to carry.</h2>
          <p>Enter the Zorah shop for the current collection, campaigns, collections and product experience.</p>
          <div className="landing-actions" style={{ justifyContent: "center" }}><a className="landing-button landing-button--solid" href="/shop">Enter the shop →</a><a className="landing-button" href="/our-story">Our story</a></div>
        </div>
      </section>

      <footer className="landing-footer"><span>© {new Date().getFullYear()} Zorah</span><span>Lagos · Nigeria</span><span><a href="/login">Sign in</a> · <a href="/shop">Shop</a></span></footer>
    </main>
  );
}
