"use client";
import {createContext,useCallback,useContext,useEffect,useMemo,useState} from "react";
import type {Product} from "@/lib/catalog";
import {createClient} from "@/lib/supabase/client";

type CartItem={product:Product;quantity:number;variant:string};
type CommerceContextValue={cart:CartItem[];wishlist:string[];recentlyViewed:string[];cartCount:number;wishlistCount:number;addToBag:(product:Product,quantity?:number,variant?:string)=>void;removeFromBag:(slug:string,variant?:string)=>void;setQuantity:(slug:string,quantity:number,variant?:string)=>void;clearBag:()=>void;toggleWishlist:(slug:string)=>void;isWishlisted:(slug:string)=>boolean;trackViewed:(slug:string)=>void};
const CommerceContext=createContext<CommerceContextValue|null>(null);
const STORAGE_VERSION="v3";
const STORAGE_KEYS={cart:`zorah-${STORAGE_VERSION}-cart`,wishlist:`zorah-${STORAGE_VERSION}-wishlist`,recentlyViewed:`zorah-${STORAGE_VERSION}-recently-viewed`} as const;
const MAX_CART_ITEMS=50,MAX_QUANTITY=99,MAX_RECENT=8;
const isSafeSlug=(value:unknown):value is string=>typeof value==="string"&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)&&value.length<=120;
function readStorage<T>(key:string,fallback:T,validate:(value:unknown)=>value is T):T{if(typeof window==="undefined")return fallback;try{const raw=window.localStorage.getItem(key);if(!raw)return fallback;const parsed:unknown=JSON.parse(raw);return validate(parsed)?parsed:fallback}catch{return fallback}}
const isWishlist=(value:unknown):value is string[]=>Array.isArray(value)&&value.length<=200&&value.every(isSafeSlug);
const isCart=(value:unknown):value is CartItem[]=>Array.isArray(value)&&value.length<=MAX_CART_ITEMS&&value.every(item=>{if(!item||typeof item!=="object")return false;const c=item as Partial<CartItem>;return isSafeSlug(c.product?.slug)&&typeof c.product?.name==="string"&&typeof c.product?.priceValue==="number"&&Number.isFinite(c.product.priceValue)&&typeof c.quantity==="number"&&Number.isInteger(c.quantity)&&c.quantity>=1&&c.quantity<=MAX_QUANTITY&&typeof c.variant==="string"&&c.variant.length<=100});
const isRecentlyViewed=(value:unknown):value is string[]=>Array.isArray(value)&&value.length<=MAX_RECENT&&value.every(isSafeSlug);
function writeStorage(key:string,value:unknown){if(typeof window==="undefined")return;try{window.localStorage.setItem(key,JSON.stringify(value))}catch{}}

async function getCurrentUserId(){try{const supabase=createClient();const {data}=await supabase.auth.getUser();return data.user?.id??null}catch{return null}}
async function productIdForSlug(slug:string){try{const supabase=createClient();const {data}=await supabase.from("products").select("id").eq("slug",slug).maybeSingle();return data?.id??null}catch{return null}}

export function CommerceProvider({children}:{children:React.ReactNode}){
  const[cart,setCart]=useState<CartItem[]>([]),[wishlist,setWishlist]=useState<string[]>([]),[recentlyViewed,setRecentlyViewed]=useState<string[]>([]),[hydrated,setHydrated]=useState(false),[userId,setUserId]=useState<string|null>(null);

  const loadCustomerData=useCallback(async(id:string)=>{
    try{
      const supabase=createClient();
      const [wish,recent]=await Promise.all([
        supabase.from("customer_wishlists").select("product:products(slug)").eq("user_id",id),
        supabase.from("customer_recently_viewed").select("product:products(slug)").eq("user_id",id).order("viewed_at",{ascending:false}).limit(MAX_RECENT),
      ]);
      const toSlug=(row:any)=>Array.isArray(row?.product)?row.product[0]?.slug:row?.product?.slug;
      setWishlist((wish.data??[]).map(toSlug).filter(isSafeSlug));
      setRecentlyViewed((recent.data??[]).map(toSlug).filter(isSafeSlug));
    }catch(error){console.error("Customer commerce data load failed",error)}
  },[]);

  useEffect(()=>{
    let mounted=true;
    const supabase=createClient();
    (async()=>{
      const {data}=await supabase.auth.getUser();
      if(!mounted)return;
      if(data.user){
        setUserId(data.user.id);
        await loadCustomerData(data.user.id);
      }else{
        setCart(readStorage(STORAGE_KEYS.cart,[],isCart));
        setWishlist(readStorage(STORAGE_KEYS.wishlist,[],isWishlist));
        setRecentlyViewed(readStorage(STORAGE_KEYS.recentlyViewed,[],isRecentlyViewed));
      }
      if(mounted)setHydrated(true);
    })();
    const{data:subscription}=supabase.auth.onAuthStateChange((_event,session)=>{
      if(!mounted)return;
      const nextId=session?.user?.id??null;
      setUserId(nextId);
      if(nextId)loadCustomerData(nextId);else{setWishlist([]);setRecentlyViewed([])}
    });
    return()=>{mounted=false;subscription.subscription.unsubscribe()};
  },[loadCustomerData]);

  useEffect(()=>{if(hydrated&&!userId)writeStorage(STORAGE_KEYS.cart,cart)},[cart,hydrated,userId]);
  useEffect(()=>{if(hydrated&&!userId)writeStorage(STORAGE_KEYS.wishlist,wishlist)},[wishlist,hydrated,userId]);
  useEffect(()=>{if(hydrated&&!userId)writeStorage(STORAGE_KEYS.recentlyViewed,recentlyViewed)},[recentlyViewed,hydrated,userId]);

  const addToBag=useCallback((product:Product,quantity=1,variant="Default")=>{if(!isSafeSlug(product.slug))return;const q=Math.min(MAX_QUANTITY,Math.max(1,Math.floor(Number(quantity)||1))),v=String(variant).slice(0,100);setCart(current=>{const index=current.findIndex(item=>item.product.slug===product.slug&&item.variant===v);if(index<0){if(current.length>=MAX_CART_ITEMS)return current;return[...current,{product,quantity:q,variant:v}]}return current.map((item,i)=>i===index?{...item,quantity:Math.min(MAX_QUANTITY,item.quantity+q)}:item)})},[]);
  const removeFromBag=useCallback((slug:string,variant="Default")=>{if(!isSafeSlug(slug))return;setCart(current=>current.filter(item=>!(item.product.slug===slug&&item.variant===variant)))},[]);
  const setQuantity=useCallback((slug:string,quantity:number,variant="Default")=>{if(!isSafeSlug(slug))return;const q=Math.floor(Number(quantity));setCart(current=>{if(!Number.isFinite(q)||q<=0)return current.filter(item=>!(item.product.slug===slug&&item.variant===variant));return current.map(item=>item.product.slug===slug&&item.variant===variant?{...item,quantity:Math.min(MAX_QUANTITY,q)}:item)})},[]);
  const clearBag=useCallback(()=>setCart([]),[]);

  const toggleWishlist=useCallback((slug:string)=>{
    if(!isSafeSlug(slug))return;
    setWishlist(current=>current.includes(slug)?current.filter(item=>item!==slug):[...current,slug].slice(-200));
    if(userId){(async()=>{const supabase=createClient();const productId=await productIdForSlug(slug);if(!productId)return;try{const {data}=await supabase.from("customer_wishlists").select("product_id").eq("user_id",userId).eq("product_id",productId).maybeSingle();if(data)await supabase.from("customer_wishlists").delete().eq("user_id",userId).eq("product_id",productId);else await supabase.from("customer_wishlists").insert({user_id:userId,product_id:productId});}catch(error){console.error("Wishlist sync failed",error)}})()}
  },[userId]);
  const isWishlisted=useCallback((slug:string)=>wishlist.includes(slug),[wishlist]);
  const trackViewed=useCallback((slug:string)=>{
    if(!isSafeSlug(slug))return;
    setRecentlyViewed(current=>[slug,...current.filter(item=>item!==slug)].slice(0,MAX_RECENT));
    if(userId){(async()=>{const supabase=createClient();const productId=await productIdForSlug(slug);if(!productId)return;try{await supabase.from("customer_recently_viewed").upsert({user_id:userId,product_id:productId,viewed_at:new Date().toISOString()},{onConflict:"user_id,product_id"});}catch(error){console.error("Recently viewed sync failed",error)}})()}
  },[userId]);
  const value=useMemo(()=>({cart,wishlist,recentlyViewed,cartCount:cart.reduce((sum,item)=>sum+item.quantity,0),wishlistCount:wishlist.length,addToBag,removeFromBag,setQuantity,clearBag,toggleWishlist,isWishlisted,trackViewed}),[cart,wishlist,recentlyViewed,addToBag,removeFromBag,setQuantity,clearBag,toggleWishlist,isWishlisted,trackViewed]);
  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>
}
export function useCommerce(){const context=useContext(CommerceContext);if(!context)throw new Error("useCommerce must be used inside CommerceProvider");return context}
