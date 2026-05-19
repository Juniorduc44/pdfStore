import { NextResponse } from 'next/server'

import { buildCallbackUrl, buildProductMetadata } from '@/lib/lnurl'
import { getProductBySlug } from '@/lib/products'

type RouteContext = {
  params: {
    slug: string
  }
}

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  const product = getProductBySlug(params.slug)

  if (!product || product.status !== 'live') {
    return NextResponse.json(
      { status: 'ERROR', reason: 'Unknown product.' },
      { status: 404 }
    )
  }

  const amountMsats = product.priceSats * 1000

  return NextResponse.json({
    tag: 'payRequest',
    callback: buildCallbackUrl(product.slug),
    minSendable: amountMsats,
    maxSendable: amountMsats,
    metadata: buildProductMetadata(product)
  })
}
