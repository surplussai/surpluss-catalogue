'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore, type DbField } from '@/store'

const FIELDS: { key: DbField; label: string }[] = [
  { key: 'name', label: 'Product name ★' },
  { key: 'brand', label: 'Brand' },
  { key: 'category', label: 'Category' },
  { key: 'description', label: 'Description' },
  { key: 'mrp', label: 'MRP' },
  { key: 'offerPrice', label: 'Offer price ★' },
  { key: 'moq', label: 'MOQ' },
  { key: 'quantity', label: 'Quantity available' },
  { key: 'stockLocation', label: 'Stock location' },
  { key: 'expiryDate', label: 'Expiry date' },
  { key: 'imageUrl1', label: 'Image URL 1' },
  { key: 'imageUrl2', label: 'Image URL 2' },
  { key: 'imageUrl3', label: 'Image URL 3' },
  { key: 'ignore', label: '— Ignore —' },
]

export default function MapPage() {
  const router = useRouter()
  const { rawRows, fileName, columnMappings, setColumnMapping } = useStore()
  useEffect(() => { if (!rawRows.length) router.replace('/import') }, [rawRows, router])
  if (!rawRows.length) return null

  const headers = Object.keys(rawRows[0] || {})
  const preview = rawRows.slice(0, 2)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[#0F2557] px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-[#0F2557] text-sm">S</div>
        <div className="text-white font-bold text-sm">Surpluss</div>
      </nav>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 flex">
          {['Upload data','Map columns','Name deal','Done'].map((s, i) => (
            <div key={s} className={`px-4 py-3 text-xs font-medium border-b-2 ${i === 1 ? 'border-[#0F2557] text-[#0F2557]' : 'border-transparent text-gray-400'}`}>
              <span className="mr-1.5">{i+1}</span>{s}
            </div>
          ))}
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#0F2557]">Confirm column mapping</h1>
          <p className="text-sm text-gray-500 mt-1">{rawRows.length} products · {fileName} · Auto-detected {Object.values(columnMappings).filter(v => v !== 'ignore').length}/{headers.length} columns</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
          <div className="grid bg-gray-50 border-b border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide" style={{ gridTemplateColumns: '1fr 190px 1fr' }}>
            <span>Your column</span><span>Maps to</span><span>Sample values</span>
          </div>
          {headers.map((h, idx) => {
            const current = columnMappings[h] || 'ignore'
            const auto = current !== 'ignore'
            const samples = preview.map(r => String(r[h] || '')).filter(Boolean)
            return (
              <div key={h} className={`grid px-4 py-2.5 border-b border-gray-100 items-center gap-3 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`} style={{ gridTemplateColumns: '1fr 190px 1fr' }}>
                <div className="text-sm font-medium text-gray-800 flex items-center gap-2">
                  {h}{auto && <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ auto</span>}
                </div>
                <select value={current} onChange={e => setColumnMapping(h, e.target.value as DbField)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-800 focus:outline-none focus:border-[#0F2557] w-full">
                  {FIELDS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                </select>
                <div className="text-xs text-gray-400 truncate">{samples.slice(0, 2).join(' / ') || '—'}</div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between">
          <button onClick={() => router.back()} className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg">← Back</button>
          <button onClick={() => router.push('/import/setup')} className="px-6 py-2.5 bg-[#0F2557] text-white text-sm font-semibold rounded-lg hover:bg-[#1A3570]">Continue →</button>
        </div>
      </div>
    </div>
  )
}
