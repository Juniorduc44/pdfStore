import type { Metadata } from 'next'
import Link from 'next/link'

import { CurrencyProvider } from '@/components/currency-provider'
import { CurrencySwitcher } from '@/components/currency-switcher'

import './globals.css'

export const metadata: Metadata = {
  title: 'PDF Store',
  description: 'Anonymous Lightning-native PDF storefront'
}

const LIGHTNING_ADDRESS = 'puffyred579@walletofsatoshi.com'

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <CurrencyProvider>
          <div className="page-frame">
            <header className="site-header">
              <Link className="brand" href="/">
                <img alt="PDF Store" src="/brand-mark.svg" />
                <div>
                  <strong>PDF Store</strong>
                  <span>Lightning-native digital downloads</span>
                </div>
              </Link>
              <div className="header-actions">
                <div className="owner-lightning">
                  <span>Lightning Address</span>
                  <code>{LIGHTNING_ADDRESS}</code>
                </div>
                <CurrencySwitcher />
                <nav className="site-nav">
                  <Link href="/">Catalog</Link>
                </nav>
              </div>
            </header>
            {children}
            <footer className="site-footer">
              <span>Store payout address</span>
              <code>{LIGHTNING_ADDRESS}</code>
            </footer>
          </div>
        </CurrencyProvider>
      </body>
    </html>
  )
}
