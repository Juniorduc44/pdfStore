import crypto from 'crypto'

type OpenNodeCharge = {
  id: string
  status: string
  amount: number
  currency: string
  order_id: string
  hosted_checkout_url?: string
  success_url?: string
  lightning_invoice?: {
    payreq: string
    expires_at: number
  }
  uri?: string
}

type OpenNodeCreateChargeParams = {
  amount: number | string
  currency: string
  description: string
  orderId: string
  callbackUrl: string
  successUrl: string
  ttl?: number
}

type OpenNodeResponse<T> = {
  data: T
}

function getOpenNodeApiUrl(): string {
  return (
    process.env.OPENNODE_API_URL ??
    'https://api.opennode.com'
  ).replace(/\/$/, '')
}

function getOpenNodeApiKey(): string {
  const value = process.env.OPENNODE_API_KEY

  if (!value) {
    throw new Error('Missing required environment variable: OPENNODE_API_KEY')
  }

  return value
}

async function openNodeFetch<T>(
  path: string,
  init: RequestInit & { body?: string }
): Promise<T> {
  const response = await fetch(`${getOpenNodeApiUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: getOpenNodeApiKey(),
      'Content-Type': 'application/json',
      ...(init.headers ?? {})
    },
    cache: 'no-store'
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenNode request failed (${response.status}): ${errorText}`)
  }

  return (await response.json()) as T
}

export async function createCharge(
  params: OpenNodeCreateChargeParams
): Promise<OpenNodeCharge> {
  const payload = {
    amount: String(params.amount),
    currency: params.currency,
    description: params.description,
    callback_url: params.callbackUrl,
    success_url: params.successUrl,
    order_id: params.orderId,
    auto_settle: false,
    ttl: params.ttl ?? 10
  }

  const response = await openNodeFetch<OpenNodeResponse<OpenNodeCharge>>(
    '/v1/charges',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  )

  return response.data
}

export async function getCharge(id: string): Promise<OpenNodeCharge> {
  const response = await openNodeFetch<OpenNodeResponse<OpenNodeCharge>>(
    `/v2/charge/${id}`,
    {
      method: 'GET'
    }
  )

  return response.data
}

export function verifyChargeWebhook(
  chargeId: string,
  hashedOrder: string
): boolean {
  const calculated = crypto
    .createHmac('sha256', getOpenNodeApiKey())
    .update(chargeId)
    .digest('hex')

  if (hashedOrder.length !== calculated.length) {
    return false
  }

  return crypto.timingSafeEqual(
    Buffer.from(hashedOrder, 'utf8'),
    Buffer.from(calculated, 'utf8')
  )
}
