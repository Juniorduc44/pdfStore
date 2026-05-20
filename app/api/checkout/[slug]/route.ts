import { NextResponse } from 'next/server'

import { getAppUrlFromRequest, getPriceQuoteTtlMinutes } from '@/lib/env'
import { createCharge } from '@/lib/opennode'
import { resolveCurrentProductPrice } from '@/lib/pricing'
import { getProductBySlug } from '@/lib/products'
import { createCheckoutSessionToken } from '@/lib/tokens'

type RouteContext = {
  params: {
    slug: string
  }
}

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  try {
    const product = getProductBySlug(params.slug)

    if (!product || product.status !== 'live') {
      return NextResponse.json(
        { status: 'ERROR', reason: 'Unknown product.' },
        { status: 404 }
      )
    }

    const resolvedPrice = await resolveCurrentProductPrice(product)
    const chargeAmount = (resolvedPrice.amountSats / 100_000_000).toFixed(8)
    const appUrl = getAppUrlFromRequest(request)
    const callbackUrl = `${appUrl}/api/payment-webhook`
    const successUrl = `${appUrl}/products/${product.slug}`
    const charge = await createCharge({
      amount: chargeAmount,
      currency: 'BTC',
      description: product.title,
      orderId: product.slug,
      callbackUrl,
      successUrl,
      ttl: getPriceQuoteTtlMinutes()
    })
    const expiresAt = Date.now() + getPriceQuoteTtlMinutes() * 60 * 1000
    const sessionToken = createCheckoutSessionToken({
      slug: product.slug,
      chargeId: charge.id,
      amountSats: resolvedPrice.amountSats,
      expiresAt
    })

    return NextResponse.json({
      status: 'OK',
      amountSats: resolvedPrice.amountSats,
      paymentRequest: charge.lightning_invoice?.payreq ?? '',
      chargeId: charge.id,
      hostedCheckoutUrl: charge.hosted_checkout_url ?? '',
      uri: charge.uri ?? '',
      sessionToken,
      expiresAt
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'ERROR',
        reason:
          error instanceof Error ? error.message : 'Unable to start checkout.'
      },
      { status: 502 }
    )
  }
}
