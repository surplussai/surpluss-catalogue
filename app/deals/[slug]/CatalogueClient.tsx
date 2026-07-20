'use client'
import Image from 'next/image'
import { useState, useMemo, useCallback } from 'react'
import type { Catalogue, Product } from '@/types'
import { formatPrice, calcDiscount, buildWAMessage } from '@/lib/utils'

interface Props {
  catalogue: Catalogue
  products: Product[]
  shareUrl: string
  waNumber: string
}

function WaIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
    </svg>
  )
}

function ImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [idx, setIdx] = useState(0)
  const valid = images.filter(Boolean)
  if (valid.length === 0) return (
    <div className="aspect-video bg-gray-100 flex items-center justify-center">
      <span className="text-6xl">📦</span>
    </div>
  )
  return (
    <div className="relative bg-gray-100 select-none">
      <div className="aspect-video overflow-hidden flex items-center justify-center bg-gray-50">
        <img src={valid[idx]} alt={alt} className="w-full h-full object-contain"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
      </div>
      {valid.length > 1 && (
        <>
          <button onClick={() => setIdx(i => (i - 1 + valid.length) % valid.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white active:scale-95 transition-all">
            <svg className="w-4 h-4 text-[#0F2557]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <button onClick={() => setIdx(i => (i + 1) % valid.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white active:scale-95 transition-all">
            <svg className="w-4 h-4 text-[#0F2557]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {valid.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${i === idx ? 'bg-[#0F2557] w-4' : 'bg-white/70 w-1.5'}`} />
            ))}
          </div>
          <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
            {idx + 1} / {valid.length}
          </div>
        </>
      )}
    </div>
  )
}

function ProductImage({ src, alt, className }: { src: string; alt: string; className: string }) {
  if (!src) return null
  return <img src={src} alt={alt} className={className} loading="lazy"
    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
}

export default function CatalogueClient({ catalogue, products, shareUrl, waNumber }: Props) {
  const [query, setQuery] = useState('')
  const [activeCat, setActiveCat] = useState('all')
  const [sort, setSort] = useState('')
  const [grid, setGrid] = useState<'grid' | 'list'>('grid')
  const [modal, setModal] = useState<Product | null>(null)
  const [showInq, setShowInq] = useState(false)
  const [inqDone, setInqDone] = useState(false)
  const [copied, setCopied] = useState(false)

  const categories = useMemo(() =>
    ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))],
    [products]
  )

  const filtered = useMemo(() => {
    let list = products.filter(p => {
      const matchCat = activeCat === 'all' || p.category === activeCat
      const q = query.toLowerCase()
      const matchQ = !q || p.name.toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      return matchCat && matchQ
    })
    if (sort === 'disc') list = [...list].sort((a, b) => calcDiscount(b.mrp, b.offerPrice) - calcDiscount(a.mrp, a.offerPrice))
    else if (sort === 'lo') list = [...list].sort((a, b) => (a.offerPrice ?? 999999) - (b.offerPrice ?? 999999))
    else if (sort === 'hi') list = [...list].sort((a, b) => (b.offerPrice ?? 0) - (a.offerPrice ?? 0))
    return list
  }, [products, activeCat, query, sort])

  const copyLink = useCallback(() => {
    navigator.clipboard?.writeText(shareUrl)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }, [shareUrl])

  const shareWA = useCallback(() => {
    const msg = buildWAMessage(catalogue.name, shareUrl, products.length)
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }, [catalogue.name, shareUrl, products.length])

  const shareEmail = useCallback(() => {
    const subj = `${catalogue.name} | Surpluss`
    const body = `Hi,\n\nPlease find our latest deals:\n${shareUrl}\n\n${catalogue.description || ''}\n\n_Surpluss — Global Inventory Exchange_`
    window.open(`mailto:?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`)
  }, [catalogue.name, catalogue.description, shareUrl])

  const inquireWA = useCallback((p: Product) => {
    const msg = `Hi, I am interested in *${p.name}*.\n\nCatalogue: ${shareUrl}\n\nPlease share pricing and availability.`
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank')
  }, [shareUrl, waNumber])

  const primaryImg = (p: Product) => p.imageUrl1 || p.imageUrl2 || p.imageUrl3 || ''
  const allImgs = (p: Product) => [p.imageUrl1, p.imageUrl2, p.imageUrl3].filter(Boolean) as string[]

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#0F2557] sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <Image src="/surpluss-logo.png" alt="Surpluss" width={36} height={36}
                className="h-9 w-9 object-contain rounded-lg bg-white p-0.5" priority />
              <div>
                <div className="text-white font-bold text-sm leading-none">Surpluss</div>
                <div className="text-white/50 text-[10px] uppercase tracking-wide mt-0.5">Global inventory exchange</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={shareEmail} className="hidden sm:flex items-center gap-1.5 border border-white/20 text-white/80 px-3 py-2 rounded-lg text-xs font-medium hover:bg-white/10 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                Email
              </button>
              <button onClick={shareWA} className="flex items-center gap-1.5 bg-[#25D366] text-white px-3 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity">
                <WaIcon /> Share
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products, brands..."
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:bg-white/15" />
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="border border-white/20 rounded-lg px-3 py-2 text-xs bg-white/10 text-white focus:outline-none cursor-pointer">
              <option value="" className="bg-[#0F2557]">Featured</option>
              <option value="disc" className="bg-[#0F2557]">Highest discount</option>
              <option value="lo" className="bg-[#0F2557]">Price: low-high</option>
              <option value="hi" className="bg-[#0F2557]">Price: high-low</option>
            </select>
          </div>
        </div>
        {categories.length > 2 && (
          <div className="bg-white border-b border-gray-200 overflow-x-auto">
            <div className="max-w-5xl mx-auto px-4 flex">
              {categories.map(c => (
                <button key={c} onClick={() => setActiveCat(c)}
                  className={`px-4 py-3 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${c === activeCat ? 'border-[#0F2557] text-[#0F2557] font-semibold' : 'border-transparent text-gray-500 hover:text-[#0F2557]'}`}>
                  {c === 'all' ? 'All deals' : c}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5">
        <div className="bg-[#0F2557] rounded-xl p-5 mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {catalogue.category && (
              <div className="inline-block bg-[#C8A96E] text-[#0F2557] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide mb-2">{catalogue.category}</div>
            )}
            <h1 className="text-lg font-bold text-white mb-1 leading-snug">{catalogue.name}</h1>
            <div className="text-white/60 text-xs">{products.length} products{catalogue.dealExpiry ? ` · Closes ${catalogue.dealExpiry}` : ''}</div>
            {catalogue.description && <div className="text-white/70 text-xs mt-1.5">{catalogue.description}</div>}
          </div>
          <button onClick={shareWA} className="flex items-center gap-1.5 bg-[#25D366] text-white px-3 py-2 rounded-lg text-xs font-semibold hover:opacity-90 shrink-0">
            <WaIcon /> Share
          </button>
        </div>

        <div className="bg-[#EEF1F8] border border-[#CBD5E0] rounded-xl px-4 py-3 flex items-center gap-2 mb-5 flex-wrap sm:flex-nowrap">
          <svg className="w-4 h-4 text-[#0F2557] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
          <span className="text-xs text-[#0F2557] font-mono flex-1 overflow-hidden text-ellipsis whitespace-nowrap min-w-0">{shareUrl}</span>
          <button onClick={copyLink} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-[#0F2557] hover:border-[#0F2557] shrink-0">{copied ? 'Copied' : 'Copy'}</button>
          <button onClick={shareWA} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] rounded-lg text-xs font-semibold text-white hover:opacity-90 shrink-0"><WaIcon className="w-3.5 h-3.5" /> WhatsApp</button>
          <button onClick={shareEmail} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F2557] rounded-lg text-xs font-semibold text-white hover:bg-[#1A3570] shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            Email
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(['grid', 'list'] as const).map(m => (
              <button key={m} onClick={() => setGrid(m)}
                className={`p-1.5 rounded-md transition-colors ${grid === m ? 'bg-[#0F2557] text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                {m === 'grid'
                  ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                  : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/></svg>}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <div className="text-base font-medium text-gray-600 mb-1">No products found</div>
            <div className="text-sm text-gray-400">Try a different search or category</div>
          </div>
        )}

        {filtered.length > 0 && grid === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map(p => {
              const img = primaryImg(p)
              const d = calcDiscount(p.mrp, p.offerPrice)
              return (
                <div key={p.productId} onClick={() => { setModal(p); setShowInq(false); setInqDone(false) }}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-[#0F2557] hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="aspect-square bg-gray-50 relative flex items-center justify-center overflow-hidden">
                    {img ? <img src={img} alt={p.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display='none' }} /> : <span className="text-4xl">📦</span>}
                    {p.isSoldOut && <div className="absolute inset-0 bg-white/85 flex items-center justify-center"><div className="border-2 border-red-500 rounded-full w-14 h-14 flex items-center justify-center transform -rotate-12 text-red-500 font-bold text-[10px] text-center leading-tight">SOLD OUT</div></div>}
                    {!p.isSoldOut && d > 0 && <div className="absolute top-2 left-2 bg-[#C8A96E] text-[#0F2557] text-[10px] font-bold px-1.5 py-0.5 rounded">{d}% off</div>}
                    {allImgs(p).length > 1 && <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded-full">{allImgs(p).length} photos</div>}
                  </div>
                  <div className="p-3">
                    {p.isAnonymous ? <div className="text-[9px] font-bold text-[#0F2557] bg-[#EEF1F8] px-1.5 py-0.5 rounded uppercase tracking-wide inline-block mb-1.5">Surpluss Verified</div>
                      : p.brand && <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{p.brand}</div>}
                    <div className="text-xs font-semibold text-gray-800 mb-2 leading-snug line-clamp-2">{p.name}</div>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      {p.offerPrice != null ? <><span className="text-sm font-bold text-[#0F2557]">{formatPrice(p.offerPrice)}</span>{p.mrp && <span className="text-[10px] text-gray-400 line-through">{formatPrice(p.mrp)}</span>}</> : <span className="text-xs text-gray-400">Contact for price</span>}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">MOQ: {p.moq.toLocaleString('en-IN')} units</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {filtered.length > 0 && grid === 'list' && (
          <div className="flex flex-col gap-2">
            {filtered.map(p => {
              const img = primaryImg(p)
              const d = calcDiscount(p.mrp, p.offerPrice)
              return (
                <div key={p.productId} onClick={() => { setModal(p); setShowInq(false); setInqDone(false) }}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-[#0F2557] hover:shadow-sm transition-all flex">
                  <div className="w-24 h-24 bg-gray-50 flex items-center justify-center shrink-0 relative overflow-hidden">
                    {img ? <img src={img} alt={p.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display='none' }} /> : <span className="text-2xl">📦</span>}
                    {!p.isSoldOut && d > 0 && <div className="absolute top-1 left-1 bg-[#C8A96E] text-[#0F2557] text-[9px] font-bold px-1 py-0.5 rounded">{d}%</div>}
                  </div>
                  <div className="flex-1 p-3 flex items-center gap-3 min-w-0">
                    <div className="flex-1 min-w-0">
                      {p.isAnonymous ? <div className="text-[9px] font-bold text-[#0F2557] bg-[#EEF1F8] px-1.5 py-0.5 rounded uppercase inline-block mb-1">Surpluss Verified</div>
                        : p.brand && <div className="text-[10px] text-gray-400 uppercase mb-0.5">{p.brand}</div>}
                      <div className="text-xs font-semibold text-gray-800 truncate">{p.name}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">MOQ {p.moq.toLocaleString('en-IN')} · {p.stockLocation || '-'}</div>
                    </div>
                    <div className="text-right shrink-0">
                      {p.offerPrice != null ? <><div className="text-sm font-bold text-[#0F2557]">{formatPrice(p.offerPrice)}</div>{p.mrp && <div className="text-[10px] text-gray-400 line-through">{formatPrice(p.mrp)}</div>}</> : <div className="text-xs text-gray-400">Contact</div>}
                      <button onClick={e => { e.stopPropagation(); inquireWA(p) }} className="mt-1.5 flex items-center gap-1 bg-[#25D366] text-white px-2 py-1 rounded text-[10px] font-semibold ml-auto">
                        <WaIcon className="w-3 h-3" /> Inquire
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="text-center py-8 border-t border-gray-100 mt-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Image src="/surpluss-logo.png" alt="Surpluss" width={24} height={24} className="h-6 w-6 object-contain rounded" />
          <span className="font-bold text-[#0F2557] text-sm">Surpluss</span>
        </div>
        <div className="text-xs text-gray-400">Global Inventory Exchange · All deals verified · Bulk pricing · No middlemen</div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4" onClick={() => setModal(null)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[94vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="bg-[#0F2557] px-4 py-3 flex items-center justify-between shrink-0">
              <span className="text-sm font-semibold text-white truncate pr-4">{modal.name}</span>
              <button onClick={() => setModal(null)} className="w-7 h-7 rounded-lg border border-white/20 bg-white/10 flex items-center justify-center text-white shrink-0 text-lg leading-none hover:bg-white/20">x</button>
            </div>
            <div className="overflow-y-auto flex-1">
              <ImageCarousel images={allImgs(modal)} alt={modal.name} />
              <div className="p-4">
                {modal.isAnonymous ? <div className="inline-block bg-[#EEF1F8] text-[#0F2557] text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-2">Surpluss Verified Deal</div>
                  : modal.brand && <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{modal.brand}</div>}
                <h2 className="text-lg font-bold text-[#0F2557] mb-3">{modal.name}</h2>
                <div className="flex items-baseline gap-3 mb-4 pb-4 border-b border-gray-100">
                  {modal.offerPrice != null
                    ? <><span className="text-2xl font-bold text-[#0F2557]">{formatPrice(modal.offerPrice)}</span>
                      {modal.mrp && <span className="text-sm text-gray-400 line-through">{formatPrice(modal.mrp)}</span>}
                      {calcDiscount(modal.mrp, modal.offerPrice) > 0 && <span className="bg-[#C8A96E] text-[#0F2557] text-xs font-bold px-2 py-0.5 rounded">{calcDiscount(modal.mrp, modal.offerPrice)}% off</span>}</>
                    : <span className="text-base text-gray-400">Price on inquiry</span>}
                </div>
                <div className="grid grid-cols-2 gap-px bg-gray-100 border border-gray-100 rounded-xl overflow-hidden mb-4">
                  {[
                    { label: 'MOQ', value: `${modal.moq.toLocaleString('en-IN')} units` },
                    { label: 'Available', value: modal.isSoldOut ? 'Sold out' : modal.quantity > 0 ? `${modal.quantity.toLocaleString('en-IN')} units` : '-' },
                    { label: 'Location', value: modal.stockLocation || '-' },
                    { label: modal.expiryDate ? 'Expiry' : 'Condition', value: modal.expiryDate || 'Excess stock' },
                  ].map(d => (
                    <div key={d.label} className="bg-white p-3">
                      <div className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">{d.label}</div>
                      <div className={`text-xs font-semibold ${d.label === 'Available' && modal.isSoldOut ? 'text-red-600' : 'text-gray-800'}`}>{d.value}</div>
                    </div>
                  ))}
                </div>
                {modal.description && <p className="text-sm text-gray-600 leading-relaxed mb-4">{modal.description}</p>}
                {showInq && !inqDone && (
                  <div className="border border-gray-200 rounded-xl p-4 mb-2">
                    <div className="text-xs font-bold text-[#0F2557] uppercase tracking-wide mb-3">Send Inquiry</div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#0F2557]" placeholder="Your name" />
                      <input className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#0F2557]" placeholder="Company" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#0F2557]" placeholder="Phone / WhatsApp" type="tel" />
                      <input className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#0F2557]" placeholder="Qty needed" type="number" />
                    </div>
                    <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#0F2557] mb-2" placeholder="Email address" type="email" />
                    <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#0F2557] resize-none mb-3" rows={2} placeholder="Any specific requirements..." />
                    <button onClick={() => setInqDone(true)} className="w-full bg-[#0F2557] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1A3570]">Send inquiry</button>
                  </div>
                )}
                {inqDone && (
                  <div className="border border-green-100 bg-green-50 rounded-xl p-4 mb-2 text-center">
                    <div className="text-green-500 text-3xl mb-2">✓</div>
                    <div className="text-sm font-semibold text-gray-800 mb-1">Inquiry sent!</div>
                    <div className="text-xs text-gray-400">We will contact you within 24 hours</div>
                  </div>
                )}
              </div>
            </div>
            {!inqDone && (
              <div className="p-4 border-t border-gray-100 flex flex-col gap-2 shrink-0 bg-white">
                <button onClick={() => inquireWA(modal)} className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90">
                  <WaIcon className="w-5 h-5" /> Inquire on WhatsApp
                </button>
                <button onClick={() => setShowInq(!showInq)} className="w-full flex items-center justify-center gap-2 bg-[#0F2557] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#1A3570]">
                  {showInq ? 'Close form' : 'Send inquiry form'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
