"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/catalog";

type CartItem = { product: Product; quantity: number; variant?: string };

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

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; }
}

export function CommerceProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  useEffect(() => {
    setCart(read<CartItem[]>("zorah-cart", []));
    setWishlist(read<string[]>("zorah-wishlist", []));
    setRecentlyViewed(read<string[]>("zorah-recently-viewed", []));
  }, []);
  useEffect(() => { localStorage.setItem("zorah-cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem("zorah-wishlist", JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem("zorah-recently-viewed", JSON.stringify(recentlyViewed)); }, [recentlyViewed]);

  const value = useMemo<CommerceContextValue>(() => ({
    cart, wishlist, recentlyViewed,
    cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    wishlistCount: wishlist.length,
    addToBag: (product, quantity = 1, variant = "Default") => setCart(current => {
      const index = current.findIndex(item => item.product.slug === product.slug && item.variant === variant);
      if (index < 0) return [...current, { product, quantity, variant }];
      return current.map((item, i) => i === index ? { ...item, quantity: item.quantity + quantity } : item);
    }),
    removeFromBag: (slug, variant = "Default") => setCart(current => current.filter(item => !(item.product.slug === slug && item.variant === variant))),
    setQuantity: (slug, quantity, variant = "Default") => setCart(current => quantity <= 0 ? current.filter(item => !(item.product.slug === slug && item.variant === variant)) : current.map(item => item.product.slug === slug && item.variant === variant ? { ...item, quantity } : item)),
    toggleWishlist: slug => setWishlist(current => current.includes(slug) ? current.filter(item => item !== slug) : [...current, slug]),
    isWishlisted: slug => wishlist.includes(slug),
    trackViewed: slug => setRecentlyViewed(current => [slug, ...current.filter(item => item !== slug)].slice(0, 8)),
  }), [cart, wishlist, recentlyViewed]);

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce() {
  const context = useContext(CommerceContext);
  if (!context) throw new Error("useCommerce must be used inside CommerceProvider");
  return context;
}
