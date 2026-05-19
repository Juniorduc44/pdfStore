import type { Product } from '@/types/product'

import { convertPricedAmountToSats, fetchBtcRates } from '@/lib/currency'

export async function resolveCurrentProductPrice(product: Product): Promise<{
  amountSats: number
  amountMsats: number
  rateDate: string
}> {
  const pricingCurrency = product.pricing.currency.toUpperCase()

  if (pricingCurrency === 'SATS') {
    return {
      amountSats: Math.round(product.pricing.amount),
      amountMsats: Math.round(product.pricing.amount) * 1000,
      rateDate: 'static'
    }
  }

  if (pricingCurrency === 'BTC') {
    const amountSats = Math.round(product.pricing.amount * 100_000_000)
    return {
      amountSats,
      amountMsats: amountSats * 1000,
      rateDate: 'static'
    }
  }

  const rates = await fetchBtcRates()
  const amountSats = convertPricedAmountToSats(
    product.pricing.amount,
    product.pricing.currency,
    rates.rates
  )

  return {
    amountSats,
    amountMsats: amountSats * 1000,
    rateDate: rates.date
  }
}
