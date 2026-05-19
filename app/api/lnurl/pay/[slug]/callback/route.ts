import { NextResponse } from 'next/server'

import { getDownloadLinkTtlMinutes, getAppUrl } from '@/lib/env'
import { createInvoice } from '@/lib/lnbits'
import { buildDescriptionHash, buildProductMetadata } from '@/lib/lnurl'
import { getProductBySlug } from '@/lib/products'
import { createDownloadToken, verifyPriceQuoteToken } from '@/lib/tokens'

type RouteContext = {
  params: {
    slug: string
  }
}

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const product = getProductBySlug(params.slug)
    const url = new URL(request.url)

    if (!product || product.status !== 'live') {
      return NextResponse.json(
        { status: 'ERROR', reason: 'Unknown product.' },
        { status: 404 }
      )
    }

    const amount = Number(url.searchParams.get('amount') ?? '')
    const quoteToken = url.searchParams.get('quote')

    if (!quoteToken) {
      return NextResponse.json(
        { status: 'ERROR', reason: 'Missing price quote.' },
        { status: 400 }
      )
    }

    const quote = verifyPriceQuoteToken(quoteToken)

    if (!quote || quote.slug !== product.slug) {
      return NextResponse.json(
        { status: 'ERROR', reason: 'Price quote is invalid or expired.' },
        { status: 400 }
      )
    }

    const expectedAmount = quote.amountMsats

    if (!Number.isFinite(amount) || amount !== expectedAmount) {
      return NextResponse.json(
        {
          status: 'ERROR',
          reason: `Amount must equal ${expectedAmount} millisatoshis.`
        },
        { status: 400 }
      )
    }

    const metadata = buildProductMetadata(product)
    const invoice = await createInvoice({
      amountSats: quote.amountSats,
      memo: product.title,
      descriptionHash: buildDescriptionHash(metadata)
    })

    const expiresAt =
      Date.now() + getDownloadLinkTtlMinutes() * 60 * 1000

    const token = createDownloadToken({
      slug: product.slug,
      checkingId: invoice.checking_id,
      expiresAt
    })

    return NextResponse.json({
      pr: invoice.payment_request,
      routes: [],
      successAction: {
        tag: 'url',
        description: `Paid. Open this link within ${getDownloadLinkTtlMinutes()} minutes to download ${product.downloadFileName}.`,
        url: `${getAppUrl()}/api/download?token=${token}`
      }
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'ERROR',
        reason: error instanceof Error ? error.message : 'Unable to create invoice.'
      },
      { status: 502 }
    )
  }
}
