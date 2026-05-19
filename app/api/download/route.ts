import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

import { isPaymentSettled } from '@/lib/lnbits'
import { getProductBySlug } from '@/lib/products'
import { verifyDownloadToken } from '@/lib/tokens'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json(
      { status: 'ERROR', reason: 'Missing download token.' },
      { status: 400 }
    )
  }

  const payload = verifyDownloadToken(token)

  if (!payload) {
    return NextResponse.json(
      { status: 'ERROR', reason: 'Download token is invalid or expired.' },
      { status: 401 }
    )
  }

  const product = getProductBySlug(payload.slug)

  if (!product || product.status !== 'live') {
    return NextResponse.json(
      { status: 'ERROR', reason: 'Product not found.' },
      { status: 404 }
    )
  }

  const paid = await isPaymentSettled(payload.checkingId)

  if (!paid) {
    return NextResponse.json(
      { status: 'ERROR', reason: 'Invoice is not settled yet.' },
      { status: 409 }
    )
  }

  const absolutePath = path.join(process.cwd(), product.pdfPath)
  const fileBuffer = await readFile(absolutePath)
  const response = new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf'
    }
  })
  response.headers.set(
    'Content-Disposition',
    `attachment; filename="${product.downloadFileName}"`
  )
  return response
}
