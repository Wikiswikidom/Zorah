'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import styles from './category-browser.module.css'

type Category = { slug: string; name: string; description: string }

const icons = ['▣', '◈', '◇', '◌', '□', '✦']

export function CategoryBrowser({ categories }: { categories: Category[] }) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return categories
    return categories.filter(item => `${item.name} ${item.description}`.toLowerCase().includes(q))
  }, [categories, query])

  return <>
    <div className={styles.searchWrap}>
      <span aria-hidden>⌕</span>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search categories" aria-label="Search categories" />
      {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear category search">×</button>}
    </div>

    <div className={styles.tabs}>
      <button type="button" className={styles.activeTab} onClick={() => setQuery('')}>ALL</button>
      <Link href="/shop?collection=tote-bags">TOTE BAGS</Link>
      <Link href="/shop?collection=crossbody">CROSSBODY</Link>
      <Link href="/shop?collection=evening">EVENING</Link>
    </div>

    <div className={styles.resultBar}>
      <strong>{filtered.length}</strong><span>{filtered.length === 1 ? 'category' : 'categories'} found</span>
    </div>

    {filtered.length ? <div className={styles.grid}>
      {filtered.map((item, index) => <Link key={item.slug} href={`/shop?collection=${item.slug}`} className={styles.card}>
        <div className={styles.icon}>{icons[index % icons.length]}</div>
        <div className={styles.copy}><h2>{item.name}</h2><p>{item.description}</p></div>
        <span className={styles.arrow}>›</span>
      </Link>)}
    </div> : <div className={styles.empty}><div>⌕</div><h2>No categories found</h2><p>Try another search.</p><button type="button" onClick={() => setQuery('')}>RESET</button></div>}

    <section className={styles.cta}>
      <div><h2>Not sure what to choose?</h2><p>Browse every Zorah handbag and filter by style, colour and availability.</p></div>
      <Link href="/shop">VIEW ALL BAGS</Link>
    </section>
  </>
}
