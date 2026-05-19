import { CatalogClient } from '@/components/catalog-client'
import { getCatalogTags, getFeaturedProducts, getLiveProducts } from '@/lib/products'
import { formatSats } from '@/lib/format'

export default function HomePage() {
  const products = getLiveProducts()
  const featured = getFeaturedProducts()
  const tags = getCatalogTags()
  const lowestPrice = products.reduce(
    (current, product) => Math.min(current, product.priceSats),
    products[0]?.priceSats ?? 0
  )

  return (
    <main className="home-page">
      <section className="hero">
        <div className="hero-copy">
          <span className="section-kicker">Anonymous browsing. Lightning checkout.</span>
          <h1>Sell PDF downloads without accounts or a self-hosted node.</h1>
          <p>
            The storefront stays data-driven. Add a PDF through the import script,
            answer a few prompts, and the catalog updates automatically.
          </p>
        </div>
        <div className="hero-panel">
          <div>
            <strong>{products.length}</strong>
            <span>Live titles</span>
          </div>
          <div>
            <strong>{formatSats(lowestPrice)}</strong>
            <span>Starting price</span>
          </div>
          <div>
            <strong>{featured.length}</strong>
            <span>Featured picks</span>
          </div>
        </div>
      </section>

      <section className="feature-strip">
        <div>
          <strong>Prompt-driven ingestion</strong>
          <span>Cover image, description, details, price, tags, and preview settings.</span>
        </div>
        <div>
          <strong>Preview support</strong>
          <span>Use the full PDF or a separate preview excerpt for each title.</span>
        </div>
        <div>
          <strong>Tokenized delivery</strong>
          <span>Short-lived download links generated after Lightning payment.</span>
        </div>
      </section>

      {products.length > 0 ? (
        <CatalogClient products={products} tags={tags} />
      ) : (
        <section className="not-found">
          <span className="section-kicker">Catalog empty</span>
          <h1>Add your first PDF to start the storefront.</h1>
          <p>
            Run <code>npm run add-product</code> inside <code>apps/pdf-store</code>
            , answer the prompts, and the title will appear here automatically.
          </p>
        </section>
      )}
    </main>
  )
}
