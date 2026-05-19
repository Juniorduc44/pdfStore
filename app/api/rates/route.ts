import { NextResponse } from 'next/server'

import { fetchBtcRates } from '@/lib/currency'

export async function GET() {
  try {
    const snapshot = await fetchBtcRates()
    return NextResponse.json(snapshot)
  } catch (error) {
    return NextResponse.json(
      {
        status: 'ERROR',
        reason: error instanceof Error ? error.message : 'Failed to load rates.'
      },
      { status: 502 }
    )
  }
}
