'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Catalogue, Product } from '@/types'

export default function AdminCollectionPage({ params }: { params: Promise<{ catalogueId: string }> }) {
  const [catalogueId, setCatalogueId] = useState('')
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [collSaving, setCollSaving] = useState(false)
  const [collSaved, setCollSaved] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)

  const appUrl = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_APP_URL || 'https://catalogue.surpluss.co') : 'https://catalogue.surpluss.co'

  useEffect(() => {
    params.then(p => {
      setCatalogueId(p.catalogueId)
      fetch(`/api/catalogues/${p.catalogueId}`).then(r => r.json()).then(d => {
        setCatalogue(d.catalogue)
        setProducts(d.products || [])
        setLoading(false)
      })
    })
  }, [params])

  const shareUrl = catalogue ? `${appUrl}/deals/${catalogue.catalogueId}` : ''
  const CATS = ['Corporate Gifting','Manyavar Collections','Apparel','Healthcare','Electronics','FMCG','Cosmetics','Travel','Trade Promotions']

  function copyLink() {
    navigator.clipboard?.writeText(shareUrl)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  async function saveCollection() {
    if (!catalogue) return
    setCollSaving(true)
    await fetch(`/api/catalogues/${catalogueId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: catalogue.name,
        description: catalogue.description,
        category: catalogue.category,
        dealExpiry: catalogue.dealExpiry,
        isActive: catalogue.isActive,
        isArchived: catalogue.isArchived,
      }),
    })
    setCollSaving(false); setCollSaved(true)
    setTimeout(() => setCollSaved(false), 2500)
  }

  async function updateProduct(productId: string, updates: Partial<Product>) {
    setSaving(productId)
    await fetch(`/api/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ catalogueId, ...updates }),
    })
    setProducts(prev => prev.map(p => p.productId === productId ? { ...p, ...updates } : p))
    setSaving(null)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#0F2557] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!catalogue) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center"><div className="text-4xl mb-3">❌</div><p className="text-gray-600">Catalogue not found</p><Link href="/admin" className="text-[#0F2557] text-sm mt-2 block">← Back to admin</Link></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[#0F2557] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-white/60 hover:text-white text-xs">← History</Link>
          <span className="text-white/20">|</span>
          <div className="text-white font-semibold text-sm truncate max-w-xs">{catalogue.name}</div>
        </div>
        <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white text-xs">View live →</a>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Share bar */}
        <div className="bg-[#EEF1F8] border border-[#CBD5E0] rounded-xl px-4 py-3 flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <svg className="w-4 h-4 text-[#0F2557] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
          <span className="text-xs text-[#0F2557] font-mono flex-1 overflow-hidden text-ellipsis whitespace-nowrap min-w-0">{shareUrl}</span>
          <button onClick={copyLink} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-[#0F2557] hover:border-[#0F2557] shrink-0">{copied ? '✓ Copied' : 'Copy link'}</button>
          <button onClick={() => {
            const msg = `*${catalogue.name}* — ${catalogue.productCount} products.\n\n${shareUrl}\n\n_Surpluss_`
            window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
          }} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] rounded-lg text-xs font-semibold text-white shrink-0">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
            WhatsApp
          </button>
        </div>

        {/* Collection editor */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Collection details</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-gray-500">{catalogue.isActive ? 'Active' : 'Inactive'}</span>
              <div className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${catalogue.isActive ? 'bg-[#0F2557]' : 'bg-gray-300'}`}
                onClick={() => setCatalogue(c => c ? { ...c, isActive: !c.isActive } : c)}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${catalogue.isActive ? 'left-5' : 'left-0.5'}`} />
              </div>
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Name</label>
              <input value={catalogue.name} onChange={e => setCatalogue(c => c ? { ...c, name: e.target.value } : c)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0F2557]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Category</label>
              <select value={catalogue.category} onChange={e => setCatalogue(c => c ? { ...c, category: e.target.value } : c)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#0F2557]">
                <option value="">None</option>
                {CATS.map(cat => <option key={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</label>
              <input value={catalogue.description} onChange={e => setCatalogue(c => c ? { ...c, description: e.target.value } : c)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0F2557]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Deal expiry</label>
              <input type="date" value={catalogue.dealExpiry} onChange={e => setCatalogue(c => c ? { ...c, dealExpiry: e.target.value } : c)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0F2557]" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={saveCollection} disabled={collSaving}
              className="px-6 py-2.5 bg-[#0F2557] text-white text-sm font-semibold rounded-lg hover:bg-[#1A3570] disabled:opacity-50 transition-colors">
              {collSaving ? 'Saving…' : collSaved ? '✓ Saved — buyer link updated' : 'Save collection details'}
            </button>
            <button onClick={() => setCatalogue(c => c ? { ...c, isArchived: !c.isArchived } : c)}
              className="px-4 py-2.5 border border-gray-200 text-gray-500 text-sm rounded-lg hover:border-gray-400 transition-colors">
              {catalogue.isArchived ? 'Unarchive' : 'Archive'}
            </button>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{products.length} products</h2>
            <span className="text-xs text-gray-400">Changes reflect on buyer link immediately</span>
          </div>
          <div className="divide-y divide-gray-100">
            {products.map(p => (
              <ProductRow key={p.productId} product={p} saving={saving === p.productId}
                onUpdate={updates => updateProduct(p.productId, updates)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductRow({ product: p, saving, onUpdate }: {
  product: Product
  saving: boolean
  onUpdate: (updates: Partial<Product>) => void
}) {
  const [editing, setEditing] = useState(false)
  const [offerPrice, setOfferPrice] = useState(String(p.offerPrice ?? ''))
  const [mrp, setMrp] = useState(String(p.mrp ?? ''))
  const [moq, setMoq] = useState(String(p.moq))
  const [qty, setQty] = useState(String(p.quantity))

  function save() {
    const newQty = parseInt(qty) || 0
    onUpdate({
      offerPrice: offerPrice ? parseFloat(offerPrice) : null,
      mrp: mrp ? parseFloat(mrp) : null,
      moq: parseInt(moq) || 1,
      quantity: newQty,
      isSoldOut: newQty === 0,
    })
    setEditing(false)
  }

  const img = p.imageUrl1 || p.imageUrl2 || p.imageUrl3

  return (
    <div className={`px-5 py-4 transition-colors ${!p.isActive ? 'opacity-50 bg-gray-50' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
          {img ? <img src={img} alt={p.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display='none' }} /> : <span className="text-xl">📦</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-gray-800">{p.name}</div>
              {p.brand && <div className="text-xs text-gray-400">{p.brand}</div>}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {p.isSoldOut && <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">SOLD OUT</span>}
              {!p.isActive && <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">INACTIVE</span>}
            </div>
          </div>

          {!editing ? (
            <div className="flex items-center gap-4 mt-2 flex-wrap text-sm">
              <span className="font-bold text-[#0F2557]">{p.offerPrice ? `₹${p.offerPrice.toLocaleString('en-IN')}` : 'No price'}</span>
              {p.mrp ? <span className="text-gray-400 line-through text-xs">₹{p.mrp.toLocaleString('en-IN')}</span> : null}
              <span className="text-xs text-gray-500">MOQ: {p.moq}</span>
              <span className="text-xs text-gray-500">Qty: {p.quantity}</span>
              {p.stockLocation && <span className="text-xs text-gray-400">📍 {p.stockLocation}</span>}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              {[
                { label: 'Offer price', val: offerPrice, set: setOfferPrice },
                { label: 'MRP', val: mrp, set: setMrp },
                { label: 'MOQ', val: moq, set: setMoq },
                { label: 'Qty available', val: qty, set: setQty },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-0.5">{f.label}</label>
                  <input value={f.val} onChange={e => f.set(e.target.value)}
                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#0F2557]" />
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 mt-2.5 flex-wrap text-xs">
            {!editing ? (
              <button onClick={() => setEditing(true)} className="text-[#0F2557] font-medium hover:underline">Edit prices</button>
            ) : (
              <>
                <button onClick={save} disabled={saving} className="px-3 py-1.5 bg-[#0F2557] text-white font-semibold rounded-lg disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
                <button onClick={() => setEditing(false)} className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg">Cancel</button>
              </>
            )}
            <span className="text-gray-200">·</span>
            <button onClick={() => onUpdate({ isSoldOut: !p.isSoldOut, isActive: true })} disabled={saving}
              className={`font-medium ${p.isSoldOut ? 'text-green-600 hover:underline' : 'text-red-600 hover:underline'}`}>
              {p.isSoldOut ? 'Mark available' : 'Mark sold out'}
            </button>
            <span className="text-gray-200">·</span>
            <button onClick={() => onUpdate({ isActive: !p.isActive })} disabled={saving} className="text-gray-400 hover:text-gray-600">
              {p.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
