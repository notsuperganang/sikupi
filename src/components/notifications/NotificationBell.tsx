'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NotificationDropdown } from './NotificationDropdown'
import { useNotifications } from '@/hooks/useNotifications'

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { unreadCount, isConnected, error } = useNotifications()

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        className="relative h-9 w-9 rounded-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
        {/* Connection status indicator */}
        <div 
          className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white ${
            isConnected ? 'bg-green-500' : error ? 'bg-red-500' : 'bg-gray-400'
          }`}
          title={
            isConnected ? 'Connected' : error ? 'Connection error' : 'Connecting...'
          }
        />
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <NotificationDropdown 
          onClose={() => setIsOpen(false)}
          className="absolute right-0 top-full mt-2 z-50"
        />
      )}
    </div>
  )
}