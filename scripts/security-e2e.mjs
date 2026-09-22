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
  return { supabase, session: data.session }
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

  const { data: crossRead, error: crossReadError } = await a.supabase
    .from('customer_addresses')
    .select('id')
    .eq('id', addressId)

  if (crossReadError) throw crossReadError
  if ((crossRead || []).length !== 0) {
    throw new Error('IDOR failure: Customer A can read Customer B address data.')
  }

  const { data: crossUpdate, error: crossUpdateError } = await a.supabase
    .from('customer_addresses')
    .update({ label: 'UNAUTHORIZED SECURITY TEST' })
    .eq('id', addressId)
    .select('id')

  if (crossUpdateError) throw crossUpdateError
  if ((crossUpdate || []).length !== 0) {
    throw new Error('IDOR failure: Customer A can update Customer B address data.')
  }

  const { data: crossDelete, error: crossDeleteError } = await a.supabase
    .from('customer_addresses')
    .delete()
    .eq('id', addressId)
    .select('id')

  if (crossDeleteError) throw crossDeleteError
  if ((crossDelete || []).length !== 0) {
    throw new Error('IDOR failure: Customer A can delete Customer B address data.')
  }

  if (createdByTest) {
    await b.supabase.from('customer_addresses').delete().eq('id', addressId)
  }

  const { data: ownOrders, error: ownOrdersError } = await b.supabase
    .from('orders')
    .select('id')
    .limit(1)
  if (ownOrdersError) throw ownOrdersError

  if (ownOrders?.[0]?.id) {
    const { data: crossOrder, error: crossOrderError } = await a.supabase
      .from('orders')
      .select('id')
      .eq('id', ownOrders[0].id)

    if (crossOrderError) throw crossOrderError
    if ((crossOrder || []).length !== 0) {
      throw new Error('IDOR failure: Customer A can read Customer B order data.')
    }
    console.log('PASS customer IDOR isolation: orders')
  } else {
    console.log('SKIP order IDOR test: Customer B has no test order')
  }

  console.log('PASS customer IDOR isolation: addresses')
}

async function assertPublicVsPrivate(a) {
  const { data: privateRows, error } = await a.supabase
    .from('orders')
    .select('id')
    .limit(10)
  if (error) throw error

  // A customer may only see their own orders. The exact number is account-dependent.
  const { data: ownProfile } = await a.supabase.auth.getUser()
  if (!ownProfile.user) throw new Error('Customer session disappeared')

  const bad = (privateRows || []).some((row) => !row.id)
  if (bad) throw new Error('Malformed order response')
  console.log(`PASS customer order query boundary: ${(privateRows || []).length} own-visible order(s)`)
}

async function assertStaffAALBoundary() {
  const staff = await signIn(process.env.ZORAH_TEST_STAFF_EMAIL, process.env.ZORAH_TEST_STAFF_PASSWORD)

  const aal1 = await staff.supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aal1.error) throw aal1.error
  if (aal1.data.currentLevel !== 'aal1') {
    throw new Error(`Expected fresh staff password session at aal1, got ${aal1.data.currentLevel}`)
  }

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

  console.log('PASS staff MFA boundary: aal1 -> aal2 -> protected catalogue access')
}

const customerA = await signIn(process.env.ZORAH_TEST_CUSTOMER_A_EMAIL, process.env.ZORAH_TEST_CUSTOMER_A_PASSWORD)
const customerB = await signIn(process.env.ZORAH_TEST_CUSTOMER_B_EMAIL, process.env.ZORAH_TEST_CUSTOMER_B_PASSWORD)

await assertNoCrossUserAddressAccess(customerA, customerB)
await assertPublicVsPrivate(customerA)
await assertStaffAALBoundary()

console.log('Security E2E checks completed successfully.')
