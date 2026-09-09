import crypto from 'node:crypto'

const PAYSTACK_BASE_URL = 'https://api.paystack.co'

export type PaystackTransaction = {
  id?: number
  status?: string
  reference?: string
  amount?: number
  currency?: string
  channel?: string
  paid_at?: string | null
  gateway_response?: string | null
  fees?: number
  requested_amount?: number
}

export function getPaystackSecret() {
  return process.env.PAYSTACK_SECRET_KEY?.trim() || null
}

export async function initializePaystackTransaction(input: { email: string; amountNaira: number; currency: string; reference: string; callbackUrl: string }) {
  const secret = getPaystackSecret()
  if (!secret) return { configured: false as const }
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: input.email, amount: Math.round(input.amountNaira * 100), currency: input.currency, reference: input.reference, callback_url: input.callbackUrl }),
    cache: 'no-store',
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || !result?.status || !result?.data?.authorization_url) throw new Error(typeof result?.message === 'string' ? result.message : 'Paystack could not initialize the transaction.')
  return { configured: true as const, authorizationUrl: result.data.authorization_url as string, accessCode: typeof result.data.access_code === 'string' ? result.data.access_code : null, channel: typeof result.data.channel === 'string' ? result.data.channel : null }
}

export async function verifyPaystackTransaction(reference: string) {
  const secret = getPaystackSecret()
  if (!secret) return { configured: false as const, ok: false, data: null as PaystackTransaction | null, message: 'Paystack is not configured.' }
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' }, cache: 'no-store' })
  const result = await response.json().catch(() => null)
  return { configured: true as const, ok: response.ok && result?.status === true, data: (result?.data ?? null) as PaystackTransaction | null, message: typeof result?.message === 'string' ? result.message : null }
}

export async function createPaystackRefund(input: { transaction: string | number; amountNaira?: number; currency?: string; customerNote?: string; merchantNote?: string }) {
  const secret = getPaystackSecret()
  if (!secret) throw new Error('Paystack is not configured.')
  const body: Record<string, unknown> = { transaction: input.transaction }
  if (input.amountNaira !== undefined) body.amount = Math.round(input.amountNaira * 100)
  if (input.currency) body.currency = input.currency
  if (input.customerNote) body.customer_note = input.customerNote
  if (input.merchantNote) body.merchant_note = input.merchantNote
  const response = await fetch(`${PAYSTACK_BASE_URL}/refund`, { method: 'POST', headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store' })
  const result = await response.json().catch(() => null)
  if (!response.ok || result?.status !== true) throw new Error(typeof result?.message === 'string' ? result.message : 'Refund could not be initiated.')
  return result.data
}

export function verifyPaystackSignature(rawBody: string, signature: string | null) {
  const secret = getPaystackSecret()
  if (!secret || !signature) return false
  const expected = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')
  const received = signature.trim().toLowerCase()
  if (expected.length !== received.length) return false
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received))
}
