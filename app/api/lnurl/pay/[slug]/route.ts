import { NextResponse } from 'next/server'

import { buildCallbackUrl, buildProductMetadata } from '@/lib/lnurl'
import { resolveCurrentProductPrice } from '@/lib/pricing'
import { getProductBySlug } from '@/lib/products'
import { createPriceQuoteToken } from '@/lib/tokens'
import { getPriceQuoteTtlMinutes } from '@/lib/env'

type RouteContext = {
  params: {
    slug: string
  }
}

export async function GET(
  _request: Request,
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

    const quote = await resolveCurrentProductPrice(product)
    const quoteToken = createPriceQuoteToken({
      slug: product.slug,
      amountSats: quote.amountSats,
      amountMsats: quote.amountMsats,
      currency: product.pricing.currency,
      pricedAmount: product.pricing.amount,
      expiresAt: Date.now() + getPriceQuoteTtlMinutes() * 60 * 1000
    })

    return NextResponse.json({
      tag: 'payRequest',
      callback: buildCallbackUrl(product.slug, quoteToken),
      minSendable: quote.amountMsats,
      maxSendable: quote.amountMsats,
      metadata: buildProductMetadata(product)
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'ERROR',
        reason: error instanceof Error ? error.message : 'Unable to quote price.'
      },
      { status: 502 }
    )
  }
}
