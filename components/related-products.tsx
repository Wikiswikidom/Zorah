import { ProductCard } from "@/components/product-card";
import { products as fallbackProducts, type Product } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";

function toneFor(name:string):Product["tone"]{const n=name.toLowerCase();if(n.includes("green"))return"green";if(n.includes("brown")||n.includes("tan"))return"brown";if(n.includes("black"))return"black";return"ivory"}

export async function RelatedProducts({currentSlug}:{currentSlug:string}){
  let related:Product[]=[];
  try{
    const s=await createClient();
    const {data,error}=await s.from("products").select("id,slug,name,short_description,description,base_price,currency,badge,is_featured,created_at,category:categories(name),variants:product_variants(color_name,name,price,stock_quantity,is_available,is_default),images:product_images(storage_path,alt_text,is_primary,sort_order)").eq("status","published").neq("slug",currentSlug).order("is_featured",{ascending:false}).order("created_at",{ascending:false}).limit(3);
    if(!error&&data?.length){
      related=await Promise.all(data.map(async p=>{
        const variants=(p.variants??[]) as Array<{color_name:string|null;name:string|null;price:number|null;stock_quantity:number;is_available:boolean;is_default:boolean}>;
        const images=(p.images??[]) as Array<{storage_path:string;alt_text:string;is_primary:boolean;sort_order:number}>;
        const primary=[...images].sort((a,b)=>Number(b.is_primary)-Number(a.is_primary)||a.sort_order-b.sort_order)[0];
        const signed=primary?await s.storage.from("product-media").createSignedUrl(primary.storage_path,900):null;
        const categoryData=Array.isArray(p.category)?p.category[0]:(p.category as {name?:string}|null);
        const category=categoryData?.name??"Handbags";
        const names=[...new Set(variants.map(v=>v.color_name||v.name).filter((v):v is string=>!!v))];
        const price=variants.find(v=>v.is_default&&v.price!=null)?.price??variants.find(v=>v.price!=null)?.price??Number(p.base_price);
        const availability=variants.length===0?"Made to order":variants.some(v=>v.is_available&&v.stock_quantity>0)?"In stock":variants.some(v=>v.is_available)?"Made to order":"Unavailable";
        const variantDetails=variants.map(v=>({label:v.color_name||v.name||"Default",priceValue:Number(v.price??p.base_price),stockQuantity:Number(v.stock_quantity)||0,isAvailable:!!v.is_available,isMadeToOrder:!!v.is_available&&Number(v.stock_quantity)<=0}));
        return {slug:p.slug,name:p.name,price:`${p.currency} ${price.toLocaleString("en-NG")}`,priceValue:price,category,tone:toneFor(names[0]??category),colors:names.length?names:["Zorah"],availability,featuredRank:p.is_featured?0:1,description:p.description||p.short_description||`${p.name}, crafted by Zorah in Lagos.`,details:["Leather exterior","Considered interior","Hand-finished hardware","Crafted in Lagos"],variants:names.length?names:["Default"],variantDetails,imageUrl:signed?.data?.signedUrl??null};
      }));
    }
  }catch(error){console.error("Related products load failed",error)}
  if(!related.length)related=fallbackProducts.filter(p=>p.slug!==currentSlug).slice(0,3);
  if(!related.length)return null;
  return <section className="section related-section"><div className="section-head"><div><p className="eyebrow">Complete the edit</p><h2 className="section-title">You may also like.</h2></div></div><div className="product-grid">{related.map(p=><ProductCard key={p.slug} {...p}/>)}</div></section>;
}
