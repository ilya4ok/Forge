'use client'

import { XPNotifications } from '@/components/notifications/XPNotifications'
import { AtmosphericDecor } from '@/components/layout/AtmosphericDecor'

export function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AtmosphericDecor />
      {children}
      <XPNotifications />
    </>
  )
}
