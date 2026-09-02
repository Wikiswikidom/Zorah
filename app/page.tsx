import { LandingThemeToggle } from "@/components/landing/theme-toggle";
import { ThreeBagStory } from "@/components/landing/three-bag-story";

export default function Home() {
  return (
    <main className="landing-page" id="top">
      <header className="landing-header">
        <nav className="landing-nav" aria-label="Zorah landing navigation">
          <div className="landing-nav-left">
            <a href="#house">The house</a>
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

      <ThreeBagStory />

      <section id="house" className="landing-editorial">
        <div className="landing-editorial-inner">
          <p className="landing-overline">The Zorah house</p>
          <h2 className="landing-editorial-title">A Lagos point of view.<br /><em>A quieter kind of luxury.</em></h2>
          <div className="landing-editorial-grid">
            <p className="landing-editorial-copy">Zorah sits at the meeting point of craft and contemporary life. We make leather handbags that feel beautiful in the hand, useful in the day, and unmistakably themselves. Every silhouette begins with how it will be carried—not simply how it will be photographed.</p>
            <div className="landing-stat-list" aria-label="Zorah principles">
              <div className="landing-stat"><span>Origin</span><strong>Lagos</strong></div>
              <div className="landing-stat"><span>Material</span><strong>Leather</strong></div>
              <div className="landing-stat"><span>Approach</span><strong>Considered</strong></div>
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

      <section className="landing-editorial landing-editorial--split" aria-labelledby="promise-title">
        <div className="landing-editorial-inner">
          <p className="landing-overline">The promise</p>
          <div className="landing-promise-grid">
            <h2 id="promise-title" className="landing-editorial-title">Less noise.<br /><em>More object.</em></h2>
            <div className="landing-editorial-copy">
              <p>Good design does not need to explain itself loudly. It earns attention through proportion, touch, movement and the small decisions that make a piece feel right.</p>
              <p>Zorah is built around that idea: contemporary bags with enough character to be remembered and enough restraint to be lived with.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-final">
        <div className="landing-final-content">
          <p className="landing-overline">Zorah · Lagos</p>
          <h2>The story ends where your collection begins.</h2>
          <p>When you are ready, leave the house and enter the shop for products, collections, campaigns and the complete buying experience.</p>
          <div className="landing-actions" style={{ justifyContent: "center" }}><a className="landing-button landing-button--solid" href="/shop">Enter the shop →</a><a className="landing-button" href="/login">Sign in / create account</a></div>
        </div>
      </section>

      <footer className="landing-footer"><span>© {new Date().getFullYear()} Zorah</span><span>Lagos · Nigeria</span><span><a href="/login">Sign in</a> · <a href="/shop">Shop</a></span></footer>
    </main>
  );
}
