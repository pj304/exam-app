'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { formatTime, getRemainingTime } from '@/lib/utils'
import { EXAM_CONFIG } from '@/lib/config'

interface TimerProps {
  startedAt: string
  onTimeUp: () => void
}

export default function Timer({ startedAt, onTimeUp }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(() => 
    getRemainingTime(startedAt, EXAM_CONFIG.DURATION_MINUTES)
  )

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getRemainingTime(startedAt, EXAM_CONFIG.DURATION_MINUTES)
      setTimeLeft(remaining)

      if (remaining <= 0) {
        clearInterval(timer)
        onTimeUp()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [startedAt, onTimeUp])

  const isWarning = timeLeft <= 600 && timeLeft > 120 // 10 min to 2 min
  const isDanger = timeLeft <= 120 // Less than 2 min

  const timerClass = isDanger 
    ? 'timer-danger' 
    : isWarning 
    ? 'timer-warning' 
    : ''

  return (
      <div className={`flex items-center gap-2 font-mono text-lg ${timerClass}`}>
      <Clock className="w-5 h-5" />
      <span className="font-bold">{formatTime(timeLeft)}</span>
      {isDanger && <span className="text-xs">(Hurry!)</span>}
    </div>
  )
}
