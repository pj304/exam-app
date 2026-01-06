'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface AntiCheatProps {
    children: React.ReactNode
    onViolation: (type: string, count: number) => void
    onMaxViolations: () => void
    maxViolations: number
    enabled: boolean
}

export default function AntiCheat({
    children,
    onViolation,
    onMaxViolations,
    maxViolations,
    enabled
}: AntiCheatProps) {
    const [violations, setViolations] = useState(0)
    const [showWarning, setShowWarning] = useState(false)
    const [warningMessage, setWarningMessage] = useState('')
    const violationRef = useRef(0)
    const isInitializedRef = useRef(false)
    const lastVisibilityStateRef = useRef<string>('visible')

    const handleViolation = useCallback((type: string) => {
        if (!enabled) return

        // Prevent duplicate violations within short time frame
        const newCount = violationRef.current + 1
        violationRef.current = newCount
        setViolations(newCount)

        // Show warning
        setWarningMessage(`Warning ${newCount}/${maxViolations - 1}: ${type}`)
        setShowWarning(true)

        // Call parent handler
        onViolation(type, newCount)

        // Check if max violations reached
        if (newCount >= maxViolations - 1) {
            setWarningMessage('Maximum violations reached. Exam will be auto-submitted.')
            setTimeout(() => {
                onMaxViolations()
            }, 2000)
        }

        // Auto-hide warning after 5 seconds
        setTimeout(() => {
            setShowWarning(false)
        }, 5000)
    }, [enabled, maxViolations, onViolation, onMaxViolations])

    useEffect(() => {
        if (!enabled || isInitializedRef.current) return
        isInitializedRef.current = true

        // Handle visibility change (tab switch, minimize)
        const handleVisibilityChange = () => {
            const currentState = document.visibilityState

            // Only trigger violation when going from visible to hidden
            // This prevents false positives when returning to the tab
            if (lastVisibilityStateRef.current === 'visible' && currentState === 'hidden') {
                handleViolation('Tab switch or window minimized detected')
            }

            lastVisibilityStateRef.current = currentState
        }

        // Handle window blur (clicking outside browser window)
        const handleWindowBlur = () => {
            // Only trigger if document is still visible (user clicked outside, not tab switch)
            // Tab switches are handled by visibilitychange
            if (document.visibilityState === 'visible') {
                // Small delay to check if this is a real blur or just a tab switch
                setTimeout(() => {
                    if (document.visibilityState === 'visible' && !document.hasFocus()) {
                        handleViolation('Window focus lost - clicked outside browser')
                    }
                }, 100)
            }
        }

        // Prevent copy
        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault()
            handleViolation('Copy attempt detected')
        }

        // Prevent cut
        const handleCut = (e: ClipboardEvent) => {
            e.preventDefault()
            handleViolation('Cut attempt detected')
        }

        // Prevent paste (optional - may want to allow for identification answers)
        // const handlePaste = (e: ClipboardEvent) => {
        //   e.preventDefault()
        //   handleViolation('Paste attempt detected')
        // }

        // Prevent right-click
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault()
            // Don't count right-click as violation, just prevent it
        }

        // Prevent keyboard shortcuts
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, Ctrl+P, F12
            if (e.ctrlKey || e.metaKey) {
                const blockedKeys = ['c', 'v', 'x', 'a', 'p', 's', 'u']
                if (blockedKeys.includes(e.key.toLowerCase())) {
                    e.preventDefault()
                    // Only count copy/paste as violation
                    if (['c', 'v', 'x'].includes(e.key.toLowerCase())) {
                        handleViolation(`Keyboard shortcut Ctrl+${e.key.toUpperCase()} detected`)
                    }
                }
            }

            // Prevent F12 (DevTools)
            if (e.key === 'F12') {
                e.preventDefault()
                handleViolation('Developer tools shortcut detected')
            }

            // Prevent PrintScreen
            if (e.key === 'PrintScreen') {
                e.preventDefault()
                handleViolation('Screenshot attempt detected')
            }
        }

        // Prevent print
        const handleBeforePrint = () => {
            handleViolation('Print attempt detected')
        }

        // Add event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange)
        document.addEventListener('copy', handleCopy)
        document.addEventListener('cut', handleCut)
        document.addEventListener('contextmenu', handleContextMenu)
        document.addEventListener('keydown', handleKeyDown)
        window.addEventListener('blur', handleWindowBlur)
        window.addEventListener('beforeprint', handleBeforePrint)

        // Cleanup
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            document.removeEventListener('copy', handleCopy)
            document.removeEventListener('cut', handleCut)
            document.removeEventListener('contextmenu', handleContextMenu)
            document.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('blur', handleWindowBlur)
            window.removeEventListener('beforeprint', handleBeforePrint)
        }
    }, [enabled, handleViolation])

    return (
        <div className="relative select-none">
            {/* Warning Banner */}
            {showWarning && (
                <div className="fixed top-0 left-0 right-0 z-[100] animate-slide-down">
                    <div className={`p-4 text-center ${violations >= maxViolations - 2
                            ? 'bg-red-500/90'
                            : 'bg-yellow-500/90'
                        } backdrop-blur-sm`}>
                        <div className="flex items-center justify-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-white" />
                            <span className="text-white font-medium">{warningMessage}</span>
                            <button
                                onClick={() => setShowWarning(false)}
                                className="ml-4 p-1 hover:bg-white/20 rounded"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>
                        {violations < maxViolations - 1 && (
                            <p className="text-white/80 text-sm mt-1">
                                {maxViolations - 1 - violations} warning(s) remaining before auto-submit
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Violation Counter Badge */}
            {enabled && violations > 0 && (
                <div className="fixed top-20 right-4 z-50">
                    <div className={`px-3 py-2 rounded-lg text-sm font-medium ${violations >= maxViolations - 2
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Warnings: {violations}/{maxViolations - 1}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            {children}
        </div>
    )
}