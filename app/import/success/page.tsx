'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store'
import { buildWAMessage } from '@/lib/utils'

export default function SuccessPage() {
  const router = useRouter()
  const { publishResult, reset } = useStore()
  const [copied, setCopied] = useState(false)
  useEffect(() => { if (!publishResult) router.replace('/import') }, [publishResult, router])
  if (!publishResult) return null
  const { url, catalogueId, productCount } = publishResult

  function copy() {
    navigator.clipboard?.writeText(url)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  function shareWA() {
    const msg = buildWAMessage(catalogueId, url, productCount)
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  function shareEmail() {
    window.open(`mailto:?subject=${encodeURIComponent('Surpluss Deals')}&body=${encodeURIComponent(`View our latest catalogue: ${url}`)}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
        </div>
        <h1 className="text-2xl font-bold text-[#0F2557] mb-2">Catalogue is live!</h1>
        <p className="text-sm text-gray-500 mb-8">{productCount} products saved to AWS. Share the link with buyers — it works on any device, any time, forever.</p>

        <div className="bg-[#EEF1F8] border border-[#CBD5E0] rounded-xl px-4 py-3 flex items-center gap-2 mb-6">
          <svg className="w-4 h-4 text-[#0F2557] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
          <span className="text-xs text-[#0F2557] font-mono flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{url}</span>
          <button onClick={copy} className="text-xs font-semibold text-[#0F2557] bg-white border border-gray-200 px-2.5 py-1.5 rounded-lg shrink-0">
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          <button onClick={shareWA} className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl text-sm font-semibold">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
            Share on WhatsApp
          </button>
          <button onClick={shareEmail} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-semibold">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            Share via Email
          </button>
          <a href={url} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-[#0F2557] text-white py-3 rounded-xl text-sm font-semibold">
            View live catalogue →
          </a>
        </div>

        <div className="flex gap-3">
          <button onClick={() => { reset(); router.push('/import') }} className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-lg">Publish another</button>
          <button onClick={() => router.push('/admin')} className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-lg">View history</button>
        </div>
      </div>
    </div>
  )
}
