'use client'

import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

import { formatSats } from '@/lib/format'

type CheckoutPanelProps = {
  slug: string
  priceSats: number
}

export function CheckoutPanel({ slug, priceSats }: CheckoutPanelProps) {
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
        <h2>{formatSats(priceSats)} sats</h2>
        <p>
          Scan the QR code with any LNURL-pay compatible wallet. After payment,
          the wallet will reveal a short-lived download link.
        </p>
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
