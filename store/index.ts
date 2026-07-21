import { create } from 'zustand'
import { driveToDirectUrl, slugify } from '@/lib/utils'
import type { DbField, RawRow, MappedProduct, CatalogueDraft, PublishResult } from '@/types'

export type { DbField }

const ALIASES: Record<DbField, string[]> = {
  name: ['product','product name','name','item','title','item name'],
  brand: ['brand','brand name','manufacturer','make'],
  category: ['category','cat','type','group'],
  description: ['description','desc','details','specification','specs'],
  mrp: ['mrp','market price','retail price','original price','max retail price'],
  offerPrice: ['offer price','deal price','selling price','our price','sale price','wholesale price','price','price (inc gst)','discounted price','offer'],
  moq: ['moq','minimum order','min order','min qty'],
  quantity: ['quantity','qty','quantity available','available qty','stock','units','pieces'],
  stockLocation: ['location','city','stock location','warehouse','place'],
  expiryDate: ['expiry','expiry date','exp date','best before','exp','expires'],
  imageUrl1: ['image','image1','image 1','image link','image url','icon image','photo','picture','img url'],
  imageUrl2: ['image2','image 2','image link 2','image url 2'],
  imageUrl3: ['image3','image 3','image link 3','image url 3'],
  imageUrl4: ['image4','image 4','image link 4','image url 4'],
  imageUrl5: ['image5','image 5','image link 5','image url 5'],
  condition: ['condition','stock condition','item condition'],
  ignore: [],
}

export function autoMap(headers: string[]): Record<string, DbField> {
  const result: Record<string, DbField> = {}
  headers.forEach(h => {
    const norm = h.toLowerCase().trim().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ')
    let found: DbField = 'ignore'
    for (const [field, aliases] of Object.entries(ALIASES)) {
      if (field === 'ignore') continue
      if (aliases.some(a => norm === a || norm.includes(a) || a.includes(norm))) {
        found = field as DbField; break
      }
    }
    result[h] = found
  })
  return result
}

function toNum(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = parseFloat(String(v).replace(/[^0-9.]/g, ''))
  return isNaN(n) ? null : n
}

interface State {
  rawRows: RawRow[]
  fileName: string
  columnMappings: Record<string, DbField>
  products: MappedProduct[]
  draft: CatalogueDraft
  publishResult: PublishResult | null
  isPublishing: boolean

  setRawRows: (rows: RawRow[], fileName: string) => void
  setColumnMapping: (col: string, field: DbField) => void
  buildProducts: () => MappedProduct[]
  setDraft: (partial: Partial<CatalogueDraft>) => void
  setPublishResult: (r: PublishResult | null) => void
  setIsPublishing: (v: boolean) => void
  reset: () => void
}

const defaultDraft: CatalogueDraft = {
  name: '', slug: '', description: '', category: '', dealExpiry: '', whatsappNumber: '',
}

export const useStore = create<State>((set, get) => ({
  rawRows: [],
  fileName: '',
  columnMappings: {},
  products: [],
  draft: defaultDraft,
  publishResult: null,
  isPublishing: false,

  setRawRows: (rows, fileName) => {
    const headers = rows.length ? Object.keys(rows[0]) : []
    set({ rawRows: rows, fileName, columnMappings: autoMap(headers) })
  },

  setColumnMapping: (col, field) =>
    set(s => ({ columnMappings: { ...s.columnMappings, [col]: field } })),

  buildProducts: () => {
    const { rawRows, columnMappings } = get()
    const get1 = (row: RawRow, field: DbField): string => {
      const col = Object.keys(columnMappings).find(h => columnMappings[h] === field)
      return col ? String(row[col] ?? '').trim() : ''
    }
    const products: MappedProduct[] = rawRows.map((row, i) => {
      const mrp = toNum(get1(row, 'mrp'))
      const offerPrice = toNum(get1(row, 'offerPrice'))
      const disc = mrp && offerPrice && mrp > offerPrice
        ? Math.round(((mrp - offerPrice) / mrp) * 100) : 0
      const brand = get1(row, 'brand')
      const img1 = driveToDirectUrl(get1(row, 'imageUrl1'))
      const img2 = driveToDirectUrl(get1(row, 'imageUrl2'))
      const img3 = driveToDirectUrl(get1(row, 'imageUrl3'))
      const img4 = driveToDirectUrl(get1(row, 'imageUrl4'))
      const img5 = driveToDirectUrl(get1(row, 'imageUrl5'))
      const qty = toNum(get1(row, 'quantity'))
      return {
        tempId: i + 1,
        name: get1(row, 'name') || `Product ${i + 1}`,
        brand, category: get1(row, 'category'),
        description: get1(row, 'description'),
        mrp, offerPrice, disc,
        moq: toNum(get1(row, 'moq')) ?? 1,
        quantity: qty ?? 0,
        stockLocation: get1(row, 'stockLocation'),
        expiryDate: get1(row, 'expiryDate'),
        condition: get1(row, 'condition') || 'Excess stock',
        imageUrl1: img1, imageUrl2: img2, imageUrl3: img3, imageUrl4: img4, imageUrl5: img5,
        images: [img1, img2, img3].filter(Boolean),
        isActive: true,
        isSoldOut: qty === 0,
        isAnonymous: !brand,
        displayOrder: i,
      }
    }).filter(p => p.name)
    set({ products })
    return products
  },

  setDraft: (partial) => {
    const current = get().draft
    const updated = { ...current, ...partial }
    if (partial.name !== undefined && partial.slug === undefined) {
      updated.slug = slugify(partial.name)
    }
    set({ draft: updated })
  },

  setPublishResult: r => set({ publishResult: r }),
  setIsPublishing: v => set({ isPublishing: v }),
  reset: () => set({ rawRows: [], fileName: '', columnMappings: {}, products: [], draft: defaultDraft, publishResult: null, isPublishing: false }),
}))
