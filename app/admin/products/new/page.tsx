import Link from 'next/link'
import { requireRole } from '@/lib/auth/authorization'
import ProductForm from '../product-form'

export default async function NewProductPage(){await requireRole(['catalog_admin']);return <main className="zorah-product-editor"><header className="zorah-admin-topbar"><div><Link href="/admin/products" className="brand">ZORAH</Link><div className="links"><Link href="/admin/products" className="pill">Catalogue</Link><Link href="/admin/categories" className="pill">Categories</Link><Link href="/admin" className="pill">Dashboard</Link></div></div></header><section><div className="editor-head"><div><p className="editor-kicker">Catalogue / Products</p><h1 className="editor-title">Add a new product</h1><p className="editor-note">Create the catalogue record first. After saving, you will go directly to the product workspace to upload photography, create variants and publish the piece.</p></div></div><ProductForm/></section></main>}
