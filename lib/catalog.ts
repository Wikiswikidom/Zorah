export type Product = {
  slug: string; name: string; price: string; priceValue: number; category: string;
  tone: "brown" | "green" | "ivory" | "black"; colors: string[];
  availability: "In stock" | "Made to order"; featuredRank: number;
  description: string; details: string[]; variants: string[]; imageUrl?: string | null;
};
export const products: Product[] = [
  { slug:"aurelia", name:"The Aurelia", price:"₦—", priceValue:0, category:"Shoulder Bags", tone:"brown", colors:["Brown","Black"], availability:"Made to order", featuredRank:1, description:"A softly structured leather silhouette designed for effortless everyday carry.", details:["Leather exterior","Lined interior","Interior pocket","Hand-finished hardware"], variants:["Brown","Black"] },
  { slug:"zorah-tote", name:"The Zorah Tote", price:"₦—", priceValue:0, category:"Tote Bags", tone:"green", colors:["Zorah Green","Brown"], availability:"In stock", featuredRank:2, description:"A generous carry-all with a calm, architectural profile.", details:["Full-grain leather","Fits daily essentials","Long shoulder handles","Structured base"], variants:["Zorah Green","Brown"] },
  { slug:"mini-edit", name:"The Mini Edit", price:"₦—", priceValue:0, category:"Mini Bags", tone:"ivory", colors:["Ivory","Black"], availability:"In stock", featuredRank:3, description:"A compact statement piece for the essentials you never leave behind.", details:["Compact interior","Adjustable strap","Polished hardware","Leather lining"], variants:["Ivory","Black"] },
  { slug:"the-classic", name:"The Classic", price:"₦—", priceValue:0, category:"Crossbody Bags", tone:"black", colors:["Black","Brown"], availability:"Made to order", featuredRank:4, description:"A timeless crossbody built around clean lines and daily versatility.", details:["Crossbody strap","Secure closure","Organised interior","Tactile leather"], variants:["Black","Brown"] },
];
export const collections = [
  { slug:"everyday", name:"Everyday", description:"Quietly versatile silhouettes for work, weekends and everywhere between." },
  { slug:"statement", name:"Statement", description:"Distinctive shapes made to become the centre of the look." },
  { slug:"mini", name:"Mini", description:"Small proportions, considered details and just enough room for what matters." },
  { slug:"custom", name:"Custom", description:"A considered route to a Zorah piece shaped around your preferences." },
];
export function getProduct(slug:string) { return products.find(product => product.slug === slug); }
