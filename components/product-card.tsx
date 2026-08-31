type ProductCardProps = {
  name: string;
  price: string;
  tone: "ivory" | "brown" | "green" | "black";
};

const tones = {
  ivory: "#e6ded2",
  brown: "#6b4632",
  green: "#23483b",
  black: "#242424",
};

export function ProductCard({ name, price, tone }: ProductCardProps) {
  return (
    <article className="product-card">
      <a href="#product" aria-label={`View ${name}`}>
        <div className="product-media">
          <div className="product-placeholder" style={{ background: `linear-gradient(145deg, ${tones[tone]}, #f7f3ec22)` }} aria-hidden="true">Z</div>
        </div>
        <div className="product-info">
          <p className="product-name">{name}</p>
          <p className="product-price">{price}</p>
        </div>
      </a>
    </article>
  );
}
