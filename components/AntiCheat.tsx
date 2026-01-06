'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { AlertTriangle, X, ShieldAlert } from 'lucide-react'

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
    const [isFullscreenWarning, setIsFullscreenWarning] = useState(false)
    const violationRef = useRef(0)
    const lastViolationTimeRef = useRef(0)
    const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleViolation = useCallback((type: string) => {
        if (!enabled) return

        // Debounce: prevent multiple violations within 1 second
        const now = Date.now()
        if (now - lastViolationTimeRef.current < 1000) {
            return
        }
        lastViolationTimeRef.current = now

        const newCount = violationRef.current + 1
        violationRef.current = newCount
        setViolations(newCount)

        // Show warning
        setWarningMessage('Warning ' + newCount + '/' + (maxViolations - 1) + ': ' + type)
        setShowWarning(true)

        // Call parent handler
        onViolation(type, newCount)

        // Check if max violations reached
        if (newCount >= maxViolations - 1) {
            setWarningMessage('Maximum violations reached. Exam will be auto-submitted.')
            setIsFullscreenWarning(true)
            setTimeout(() => {
                onMaxViolations()
            }, 3000)
            return
        }

        // Auto-hide warning after 5 seconds
        if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current)
        }
        warningTimeoutRef.current = setTimeout(() => {
            setShowWarning(false)
        }, 5000)
    }, [enabled, maxViolations, onViolation, onMaxViolations])

    useEffect(() => {
        if (!enabled) return

        // ============================================
        // TAB SWITCH / VISIBILITY CHANGE DETECTION
        // ============================================
        const handleVisibilityChange = () => {
            if (document.hidden || document.visibilityState === 'hidden') {
                handleViolation('You switched to another tab or minimized the window')
            }
        }

        // ============================================
        // WINDOW BLUR DETECTION (clicking outside)
        // ============================================
        const handleWindowBlur = () => {
            // Small delay to avoid false positives
            setTimeout(() => {
                if (document.visibilityState === 'visible') {
                    handleViolation('You clicked outside the exam window')
                }
            }, 200)
        }

        // ============================================
        // COPY PREVENTION
        // ============================================
        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault()
            e.stopPropagation()
            handleViolation('Copy attempt blocked')
            return false
        }

        // ============================================
        // CUT PREVENTION
        // ============================================
        const handleCut = (e: ClipboardEvent) => {
            e.preventDefault()
            e.stopPropagation()
            handleViolation('Cut attempt blocked')
            return false
        }

        // ============================================
        // RIGHT-CLICK PREVENTION
        // ============================================
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
            // Don't add violation for right-click, just block it
            return false
        }

        // ============================================
        // KEYBOARD SHORTCUTS PREVENTION
        // ============================================
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase()
            const isCtrl = e.ctrlKey || e.metaKey

            // Block Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, Ctrl+P, Ctrl+S, Ctrl+U
            if (isCtrl && ['c', 'v', 'x', 'a', 'p', 's', 'u'].includes(key)) {
                e.preventDefault()
                e.stopPropagation()
                if (['c', 'x'].includes(key)) {
                    handleViolation('Keyboard shortcut Ctrl+' + key.toUpperCase() + ' blocked')
                }
                return false
            }

            // Block F12 (DevTools)
            if (e.key === 'F12') {
                e.preventDefault()
                e.stopPropagation()
                handleViolation('Developer tools shortcut blocked')
                return false
            }

            // Block Ctrl+Shift+I (DevTools)
            if (isCtrl && e.shiftKey && key === 'i') {
                e.preventDefault()
                e.stopPropagation()
                handleViolation('Developer tools shortcut blocked')
                return false
            }

            // Block Ctrl+Shift+J (Console)
            if (isCtrl && e.shiftKey && key === 'j') {
                e.preventDefault()
                e.stopPropagation()
                handleViolation('Developer tools shortcut blocked')
                return false
            }

            // Block Ctrl+Shift+C (Inspect)
            if (isCtrl && e.shiftKey && key === 'c') {
                e.preventDefault()
                e.stopPropagation()
                return false
            }

            // Detect PrintScreen (can't prevent, but can detect)
            if (e.key === 'PrintScreen') {
                handleViolation('Screenshot key detected')
            }

            // Block Alt+Tab (can detect, may not prevent)
            if (e.altKey && e.key === 'Tab') {
                e.preventDefault()
                handleViolation('Alt+Tab detected')
            }
        }

        // ============================================
        // PRINT PREVENTION
        // ============================================
        const handleBeforePrint = () => {
            handleViolation('Print attempt detected')
        }

        // ============================================
        // DEVTOOLS DETECTION (resize method)
        // ============================================
        let devtoolsOpen = false
        const checkDevTools = () => {
            const threshold = 160
            const widthThreshold = window.outerWidth - window.innerWidth > threshold
            const heightThreshold = window.outerHeight - window.innerHeight > threshold

            if (widthThreshold || heightThreshold) {
                if (!devtoolsOpen) {
                    devtoolsOpen = true
                    handleViolation('Developer tools detected')
                }
            } else {
                devtoolsOpen = false
            }
        }

        // ============================================
        // DRAG PREVENTION (prevent dragging text/images)
        // ============================================
        const handleDragStart = (e: DragEvent) => {
            e.preventDefault()
            return false
        }

        // ============================================
        // SELECT START PREVENTION
        // ============================================
        const handleSelectStart = (e: Event) => {
            // Allow selection in input fields
            const target = e.target as HTMLElement
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                return true
            }
            e.preventDefault()
            return false
        }

        // Add all event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange)
        window.addEventListener('blur', handleWindowBlur)
        document.addEventListener('copy', handleCopy, true)
        document.addEventListener('cut', handleCut, true)
        document.addEventListener('contextmenu', handleContextMenu, true)
        document.addEventListener('keydown', handleKeyDown, true)
        window.addEventListener('beforeprint', handleBeforePrint)
        document.addEventListener('dragstart', handleDragStart, true)
        document.addEventListener('selectstart', handleSelectStart, true)

        // DevTools check interval
        const devToolsInterval = setInterval(checkDevTools, 1000)

        // Cleanup
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('blur', handleWindowBlur)
            document.removeEventListener('copy', handleCopy, true)
            document.removeEventListener('cut', handleCut, true)
            document.removeEventListener('contextmenu', handleContextMenu, true)
            document.removeEventListener('keydown', handleKeyDown, true)
            window.removeEventListener('beforeprint', handleBeforePrint)
            document.removeEventListener('dragstart', handleDragStart, true)
            document.removeEventListener('selectstart', handleSelectStart, true)
            clearInterval(devToolsInterval)
            if (warningTimeoutRef.current) {
                clearTimeout(warningTimeoutRef.current)
            }
        }
    }, [enabled, handleViolation])

    // Fullscreen warning overlay when max violations reached
    if (isFullscreenWarning) {
        return (
            <div className="fixed inset-0 z-[200] bg-red-900/95 flex items-center justify-center">
                <div className="text-center text-white p-8">
                    <ShieldAlert className="w-20 h-20 mx-auto mb-6 animate-pulse" />
                    <h1 className="text-3xl font-bold mb-4">Exam Terminated</h1>
                    <p className="text-xl mb-2">Maximum violations reached.</p>
                    <p className="text-lg opacity-80">Your exam is being auto-submitted...</p>
                    <div className="mt-8">
                        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            className="relative"
            style={{
                userSelect: 'none',
                WebkitUserSelect: 'none'
            }}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
        >
            {/* Warning Banner */}
            {showWarning && (
                <div className="fixed top-0 left-0 right-0 z-[100]">
                    <div
                        className={'p-4 text-center backdrop-blur-sm ' + (
                            violations >= maxViolations - 2
                                ? 'bg-red-600/95'
                                : 'bg-yellow-500/95'
                        )}
                    >
                        <div className="flex items-center justify-center gap-3">
                            <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
                            <span className="text-white font-bold text-lg">{warningMessage}</span>
                            <button
                                onClick={() => setShowWarning(false)}
                                className="ml-4 p-1 hover:bg-white/20 rounded"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                        {violations < maxViolations - 1 && (
                            <p className="text-white/90 text-sm mt-2">
                                {maxViolations - 1 - violations} warning(s) remaining before automatic submission
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Violation Counter Badge - Always visible when there are violations */}
            {enabled && violations > 0 && !isFullscreenWarning && (
                <div className="fixed top-4 right-4 z-50">
                    <div
                        className={'px-4 py-3 rounded-lg font-medium shadow-lg ' + (
                            violations >= maxViolations - 2
                                ? 'bg-red-500 text-white'
                                : 'bg-yellow-500 text-black'
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="font-bold">Warnings: {violations}/{maxViolations - 1}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Security Notice */}
            {enabled && violations === 0 && (
                <div className="fixed bottom-4 right-4 z-40">
                    <div className="px-3 py-2 rounded-lg bg-green-500/20 text-green-400 text-xs border border-green-500/30">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4" />
                            <span>Anti-cheat active</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            {children}
        </div>
    )
}
