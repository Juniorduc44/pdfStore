import { NextResponse } from 'next/server'

import { verifyChargeWebhook } from '@/lib/opennode'

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type') ?? ''
  let id = ''
  let status = ''
  let orderId = ''
  let hashedOrder = ''

  if (contentType.includes('application/json')) {
    const payload = (await request.json()) as Record<string, unknown>
    id = String(payload.id ?? '')
    status = String(payload.status ?? '')
    orderId = String(payload.order_id ?? '')
    hashedOrder = String(payload.hashed_order ?? '')
  } else {
    const formData = await request.formData()
    id = String(formData.get('id') ?? '')
    status = String(formData.get('status') ?? '')
    orderId = String(formData.get('order_id') ?? '')
    hashedOrder = String(formData.get('hashed_order') ?? '')
  }

  if (!id || !hashedOrder) {
    return new NextResponse('missing webhook signature', { status: 400 })
  }

  if (!verifyChargeWebhook(id, hashedOrder)) {
    return new NextResponse('invalid webhook signature', { status: 401 })
  }

  // No persistence layer is required for the current storefront because the
  // product page polls charge status directly from OpenNode before unlocking.
  // This endpoint still validates and accepts official webhook events so the
  // integration is production-ready once asynchronous side effects are added.
  if (status === 'paid' && orderId) {
    return NextResponse.json({ status: 'accepted' })
  }

  return NextResponse.json({ status: 'ignored' })
}
