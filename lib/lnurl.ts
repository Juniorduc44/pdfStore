import { createHash } from 'crypto'

import type { Product } from '@/types/product'
import { getAppUrl } from '@/lib/env'

export function buildProductMetadata(product: Product): string {
  const metadata = [
    ['text/plain', product.title],
    ['text/long-desc', product.details],
    ['text/identifier', `${product.slug}@pdf-store.local`]
  ]

  return JSON.stringify(metadata)
}

export function buildDescriptionHash(metadata: string): string {
  return createHash('sha256').update(metadata, 'utf8').digest('hex')
}

export function buildPayRequestUrl(slug: string): string {
  return `${getAppUrl()}/api/lnurl/pay/${slug}`
}

export function buildCallbackUrl(slug: string): string {
  return `${getAppUrl()}/api/lnurl/pay/${slug}/callback`
}
