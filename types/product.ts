export type ProductStatus = 'draft' | 'live'

export type Product = {
  id: string
  slug: string
  title: string
  description: string
  details: string
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
