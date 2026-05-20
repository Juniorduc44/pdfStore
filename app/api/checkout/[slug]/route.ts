import { NextResponse } from 'next/server'

import { getPriceQuoteTtlMinutes } from '@/lib/env'
import { createInvoice } from '@/lib/lnbits'
import { buildDescriptionHash, buildProductMetadata } from '@/lib/lnurl'
import { resolveCurrentProductPrice } from '@/lib/pricing'
import { getProductBySlug } from '@/lib/products'
import { createCheckoutSessionToken } from '@/lib/tokens'

type RouteContext = {
  params: {
    slug: string
  }
}

export async function POST(
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

    const price = await resolveCurrentProductPrice(product)
    const metadata = buildProductMetadata(product)
    const invoice = await createInvoice({
      amountSats: price.amountSats,
      memo: product.title,
      descriptionHash: buildDescriptionHash(metadata)
    })
    const expiresAt = Date.now() + getPriceQuoteTtlMinutes() * 60 * 1000
    const sessionToken = createCheckoutSessionToken({
      slug: product.slug,
      checkingId: invoice.checking_id,
      amountSats: price.amountSats,
      expiresAt
    })

    return NextResponse.json({
      status: 'OK',
      amountSats: price.amountSats,
      paymentRequest: invoice.payment_request,
      checkingId: invoice.checking_id,
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
