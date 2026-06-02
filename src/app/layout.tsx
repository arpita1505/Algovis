import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AlgoVis — Interactive Algorithm Visualizer',
  description: 'Learn DSA by watching algorithms work in real time. Sorting, graphs, trees, search and more.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
