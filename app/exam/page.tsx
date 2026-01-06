'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
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
  ChevronLeft,
  ChevronRight,
  Hash,
  Code,
  FileText,
  List
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

type SectionType = 'multiple_choice' | 'identification' | 'code_analysis'

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
  const [currentSection, setCurrentSection] = useState<SectionType>('multiple_choice')

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null)

  const multipleChoiceQuestions = EXAM_QUESTIONS.filter(q => q.type === 'multiple_choice')
  const identificationQuestions = EXAM_QUESTIONS.filter(q => q.type === 'identification')
  const codeAnalysisQuestions = EXAM_QUESTIONS.filter(q => q.type === 'code_analysis')

  useEffect(() => {
    initializeExam()
  }, [])

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
      const supabase = getSupabaseClient()
      const { data: { session: authSession } } = await supabase.auth.getSession()

      if (!authSession?.user) {
        router.push('/login')
        return
      }

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

      const { data: existingSession } = await supabase
        .from('exam_sessions')
        .select('*')
        .eq('user_id', authSession.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (existingSession && existingSession.is_submitted) {
        router.push('/results')
        return
      }

      if (existingSession && !existingSession.is_submitted) {
        setSession(existingSession)
        setAnswers(existingSession.answers || {})
      } else {
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

        await supabase.from('activity_logs').insert({
          user_id: authSession.user.id,
          session_id: newSession.id,
          action: 'EXAM_STARTED',
          details: 'Exam started at ' + new Date().toISOString()
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

      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('exam_sessions')
        .update({ answers })
        .eq('id', session.id)

      if (error) {
        console.error('Save error:', error)
        setSaveStatus('error')
      } else {
        setSaveStatus('saved')
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
      const supabase = getSupabaseClient()
      await supabase
        .from('exam_sessions')
        .update({
          tab_switches: count,
          warnings: [...(session.warnings || []), type + ' at ' + new Date().toISOString()]
        })
        .eq('id', session.id)

      await supabase.from('activity_logs').insert({
        user_id: user.id,
        session_id: session.id,
        action: 'VIOLATION',
        details: type + ' - Violation #' + count
      })

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
    await submitExam(true)
  }

  async function handleTimeUp() {
    await submitExam(true)
  }

  async function submitExam(forced: boolean = false) {
    if (!session || !user || submitting) return

    try {
      setSubmitting(true)
      const result = calculateScore(answers)

      const supabase = getSupabaseClient()
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

      await supabase.from('activity_logs').insert({
        user_id: user.id,
        session_id: session.id,
        action: forced ? 'EXAM_AUTO_SUBMITTED' : 'EXAM_SUBMITTED',
        details: 'Score: ' + result.score + '/' + result.totalPoints + ' (' + Math.round((result.score / result.totalPoints) * 100) + '%)'
      })

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
      const confirmLogout = window.confirm(
        'Warning: Your exam will be saved but you will need to continue later. Are you sure you want to leave?'
      )
      if (!confirmLogout) return
      await saveAnswers()
    }

    await getSupabaseClient().auth.signOut()
    router.push('/')
  }

  function getCurrentQuestions() {
    switch (currentSection) {
      case 'multiple_choice':
        return multipleChoiceQuestions
      case 'identification':
        return identificationQuestions
      case 'code_analysis':
        return codeAnalysisQuestions
      default:
        return multipleChoiceQuestions
    }
  }

  function getQuestionNumberOffset() {
    switch (currentSection) {
      case 'multiple_choice':
        return 0
      case 'identification':
        return multipleChoiceQuestions.length
      case 'code_analysis':
        return multipleChoiceQuestions.length + identificationQuestions.length
      default:
        return 0
    }
  }

  function goToNextSection() {
    if (currentSection === 'multiple_choice') {
      setCurrentSection('identification')
    } else if (currentSection === 'identification') {
      setCurrentSection('code_analysis')
    }
  }

  function goToPreviousSection() {
    if (currentSection === 'identification') {
      setCurrentSection('multiple_choice')
    } else if (currentSection === 'code_analysis') {
      setCurrentSection('identification')
    }
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

  const currentQuestions = getCurrentQuestions()
  const questionNumberOffset = getQuestionNumberOffset()
  const answeredCount = Object.keys(answers).filter(k => answers[k]?.trim()).length
  const progress = (answeredCount / EXAM_QUESTIONS.length) * 100

  const mcAnswered = multipleChoiceQuestions.filter(q => answers[q.id]?.trim()).length
  const idAnswered = identificationQuestions.filter(q => answers[q.id]?.trim()).length
  const caAnswered = codeAnalysisQuestions.filter(q => answers[q.id]?.trim()).length

  return (
    <AntiCheat
      onViolation={handleViolation}
      onMaxViolations={handleMaxViolations}
      maxViolations={ANTI_CHEAT_CONFIG.WARNING_THRESHOLD + 1}
      enabled={true}
    >
      <div className="min-h-screen">
        <header className="sticky top-0 z-50 bg-exam-bg/95 backdrop-blur-sm border-b border-exam-border">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                  {user.full_name?.[0] || user.email[0].toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="font-medium text-sm">{user.full_name || 'Student'}</p>
                  <p className="text-xs text-exam-muted">{user.email}</p>
                </div>
              </div>

              <div className="order-last sm:order-none w-full sm:w-auto text-center">
                <Timer startedAt={session.started_at} onTimeUp={handleTimeUp} />
              </div>

              <div className="flex items-center gap-3">
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

                <button
                  onClick={saveAnswers}
                  disabled={saving}
                  className="p-2 rounded-lg bg-exam-card hover:bg-exam-border transition-colors"
                  title="Save answers"
                >
                  <Save className="w-5 h-5" />
                </button>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-exam-card hover:bg-exam-border transition-colors text-exam-muted hover:text-exam-text"
                  title="Save and exit"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-exam-muted mb-2">
                <span>{answeredCount} of {EXAM_QUESTIONS.length} answered</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: progress + '%' }}></div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">{EXAM_CONFIG.TITLE}</h1>
            <p className="text-exam-muted">Total Points: {TOTAL_POINTS}</p>
          </div>

          <div className="flex gap-2 md:gap-4 mb-8 justify-center flex-wrap">
            <button
              onClick={() => setCurrentSection('multiple_choice')}
              className={'px-4 md:px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ' + (
                currentSection === 'multiple_choice'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                  : 'bg-exam-card text-exam-muted hover:bg-exam-border'
              )}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Multiple Choice</span>
              <span className="sm:hidden">MC</span>
              <span className="text-sm opacity-70">
                ({mcAnswered}/{multipleChoiceQuestions.length})
              </span>
            </button>
            <button
              onClick={() => setCurrentSection('identification')}
              className={'px-4 md:px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ' + (
                currentSection === 'identification'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                  : 'bg-exam-card text-exam-muted hover:bg-exam-border'
              )}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Identification</span>
              <span className="sm:hidden">ID</span>
              <span className="text-sm opacity-70">
                ({idAnswered}/{identificationQuestions.length})
              </span>
            </button>
            <button
              onClick={() => setCurrentSection('code_analysis')}
              className={'px-4 md:px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ' + (
                currentSection === 'code_analysis'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                  : 'bg-exam-card text-exam-muted hover:bg-exam-border'
              )}
            >
              <Code className="w-4 h-4" />
              <span className="hidden sm:inline">Code Analysis</span>
              <span className="sm:hidden">Code</span>
              <span className="text-sm opacity-70">
                ({caAnswered}/{codeAnalysisQuestions.length})
              </span>
            </button>
          </div>

          <div className="glass-card p-4 mb-6 text-center">
            {currentSection === 'multiple_choice' && (
              <p className="text-sm text-exam-muted">
                <span className="text-blue-400 font-medium">Part I: Multiple Choice</span> - Select the best answer for each question.
              </p>
            )}
            {currentSection === 'identification' && (
              <p className="text-sm text-exam-muted">
                <span className="text-purple-400 font-medium">Part II: Identification</span> - Write the correct answer.
              </p>
            )}
            {currentSection === 'code_analysis' && (
              <p className="text-sm text-exam-muted">
                <span className="text-green-400 font-medium">Part III: Code Analysis</span> - Analyze the C program and write the exact output.
              </p>
            )}
          </div>

          <div className="space-y-6">
            {currentQuestions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                questionNumber={questionNumberOffset + index + 1}
                selectedAnswer={answers[question.id] || ''}
                onAnswerChange={(answer) => handleAnswerChange(question.id, answer)}
              />
            ))}
          </div>

          <div className="flex justify-between items-center mt-8 pt-8 border-t border-exam-border">
            {currentSection !== 'multiple_choice' ? (
              <button onClick={goToPreviousSection} className="btn-secondary">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous Section
              </button>
            ) : (
              <div></div>
            )}

            {currentSection !== 'code_analysis' ? (
              <button onClick={goToNextSection} className="btn-secondary">
                Next Section
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
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

          <div className="fixed bottom-6 right-6 hidden lg:block">
            <div className="glass-card p-4 max-w-xs">
              <div className="flex items-center gap-2 mb-3">
                <Hash className="w-4 h-4 text-exam-muted" />
                <span className="text-sm text-exam-muted">Quick Nav</span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {EXAM_QUESTIONS.map((q, i) => {
                  const isCurrentSection = q.type === currentSection
                  const bgColor = answers[q.id]?.trim()
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : isCurrentSection
                      ? 'bg-exam-card text-exam-text border border-exam-border'
                      : 'bg-exam-border/30 text-exam-muted'

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentSection(q.type as SectionType)
                      }}
                      className={'w-7 h-7 rounded text-xs font-medium transition-colors ' + bgColor}
                      title={'Question ' + (i + 1)}
                    >
                      {i + 1}
                    </button>
                  )
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-exam-border text-xs text-exam-muted">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500/20 border border-green-500/30 rounded"></div>
                  <span>Answered</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="glass-card p-8 max-w-md w-full animate-slide-in">
              <h3 className="text-xl font-bold mb-4">Submit Exam?</h3>

              <div className="mb-6 space-y-3">
                <p className="text-exam-muted">
                  You have answered <span className="text-cyan-400 font-bold">{answeredCount}</span> out of <span className="font-bold">{EXAM_QUESTIONS.length}</span> questions.
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-exam-muted">Multiple Choice:</span>
                    <span className={mcAnswered === multipleChoiceQuestions.length ? 'text-green-400' : 'text-yellow-400'}>
                      {mcAnswered}/{multipleChoiceQuestions.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-exam-muted">Identification:</span>
                    <span className={idAnswered === identificationQuestions.length ? 'text-green-400' : 'text-yellow-400'}>
                      {idAnswered}/{identificationQuestions.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-exam-muted">Code Analysis:</span>
                    <span className={caAnswered === codeAnalysisQuestions.length ? 'text-green-400' : 'text-yellow-400'}>
                      {caAnswered}/{codeAnalysisQuestions.length}
                    </span>
                  </div>
                </div>

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
