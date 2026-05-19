'use client'

import { FormEvent, useMemo, useState } from 'react'

import { useCurrency } from '@/components/currency-provider'
import { normalizeCurrencyCode } from '@/lib/currency'

export function CurrencySwitcher() {
  const {
    selectedCurrency,
    setSelectedCurrency,
    rates,
    error,
    popularCurrencies
  } = useCurrency()
  const [customCode, setCustomCode] = useState('')
  const [customError, setCustomError] = useState<string | null>(null)

  const selectValue = useMemo(() => {
    return popularCurrencies.includes(selectedCurrency as never)
      ? selectedCurrency
      : 'CUSTOM'
  }, [popularCurrencies, selectedCurrency])

  function applyCustomCurrency(event: FormEvent) {
    event.preventDefault()
    const normalized = normalizeCurrencyCode(customCode)

    if (!normalized) {
      setCustomError('Enter a currency code.')
      return
    }

    if (normalized !== 'SATS' && normalized !== 'BTC' && !rates?.[normalized.toLowerCase()]) {
      setCustomError('Currency not found in the live rate feed.')
      return
    }

    setSelectedCurrency(normalized)
    setCustomCode('')
    setCustomError(null)
  }

  return (
    <div className="currency-switcher">
      <label className="currency-select">
        <span>Display</span>
        <select
          onChange={(event) => {
            const value = event.target.value
            if (value !== 'CUSTOM') {
              setSelectedCurrency(value)
              setCustomError(null)
            }
          }}
          value={selectValue}
        >
          {popularCurrencies.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
          <option value="CUSTOM">Custom</option>
        </select>
      </label>

      <form className="custom-currency-form" onSubmit={applyCustomCurrency}>
        <input
          maxLength={5}
          onChange={(event) => setCustomCode(event.target.value.toUpperCase())}
          placeholder={selectValue === 'CUSTOM' ? selectedCurrency : 'ISO code'}
          value={customCode}
        />
        <button className="button secondary mini" type="submit">
          Use
        </button>
      </form>

      {customError ? <span className="currency-note error">{customError}</span> : null}
      {!customError && error ? <span className="currency-note error">{error}</span> : null}
    </div>
  )
}
