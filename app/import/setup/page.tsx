'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store'

const CATS = ['Corporate Gifting','Manyavar Collections','Apparel','Healthcare','Electronics','FMCG','Cosmetics','Travel','Trade Promotions']

export default function SetupPage() {
  const router = useRouter()
  const { rawRows, draft, setDraft, buildProducts, setPublishResult, setIsPublishing } = useStore()
  useEffect(() => { if (!rawRows.length) router.replace('/import') }, [rawRows, router])

  async function publish() {
    if (!draft.name.trim()) { alert('Enter a collection name.'); return }
    if (!draft.slug.trim()) { alert('URL slug is required.'); return }
    setIsPublishing(true)
    const products = buildProducts()
    if (!products.length) { alert('No valid products found.'); setIsPublishing(false); return }
    try {
      const res = await fetch('/api/catalogues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          catalogue: draft,
          products: products.map(p => ({
            name: p.name, brand: p.brand, category: p.category,
            description: p.description, mrp: p.mrp, offerPrice: p.offerPrice,
            moq: p.moq, quantity: p.quantity, stockLocation: p.stockLocation,
            expiryDate: p.expiryDate, imageUrl1: p.imageUrl1,
            imageUrl2: p.imageUrl2, imageUrl3: p.imageUrl3,
            isActive: true, isSoldOut: p.quantity === 0,
            isAnonymous: !p.brand, displayOrder: p.displayOrder,
          })),
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)
      setPublishResult(result)
      router.push('/import/success')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Publish failed')
      setIsPublishing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[#0F2557] px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-[#0F2557] text-sm">S</div>
        <div className="text-white font-bold text-sm">Surpluss</div>
      </nav>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 flex">
          {['Upload data','Map columns','Name deal','Done'].map((s, i) => (
            <div key={s} className={`px-4 py-3 text-xs font-medium border-b-2 ${i === 2 ? 'border-[#0F2557] text-[#0F2557]' : 'border-transparent text-gray-400'}`}>
              <span className="mr-1.5">{i+1}</span>{s}
            </div>
          ))}
        </div>
      </div>
      <div className="max-w-xl mx-auto px-4 py-10">
        <h1 className="text-xl font-bold text-[#0F2557] mb-1">Name your deal collection</h1>
        <p className="text-sm text-gray-500 mb-8">{rawRows.length} products · Saved permanently to AWS DynamoDB</p>
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Collection name <span className="text-red-400">*</span></label>
            <input type="text" value={draft.name} onChange={e => setDraft({ name: e.target.value })}
              placeholder="e.g. Manyavar Festive Collection July 2026"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#0F2557]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Shareable URL <span className="text-red-400">*</span></label>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#0F2557]">
              <span className="px-3 py-2.5 bg-gray-50 text-xs text-gray-400 border-r border-gray-200 whitespace-nowrap">catalogue.surpluss.co/deals/</span>
              <input type="text" value={draft.slug}
                onChange={e => setDraft({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                placeholder="manyavar-festive-july-2026"
                className="flex-1 px-3 py-2.5 text-sm focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Category</label>
              <select value={draft.category} onChange={e => setDraft({ category: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#0F2557]">
                <option value="">Select…</option>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Deal expiry</label>
              <input type="date" value={draft.dealExpiry} onChange={e => setDraft({ dealExpiry: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#0F2557]" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Short description</label>
            <textarea value={draft.description} onChange={e => setDraft({ description: e.target.value })}
              placeholder="e.g. Premium festive ethnic wear at wholesale prices. MOQ applies."
              rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#0F2557] resize-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">WhatsApp number <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="text" value={draft.whatsappNumber} onChange={e => setDraft({ whatsappNumber: e.target.value })}
              placeholder="919999999999"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#0F2557]" />
          </div>
        </div>
        <div className="flex justify-between mt-6">
          <button onClick={() => router.back()} className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg">← Back</button>
          <button onClick={publish} className="px-8 py-2.5 bg-[#F5A623] text-[#0F2557] text-sm font-bold rounded-lg hover:bg-[#D4881A] hover:text-white transition-colors">
            Save to AWS & Generate link →
          </button>
        </div>
      </div>
    </div>
  )
}
