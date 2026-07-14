import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import slugifyLib from 'slugify'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return slugifyLib(text, { lower: true, strict: true, trim: true })
}

export function formatPrice(n: number | null | undefined): string {
  if (n == null) return '—'
  return '₹' + n.toLocaleString('en-IN')
}

export function calcDiscount(mrp: number | null, price: number | null): number {
  if (!mrp || !price || mrp <= price) return 0
  return Math.round(((mrp - price) / mrp) * 100)
}

export function formatDate(str: string | null | undefined): string {
  if (!str) return '—'
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    }).format(new Date(str))
  } catch { return str }
}

// Convert Google Drive share URL to direct render URL
export function driveToDirectUrl(url: string): string {
  if (!url) return ''
  if (url.includes('drive.google.com/file/d/')) {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
    if (match) return `https://drive.google.com/uc?export=view&id=${match[1]}`
  }
  return url
}

export function buildShareUrl(slug: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://catalogue.surpluss.co'
  return `${base}/deals/${slug}`
}

export function buildWAMessage(name: string, url: string, count: number): string {
  return `*${name}* — ${count} products at wholesale prices.\n\nView catalogue: ${url}\n\n_Surpluss — Global Inventory Exchange_`
}
