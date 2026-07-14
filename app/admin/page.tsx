'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Catalogue } from '@/types'
import { formatDate } from '@/lib/utils'

export default function AdminPage() {
  const [catalogues, setCatalogues] = useState<Catalogue[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://catalogue.surpluss.co'

  useEffect(() => {
    fetch('/api/catalogues/list').then(r => r.json()).then(d => {
      setCatalogues(d.catalogues || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  function copy(url: string, id: string) {
    navigator.clipboard?.writeText(url)
    setCopied(id); setTimeout(() => setCopied(null), 2000)
  }

  function shareWA(c: Catalogue) {
    const url = `${appUrl}/deals/${c.catalogueId}`
    const msg = `*${c.name}* — ${c.productCount} products at wholesale prices.\n\nView catalogue: ${url}\n\n_Surpluss — Global Inventory Exchange_`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[#0F2557] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-[#0F2557] text-sm">S</div>
          <div><div className="text-white font-bold text-sm">Surpluss</div><div className="text-white/50 text-[10px] uppercase tracking-wide">Catalogue Admin</div></div>
        </div>
        <Link href="/import" className="flex items-center gap-1.5 bg-[#F5A623] text-[#0F2557] px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#D4881A] transition-colors">
          + Publish new deal
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#0F2557]">Catalogue history</h1>
            <p className="text-sm text-gray-500 mt-0.5">{catalogues.length} deal{catalogues.length !== 1 ? 's' : ''} published</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="w-8 h-8 border-2 border-[#0F2557] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading catalogues…
          </div>
        ) : catalogues.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-base font-semibold text-gray-800 mb-2">No catalogues yet</h2>
            <p className="text-sm text-gray-400 mb-6">Publish your first deal catalogue to see it here.</p>
            <Link href="/import" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F2557] text-white text-sm font-semibold rounded-lg hover:bg-[#1A3570]">
              Publish first deal →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {catalogues.map(c => {
              const shareUrl = `${appUrl}/deals/${c.catalogueId}`
              return (
                <div key={c.catalogueId} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#0F2557] transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h2 className="text-base font-semibold text-gray-800">{c.name}</h2>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${c.isArchived ? 'bg-gray-100 text-gray-500' : c.isActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {c.isArchived ? 'Archived' : c.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {c.category && <span className="text-[10px] font-medium px-2 py-0.5 bg-[#EEF1F8] text-[#0F2557] rounded-full">{c.category}</span>}
                      </div>
                      <div className="text-xs text-gray-500 mb-3">
                        {c.productCount} product{c.productCount !== 1 ? 's' : ''} · Published {formatDate(c.createdAt)}
                        {c.dealExpiry ? ` · Expires ${c.dealExpiry}` : ''}
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                        <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                        <span className="text-xs text-gray-500 font-mono flex-1 truncate">{shareUrl}</span>
                        <button onClick={() => copy(shareUrl, c.catalogueId)} className="text-xs font-medium text-[#0F2557] hover:underline shrink-0">
                          {copied === c.catalogueId ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Link href={`/admin/${c.catalogueId}`} className="px-4 py-2 bg-[#0F2557] text-white text-xs font-semibold rounded-lg hover:bg-[#1A3570] text-center">Edit</Link>
                      <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:border-[#0F2557] text-center">View</a>
                      <button onClick={() => shareWA(c)} className="px-4 py-2 bg-[#25D366] text-white text-xs font-semibold rounded-lg hover:opacity-90 text-center">WhatsApp</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
