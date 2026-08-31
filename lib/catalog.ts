export type Product = {
  slug: string;
  name: string;
  price: string;
  category: string;
  tone: "brown" | "green" | "ivory" | "black";
  description: string;
  details: string[];
};

export const products: Product[] = [
  { slug: "aurelia", name: "The Aurelia", price: "₦—", category: "Shoulder Bags", tone: "brown", description: "A softly structured leather silhouette designed for effortless everyday carry.", details: ["Leather exterior", "Lined interior", "Interior pocket", "Hand-finished hardware"] },
  { slug: "zorah-tote", name: "The Zorah Tote", price: "₦—", category: "Tote Bags", tone: "green", description: "A generous carry-all with a calm, architectural profile.", details: ["Full-grain leather", "Fits daily essentials", "Long shoulder handles", "Structured base"] },
  { slug: "mini-edit", name: "The Mini Edit", price: "₦—", category: "Mini Bags", tone: "ivory", description: "A compact statement piece for the essentials you never leave behind.", details: ["Compact interior", "Adjustable strap", "Polished hardware", "Leather lining"] },
  { slug: "the-classic", name: "The Classic", price: "₦—", category: "Crossbody Bags", tone: "black", description: "A timeless crossbody built around clean lines and daily versatility.", details: ["Crossbody strap", "Secure closure", "Organised interior", "Tactile leather"] },
];

export const collections = [
  { slug: "everyday", name: "Everyday", description: "Quietly versatile silhouettes for work, weekends and everywhere between." },
  { slug: "statement", name: "Statement", description: "Distinctive shapes made to become the centre of the look." },
  { slug: "mini", name: "Mini", description: "Small proportions, considered details and just enough room for what matters." },
  { slug: "custom", name: "Custom", description: "A considered route to a Zorah piece shaped around your preferences." },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
