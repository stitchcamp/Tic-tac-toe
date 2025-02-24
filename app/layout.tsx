import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tic-tac-toe',
  description: 'Created to play tic-tac-toe',
  generator: 'stitchcamp',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
