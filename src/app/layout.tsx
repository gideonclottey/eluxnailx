import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nail Studio – Book an Appointment',
  description: 'Book your nail appointment online. Easy, fast, and hassle-free.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ backgroundColor: '#fdf8f9' }}>
        {children}
      </body>
    </html>
  )
}
