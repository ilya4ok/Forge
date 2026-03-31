import { LayoutClient } from '@/components/layout/LayoutClient'

export const dynamic = 'force-dynamic'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <LayoutClient>{children}</LayoutClient>
}
