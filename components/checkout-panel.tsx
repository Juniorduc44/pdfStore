'use client'

import { useEffect, useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

import { LivePriceBlock } from '@/components/live-price-block'
import { formatConfiguredPrice, formatSats } from '@/lib/format'
import type { ProductPricing } from '@/types/product'

type CheckoutPanelProps = {
  slug: string
  priceSats: number
  pricing: ProductPricing
}

type CheckoutState = {
  amountSats: number
  paymentRequest: string
  sessionToken: string
  expiresAt: number
}

export function CheckoutPanel({ slug, priceSats, pricing }: CheckoutPanelProps) {
  const [origin, setOrigin] = useState('')
  const [checkout, setCheckout] = useState<CheckoutState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'pending' | 'paid' | 'error'>('idle')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const payUrl = origin ? `${origin}/api/lnurl/pay/${slug}` : ''
  const lightningUri = payUrl ? `lightning:${payUrl}` : ''
  const bolt11Uri = checkout ? `lightning:${checkout.paymentRequest}` : ''
  const expiresLabel = checkout
    ? new Date(checkout.expiresAt).toLocaleString()
    : ''

  useEffect(() => {
    if (!checkout || status === 'paid') {
      return
    }

    let active = true
    const poll = async () => {
      try {
        const response = await fetch(
          `/api/checkout/${slug}/status?session=${encodeURIComponent(checkout.sessionToken)}`,
          { cache: 'no-store' }
        )
        const payload = await response.json()

        if (!active) {
          return
        }

        if (response.ok && payload.status === 'PAID') {
          setStatus('paid')
          setDownloadUrl(payload.downloadUrl)
          setError('')
          return
        }

        if (!response.ok && payload.reason) {
          setStatus('error')
          setError(payload.reason)
        } else {
          setStatus('pending')
        }
      } catch {
        if (active) {
          setStatus('error')
          setError('Unable to refresh payment status.')
        }
      }
    }

    poll()
    const interval = window.setInterval(poll, 5000)

    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [checkout, slug, status])

  const checkoutQrValue = useMemo(() => {
    if (bolt11Uri) {
      return bolt11Uri
    }

    return lightningUri
  }, [bolt11Uri, lightningUri])

  async function startCheckout() {
    setIsLoading(true)
    setError('')
    setStatus('idle')
    setDownloadUrl('')

    try {
      const response = await fetch(`/api/checkout/${slug}`, {
        method: 'POST'
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.reason ?? 'Unable to start checkout.')
      }

      setCheckout({
        amountSats: payload.amountSats,
        paymentRequest: payload.paymentRequest,
        sessionToken: payload.sessionToken,
        expiresAt: payload.expiresAt
      })
      setStatus('pending')
    } catch (checkoutError) {
      setStatus('error')
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : 'Unable to start checkout.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function refreshStatus() {
    if (!checkout) {
      return
    }

    setStatus('pending')

    try {
      const response = await fetch(
        `/api/checkout/${slug}/status?session=${encodeURIComponent(checkout.sessionToken)}`,
        { cache: 'no-store' }
      )
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.reason ?? 'Unable to refresh payment status.')
      }

      if (payload.status === 'PAID') {
        setStatus('paid')
        setDownloadUrl(payload.downloadUrl)
        setError('')
        return
      }

      setStatus('pending')
    } catch (refreshError) {
      setStatus('error')
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : 'Unable to refresh payment status.'
      )
    }
  }

  return (
    <section className="checkout-panel">
      <div className="checkout-copy">
        <span className="section-kicker">Paywall checkout</span>
        <h2>{formatConfiguredPrice(pricing.amount, pricing.currency)}</h2>
        <p>
          Start a checkout session to generate an invoice, then pay from your
          wallet. This panel will watch settlement and reveal the download link
          as soon as payment clears.
        </p>
        <LivePriceBlock priceSats={priceSats} pricing={pricing} />
        <div className="checkout-actions">
          <button
            className="button primary"
            disabled={isLoading}
            onClick={startCheckout}
            type="button"
          >
            {isLoading ? 'Preparing invoice…' : checkout ? 'Generate new invoice' : 'Buy now'}
          </button>
          {checkout ? (
            <button className="button secondary" onClick={refreshStatus} type="button">
              I paid, unlock download
            </button>
          ) : null}
        </div>
        {checkout ? (
          <div className="checkout-status">
            <span>
              Invoice amount: {formatSats(checkout.amountSats)} sats
            </span>
            <span>
              Session expires: {expiresLabel}
            </span>
            {status === 'pending' ? <span>Waiting for payment confirmation.</span> : null}
            {status === 'paid' ? <span>Payment confirmed. Download unlocked below.</span> : null}
            {status === 'error' && error ? <span className="currency-note error">{error}</span> : null}
          </div>
        ) : (
          <div className="checkout-status">
            <span>Locked PDF download</span>
            <span>Preview stays public. Paid file stays private until settlement.</span>
          </div>
        )}
        {downloadUrl ? (
          <div className="download-unlock">
            <a className="button primary" href={downloadUrl}>
              Download purchased PDF
            </a>
          </div>
        ) : null}
      </div>

      <div className="checkout-qr">
        {checkoutQrValue ? (
          <QRCodeSVG
            bgColor="#f6f1e8"
            fgColor="#1a120b"
            includeMargin
            size={220}
            value={checkoutQrValue}
          />
        ) : (
          <div className="qr-placeholder">Preparing checkout…</div>
        )}
        <code>{checkout?.paymentRequest || payUrl || 'Loading…'}</code>
        {checkout ? (
          <a className="button tertiary" href={bolt11Uri}>
            Open invoice in wallet
          </a>
        ) : (
          <a className="button tertiary" href={lightningUri}>
            Open LNURL in wallet
          </a>
        )}
      </div>
    </section>
  )
}
