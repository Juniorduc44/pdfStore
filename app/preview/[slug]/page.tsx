import { notFound } from 'next/navigation'

import { getProductBySlug } from '@/lib/products'

type PreviewPageProps = {
  params: {
    slug: string
  }
}

export default function PreviewPage({ params }: PreviewPageProps) {
  const product = getProductBySlug(params.slug)

  if (!product || product.status !== 'live' || !product.previewEnabled) {
    notFound()
  }

  return (
    <main className="preview-page">
      <section className="preview-header">
        <span className="section-kicker">Preview</span>
        <h1>{product.title}</h1>
        <p>
          This preview uses {product.previewPath === product.pdfPath ? 'the full PDF' : 'a separate preview file'}.
        </p>
      </section>
      <section className="preview-frame">
        <iframe src={product.previewPath} title={`${product.title} preview`} />
      </section>
    </main>
  )
}
