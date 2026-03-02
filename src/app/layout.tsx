import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { LayoutClient } from '@/components/layout/LayoutClient'

export const metadata: Metadata = {
  title: 'Personal Dashboard',
  description: 'Илья — личный дашборд',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <LayoutClient>{children}</LayoutClient>
        </main>
      </body>
    </html>
  )
}
