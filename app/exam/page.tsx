'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { EXAM_QUESTIONS, TOTAL_POINTS, calculateScore } from '@/lib/questions'
import { EXAM_CONFIG, ANTI_CHEAT_CONFIG } from '@/lib/config'
import AntiCheat from '@/components/AntiCheat'
import Timer from '@/components/Timer'
import QuestionCard from '@/components/QuestionCard'
import { 
  Send, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  LogOut,
  ChevronUp,
  ChevronDown,
  Hash
} from 'lucide-react'

interface ExamSession {
  id: string
  user_id: string
  started_at: string
  answers: Record<string, string>
  tab_switches: number
  warnings: string[]
  is_submitted: boolean
}

interface User {
  id: string
  email: string
  full_name: string | null
}

export default function ExamPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<ExamSession | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [currentSection, setCurrentSection] = useState<'multiple_choice' | 'identification'>('multiple_choice')
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize exam
  useEffect(() => {
    initializeExam()
  }, [])

  // Auto-save effect
  useEffect(() => {
    if (!session || session.is_submitted) return

    autoSaveRef.current = setInterval(() => {
      saveAnswers()
    }, EXAM_CONFIG.AUTO_SAVE_INTERVAL)

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current)
      }
    }
  }, [session, answers])

  async function initializeExam() {
    try {
      // Check auth
      const { data: { session: authSession } } = await supabase.auth.getSession()
      
      if (!authSession?.user) {
        router.push('/login')
        return
      }

      // Get user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name, role, is_approved')
        .eq('id', authSession.user.id)
        .single()

      if (userError || !userData) {
        console.error('User fetch error:', userError)
        router.push('/login')
        return
      }

      if (userData.role === 'teacher') {
        router.push('/dashboard')
        return
      }

      if (!userData.is_approved) {
        alert('Your account has not been approved yet. Please contact your teacher.')
        router.push('/')
        return
      }

      setUser(userData)

      // Check for existing session
      const { data: existingSession, error: sessionError } = await supabase
        .from('exam_sessions')
        .select('*')
        .eq('user_id', authSession.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (existingSession && existingSession.is_submitted) {
        // Already submitted, redirect to results
        router.push('/results')
        return
      }

      if (existingSession && !existingSession.is_submitted) {
        // Resume existing session
        setSession(existingSession)
        setAnswers(existingSession.answers || {})
      } else {
        // Create new session
        const { data: newSession, error: createError } = await supabase
          .from('exam_sessions')
          .insert({
            user_id: authSession.user.id,
            answers: {},
            tab_switches: 0,
            warnings: [],
          })
          .select()
          .single()

        if (createError) {
          console.error('Session creation error:', createError)
          alert('Failed to start exam. Please try again.')
          return
        }

        setSession(newSession)

        // Log exam start
        await supabase.from('activity_logs').insert({
          user_id: authSession.user.id,
          session_id: newSession.id,
          action: 'EXAM_STARTED',
          details: `Exam started at ${new Date().toISOString()}`
        })
      }
    } catch (error) {
      console.error('Initialization error:', error)
      alert('An error occurred. Please refresh and try again.')
    } finally {
      setLoading(false)
    }
  }

  const saveAnswers = useCallback(async () => {
    if (!session || session.is_submitted || saving) return

    try {
      setSaving(true)
      setSaveStatus('saving')

      const { error } = await supabase
        .from('exam_sessions')
        .update({ answers })
        .eq('id', session.id)

      if (error) {
        console.error('Save error:', error)
        setSaveStatus('error')
      } else {
        setSaveStatus('saved')
        
        // Clear saved status after 2 seconds
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current)
        }
        saveTimeoutRef.current = setTimeout(() => {
          setSaveStatus('idle')
        }, 2000)
      }
    } catch (error) {
      console.error('Save error:', error)
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }, [session, answers, saving])

  async function handleViolation(type: string, count: number) {
    if (!session || !user) return

    try {
      // Update session with violation
      await supabase
        .from('exam_sessions')
        .update({
          tab_switches: count,
          warnings: [...(session.warnings || []), `${type} at ${new Date().toISOString()}`]
        })
        .eq('id', session.id)

      // Log the violation
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        session_id: session.id,
        action: 'VIOLATION',
        details: `${type} - Violation #${count}`
      })

      // Update local state
      setSession(prev => prev ? {
        ...prev,
        tab_switches: count,
        warnings: [...(prev.warnings || []), type]
      } : null)
    } catch (error) {
      console.error('Error logging violation:', error)
    }
  }

  async function handleMaxViolations() {
    // Auto-submit on max violations
    await submitExam(true)
  }

  async function handleTimeUp() {
    // Auto-submit on time up
    await submitExam(true)
  }

  async function submitExam(forced: boolean = false) {
    if (!session || !user || submitting) return

    try {
      setSubmitting(true)

      // Calculate score
      const result = calculateScore(answers)

      // Update session
      const { error } = await supabase
        .from('exam_sessions')
        .update({
          answers,
          score: result.score,
          total_points: result.totalPoints,
          is_submitted: true,
          submitted_at: new Date().toISOString()
        })
        .eq('id', session.id)

      if (error) {
        console.error('Submit error:', error)
        alert('Failed to submit exam. Please try again.')
        return
      }

      // Log submission
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        session_id: session.id,
        action: forced ? 'EXAM_AUTO_SUBMITTED' : 'EXAM_SUBMITTED',
        details: `Score: ${result.score}/${result.totalPoints} (${Math.round((result.score / result.totalPoints) * 100)}%)`
      })

      // Redirect to results
      router.push('/results')
    } catch (error) {
      console.error('Submit error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleAnswerChange(questionId: string, answer: string) {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  async function handleLogout() {
    if (session && !session.is_submitted) {
      const confirm = window.confirm(
        'Warning: Your exam will be saved but you will need to continue later. Are you sure you want to leave?'
      )
      if (!confirm) return
      
      await saveAnswers()
    }
    
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="spinner mx-auto"></div>
          <p className="text-exam-muted">Loading exam...</p>
        </div>
      </div>
    )
  }

  if (!user || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-exam-muted">Unable to load exam. Please refresh.</p>
        </div>
      </div>
    )
  }

  const multipleChoiceQuestions = EXAM_QUESTIONS.filter(q => q.type === 'multiple_choice')
  const identificationQuestions = EXAM_QUESTIONS.filter(q => q.type === 'identification')
  const currentQuestions = currentSection === 'multiple_choice' 
    ? multipleChoiceQuestions 
    : identificationQuestions

  const answeredCount = Object.keys(answers).filter(k => answers[k]?.trim()).length
  const progress = (answeredCount / EXAM_QUESTIONS.length) * 100

  return (
    <AntiCheat
      onViolation={handleViolation}
      onMaxViolations={handleMaxViolations}
      maxViolations={ANTI_CHEAT_CONFIG.WARNING_THRESHOLD + 1}
      enabled={true}
    >
      <div className="min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-exam-bg/95 backdrop-blur-sm border-b border-exam-border">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Left: User info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                  {user.full_name?.[0] || user.email[0].toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="font-medium text-sm">{user.full_name || 'Student'}</p>
                  <p className="text-xs text-exam-muted">{user.email}</p>
                </div>
              </div>

              {/* Center: Timer */}
              <div className="order-last sm:order-none w-full sm:w-auto text-center">
                <Timer startedAt={session.started_at} onTimeUp={handleTimeUp} />
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-3">
                {/* Save status */}
                <div className="flex items-center gap-2 text-sm">
                  {saveStatus === 'saving' && (
                    <>
                      <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-exam-muted hidden sm:inline">Saving...</span>
                    </>
                  )}
                  {saveStatus === 'saved' && (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 hidden sm:inline">Saved</span>
                    </>
                  )}
                  {saveStatus === 'error' && (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 hidden sm:inline">Error</span>
                    </>
                  )}
                </div>

                {/* Manual save */}
                <button
                  onClick={saveAnswers}
                  disabled={saving}
                  className="p-2 rounded-lg bg-exam-card hover:bg-exam-border transition-colors"
                  title="Save answers"
                >
                  <Save className="w-5 h-5" />
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-exam-card hover:bg-exam-border transition-colors text-exam-muted hover:text-exam-text"
                  title="Save and exit"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-exam-muted mb-2">
                <span>{answeredCount} of {EXAM_QUESTIONS.length} answered</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-4 py-8">
          {/* Exam Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">{EXAM_CONFIG.TITLE}</h1>
            <p className="text-exam-muted">Total Points: {TOTAL_POINTS}</p>
          </div>

          {/* Section Tabs */}
          <div className="flex gap-4 mb-8 justify-center">
            <button
              onClick={() => setCurrentSection('multiple_choice')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                currentSection === 'multiple_choice'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'bg-exam-card text-exam-muted hover:bg-exam-border'
              }`}
            >
              Multiple Choice
              <span className="ml-2 text-sm opacity-70">
                ({multipleChoiceQuestions.filter(q => answers[q.id]?.trim()).length}/{multipleChoiceQuestions.length})
              </span>
            </button>
            <button
              onClick={() => setCurrentSection('identification')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                currentSection === 'identification'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'bg-exam-card text-exam-muted hover:bg-exam-border'
              }`}
            >
              Identification
              <span className="ml-2 text-sm opacity-70">
                ({identificationQuestions.filter(q => answers[q.id]?.trim()).length}/{identificationQuestions.length})
              </span>
            </button>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {currentQuestions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                questionNumber={
                  currentSection === 'multiple_choice' 
                    ? index + 1 
                    : multipleChoiceQuestions.length + index + 1
                }
                selectedAnswer={answers[question.id] || ''}
                onAnswerChange={(answer) => handleAnswerChange(question.id, answer)}
              />
            ))}
          </div>

          {/* Section Navigation */}
          <div className="flex justify-between items-center mt-8 pt-8 border-t border-exam-border">
            {currentSection === 'identification' && (
              <button
                onClick={() => setCurrentSection('multiple_choice')}
                className="btn-secondary"
              >
                <ChevronUp className="w-4 h-4 mr-2" />
                Previous Section
              </button>
            )}
            
            {currentSection === 'multiple_choice' && (
              <>
                <div></div>
                <button
                  onClick={() => setCurrentSection('identification')}
                  className="btn-secondary"
                >
                  Next Section
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>
              </>
            )}

            {currentSection === 'identification' && (
              <button
                onClick={() => setShowSubmitConfirm(true)}
                className="btn-primary"
                disabled={submitting}
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Exam
              </button>
            )}
          </div>

          {/* Question Navigator */}
          <div className="fixed bottom-6 right-6">
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Hash className="w-4 h-4 text-exam-muted" />
                <span className="text-sm text-exam-muted">Quick Nav</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {EXAM_QUESTIONS.map((q, i) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentSection(q.type as 'multiple_choice' | 'identification')
                      document.getElementById(`question-${q.id}`)?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                      answers[q.id]?.trim()
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-exam-border/50 text-exam-muted hover:bg-exam-border'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Submit Confirmation Modal */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="glass-card p-8 max-w-md mx-4 animate-slide-in">
              <h3 className="text-xl font-bold mb-4">Submit Exam?</h3>
              
              <div className="mb-6 space-y-3">
                <p className="text-exam-muted">
                  You have answered {answeredCount} out of {EXAM_QUESTIONS.length} questions.
                </p>
                
                {answeredCount < EXAM_QUESTIONS.length && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    You have {EXAM_QUESTIONS.length - answeredCount} unanswered questions!
                  </div>
                )}

                <p className="text-exam-muted text-sm">
                  Once submitted, you cannot change your answers.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="btn-secondary flex-1"
                  disabled={submitting}
                >
                  Review Answers
                </button>
                <button
                  onClick={() => submitExam(false)}
                  className="btn-primary flex-1"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-exam-bg border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AntiCheat>
  )
}
