import { getLnbitsBaseUrl, getLnbitsInvoiceKey } from '@/lib/env'

type CreateInvoiceParams = {
  amountSats: number
  memo: string
  descriptionHash: string
}

type CreateInvoiceResult = {
  checking_id: string
  payment_hash: string
  payment_request: string
}

type PaymentStatusResult = {
  paid?: boolean
  details?: {
    pending?: boolean
  }
}

async function lnbitsFetch<T>(
  path: string,
  init: RequestInit & { body?: string }
): Promise<T> {
  const response = await fetch(`${getLnbitsBaseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': getLnbitsInvoiceKey(),
      ...(init.headers ?? {})
    },
    cache: 'no-store'
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`LNbits request failed (${response.status}): ${errorText}`)
  }

  return (await response.json()) as T
}

export async function createInvoice({
  amountSats,
  memo,
  descriptionHash
}: CreateInvoiceParams): Promise<CreateInvoiceResult> {
  return lnbitsFetch<CreateInvoiceResult>('/api/v1/payments', {
    method: 'POST',
    body: JSON.stringify({
      out: false,
      amount: amountSats,
      memo,
      description_hash: descriptionHash
    })
  })
}

export async function getPaymentStatus(
  checkingId: string
): Promise<PaymentStatusResult> {
  return lnbitsFetch<PaymentStatusResult>(`/api/v1/payments/${checkingId}`, {
    method: 'GET'
  })
}

export async function isPaymentSettled(checkingId: string): Promise<boolean> {
  const status = await getPaymentStatus(checkingId)

  if (typeof status.paid === 'boolean') {
    return status.paid
  }

  return status.details?.pending === false
}
