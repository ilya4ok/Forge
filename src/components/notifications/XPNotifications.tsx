'use client'

import { useNotificationStore } from '@/lib/notifications'

export function XPNotifications() {
  const { notifications } = useNotificationStore()

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className="animate-xp-pop"
          style={{
            background: `linear-gradient(135deg, ${notification.color}cc, ${notification.color}88)`,
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: `0 0 16px ${notification.color}66`,
            whiteSpace: 'nowrap',
          }}
        >
          +{notification.xp} XP
        </div>
      ))}
    </div>
  )
}
