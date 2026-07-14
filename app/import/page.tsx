'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { useStore } from '@/store'

export default function ImportPage() {
  const router = useRouter()
  const { setRawRows } = useStore()
  const [dragging, setDragging] = useState(false)
  const [pasted, setPasted] = useState('')
  const [error, setError] = useState('')

  function parseFile(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: 'binary' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false }) as Record<string, string>[]
        if (!data.length) { setError('No data found in file.'); return }
        setRawRows(data, file.name)
        router.push('/import/map')
      } catch { setError('Could not read file. Use .xlsx, .xls or .csv') }
    }
    reader.readAsBinaryString(file)
  }

  function parsePaste() {
    const text = pasted.trim()
    if (!text) { setError('Paste your data first.'); return }
    const lines = text.split('\n').filter(l => l.trim())
    if (lines.length < 2) { setError('Need header row + at least one product.'); return }
    const sep = lines[0].includes('\t') ? '\t' : ','
    const headers = lines[0].split(sep).map(h => h.trim().replace(/^"|"$/g, ''))
    const rows = lines.slice(1).map(line => {
      const vals = line.split(sep)
      const obj: Record<string, string> = {}
      headers.forEach((h, i) => { obj[h] = (vals[i] || '').trim().replace(/^"|"$/g, '') })
      return obj
    }).filter(r => Object.values(r).some(v => v))
    if (!rows.length) { setError('No valid rows found.'); return }
    setRawRows(rows, 'Pasted data')
    router.push('/import/map')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[#0F2557] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-[#0F2557] text-sm">S</div>
          <div><div className="text-white font-bold text-sm">Surpluss</div><div className="text-white/50 text-[10px] uppercase tracking-wide">Catalogue Publisher</div></div>
        </div>
        <a href="/admin" className="text-white/60 hover:text-white text-xs">← History</a>
      </nav>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 flex">
          {['Upload data','Map columns','Name deal','Done'].map((s, i) => (
            <div key={s} className={`px-4 py-3 text-xs font-medium border-b-2 ${i === 0 ? 'border-[#0F2557] text-[#0F2557]' : 'border-transparent text-gray-400'}`}>
              <span className="mr-1.5">{i+1}</span>{s}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-xl font-bold text-[#0F2557] mb-1">Upload product data</h1>
        <p className="text-sm text-gray-500 mb-8">Drop an Excel file or paste rows from Google Sheets. Each row becomes a product saved permanently to your catalogue.</p>

        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) parseFile(f) }}
          onClick={() => document.getElementById('fi')?.click()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all mb-6 ${dragging ? 'border-[#0F2557] bg-[#EEF1F8]' : 'border-gray-300 bg-white hover:border-[#0F2557] hover:bg-[#EEF1F8]'}`}
        >
          <div className="text-4xl mb-3">📊</div>
          <div className="text-base font-semibold text-gray-800 mb-1">Drop Excel or CSV file here</div>
          <div className="text-sm text-gray-400 mb-4">.xlsx · .xls · .csv</div>
          <button className="px-5 py-2.5 bg-[#0F2557] text-white text-sm font-semibold rounded-lg" onClick={e => { e.stopPropagation(); document.getElementById('fi')?.click() }}>Browse file</button>
        </div>
        <input id="fi" type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => e.target.files?.[0] && parseFile(e.target.files[0])} />

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or paste from Excel / Google Sheets</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <textarea className="w-full border border-gray-200 rounded-lg p-3 text-xs font-mono text-gray-800 resize-none focus:outline-none focus:border-[#0F2557] bg-gray-50 mb-3" rows={5}
            value={pasted} onChange={e => setPasted(e.target.value)}
            placeholder={`Paste rows from Excel (Ctrl+A, Ctrl+C)\n\nProduct Name\tBrand\tCategory\tMRP\tOffer Price\tMOQ\nVIP Trolley 55cm\tVIP\tTravel\t6500\t2499\t50`} />
          {error && <p className="text-red-600 text-xs mb-3">{error}</p>}
          <div className="flex justify-end">
            <button onClick={parsePaste} className="px-5 py-2.5 bg-[#0F2557] text-white text-sm font-semibold rounded-lg hover:bg-[#1A3570] transition-colors">Parse data →</button>
          </div>
        </div>

        <div className="mt-6 bg-[#FEF3DC] border border-yellow-200 rounded-xl p-4">
          <div className="text-xs font-semibold text-[#92400E] mb-2 uppercase tracking-wide">Supported columns</div>
          <div className="grid grid-cols-2 gap-1">
            {['Product Name','Brand','Category','MRP','Offer Price','MOQ','Quantity','Location','Description','Expiry Date','Image URL 1','Image URL 2'].map(c => (
              <div key={c} className="text-xs text-[#92400E] flex items-center gap-1"><span className="text-[#D4881A]">✓</span>{c}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
