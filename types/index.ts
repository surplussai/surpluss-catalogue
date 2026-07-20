// ─────────────────────────────────────────────────────────────────────────────
// SURPLUSS CATALOGUE PLATFORM — TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface Catalogue {
  catalogueId: string        // partition key = URL slug
  name: string
  description: string
  category: string
  dealExpiry: string
  whatsappNumber: string
  isActive: boolean
  isArchived: boolean
  productCount: number
  createdAt: string
  updatedAt: string
}

export interface Product {
  catalogueId: string        // partition key
  productId: string          // sort key
  name: string
  brand: string
  category: string
  description: string
  mrp: number | null
  offerPrice: number | null
  moq: number
  quantity: number
  stockLocation: string
  expiryDate: string
  imageUrl1: string
  imageUrl2: string
  imageUrl3: string
  imageUrl4: string
  imageUrl5: string
  isActive: boolean
  isSoldOut: boolean
  isAnonymous: boolean
  displayOrder: number
  updatedAt: string
}

// ─── Publisher pipeline types (client-side only) ──────────────────────────────

export type DbField =
  | 'name' | 'brand' | 'category' | 'description'
  | 'mrp' | 'offerPrice' | 'moq' | 'quantity'
  | 'stockLocation' | 'expiryDate'
  | 'imageUrl1' | 'imageUrl2' | 'imageUrl3' | 'imageUrl4' | 'imageUrl5'
  | 'ignore'

export interface RawRow {
  [key: string]: string | number | null
}

export interface MappedProduct {
  tempId: number
  name: string
  brand: string
  category: string
  description: string
  mrp: number | null
  offerPrice: number | null
  disc: number
  moq: number
  quantity: number
  stockLocation: string
  expiryDate: string
  imageUrl1: string
  imageUrl2: string
  imageUrl3: string
  imageUrl4: string
  imageUrl5: string
  images: string[]
  isActive: boolean
  isSoldOut: boolean
  isAnonymous: boolean
  displayOrder: number
}

export interface CatalogueDraft {
  name: string
  slug: string
  description: string
  category: string
  dealExpiry: string
  whatsappNumber: string
}

export interface PublishResult {
  catalogueId: string
  productCount: number
  url: string
}
