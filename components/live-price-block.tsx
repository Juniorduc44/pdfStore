'use client'

import { useMemo } from 'react'

import { useCurrency } from '@/components/currency-provider'
import {
  convertPricedAmountToSats,
  convertSatsToDisplayAmount,
  formatSelectedCurrencyAmount
} from '@/lib/currency'
import { formatConfiguredPrice, formatSats } from '@/lib/format'
import type { ProductPricing } from '@/types/product'

type LivePriceBlockProps = {
  priceSats: number
  pricing: ProductPricing
  compact?: boolean
}

export function LivePriceBlock({
  priceSats,
  pricing,
  compact = false
}: LivePriceBlockProps) {
  const { selectedCurrency, rates } = useCurrency()
  const currentSats = useMemo(() => {
    if (!rates) {
      return priceSats
    }

    try {
      return convertPricedAmountToSats(pricing.amount, pricing.currency, rates)
    } catch {
      return priceSats
    }
  }, [priceSats, pricing.amount, pricing.currency, rates])

  const selectedValue = useMemo(() => {
    if (!rates) {
      return formatConfiguredPrice(pricing.amount, pricing.currency)
    }

    try {
      if (selectedCurrency.toUpperCase() === pricing.currency.toUpperCase()) {
        return formatConfiguredPrice(pricing.amount, pricing.currency)
      }

      const converted = convertSatsToDisplayAmount(currentSats, selectedCurrency, rates)
      return `~${formatSelectedCurrencyAmount(converted, selectedCurrency)}`
    } catch {
      return formatConfiguredPrice(pricing.amount, pricing.currency)
    }
  }, [currentSats, pricing.amount, pricing.currency, rates, selectedCurrency])

  return (
    <div className={compact ? 'live-price compact' : 'live-price'}>
      <strong>
        {selectedValue}
      </strong>
      <span>
        Current Lightning amount: {formatSats(currentSats)} sats
      </span>
      <span>
        Catalog base price: {formatConfiguredPrice(pricing.amount, pricing.currency)}
      </span>
      {selectedCurrency.toUpperCase() !== pricing.currency.toUpperCase() ? (
        <span>
          Display currency: {selectedCurrency.toUpperCase()}
        </span>
      ) : null}
    </div>
  )
}
