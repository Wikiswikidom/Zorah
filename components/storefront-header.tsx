"use client"
import Link from 'next/link'
import {useEffect,useState} from 'react'
import {useCommerce} from '@/components/commerce-provider'

export function StorefrontHeader(){
  const {cartCount,wishlistCount}=useCommerce()
  const [logo,setLogo]=useState<string|null>(null)
  const [menuOpen,setMenuOpen]=useState(false)

  useEffect(()=>{
    fetch('/api/landing',{cache:'no-store'})
      .then(r=>r.ok?r.json():null)
      .then(d=>{const x=d?.sections?.find((s:{section_key:string})=>s.section_key==='site-logo');if(x?.media_url||x?.media_path)setLogo(x.media_url||x.media_path)})
      .catch(()=>{})
    fetch('/api/branding/logo',{cache:'no-store'})
      .then(r=>r.ok?r.json():null)
      .then(d=>{if(d?.url)setLogo(d.url)})
      .catch(()=>{})
  },[])

  return <>
    <header className="store-header">
      <div className="store-topline"><div className="store-header-inner store-header-inner-top">
        <button type="button" className="store-menu" aria-label="Open menu" aria-expanded={menuOpen} onClick={()=>setMenuOpen(v=>!v)}>☰</button>
        <Link href="/shop" className="store-logo" aria-label="Zorah shop">{logo?<img src={logo} alt="Zorah"/>:<span>ZORAH</span>}</Link>
        <nav className={`store-nav ${menuOpen?'is-open':''}`}>
          <Link href="/shop" onClick={()=>setMenuOpen(false)}>Shop</Link>
          <Link href="/collections" onClick={()=>setMenuOpen(false)}>Categories</Link>
          <Link href="/our-story" onClick={()=>setMenuOpen(false)}>Our story</Link>
          <Link href="/journal" onClick={()=>setMenuOpen(false)}>Journal</Link>
        </nav>
        <div className="store-actions">
          <Link href="/search" className="store-search-link">⌕ <span>Search</span></Link>
          <Link href="/wishlist" className="store-wishlist">♡ <span>Wishlist{wishlistCount>0&&` (${wishlistCount})`}</span></Link>
          <Link href="/cart" className="store-cart" aria-label={`Open shopping cart${cartCount?` (${cartCount} items)`:''}`}>🛒 <span>Cart{cartCount>0&&` (${cartCount})`}</span></Link>
          <Link href="/account" className="store-account">♙ <span>Account</span></Link>
        </div>
      </div></div>
      <div className="store-mobile-search"><Link href="/search" aria-label="Search Zorah">⌕ <span>Search Zorah handbags, collections and more</span></Link><Link href="/cart" aria-label="Cart">🛒{cartCount>0&&<b>{cartCount}</b>}</Link></div>
    </header>
    <nav className="store-bottom-nav" aria-label="Primary mobile navigation">
      <Link href="/shop"><span>⌂</span>Home</Link>
      <Link href="/collections"><span>▦</span>Categories</Link>
      <Link href="/cart"><span className="nav-badge-wrap">🛒{cartCount>0&&<b>{cartCount}</b>}</span>Cart</Link>
      <Link href="/wishlist"><span>♡</span>Wishlist</Link>
      <Link href="/account"><span className="nav-badge-wrap">♙</span>Account</Link>
    </nav>
  </>
}
