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

export function getAppUrlFromRequest(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL

  if (configured) {
    return configured.replace(/\/$/, '')
  }

  const url = new URL(request.url)
  return `${url.protocol}//${url.host}`
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

export function getPriceQuoteTtlMinutes(): number {
  const value = Number(process.env.PRICE_QUOTE_TTL_MINUTES ?? '10')

  if (!Number.isFinite(value) || value < 1) {
    return 10
  }

  return Math.floor(value)
}
