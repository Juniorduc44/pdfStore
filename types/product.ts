export type ProductStatus = 'draft' | 'live'

export type ProductPricing = {
  amount: number
  currency: string
  importedSats: number
}

export type Product = {
  id: string
  slug: string
  title: string
  description: string
  details: string
  pricing: ProductPricing
  priceSats: number
  coverImage: string
  pdfPath: string
  previewEnabled: boolean
  previewPath?: string
  downloadFileName: string
  tags: string[]
  author?: string
  pageCount?: number
  fileSizeBytes: number
  featured?: boolean
  status: ProductStatus
  createdAt: string
}

export type CatalogFilter = {
  query?: string
  tag?: string
}
