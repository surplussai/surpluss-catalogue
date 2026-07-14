import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = {
  title: { default: 'Surpluss — Global Inventory Exchange', template: '%s | Surpluss' },
  description: 'Premium surplus inventory at wholesale prices.',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
