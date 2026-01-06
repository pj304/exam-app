'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { EXAM_QUESTIONS, TOTAL_POINTS } from '@/lib/questions'
import { EXAM_CONFIG } from '@/lib/config'
import { formatDateTime, getScoreGrade, calculatePercentage } from '@/lib/utils'
import { 
  Trophy, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Home,
  Award,
  Target,
  BarChart3
} from 'lucide-react'

interface ExamResult {
  id: string
  started_at: string
  submitted_at: string
  score: number
  total_points: number
  tab_switches: number
  warnings: string[]
  answers: Record<string, string>
}

interface User {
  id: string
  email: string
  full_name: string | null
}

export default function ResultsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [result, setResult] = useState<ExamResult | null>(null)

  useEffect(() => {
    loadResults()
  }, [])

  async function loadResults() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        router.push('/login')
        return
      }

      // Get user data
      const { data: userData } = await supabase
        .from('users')
        .select('id, email, full_name')
        .eq('id', session.user.id)
        .single()

      if (!userData) {
        router.push('/login')
        return
      }

      setUser(userData)

      // Get submitted exam session
      const { data: examResult, error } = await supabase
        .from('exam_sessions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_submitted', true)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !examResult) {
        // No submitted exam, redirect to exam page
        router.push('/exam')
        return
      }

      setResult(examResult)
    } catch (error) {
      console.error('Error loading results:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="spinner mx-auto"></div>
          <p className="text-exam-muted">Loading results...</p>
        </div>
      </div>
    )
  }

  if (!user || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto" />
          <p className="text-exam-muted">Unable to load results.</p>
          <button onClick={() => router.push('/')} className="btn-primary">
            Return Home
          </button>
        </div>
      </div>
    )
  }

  const percentage = calculatePercentage(result.score, result.total_points)
  const isPassed = percentage >= EXAM_CONFIG.PASSING_PERCENTAGE
  const { grade, color } = getScoreGrade(percentage)

  // Count correct answers per category
  const categoryResults: Record<string, { correct: number; total: number }> = {}
  EXAM_QUESTIONS.forEach(q => {
    if (!categoryResults[q.category]) {
      categoryResults[q.category] = { correct: 0, total: 0 }
    }
    categoryResults[q.category].total++
    
    // Check if answer is correct (simplified check without revealing answer)
    const userAnswer = result.answers[q.id]?.toLowerCase().trim()
    const correctAnswer = q.correctAnswer.toLowerCase().trim()
    if (userAnswer === correctAnswer || 
        (q.type === 'identification' && correctAnswer.includes(userAnswer))) {
      categoryResults[q.category].correct++
    }
  })

  const multipleChoiceAnswered = EXAM_QUESTIONS
    .filter(q => q.type === 'multiple_choice')
    .filter(q => result.answers[q.id]?.trim()).length

  const identificationAnswered = EXAM_QUESTIONS
    .filter(q => q.type === 'identification')
    .filter(q => result.answers[q.id]?.trim()).length

  return (
    <div className="min-h-screen py-12 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-slide-in">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 ${
            isPassed 
              ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
              : 'bg-gradient-to-br from-orange-400 to-red-500'
          }`}>
            {isPassed ? (
              <Trophy className="w-10 h-10 text-white" />
            ) : (
              <Target className="w-10 h-10 text-white" />
            )}
          </div>
          
          <h1 className="text-3xl font-bold mb-2">
            {isPassed ? 'Congratulations!' : 'Exam Complete'}
          </h1>
          <p className="text-exam-muted">
            {isPassed 
              ? 'You have passed the examination!' 
              : 'Keep practicing to improve your score.'}
          </p>
        </div>

        {/* Score Card */}
        <div className="glass-card p-8 mb-8 animate-slide-in stagger-1 opacity-0">
          <div className="text-center">
            <div className="relative inline-block">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-exam-border"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - percentage / 100)}`}
                  className={isPassed ? 'text-green-400' : 'text-orange-400'}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className={`text-4xl font-bold ${color}`}>{percentage}%</span>
                <span className="text-sm text-exam-muted">{grade}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-cyan-400">{result.score}</p>
                <p className="text-sm text-exam-muted">Points Earned</p>
              </div>
              <div className="w-px h-12 bg-exam-border"></div>
              <div className="text-center">
                <p className="text-3xl font-bold text-exam-text">{result.total_points}</p>
                <p className="text-sm text-exam-muted">Total Points</p>
              </div>
            </div>
          </div>
        </div>

        {/* Exam Details */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Student Info */}
          <div className="glass-card p-6 animate-slide-in stagger-2 opacity-0">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-400" />
              Student Information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-exam-muted">Name</span>
                <span>{user.full_name || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-exam-muted">Email</span>
                <span className="truncate ml-4">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-exam-muted">Submitted</span>
                <span>{formatDateTime(result.submitted_at)}</span>
              </div>
            </div>
          </div>

          {/* Exam Stats */}
          <div className="glass-card p-6 animate-slide-in stagger-3 opacity-0">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Exam Statistics
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-exam-muted">Multiple Choice</span>
                <span>{multipleChoiceAnswered}/20 answered</span>
              </div>
              <div className="flex justify-between">
                <span className="text-exam-muted">Identification</span>
                <span>{identificationAnswered}/10 answered</span>
              </div>
              <div className="flex justify-between">
                <span className="text-exam-muted">Passing Score</span>
                <span>{EXAM_CONFIG.PASSING_PERCENTAGE}%</span>
              </div>
              {result.tab_switches > 0 && (
                <div className="flex justify-between text-yellow-400">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    Tab Switches
                  </span>
                  <span>{result.tab_switches}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance by Category */}
        <div className="glass-card p-6 mb-8 animate-slide-in stagger-4 opacity-0">
          <h3 className="text-lg font-semibold mb-4">Performance by Category</h3>
          <div className="space-y-4">
            {Object.entries(categoryResults).map(([category, data]) => {
              const catPercentage = Math.round((data.correct / data.total) * 100)
              return (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-exam-muted">{category}</span>
                    <span>{data.correct}/{data.total} ({catPercentage}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${catPercentage}%`,
                        background: catPercentage >= 60 
                          ? 'linear-gradient(90deg, #22c55e, #10b981)'
                          : 'linear-gradient(90deg, #f59e0b, #ef4444)'
                      }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Notice */}
        <div className="glass-card p-6 border-l-4 border-l-cyan-500 animate-slide-in stagger-5 opacity-0">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Your exam has been recorded</p>
              <p className="text-sm text-exam-muted mt-1">
                Your teacher can view your detailed results. The correct answers are not shown 
                to maintain exam integrity. If you have questions about specific items, 
                please consult your teacher.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 mt-8 animate-slide-in stagger-5 opacity-0">
          <button
            onClick={() => router.push('/')}
            className="btn-secondary"
          >
            <Home className="w-4 h-4 mr-2" />
            Return Home
          </button>
          <button
            onClick={handleLogout}
            className="btn-primary"
          >
            Sign Out
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-exam-muted text-xs mt-12">
          {EXAM_CONFIG.TITLE} | {process.env.NEXT_PUBLIC_SCHOOL_NAME || 'Senior High School'}
        </p>
      </div>
    </div>
  )
}
