import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <main className="not-found">
      <span className="section-kicker">Missing page</span>
      <h1>That title is not on the shelf.</h1>
      <p>The product may still be a draft, or the URL may be wrong.</p>
      <Link className="button primary" href="/">
        Back to catalog
      </Link>
    </main>
  )
}
