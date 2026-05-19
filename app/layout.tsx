import type { Metadata } from 'next'
import Link from 'next/link'

import './globals.css'

export const metadata: Metadata = {
  title: 'PDF Store',
  description: 'Anonymous Lightning-native PDF storefront'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <div className="page-frame">
          <header className="site-header">
            <Link className="brand" href="/">
              <img alt="PDF Store" src="/brand-mark.svg" />
              <div>
                <strong>PDF Store</strong>
                <span>Lightning-native digital downloads</span>
              </div>
            </Link>
            <nav className="site-nav">
              <Link href="/">Catalog</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  )
}
