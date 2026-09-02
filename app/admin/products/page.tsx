import Link from 'next/link'
import { requireRole } from '@/lib/auth/authorization'
import { createClient } from '@/lib/supabase/server'
import ProductCatalogueFilters from './product-catalogue-filters'
import { deleteProduct } from './actions'

const statuses=new Set(['draft','published','archived'])
const sorts=new Set(['newest','oldest','name_asc','name_desc','price_asc','price_desc'])

export default async function AdminProductsPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
  await requireRole(['catalog_admin'])
  const p=await searchParams
  const q=typeof p.q==='string'?p.q.trim().slice(0,80):''
  const status=typeof p.status==='string'&&statuses.has(p.status)?p.status:'all'
  const featured=p.featured==='yes'||p.featured==='no'?p.featured:'all'
  const sort=typeof p.sort==='string'&&sorts.has(p.sort)?p.sort:'newest'
  const s=await createClient()
  let query=s.from('products').select('id,name,slug,base_price,currency,status,is_featured,created_at,category:categories(name)',{count:'exact'})
  if(q){const safe=q.replace(/[%_,]/g,'');query=query.or(`name.ilike.%${safe}%,slug.ilike.%${safe}%`)}
  if(status!=='all')query=query.eq('status',status)
  if(featured!=='all')query=query.eq('is_featured',featured==='yes')
  const map:Record<string,{column:string;ascending:boolean}>={newest:{column:'created_at',ascending:false},oldest:{column:'created_at',ascending:true},name_asc:{column:'name',ascending:true},name_desc:{column:'name',ascending:false},price_asc:{column:'base_price',ascending:true},price_desc:{column:'base_price',ascending:false}}
  const {data,error,count}=await query.order(map[sort].column,{ascending:map[sort].ascending}).limit(100)
  const rows=data??[]
  const media=rows.length?await s.from('product_images').select('product_id,storage_path,alt_text,is_primary,sort_order').in('product_id',rows.map(x=>x.id)).order('sort_order'):null
  const imageMap=new Map<string,string>()
  for(const image of media?.data??[]){if(imageMap.has(image.product_id)&&!image.is_primary)continue;const signed=await s.storage.from('product-media').createSignedUrl(image.storage_path,900);if(signed.data?.signedUrl)imageMap.set(image.product_id,signed.data.signedUrl)}
  const published=rows.filter(x=>x.status==='published').length
  const drafts=rows.filter(x=>x.status==='draft').length
  return <main className="zorah-product-centre">
    <header className="zorah-admin-page-header"><div><Link href="/admin" className="brand">ZORAH</Link><span>Product Centre</span></div><div className="header-actions"><Link href="/admin/categories" className="header-link">Categories</Link><Link href="/admin" className="header-link">Dashboard</Link></div></header>
    <section className="product-centre-content">
      <div className="product-centre-hero"><div><p className="product-centre-kicker">Catalogue management</p><h1>Products</h1><p>Build and maintain the live Zorah catalogue. Add products, photography, variants, pricing and stock from one workspace.</p></div><Link href="/admin/products/new" className="add-product-button"><span>＋</span> Add product</Link></div>
      <div className="product-centre-stats"><div><span>Total products</span><strong>{count??0}</strong></div><div><span>Published</span><strong>{published}</strong></div><div><span>Drafts</span><strong>{drafts}</strong></div><div><span>Featured</span><strong>{rows.filter(x=>x.is_featured).length}</strong></div></div>
      <div className="product-centre-toolbar"><ProductCatalogueFilters total={count??0}/></div>
      <div className="product-list-card">
        <div className="product-list-heading"><div><span>CATALOGUE</span><h2>All products</h2></div><Link href="/admin/products/new" className="small-add">＋ New product</Link></div>
        {error?<div className="catalogue-error">Catalogue could not be loaded.</div>:rows.length?<div className="catalogue-table"><div className="catalogue-table-head"><span>Product</span><span>Category</span><span>Status</span><span>Price</span><span>Actions</span></div>{rows.map(product=>{const category=Array.isArray(product.category)?product.category[0]?.name:'Handbags';const image=imageMap.get(product.id);return <div key={product.id} className="catalogue-row"><div className="catalogue-product"><div className="catalogue-thumb">{image?<img src={image} alt=""/>:<span>Z</span>}</div><div><strong>{product.name}</strong><small>/{product.slug}</small></div></div><span className="catalogue-category">{category??'Handbags'}</span><span className={`catalogue-status ${product.status}`}>{product.status}</span><strong className="catalogue-price">{product.currency} {Number(product.base_price).toLocaleString('en-NG')}</strong><div className="catalogue-actions"><Link href={`/admin/products/${product.id}`}>Edit</Link><form action={deleteProduct}><input type="hidden" name="id" value={product.id}/><button type="submit">Delete</button></form></div></div>})}</div>:<div className="catalogue-empty"><div className="empty-icon">＋</div><h2>Your catalogue is empty</h2><p>Add your first Zorah handbag, assign its category and upload the photography customers will see.</p><Link href="/admin/products/new" className="add-product-button">＋ Add your first product</Link></div>}
      </div>
      <div className="publishing-help"><strong>How a product reaches customers</strong><span>Create → add photography → choose a category → set stock/variants → publish. Only published products with readable media are shown in the storefront.</span></div>
    </section>
  </main>
}
