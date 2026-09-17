"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/client";

type CartItem = { product: Product; quantity: number; variant: string };
type CommerceContextValue = {
  cart: CartItem[];
  wishlist: string[];
  waitlist: string[];
  cartCount: number;
  wishlistCount: number;
  waitlistCount: number;
  addToBag: (product: Product, quantity?: number, variant?: string) => void;
  removeFromBag: (slug: string, variant?: string) => void;
  setQuantity: (slug: string, quantity: number, variant?: string) => void;
  clearBag: () => void;
  toggleWishlist: (slug: string) => void;
  isWishlisted: (slug: string) => boolean;
  addToWaitlist: (slug: string) => Promise<boolean>;
  isWaitlisted: (slug: string) => boolean;
};

const CommerceContext = createContext<CommerceContextValue | null>(null);
const STORAGE_VERSION = "v5";
const STORAGE_KEYS = {
  cart: `zorah-${STORAGE_VERSION}-cart`,
  wishlist: `zorah-${STORAGE_VERSION}-wishlist`,
  waitlist: `zorah-${STORAGE_VERSION}-waitlist`,
} as const;
const MAX_CART_ITEMS = 50;
const MAX_QUANTITY = 99;

const isSafeSlug = (value: unknown): value is string =>
  typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 120;

function readStorage<T>(key: string, fallback: T, validate: (value: unknown) => value is T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return validate(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function removeStorage(key: string) {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(key); } catch {}
}

const isWishlist = (value: unknown): value is string[] =>
  Array.isArray(value) && value.length <= 200 && value.every(isSafeSlug);

const isWaitlist = isWishlist;

const isCart = (value: unknown): value is CartItem[] =>
  Array.isArray(value) && value.length <= MAX_CART_ITEMS && value.every(item => {
    if (!item || typeof item !== "object") return false;
    const c = item as Partial<CartItem>;
    return isSafeSlug(c.product?.slug) &&
      typeof c.product?.name === "string" &&
      typeof c.product?.priceValue === "number" &&
      Number.isFinite(c.product.priceValue) &&
      typeof c.quantity === "number" && Number.isInteger(c.quantity) &&
      c.quantity >= 1 && c.quantity <= MAX_QUANTITY &&
      typeof c.variant === "string" && c.variant.length <= 100;
  });

const isProductSnapshot = (value: unknown): value is Product => {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<Product>;
  return isSafeSlug(p.slug) && typeof p.name === "string" && typeof p.price === "string" &&
    typeof p.priceValue === "number" && Number.isFinite(p.priceValue) &&
    typeof p.category === "string" && typeof p.description === "string" &&
    Array.isArray(p.details) && Array.isArray(p.variants);
};

function userKey(base: string, id: string) { return `${base}:${id}`; }

async function productIdForSlug(slug: string) {
  try {
    const { data } = await createClient().from("products").select("id").eq("slug", slug).maybeSingle();
    return data?.id ?? null;
  } catch { return null; }
}

async function hydrateCartImages(items: CartItem[]) {
  if (!items.length) return items;
  try {
    const supabase = createClient();
    const slugs = [...new Set(items.map(item => item.product.slug).filter(isSafeSlug))];
    const { data, error } = await supabase.from("products")
      .select("slug,images:product_images(storage_path,alt_text,is_primary,sort_order)")
      .in("slug", slugs).eq("status", "published");
    if (error || !data?.length) return items;
    const imageBySlug = new Map<string, string>();
    await Promise.all(data.map(async (row: any) => {
      const images = (row.images ?? []) as Array<{ storage_path: string; is_primary: boolean; sort_order: number }>;
      const primary = [...images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)[0];
      if (!primary?.storage_path) return;
      const signed = await supabase.storage.from("product-media").createSignedUrl(primary.storage_path, 900);
      if (signed.data?.signedUrl) imageBySlug.set(row.slug, signed.data.signedUrl);
    }));
    return items.map(item => {
      const imageUrl = imageBySlug.get(item.product.slug);
      return imageUrl ? { ...item, product: { ...item.product, imageUrl } } : item;
    });
  } catch { return items; }
}

export function CommerceProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [waitlist, setWaitlist] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const loadCustomerData = useCallback(async (id: string) => {
    const supabase = createClient();
    const localCart = readStorage(userKey(STORAGE_KEYS.cart, id), [], isCart);
    const localWishlist = readStorage(userKey(STORAGE_KEYS.wishlist, id), [], isWishlist);
    const localWaitlist = readStorage(userKey(STORAGE_KEYS.waitlist, id), [], isWaitlist);
    const guestCart = readStorage(STORAGE_KEYS.cart, [], isCart);
    const guestWishlist = readStorage(STORAGE_KEYS.wishlist, [], isWishlist);
    const guestWaitlist = readStorage(STORAGE_KEYS.waitlist, [], isWaitlist);

    try {
      const [wishResult, cartResult, waitResult] = await Promise.all([
        supabase.from("customer_wishlists").select("product:products(slug)").eq("user_id", id),
        supabase.from("customer_cart").select("product_slug,variant,quantity,product_snapshot").eq("user_id", id).order("updated_at", { ascending: false }),
        supabase.from("product_waitlists").select("product:products(slug),status").eq("customer_id", id).eq("status", "waiting"),
      ]);

      const toSlug = (row: any) => Array.isArray(row?.product) ? row.product[0]?.slug : row?.product?.slug;
      const serverWishlist = (wishResult.data ?? []).map(toSlug).filter(isSafeSlug);
      const serverWaitlist = (waitResult.data ?? []).map(toSlug).filter(isSafeSlug);
      const remoteCart = (cartResult.data ?? []).map((row: any) => {
        const snapshot = row?.product_snapshot;
        if (!isProductSnapshot(snapshot) || !isSafeSlug(row?.product_slug) || typeof row?.variant !== "string") return null;
        return {
          product: { ...snapshot, slug: row.product_slug },
          quantity: Math.min(MAX_QUANTITY, Math.max(1, Number(row.quantity) || 1)),
          variant: row.variant.slice(0, 100),
        } as CartItem;
      }).filter((item): item is CartItem => item !== null);

      const mergedCart = [...remoteCart];
      for (const item of [...localCart, ...guestCart]) {
        const index = mergedCart.findIndex(x => x.product.slug === item.product.slug && x.variant === item.variant);
        if (index < 0) mergedCart.push(item);
        else mergedCart[index] = { ...mergedCart[index], quantity: Math.min(MAX_QUANTITY, mergedCart[index].quantity + item.quantity) };
      }
      const limitedCart = await hydrateCartImages(mergedCart.slice(0, MAX_CART_ITEMS));
      const mergedWishlist = [...new Set([...serverWishlist, ...localWishlist, ...guestWishlist])].filter(isSafeSlug).slice(0, 200);
      const mergedWaitlist = [...new Set([...serverWaitlist, ...localWaitlist, ...guestWaitlist])].filter(isSafeSlug).slice(0, 200);

      setCart(limitedCart);
      setWishlist(mergedWishlist);
      setWaitlist(mergedWaitlist);

      await Promise.all(limitedCart.map(item => supabase.from("customer_cart").upsert({
        user_id: id, product_slug: item.product.slug, variant: item.variant,
        quantity: item.quantity, product_snapshot: item.product,
      }, { onConflict: "user_id,product_slug,variant" })));

      for (const slug of [...new Set([...localWishlist, ...guestWishlist])]) {
        const productId = await productIdForSlug(slug);
        if (productId) await supabase.from("customer_wishlists").upsert({ user_id: id, product_id: productId }, { onConflict: "user_id,product_id" });
      }
      for (const slug of [...new Set([...localWaitlist, ...guestWaitlist])]) {
        const productId = await productIdForSlug(slug);
        if (productId) await supabase.from("product_waitlists").upsert({ product_id: productId, customer_id: id, email: (await supabase.auth.getUser()).data.user?.email ?? "", status: "waiting" }, { onConflict: "product_id,email" });
      }
      writeStorage(userKey(STORAGE_KEYS.cart, id), limitedCart);
      writeStorage(userKey(STORAGE_KEYS.wishlist, id), mergedWishlist);
      writeStorage(userKey(STORAGE_KEYS.waitlist, id), mergedWaitlist);
      removeStorage(STORAGE_KEYS.cart); removeStorage(STORAGE_KEYS.wishlist); removeStorage(STORAGE_KEYS.waitlist);
    } catch (error) {
      console.error("Customer commerce data load failed", error);
      const fallbackCart = await hydrateCartImages([...localCart, ...guestCart].slice(0, MAX_CART_ITEMS));
      setCart(fallbackCart);
      setWishlist([...new Set([...localWishlist, ...guestWishlist])].filter(isSafeSlug));
      setWaitlist([...new Set([...localWaitlist, ...guestWaitlist])].filter(isSafeSlug));
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUserId(data.user?.id ?? null);
      setAuthReady(true);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setHydrated(false);
      setUserId(session?.user?.id ?? null);
      setAuthReady(true);
    });
    return () => { mounted = false; subscription.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (userId) {
      void loadCustomerData(userId);
    } else {
      setCart(readStorage(STORAGE_KEYS.cart, [], isCart));
      setWishlist(readStorage(STORAGE_KEYS.wishlist, [], isWishlist));
      setWaitlist(readStorage(STORAGE_KEYS.waitlist, [], isWaitlist));
      setHydrated(true);
    }
  }, [authReady, userId, loadCustomerData]);

  useEffect(() => {
    if (!hydrated) return;
    writeStorage(userId ? userKey(STORAGE_KEYS.cart, userId) : STORAGE_KEYS.cart, cart);
  }, [cart, hydrated, userId]);
  useEffect(() => {
    if (!hydrated) return;
    writeStorage(userId ? userKey(STORAGE_KEYS.wishlist, userId) : STORAGE_KEYS.wishlist, wishlist);
  }, [wishlist, hydrated, userId]);
  useEffect(() => {
    if (!hydrated) return;
    writeStorage(userId ? userKey(STORAGE_KEYS.waitlist, userId) : STORAGE_KEYS.waitlist, waitlist);
  }, [waitlist, hydrated, userId]);

  const syncCartItem = useCallback(async (id: string, item: CartItem) => {
    try { await createClient().from("customer_cart").upsert({ user_id: id, product_slug: item.product.slug, variant: item.variant, quantity: item.quantity, product_snapshot: item.product }, { onConflict: "user_id,product_slug,variant" }); }
    catch (error) { console.error("Cart sync failed", error); }
  }, []);
  const deleteCartItem = useCallback(async (id: string, slug: string, variant: string) => {
    try { await createClient().from("customer_cart").delete().eq("user_id", id).eq("product_slug", slug).eq("variant", variant); }
    catch (error) { console.error("Cart delete sync failed", error); }
  }, []);

  const addToBag = useCallback((product: Product, quantity = 1, variant = "Default") => {
    if (!isSafeSlug(product.slug)) return;
    const q = Math.min(MAX_QUANTITY, Math.max(1, Math.floor(Number(quantity) || 1)));
    const v = String(variant).slice(0, 100);
    setCart(current => {
      const index = current.findIndex(item => item.product.slug === product.slug && item.variant === v);
      const next = index < 0 ? { product, quantity: q, variant: v } : { ...current[index], quantity: Math.min(MAX_QUANTITY, current[index].quantity + q) };
      if (index < 0 && current.length >= MAX_CART_ITEMS) return current;
      if (userId) void syncCartItem(userId, next);
      return index < 0 ? [...current, next] : current.map((item, i) => i === index ? next : item);
    });
  }, [syncCartItem, userId]);

  const removeFromBag = useCallback((slug: string, variant = "Default") => {
    if (!isSafeSlug(slug)) return;
    setCart(current => current.filter(item => !(item.product.slug === slug && item.variant === variant)));
    if (userId) void deleteCartItem(userId, slug, variant);
  }, [deleteCartItem, userId]);

  const setQuantity = useCallback((slug: string, quantity: number, variant = "Default") => {
    if (!isSafeSlug(slug)) return;
    const q = Math.floor(Number(quantity));
    if (!Number.isFinite(q) || q <= 0) { removeFromBag(slug, variant); return; }
    setCart(current => current.map(item => {
      if (item.product.slug !== slug || item.variant !== variant) return item;
      const next = { ...item, quantity: Math.min(MAX_QUANTITY, q) };
      if (userId) void syncCartItem(userId, next);
      return next;
    }));
  }, [removeFromBag, syncCartItem, userId]);

  const clearBag = useCallback(() => {
    setCart([]);
    if (userId) void createClient().from("customer_cart").delete().eq("user_id", userId);
  }, [userId]);

  const toggleWishlist = useCallback((slug: string) => {
    if (!isSafeSlug(slug)) return;
    setWishlist(current => {
      const exists = current.includes(slug);
      const next = exists ? current.filter(item => item !== slug) : [...current, slug].slice(-200);
      if (userId) void (async () => {
        const supabase = createClient();
        const productId = await productIdForSlug(slug);
        if (!productId) return;
        try {
          if (exists) await supabase.from("customer_wishlists").delete().eq("user_id", userId).eq("product_id", productId);
          else await supabase.from("customer_wishlists").upsert({ user_id: userId, product_id: productId }, { onConflict: "user_id,product_id" });
        } catch (error) { console.error("Wishlist sync failed", error); }
      })();
      return next;
    });
  }, [userId]);

  const isWishlisted = useCallback((slug: string) => wishlist.includes(slug), [wishlist]);
  const addToWaitlist = useCallback(async (slug: string) => {
    if (!isSafeSlug(slug)) return false;
    if (waitlist.includes(slug)) return true;
    setWaitlist(current => [...current, slug].slice(-200));
    if (!userId) return true;
    try {
      const response = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug }) });
      if (!response.ok) {
        setWaitlist(current => current.filter(item => item !== slug));
        return false;
      }
      return true;
    } catch {
      setWaitlist(current => current.filter(item => item !== slug));
      return false;
    }
  }, [userId, waitlist]);
  const isWaitlisted = useCallback((slug: string) => waitlist.includes(slug), [waitlist]);

  const value = useMemo(() => ({
    cart, wishlist, waitlist,
    cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    wishlistCount: wishlist.length,
    waitlistCount: waitlist.length,
    addToBag, removeFromBag, setQuantity, clearBag, toggleWishlist, isWishlisted, addToWaitlist, isWaitlisted,
  }), [cart, wishlist, waitlist, addToBag, removeFromBag, setQuantity, clearBag, toggleWishlist, isWishlisted, addToWaitlist, isWaitlisted]);

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce() {
  const context = useContext(CommerceContext);
  if (!context) throw new Error("useCommerce must be used inside CommerceProvider");
  return context;
}
