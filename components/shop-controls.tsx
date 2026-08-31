"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

type Filters = { categories: string[]; colors: string[]; availability: string[]; maxPrice: number };
const initial: Filters = { categories: [], colors: [], availability: [], maxPrice: 1000000 };

export function ShopControls({ products }: { products: Product[] }) {
  const [filters, setFilters] = useState(initial);
  const [sort, setSort] = useState("featured");
  const [open, setOpen] = useState(false);
  const categories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);
  const colors = useMemo(() => [...new Set(products.flatMap(p => p.colors))], [products]);
  const filtered = useMemo(() => products.filter(p => (!filters.categories.length || filters.categories.includes(p.category)) && (!filters.colors.length || p.colors.some(c => filters.colors.includes(c))) && (!filters.availability.length || filters.availability.includes(p.availability)) && (!p.priceValue || p.priceValue <= filters.maxPrice)).sort((a,b) => sort === "name" ? a.name.localeCompare(b.name) : sort === "price-asc" ? (a.priceValue || Infinity) - (b.priceValue || Infinity) : sort === "price-desc" ? (b.priceValue || 0) - (a.priceValue || 0) : a.featuredRank - b.featuredRank), [products, filters, sort]);
  const toggle = (key: "categories" | "colors" | "availability", value: string) => setFilters(f => ({ ...f, [key]: f[key].includes(value) ? f[key].filter(x => x !== value) : [...f[key], value] }));
  const activeCount = filters.categories.length + filters.colors.length + filters.availability.length + (filters.maxPrice < 1000000 ? 1 : 0);
  const reset = () => setFilters(initial);
  return <>
    <div className="shop-controls"><button className="filter-trigger" onClick={() => setOpen(true)}>Filter{activeCount ? ` (${activeCount})` : ""}</button><span className="result-count">{filtered.length} {filtered.length === 1 ? "piece" : "pieces"}</span><label className="sort-control">Sort <select value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort products"><option value="featured">Featured</option><option value="name">Name</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label></div>
    {activeCount > 0 && <div className="applied-filters">{filters.categories.map(v => <button key={v} onClick={() => toggle("categories",v)}>{v} ×</button>)}{filters.colors.map(v => <button key={v} onClick={() => toggle("colors",v)}>{v} ×</button>)}{filters.availability.map(v => <button key={v} onClick={() => toggle("availability",v)}>{v} ×</button>)}{filters.maxPrice < 1000000 && <button onClick={() => setFilters(f => ({...f,maxPrice:1000000}))}>Under ₦{filters.maxPrice.toLocaleString()} ×</button>}<button className="clear-filters" onClick={reset}>Clear all</button></div>}
    <div className="product-grid">{filtered.map(product => <ProductCard key={product.slug} {...product} />)}</div>
    {!filtered.length && <div className="empty-state"><span className="empty-mark">—</span><h2>No pieces match</h2><p>Try removing a filter or exploring the full collection.</p><button className="button button-dark" onClick={reset}>Reset filters</button></div>}
    {open && <div className="filter-backdrop" onClick={() => setOpen(false)}><aside className="filter-drawer" role="dialog" aria-modal="true" aria-label="Filter products" onClick={e => e.stopPropagation()}><div className="filter-head"><strong>Filter</strong><button onClick={() => setOpen(false)} aria-label="Close filters">×</button></div><FilterGroup title="Category" values={categories} selected={filters.categories} onToggle={v => toggle("categories",v)} /><FilterGroup title="Colour" values={colors} selected={filters.colors} onToggle={v => toggle("colors",v)} /><FilterGroup title="Availability" values={["In stock","Made to order"]} selected={filters.availability} onToggle={v => toggle("availability",v)} /><div className="filter-group"><div className="filter-group-title"><span>Price</span><span>{filters.maxPrice >= 1000000 ? "Any" : `₦${filters.maxPrice.toLocaleString()}`}</span></div><input type="range" min="0" max="1000000" step="5000" value={filters.maxPrice} onChange={e => setFilters(f => ({...f,maxPrice:Number(e.target.value)}))} aria-label="Maximum price" /></div><div className="filter-actions"><button className="secondary-action" onClick={reset}>Clear</button><button className="button button-dark" onClick={() => setOpen(false)}>Show {filtered.length} results</button></div></aside></div>}
  </>;
}
function FilterGroup({ title, values, selected, onToggle }: { title:string; values:string[]; selected:string[]; onToggle:(v:string)=>void }) { return <fieldset className="filter-group"><legend className="filter-group-title">{title}</legend>{values.map(value => <label className="filter-option" key={value}><input type="checkbox" checked={selected.includes(value)} onChange={() => onToggle(value)} /><span>{value}</span></label>)}</fieldset>; }
