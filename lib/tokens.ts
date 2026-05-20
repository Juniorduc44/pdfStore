import { createHmac, timingSafeEqual } from 'crypto'

import { getDownloadTokenSecret } from '@/lib/env'

type DownloadTokenPayload = {
  slug: string
  checkingId: string
  expiresAt: number
}

type PriceQuotePayload = {
  slug: string
  amountSats: number
  amountMsats: number
  currency: string
  pricedAmount: number
  expiresAt: number
}

type CheckoutSessionPayload = {
  slug: string
  checkingId: string
  amountSats: number
  expiresAt: number
}

function encode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function decode(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function sign(payload: string): string {
  return createHmac('sha256', getDownloadTokenSecret())
    .update(payload)
    .digest('base64url')
}

export function createDownloadToken(payload: DownloadTokenPayload): string {
  const encodedPayload = encode(JSON.stringify(payload))
  const signature = sign(encodedPayload)
  return `${encodedPayload}.${signature}`
}

export function verifyDownloadToken(token: string): DownloadTokenPayload | null {
  const [encodedPayload, signature] = token.split('.')

  if (!encodedPayload || !signature) {
    return null
  }

  const expected = sign(encodedPayload)
  const receivedBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    return null
  }

  const payload = JSON.parse(decode(encodedPayload)) as DownloadTokenPayload

  if (payload.expiresAt <= Date.now()) {
    return null
  }

  return payload
}

export function createPriceQuoteToken(payload: PriceQuotePayload): string {
  const encodedPayload = encode(JSON.stringify(payload))
  const signature = sign(encodedPayload)
  return `${encodedPayload}.${signature}`
}

export function verifyPriceQuoteToken(token: string): PriceQuotePayload | null {
  const [encodedPayload, signature] = token.split('.')

  if (!encodedPayload || !signature) {
    return null
  }

  const expected = sign(encodedPayload)
  const receivedBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    return null
  }

  const payload = JSON.parse(decode(encodedPayload)) as PriceQuotePayload

  if (payload.expiresAt <= Date.now()) {
    return null
  }

  return payload
}

export function createCheckoutSessionToken(
  payload: CheckoutSessionPayload
): string {
  const encodedPayload = encode(JSON.stringify(payload))
  const signature = sign(encodedPayload)
  return `${encodedPayload}.${signature}`
}

export function verifyCheckoutSessionToken(
  token: string
): CheckoutSessionPayload | null {
  const [encodedPayload, signature] = token.split('.')

  if (!encodedPayload || !signature) {
    return null
  }

  const expected = sign(encodedPayload)
  const receivedBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    return null
  }

  const payload = JSON.parse(decode(encodedPayload)) as CheckoutSessionPayload

  if (payload.expiresAt <= Date.now()) {
    return null
  }

  return payload
}
