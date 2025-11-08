import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Unspun Media Annotation',
  description: 'Sentence-level media bias detection system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
