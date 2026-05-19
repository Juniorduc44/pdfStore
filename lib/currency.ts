import { getAppUrl } from '@/lib/env'

export const SATS_PER_BTC = 100_000_000
export const POPULAR_DISPLAY_CURRENCIES = [
  'SATS',
  'BTC',
  'USD',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
  'JPY'
] as const

type CurrencyApiResponse = {
  date: string
  btc: Record<string, number>
}

export type RatesSnapshot = {
  date: string
  rates: Record<string, number>
}

function getCurrencyApiRoot(): string {
  return (
    process.env.CURRENCY_API_ROOT ??
    'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1'
  ).replace(/\/$/, '')
}

export function normalizeCurrencyCode(value: string): string {
  return value.trim().toUpperCase()
}

export async function fetchBtcRates(): Promise<RatesSnapshot> {
  const response = await fetch(
    `${getCurrencyApiRoot()}/currencies/btc.json`,
    { cache: 'no-store' }
  )

  if (!response.ok) {
    throw new Error(`Currency API request failed with ${response.status}.`)
  }

  const payload = (await response.json()) as CurrencyApiResponse

  return {
    date: payload.date,
    rates: payload.btc
  }
}

export function convertPricedAmountToSats(
  amount: number,
  currency: string,
  rates: Record<string, number>
): number {
  const normalized = normalizeCurrencyCode(currency)

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Price amount must be positive.')
  }

  if (normalized === 'SATS') {
    return Math.round(amount)
  }

  if (normalized === 'BTC') {
    return Math.round(amount * SATS_PER_BTC)
  }

  const rate = rates[normalized.toLowerCase()]

  if (!rate || rate <= 0) {
    throw new Error(`Unsupported currency code: ${normalized}`)
  }

  return Math.round((amount / rate) * SATS_PER_BTC)
}

export function convertSatsToDisplayAmount(
  sats: number,
  currency: string,
  rates: Record<string, number>
): number {
  const normalized = normalizeCurrencyCode(currency)

  if (normalized === 'SATS') {
    return sats
  }

  if (normalized === 'BTC') {
    return sats / SATS_PER_BTC
  }

  const rate = rates[normalized.toLowerCase()]

  if (!rate || rate <= 0) {
    throw new Error(`Unsupported currency code: ${normalized}`)
  }

  return (sats / SATS_PER_BTC) * rate
}

export function formatSelectedCurrencyAmount(
  amount: number,
  currency: string
): string {
  const normalized = normalizeCurrencyCode(currency)

  if (normalized === 'SATS') {
    return `${new Intl.NumberFormat('en-US').format(Math.round(amount))} sats`
  }

  if (normalized === 'BTC') {
    return `${amount.toFixed(8).replace(/0+$/, '').replace(/\.$/, '')} BTC`
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: normalized,
    maximumFractionDigits: 2
  }).format(amount)
}

export function getRatesApiUrl(): string {
  return `${getAppUrl()}/api/rates`
}
