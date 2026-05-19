'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

import {
  POPULAR_DISPLAY_CURRENCIES,
  normalizeCurrencyCode,
  type RatesSnapshot
} from '@/lib/currency'

type CurrencyContextValue = {
  selectedCurrency: string
  setSelectedCurrency: (currency: string) => void
  rates: Record<string, number> | null
  ratesDate: string | null
  isLoading: boolean
  error: string | null
  popularCurrencies: readonly string[]
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [selectedCurrency, setSelectedCurrencyState] = useState('USD')
  const [rates, setRates] = useState<Record<string, number> | null>(null)
  const [ratesDate, setRatesDate] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const stored = window.localStorage.getItem('pdf-store.currency')

    if (stored) {
      setSelectedCurrencyState(normalizeCurrencyCode(stored))
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadRates() {
      try {
        const response = await fetch('/api/rates', { cache: 'no-store' })
        const payload = (await response.json()) as RatesSnapshot & {
          status?: string
          reason?: string
        }

        if (!response.ok) {
          throw new Error(payload.reason ?? 'Failed to load currency rates.')
        }

        if (!cancelled) {
          setRates(payload.rates)
          setRatesDate(payload.date)
          setError(null)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Failed to load currency rates.'
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadRates()
    const intervalId = window.setInterval(loadRates, 5 * 60 * 1000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [])

  const value = useMemo<CurrencyContextValue>(() => ({
    selectedCurrency,
    setSelectedCurrency: (currency: string) => {
      const normalized = normalizeCurrencyCode(currency)
      window.localStorage.setItem('pdf-store.currency', normalized)
      setSelectedCurrencyState(normalized)
    },
    rates,
    ratesDate,
    isLoading,
    error,
    popularCurrencies: POPULAR_DISPLAY_CURRENCIES
  }), [error, isLoading, rates, ratesDate, selectedCurrency])

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)

  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider.')
  }

  return context
}
