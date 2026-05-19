'use client'

import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

import { LivePriceBlock } from '@/components/live-price-block'
import { formatConfiguredPrice } from '@/lib/format'
import type { ProductPricing } from '@/types/product'

type CheckoutPanelProps = {
  slug: string
  priceSats: number
  pricing: ProductPricing
}

export function CheckoutPanel({ slug, priceSats, pricing }: CheckoutPanelProps) {
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const payUrl = origin ? `${origin}/api/lnurl/pay/${slug}` : ''
  const lightningUri = payUrl ? `lightning:${payUrl}` : ''

  return (
    <section className="checkout-panel">
      <div className="checkout-copy">
        <span className="section-kicker">Lightning checkout</span>
        <h2>{formatConfiguredPrice(pricing.amount, pricing.currency)}</h2>
        <p>
          Scan the QR code with any LNURL-pay compatible wallet. The invoice
          amount is quoted in sats from the current FX rate and locked for the
          LNURL checkout session.
        </p>
        <LivePriceBlock priceSats={priceSats} pricing={pricing} />
      </div>

      <div className="checkout-qr">
        {payUrl ? (
          <QRCodeSVG
            bgColor="#f6f1e8"
            fgColor="#1a120b"
            includeMargin
            size={220}
            value={lightningUri}
          />
        ) : (
          <div className="qr-placeholder">Preparing checkout…</div>
        )}
        <code>{payUrl || 'Loading…'}</code>
      </div>
    </section>
  )
}
