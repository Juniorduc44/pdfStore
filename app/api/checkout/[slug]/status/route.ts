import { NextRequest, NextResponse } from 'next/server'

import { getDownloadLinkTtlMinutes, getAppUrl } from '@/lib/env'
import { getCharge } from '@/lib/opennode'
import { getProductBySlug } from '@/lib/products'
import {
  createDownloadToken,
  verifyCheckoutSessionToken
} from '@/lib/tokens'

type RouteContext = {
  params: {
    slug: string
  }
}

export async function GET(
  request: NextRequest,
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

    const sessionToken = request.nextUrl.searchParams.get('session')

    if (!sessionToken) {
      return NextResponse.json(
        { status: 'ERROR', reason: 'Missing checkout session.' },
        { status: 400 }
      )
    }

    const session = verifyCheckoutSessionToken(sessionToken)

    if (!session || session.slug !== product.slug) {
      return NextResponse.json(
        { status: 'ERROR', reason: 'Checkout session is invalid or expired.' },
        { status: 401 }
      )
    }

    const charge = await getCharge(session.chargeId)
    const paid = charge.status === 'paid'

    if (!paid) {
      return NextResponse.json({
        status: 'PENDING',
        paid: false
      })
    }

    const expiresAt = Date.now() + getDownloadLinkTtlMinutes() * 60 * 1000
    const downloadToken = createDownloadToken({
      slug: product.slug,
      checkingId: session.chargeId,
      expiresAt
    })

    return NextResponse.json({
      status: 'PAID',
      paid: true,
      downloadUrl: `${getAppUrl()}/api/download?token=${downloadToken}`,
      expiresAt
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'ERROR',
        reason:
          error instanceof Error ? error.message : 'Unable to verify checkout.'
      },
      { status: 502 }
    )
  }
}
