'use client'

import { useMemo } from 'react'

import { useCurrency } from '@/components/currency-provider'
import {
  convertSatsToDisplayAmount,
  formatSelectedCurrencyAmount,
  normalizeCurrencyCode
} from '@/lib/currency'
import { formatSats } from '@/lib/format'

type LivePriceProps = {
  priceSats: number
  className?: string
  showApproximation?: boolean
}

export function LivePrice({
  priceSats,
  className,
  showApproximation = true
}: LivePriceProps) {
  const { selectedCurrency, rates, isLoading } = useCurrency()

  const displayValue = useMemo(() => {
    const normalized = normalizeCurrencyCode(selectedCurrency)

    if (!rates || isLoading) {
      return `${formatSats(priceSats)} sats`
    }

    try {
      const converted = convertSatsToDisplayAmount(priceSats, normalized, rates)
      const formatted = formatSelectedCurrencyAmount(converted, normalized)

      if (normalized === 'SATS') {
        return formatted
      }

      return showApproximation ? `~${formatted}` : formatted
    } catch {
      return `${formatSats(priceSats)} sats`
    }
  }, [isLoading, priceSats, rates, selectedCurrency, showApproximation])

  return (
    <span className={className}>
      {displayValue}
    </span>
  )
}
