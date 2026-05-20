import Link from 'next/link'
import { notFound } from 'next/navigation'

import { CheckoutPanel } from '@/components/checkout-panel'
import { LivePriceBlock } from '@/components/live-price-block'
import { formatConfiguredPrice, formatDate, formatFileSize, formatSats } from '@/lib/format'
import { getProductBySlug } from '@/lib/products'

type ProductPageProps = {
  params: {
    slug: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProductBySlug(params.slug)

  if (!product || product.status !== 'live') {
    notFound()
  }

  return (
    <main className="product-page">
      <section className="product-hero">
        <img alt={`${product.title} cover`} className="detail-cover" src={product.coverImage} />
        <div className="detail-copy">
          <span className="section-kicker">PDF download</span>
          <h1>{product.title}</h1>
          <p className="lead">{product.description}</p>
          <div className="detail-stats">
            <span>{formatConfiguredPrice(product.pricing.amount, product.pricing.currency)}</span>
            <span>{formatSats(product.priceSats)} sats snapshot</span>
            <span>{formatFileSize(product.fileSizeBytes)}</span>
            {product.pageCount ? <span>{product.pageCount} pages</span> : null}
            {product.author ? <span>{product.author}</span> : null}
            <span>Added {formatDate(product.createdAt)}</span>
          </div>
          <LivePriceBlock priceSats={product.priceSats} pricing={product.pricing} />
          <div className="tag-list">
            {product.tags.map((tag) => (
              <span className="tag-chip" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          <p className="detail-body">{product.details}</p>
          <div className="detail-actions">
            {product.previewEnabled ? (
              <Link className="button secondary" href={`/preview/${product.slug}`}>
                Preview first
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <CheckoutPanel
        priceSats={product.priceSats}
        pricing={product.pricing}
        slug={product.slug}
      />
    </main>
  )
}
