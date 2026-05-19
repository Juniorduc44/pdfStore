import rawProducts from '@/data/products.json'
import type { Product } from '@/types/product'

const products = (rawProducts as Product[]).map((product) => ({
  ...product,
  pricing: product.pricing ?? {
    amount: product.priceSats,
    currency: 'SATS',
    importedSats: product.priceSats
  }
}))

export function getAllProducts(): Product[] {
  return [...products].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt)
  )
}

export function getLiveProducts(): Product[] {
  return getAllProducts().filter((product) => product.status === 'live')
}

export function getFeaturedProducts(): Product[] {
  return getLiveProducts().filter((product) => product.featured)
}

export function getProductBySlug(slug: string): Product | undefined {
  return getAllProducts().find((product) => product.slug === slug)
}

export function getCatalogTags(): string[] {
  const tagSet = new Set<string>()

  for (const product of getLiveProducts()) {
    for (const tag of product.tags) {
      tagSet.add(tag)
    }
  }

  return [...tagSet].sort((left, right) => left.localeCompare(right))
}
