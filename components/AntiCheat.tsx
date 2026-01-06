'use client'

import { useEffect, useCallback, useState, ReactNode } from 'react'
import { ANTI_CHEAT_CONFIG } from '@/lib/config'
import { AlertTriangle, Eye, X } from 'lucide-react'

interface AntiCheatProps {
  children: ReactNode
  onViolation: (type: string, count: number) => void
  onMaxViolations: () => void
  maxViolations?: number
  enabled?: boolean
}

export default function AntiCheat({
  children,
  onViolation,
  onMaxViolations,
  maxViolations = 3,
  enabled = true,
}: AntiCheatProps) {
  const [violations, setViolations] = useState(0)
  const [showWarning, setShowWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')
  const [isReconnecting, setIsReconnecting] = useState(false)

  const handleViolation = useCallback((type: string) => {
    setViolations(prev => {
      const newCount = prev + 1
      onViolation(type, newCount)

      if (newCount >= maxViolations) {
        onMaxViolations()
        setWarningMessage('Maximum violations reached. Your exam will be submitted.')
      } else {
        setWarningMessage(`Warning: ${type}. You have ${maxViolations - newCount} warning(s) remaining.`)
      }
      
      setShowWarning(true)
      return newCount
    })
  }, [maxViolations, onViolation, onMaxViolations])

  useEffect(() => {
    if (!enabled) return

    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => {
      if (ANTI_CHEAT_CONFIG.DISABLE_RIGHT_CLICK) {
        e.preventDefault()
      }
    }

    // Disable keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!ANTI_CHEAT_CONFIG.DISABLE_SHORTCUTS) return

      // Prevent common shortcuts
      const blockedKeys = [
        // Copy/paste
        { ctrl: true, key: 'c' },
        { ctrl: true, key: 'v' },
        { ctrl: true, key: 'x' },
        { ctrl: true, key: 'a' },
        // Developer tools
        { key: 'F12' },
        { ctrl: true, shift: true, key: 'I' },
        { ctrl: true, shift: true, key: 'J' },
        { ctrl: true, shift: true, key: 'C' },
        { ctrl: true, key: 'u' },
        // Print
        { ctrl: true, key: 'p' },
        // Save
        { ctrl: true, key: 's' },
        // Find
        { ctrl: true, key: 'f' },
        // Print Screen
        { key: 'PrintScreen' },
      ]

      const isBlocked = blockedKeys.some(blocked => {
        const ctrlMatch = blocked.ctrl ? (e.ctrlKey || e.metaKey) : true
        const shiftMatch = blocked.shift ? e.shiftKey : true
        const keyMatch = e.key.toLowerCase() === blocked.key.toLowerCase() || 
                        e.key === blocked.key
        return ctrlMatch && shiftMatch && keyMatch
      })

      if (isBlocked) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    // Visibility change detection
    const handleVisibilityChange = () => {
      if (!ANTI_CHEAT_CONFIG.DETECT_VISIBILITY_CHANGE) return

      if (document.hidden) {
        handleViolation('Tab switch or window minimized')
      }
    }

    // Window blur detection
    const handleBlur = () => {
      if (!ANTI_CHEAT_CONFIG.DETECT_WINDOW_BLUR) return
      
      // Give a small grace period for slow connections
      setTimeout(() => {
        if (!document.hasFocus()) {
          handleViolation('Left exam window')
        }
      }, 500)
    }

    // Online/offline detection for slow internet handling
    const handleOffline = () => {
      setIsReconnecting(true)
      setWarningMessage('Connection lost. Your answers are saved. Reconnecting...')
      setShowWarning(true)
    }

    const handleOnline = () => {
      setIsReconnecting(false)
      setShowWarning(false)
    }

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [enabled, handleViolation])

  return (
    <div className="no-select">
      {children}

      {/* Warning Modal */}
      {showWarning && (
        <div className="warning-overlay animate-fade-in">
          <div className="glass-card p-8 max-w-md mx-4 animate-shake">
            <div className="flex items-center gap-4 mb-6">
              {isReconnecting ? (
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <div className="spinner !w-6 !h-6 !border-yellow-500 !border-t-transparent"></div>
                </div>
              ) : (
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-white">
                  {isReconnecting ? 'Connection Issue' : 'Warning!'}
                </h3>
                <p className="text-exam-muted text-sm">
                  {isReconnecting ? 'Please wait...' : `Violation ${violations}/${maxViolations}`}
                </p>
              </div>
            </div>

            <p className="text-exam-text mb-6">
              {warningMessage}
            </p>

            {!isReconnecting && violations < maxViolations && (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowWarning(false)}
                  className="btn-primary flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Return to Exam
                </button>
              </div>
            )}

            {violations >= maxViolations && (
              <p className="text-red-400 text-sm text-center">
                Your exam is being submitted automatically...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
