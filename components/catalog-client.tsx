'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { formatFileSize, formatSats } from '@/lib/format'
import type { Product } from '@/types/product'

type CatalogClientProps = {
  products: Product[]
  tags: string[]
}

export function CatalogClient({ products, tags }: CatalogClientProps) {
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState<string>('all')

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesQuery =
        query.length === 0 ||
        [product.title, product.description, product.details, product.author ?? '', product.tags.join(' ')]
          .join(' ')
          .toLowerCase()
          .includes(query.toLowerCase())

      const matchesTag =
        activeTag === 'all' || product.tags.includes(activeTag)

      return matchesQuery && matchesTag
    })
  }, [activeTag, products, query])

  return (
    <section className="catalog-shell">
      <div className="catalog-toolbar">
        <label className="search-field">
          <span>Search the shelf</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Title, author, tag, or topic"
          />
        </label>

        <div className="tag-row">
          <button
            className={activeTag === 'all' ? 'tag active' : 'tag'}
            onClick={() => setActiveTag('all')}
            type="button"
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              className={activeTag === tag ? 'tag active' : 'tag'}
              onClick={() => setActiveTag(tag)}
              type="button"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="product-grid">
        {filtered.map((product) => (
          <article className="product-card" key={product.slug}>
            <div className="cover-wrap">
              <img alt={`${product.title} cover`} className="cover-image" src={product.coverImage} />
            </div>
            <div className="product-copy">
              <div className="eyebrow-row">
                <span>{formatSats(product.priceSats)} sats</span>
                <span>{formatFileSize(product.fileSizeBytes)}</span>
              </div>
              <h2>{product.title}</h2>
              <p>{product.description}</p>
              <div className="meta-row">
                {product.author ? <span>{product.author}</span> : null}
                {product.pageCount ? <span>{product.pageCount} pages</span> : null}
                {product.previewEnabled ? <span>Preview available</span> : null}
              </div>
              <div className="tag-list">
                {product.tags.map((tag) => (
                  <span className="tag-chip" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="card-actions">
              <Link className="button primary" href={`/products/${product.slug}`}>
                View details
              </Link>
              {product.previewEnabled ? (
                <Link className="button secondary" href={`/preview/${product.slug}`}>
                  Preview PDF
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
