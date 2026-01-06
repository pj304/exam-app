// Utility functions

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getScoreGrade(percentage: number): { grade: string; color: string } {
  if (percentage >= 90) return { grade: 'Excellent', color: 'text-green-400' }
  if (percentage >= 80) return { grade: 'Very Good', color: 'text-green-500' }
  if (percentage >= 75) return { grade: 'Good', color: 'text-blue-400' }
  if (percentage >= 60) return { grade: 'Passed', color: 'text-yellow-400' }
  return { grade: 'Failed', color: 'text-red-400' }
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function generateSessionToken(): string {
  return `exam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Check if user's email domain is allowed
export function isEmailAllowed(email: string): boolean {
  const allowedDomains = process.env.NEXT_PUBLIC_ALLOWED_DOMAINS
  
  if (!allowedDomains || allowedDomains.trim() === '') {
    // If no domain restriction, allow all Gmail accounts
    return email.endsWith('@gmail.com') || true
  }
  
  const domains = allowedDomains.split(',').map(d => d.trim().toLowerCase())
  const emailDomain = email.split('@')[1]?.toLowerCase()
  
  return domains.includes(emailDomain)
}

// Debounce function for auto-save
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Calculate percentage
export function calculatePercentage(score: number, total: number): number {
  if (total === 0) return 0
  return Math.round((score / total) * 100)
}

// Validate session is still active
export function isSessionExpired(startedAt: string, durationMinutes: number): boolean {
  const startTime = new Date(startedAt).getTime()
  const expiryTime = startTime + (durationMinutes * 60 * 1000)
  return Date.now() > expiryTime
}

// Get remaining time in seconds
export function getRemainingTime(startedAt: string, durationMinutes: number): number {
  const startTime = new Date(startedAt).getTime()
  const expiryTime = startTime + (durationMinutes * 60 * 1000)
  const remaining = Math.max(0, expiryTime - Date.now())
  return Math.floor(remaining / 1000)
}
