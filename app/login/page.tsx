'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/admin'
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    })
    if (res.ok) { router.push(redirectTo); router.refresh() }
    else { setError('Incorrect password.'); setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#0F2557] rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">S</div>
          <h1 className="text-xl font-bold text-[#0F2557]">Surpluss Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your team password</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <form onSubmit={submit} className="space-y-4">
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} required autoFocus placeholder="••••••••"
              className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0F2557] transition-colors" />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full h-11 bg-[#0F2557] text-white text-sm font-semibold rounded-lg hover:bg-[#1A3570] disabled:opacity-50 transition-colors">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">Surpluss team access only</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
