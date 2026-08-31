type PromoSlotProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  cta?: string;
};

export function PromoSlot({ eyebrow = "Zorah edit", title, description, href = "#shop", cta = "Shop now" }: PromoSlotProps) {
  return (
    <section className="promo" aria-label="Promotional campaign">
      <div className="promo-inner">
        <div>
          <p className="promo-meta">{eyebrow}</p>
          <h2 className="promo-title">{title}</h2>
          {description && <p className="promo-meta" style={{ marginTop: 6 }}>{description}</p>}
        </div>
        <a className="button" href={href}>{cta} →</a>
      </div>
    </section>
  );
}
