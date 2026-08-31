"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/catalog";
import { products } from "@/lib/catalog";

type CartItem = { product: Product; quantity: number; variant: string };
type CommerceContextValue = {
  cart: CartItem[];
  wishlist: string[];
  recentlyViewed: string[];
  cartCount: number;
  wishlistCount: number;
  addToBag: (product: Product, quantity?: number, variant?: string) => void;
  removeFromBag: (slug: string, variant?: string) => void;
  setQuantity: (slug: string, quantity: number, variant?: string) => void;
  toggleWishlist: (slug: string) => void;
  isWishlisted: (slug: string) => boolean;
  trackViewed: (slug: string) => void;
};

const CommerceContext = createContext<CommerceContextValue | null>(null);
const STORAGE_VERSION = "v1";
const STORAGE_KEYS = {
  cart: `zorah-${STORAGE_VERSION}-cart`,
  wishlist: `zorah-${STORAGE_VERSION}-wishlist`,
  recentlyViewed: `zorah-${STORAGE_VERSION}-recently-viewed`,
} as const;
const MAX_CART_ITEMS = 50;
const MAX_QUANTITY = 99;
const MAX_RECENT = 8;

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

const validProductSlugs = new Set(products.map((product) => product.slug));
const isSafeSlug = (value: unknown): value is string =>
  typeof value === "string" && validProductSlugs.has(value);

const isWishlist = (value: unknown): value is string[] =>
  Array.isArray(value) && value.length <= products.length && value.every(isSafeSlug);

const isCart = (value: unknown): value is CartItem[] =>
  Array.isArray(value) &&
  value.length <= MAX_CART_ITEMS &&
  value.every((item) => {
    if (!item || typeof item !== "object") return false;
    const candidate = item as Partial<CartItem>;
    return (
      isSafeSlug(candidate.product?.slug) &&
      typeof candidate.quantity === "number" &&
      Number.isInteger(candidate.quantity) &&
      candidate.quantity >= 1 &&
      candidate.quantity <= MAX_QUANTITY &&
      typeof candidate.variant === "string" &&
      candidate.variant.length <= 100
    );
  });

const isRecentlyViewed = (value: unknown): value is string[] =>
  Array.isArray(value) && value.length <= MAX_RECENT && value.every(isSafeSlug);

function writeStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be disabled/full. Commerce continues in memory.
  }
}

export function CommerceProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(readStorage(STORAGE_KEYS.cart, [], isCart));
    setWishlist(readStorage(STORAGE_KEYS.wishlist, [], isWishlist));
    setRecentlyViewed(readStorage(STORAGE_KEYS.recentlyViewed, [], isRecentlyViewed));
    setHydrated(true);
  }, []);

  // Prevent the initial empty state from overwriting restored browser state.
  useEffect(() => {
    if (hydrated) writeStorage(STORAGE_KEYS.cart, cart);
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) writeStorage(STORAGE_KEYS.wishlist, wishlist);
  }, [wishlist, hydrated]);

  useEffect(() => {
    if (hydrated) writeStorage(STORAGE_KEYS.recentlyViewed, recentlyViewed);
  }, [recentlyViewed, hydrated]);

  const addToBag = useCallback((product: Product, quantity = 1, variant = "Default") => {
    if (!isSafeSlug(product.slug)) return;
    const safeQuantity = Math.min(MAX_QUANTITY, Math.max(1, Math.floor(Number(quantity) || 1)));
    const safeVariant = String(variant).slice(0, 100);
    setCart((current) => {
      const index = current.findIndex(
        (item) => item.product.slug === product.slug && item.variant === safeVariant,
      );
      if (index < 0) {
        if (current.length >= MAX_CART_ITEMS) return current;
        return [...current, { product, quantity: safeQuantity, variant: safeVariant }];
      }
      return current.map((item, i) =>
        i === index ? { ...item, quantity: Math.min(MAX_QUANTITY, item.quantity + safeQuantity) } : item,
      );
    });
  }, []);

  const removeFromBag = useCallback((slug: string, variant = "Default") => {
    if (!isSafeSlug(slug)) return;
    setCart((current) => current.filter((item) => !(item.product.slug === slug && item.variant === variant)));
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number, variant = "Default") => {
    if (!isSafeSlug(slug)) return;
    const safeQuantity = Math.floor(Number(quantity));
    setCart((current) => {
      if (!Number.isFinite(safeQuantity) || safeQuantity <= 0) {
        return current.filter((item) => !(item.product.slug === slug && item.variant === variant));
      }
      return current.map((item) =>
        item.product.slug === slug && item.variant === variant
          ? { ...item, quantity: Math.min(MAX_QUANTITY, safeQuantity) }
          : item,
      );
    });
  }, []);

  const toggleWishlist = useCallback((slug: string) => {
    if (!isSafeSlug(slug)) return;
    setWishlist((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug],
    );
  }, []);

  const isWishlisted = useCallback((slug: string) => wishlist.includes(slug), [wishlist]);

  const trackViewed = useCallback((slug: string) => {
    if (!isSafeSlug(slug)) return;
    setRecentlyViewed((current) => [slug, ...current.filter((item) => item !== slug)].slice(0, MAX_RECENT));
  }, []);

  const value = useMemo(
    () => ({
      cart,
      wishlist,
      recentlyViewed,
      cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      wishlistCount: wishlist.length,
      addToBag,
      removeFromBag,
      setQuantity,
      toggleWishlist,
      isWishlisted,
      trackViewed,
    }),
    [cart, wishlist, recentlyViewed, addToBag, removeFromBag, setQuantity, toggleWishlist, isWishlisted, trackViewed],
  );

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce() {
  const context = useContext(CommerceContext);
  if (!context) throw new Error("useCommerce must be used inside CommerceProvider");
  return context;
}
