export function formatSats(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

export function formatConfiguredPrice(amount: number, currency: string): string {
  if (currency.toUpperCase() === 'SATS') {
    return `${formatSats(Math.round(amount))} sats`
  }

  if (currency.toUpperCase() === 'BTC') {
    return `${amount.toFixed(8).replace(/0+$/, '').replace(/\.$/, '')} BTC`
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: 2
  }).format(amount)
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  const units = ['KB', 'MB', 'GB']
  let size = bytes / 1024
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value))
}
