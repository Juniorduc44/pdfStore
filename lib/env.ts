function requireEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export function getAppUrl(): string {
  return requireEnv('NEXT_PUBLIC_APP_URL').replace(/\/$/, '')
}

export function getLnbitsBaseUrl(): string {
  return requireEnv('LNBITS_BASE_URL').replace(/\/$/, '')
}

export function getLnbitsInvoiceKey(): string {
  return requireEnv('LNBITS_INVOICE_KEY')
}

export function getDownloadTokenSecret(): string {
  return requireEnv('DOWNLOAD_TOKEN_SECRET')
}

export function getDownloadLinkTtlMinutes(): number {
  const value = Number(process.env.DOWNLOAD_LINK_TTL_MINUTES ?? '30')

  if (!Number.isFinite(value) || value < 1) {
    return 30
  }

  return Math.floor(value)
}
