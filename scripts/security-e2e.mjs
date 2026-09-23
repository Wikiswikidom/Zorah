import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'

const required = [
  'ZORAH_SUPABASE_URL',
  'ZORAH_SUPABASE_PUBLISHABLE_KEY',
  'ZORAH_TEST_CUSTOMER_A_EMAIL',
  'ZORAH_TEST_CUSTOMER_A_PASSWORD',
  'ZORAH_TEST_CUSTOMER_B_EMAIL',
  'ZORAH_TEST_CUSTOMER_B_PASSWORD',
  'ZORAH_TEST_STAFF_EMAIL',
  'ZORAH_TEST_STAFF_PASSWORD',
  'ZORAH_TEST_STAFF_TOTP_SECRET',
]

for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required test secret: ${key}`)
}

const url = process.env.ZORAH_SUPABASE_URL
const key = process.env.ZORAH_SUPABASE_PUBLISHABLE_KEY

function client() {
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}

function base32Decode(input) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const clean = input.toUpperCase().replace(/=+$/g, '').replace(/[^A-Z2-7]/g, '')
  let bits = ''
  for (const char of clean) {
    const value = alphabet.indexOf(char)
    if (value < 0) throw new Error('Invalid TOTP secret')
    bits += value.toString(2).padStart(5, '0')
  }
  const bytes = []
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2))
  return Buffer.from(bytes)
}

function totp(secret, time = Date.now()) {
  const counter = Math.floor(time / 1000 / 30)
  const buffer = Buffer.alloc(8)
  buffer.writeBigUInt64BE(BigInt(counter))
  const digest = crypto.createHmac('sha1', base32Decode(secret)).update(buffer).digest()
  const offset = digest[digest.length - 1] & 0x0f
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff)
  return String(binary % 1_000_000).padStart(6, '0')
}

async function signIn(email, password) {
  const supabase = client()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.session) throw new Error(`Login failed for ${email}: ${error?.message || 'no session'}`)
  return { supabase, session: data.session, user: data.user }
}

async function assertCrossUserDenied(label, query) {
  const { data, error } = await query
  if (error) throw error
  if ((data || []).length !== 0) throw new Error(`IDOR failure: Customer A can access Customer B ${label}.`)
  console.log(`PASS customer isolation: ${label}`)
}

async function assertNoCrossUserAddressAccess(a, b) {
  const { data: own, error: ownError } = await b.supabase
    .from('customer_addresses')
    .select('id')
    .limit(1)
  if (ownError) throw ownError

  let addressId = own?.[0]?.id
  let createdByTest = false

  if (!addressId) {
    const { data: created, error } = await b.supabase
      .from('customer_addresses')
      .insert({
        label: 'Security Test',
        full_name: 'Zorah Security Test',
        phone: '+2348000000000',
        address_line1: 'Security Test Address',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
        is_default: false,
      })
      .select('id')
      .single()
    if (error || !created) throw error || new Error('Could not create test address')
    addressId = created.id
    createdByTest = true
  }

  await assertCrossUserDenied('address reads', a.supabase.from('customer_addresses').select('id').eq('id', addressId))
  await assertCrossUserDenied(
    'address updates',
    a.supabase.from('customer_addresses').update({ label: 'UNAUTHORIZED SECURITY TEST' }).eq('id', addressId).select('id'),
  )
  await assertCrossUserDenied('address deletes', a.supabase.from('customer_addresses').delete().eq('id', addressId).select('id'))

  if (createdByTest) {
    await b.supabase.from('customer_addresses').delete().eq('id', addressId)
  }
}

async function assertCustomerPrivateCollections(a, b) {
  const { data: bCart, error: cartError } = await b.supabase.from('customer_cart').select('product_slug,variant').limit(1)
  if (cartError) throw cartError
  if (bCart?.[0]) {
    const row = bCart[0]
    await assertCrossUserDenied('cart reads', a.supabase.from('customer_cart').select('user_id').eq('user_id', b.user.id).eq('product_slug', row.product_slug).eq('variant', row.variant))
    await assertCrossUserDenied('cart updates', a.supabase.from('customer_cart').update({ quantity: 99 }).eq('user_id', b.user.id).eq('product_slug', row.product_slug).eq('variant', row.variant).select('user_id'))
    await assertCrossUserDenied('cart deletes', a.supabase.from('customer_cart').delete().eq('user_id', b.user.id).eq('product_slug', row.product_slug).eq('variant', row.variant).select('user_id'))
  } else {
    console.log('SKIP cart IDOR test: Customer B has no cart item')
  }

  const { data: bWishlist, error: wishlistError } = await b.supabase.from('customer_wishlists').select('product_id').limit(1)
  if (wishlistError) throw wishlistError
  if (bWishlist?.[0]) {
    const productId = bWishlist[0].product_id
    await assertCrossUserDenied('wishlist reads', a.supabase.from('customer_wishlists').select('user_id').eq('user_id', b.user.id).eq('product_id', productId))
    await assertCrossUserDenied('wishlist deletes', a.supabase.from('customer_wishlists').delete().eq('user_id', b.user.id).eq('product_id', productId).select('user_id'))
  } else {
    console.log('SKIP wishlist IDOR test: Customer B has no wishlist item')
  }

  const { data: bViewed, error: viewedError } = await b.supabase.from('customer_recently_viewed').select('product_id').limit(1)
  if (viewedError) throw viewedError
  if (bViewed?.[0]) {
    const productId = bViewed[0].product_id
    await assertCrossUserDenied('recently-viewed reads', a.supabase.from('customer_recently_viewed').select('user_id').eq('user_id', b.user.id).eq('product_id', productId))
    await assertCrossUserDenied('recently-viewed deletes', a.supabase.from('customer_recently_viewed').delete().eq('user_id', b.user.id).eq('product_id', productId).select('user_id'))
  } else {
    console.log('SKIP recently-viewed IDOR test: Customer B has no record')
  }

  const { data: bWaitlist, error: waitlistError } = await b.supabase.from('product_waitlists').select('id').limit(1)
  if (waitlistError) throw waitlistError
  if (bWaitlist?.[0]) {
    const waitlistId = bWaitlist[0].id
    await assertCrossUserDenied('waitlist reads', a.supabase.from('product_waitlists').select('id').eq('id', waitlistId))
    await assertCrossUserDenied('waitlist updates', a.supabase.from('product_waitlists').update({ status: 'cancelled' }).eq('id', waitlistId).select('id'))
  } else {
    console.log('SKIP waitlist IDOR test: Customer B has no waitlist record')
  }
}

async function assertOrderIsolation(a, b) {
  const { data: ownOrders, error: ownOrdersError } = await b.supabase
    .from('orders')
    .select('id')
    .limit(1)
  if (ownOrdersError) throw ownOrdersError

  if (!ownOrders?.[0]?.id) {
    console.log('SKIP order/payment IDOR tests: Customer B has no test order')
    return
  }

  const orderId = ownOrders[0].id
  await assertCrossUserDenied('order reads', a.supabase.from('orders').select('id').eq('id', orderId))
  await assertCrossUserDenied('order updates', a.supabase.from('orders').update({ customer_note: 'UNAUTHORIZED SECURITY TEST' }).eq('id', orderId).select('id'))
  await assertCrossUserDenied('order deletes', a.supabase.from('orders').delete().eq('id', orderId).select('id'))
  await assertCrossUserDenied('order item reads', a.supabase.from('order_items').select('id').eq('order_id', orderId))
  await assertCrossUserDenied('order history reads', a.supabase.from('order_status_history').select('id').eq('order_id', orderId))
  await assertCrossUserDenied('payment reads', a.supabase.from('payments').select('id').eq('order_id', orderId))
}

async function assertProfileIsolation(a, b) {
  await assertCrossUserDenied('profile reads', a.supabase.from('profiles').select('id').eq('id', b.user.id))
  await assertCrossUserDenied('profile updates', a.supabase.from('profiles').update({ full_name: 'UNAUTHORIZED SECURITY TEST' }).eq('id', b.user.id).select('id'))
  await assertCrossUserDenied('profile privilege changes', a.supabase.from('profiles').update({ role: 'super_admin' }).eq('id', b.user.id).select('id'))
}

async function assertPublicVsPrivate(a) {
  const { data: privateRows, error } = await a.supabase
    .from('orders')
    .select('id, user_id')
    .limit(10)
  if (error) throw error

  const bad = (privateRows || []).some((row) => row.user_id !== a.user.id)
  if (bad) throw new Error('Customer order query returned another customer\'s order')
  console.log(`PASS customer order query boundary: ${(privateRows || []).length} own-visible order(s)`)
}

async function assertStaffAALBoundary() {
  const staff = await signIn(process.env.ZORAH_TEST_STAFF_EMAIL, process.env.ZORAH_TEST_STAFF_PASSWORD)

  const aal1 = await staff.supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aal1.error) throw aal1.error
  if (aal1.data.currentLevel !== 'aal1') {
    throw new Error(`Expected fresh staff password session at aal1, got ${aal1.data.currentLevel}`)
  }

  const { data: aal1Products, error: aal1ProductError } = await staff.supabase
    .from('products')
    .select('id')
    .limit(1)
  if (aal1ProductError) throw aal1ProductError
  if ((aal1Products || []).length !== 0) {
    throw new Error('MFA bypass: staff at AAL1 can read protected catalogue data')
  }
  console.log('PASS staff MFA boundary: AAL1 cannot read protected catalogue data')

  const factors = await staff.supabase.auth.mfa.listFactors()
  if (factors.error) throw factors.error
  const factor = factors.data.totp.find((item) => item.status === 'verified')
  if (!factor) throw new Error('No verified staff TOTP factor found')

  const challenge = await staff.supabase.auth.mfa.challenge({ factorId: factor.id })
  if (challenge.error || !challenge.data?.id) throw challenge.error || new Error('MFA challenge failed')

  const verification = await staff.supabase.auth.mfa.verify({
    factorId: factor.id,
    challengeId: challenge.data.id,
    code: totp(process.env.ZORAH_TEST_STAFF_TOTP_SECRET),
  })
  if (verification.error) throw verification.error

  await staff.supabase.auth.refreshSession()

  const aal2 = await staff.supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aal2.error) throw aal2.error
  if (aal2.data.currentLevel !== 'aal2') {
    throw new Error(`Expected staff session at aal2 after TOTP, got ${aal2.data.currentLevel}`)
  }

  const { data: products, error: productsError } = await staff.supabase
    .from('products')
    .select('id')
    .limit(1)
  if (productsError) throw productsError
  if (!products?.length) throw new Error('AAL2 staff session could not read protected catalogue data')

  console.log('PASS staff MFA boundary: AAL1 denied -> TOTP -> AAL2 protected catalogue access')
}

const customerA = await signIn(process.env.ZORAH_TEST_CUSTOMER_A_EMAIL, process.env.ZORAH_TEST_CUSTOMER_A_PASSWORD)
const customerB = await signIn(process.env.ZORAH_TEST_CUSTOMER_B_EMAIL, process.env.ZORAH_TEST_CUSTOMER_B_PASSWORD)

await assertNoCrossUserAddressAccess(customerA, customerB)
await assertProfileIsolation(customerA, customerB)
await assertCustomerPrivateCollections(customerA, customerB)
await assertOrderIsolation(customerA, customerB)
await assertPublicVsPrivate(customerA)
await assertStaffAALBoundary()

console.log('Security E2E checks completed successfully.')
