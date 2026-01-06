'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import { Code2, Shield, Clock, Award, LogIn, ChevronRight, Terminal } from 'lucide-react'

// Force dynamic rendering

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ email: string; role: string } | null>(null)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const supabase = getSupabaseClient()
        const { data: userData } = await supabase
          .from('users')
          .select('email, role')
          .eq('id', session.user.id)
          .single()
        
        if (userData) {
          setUser(userData)
        }
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Terminal className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">CP2 Exam</span>
          </div>
          
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-exam-muted text-sm">{user.email}</span>
              {user.role === 'teacher' ? (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-primary"
                >
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={() => router.push('/exam')}
                  className="btn-primary"
                >
                  Start Exam
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="btn-primary"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </button>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-8 animate-slide-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium">
            <Code2 className="w-4 h-4" />
            Computer Programming 2
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
              Midterm Examination
            </span>
            <br />
            <span className="text-exam-text">C Programming</span>
          </h1>
          
          <p className="text-xl text-exam-muted max-w-2xl mx-auto">
            Test your knowledge on C programming fundamentals including variables, 
            data types, operators, and conditional statements.
          </p>

          {!user && (
            <button
              onClick={() => router.push('/login')}
              className="btn-primary text-lg px-8 py-4"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign in with Google to Start
            </button>
          )}

          {user && user.role === 'student' && (
            <button
              onClick={() => router.push('/exam')}
              className="btn-primary text-lg px-8 py-4"
            >
              Begin Examination
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-24">
          <div className="glass-card p-6 space-y-4 animate-slide-in stagger-1 opacity-0">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400/20 to-cyan-400/5 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold">Secure Testing</h3>
            <p className="text-exam-muted">
              Anti-cheating measures including tab switch detection, 
              copy prevention, and activity monitoring.
            </p>
          </div>

          <div className="glass-card p-6 space-y-4 animate-slide-in stagger-2 opacity-0">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400/20 to-purple-400/5 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold">Timed Exam</h3>
            <p className="text-exam-muted">
              60-minute time limit with auto-save feature. 
              Your progress is saved every 30 seconds.
            </p>
          </div>

          <div className="glass-card p-6 space-y-4 animate-slide-in stagger-3 opacity-0">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400/20 to-green-400/5 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold">Instant Results</h3>
            <p className="text-exam-muted">
              See your score immediately after submission. 
              Review your performance with detailed analytics.
            </p>
          </div>
        </div>

        {/* Exam Info */}
        <div className="glass-card p-8 mt-16 animate-slide-in stagger-4 opacity-0">
          <h2 className="text-2xl font-bold mb-6">Exam Information</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-400">Topics Covered</h3>
              <ul className="space-y-2 text-exam-muted">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                  Variables and Variable Declaration
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                  Data Types (int, float, char, double)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                  Operators (Arithmetic, Relational, Logical)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                  Format Specifiers (%d, %f, %c, %s)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                  Conditional Statements (if, else)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                  Input/Output Functions (printf, scanf)
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-400">Exam Structure</h3>
              <ul className="space-y-2 text-exam-muted">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                  20 Multiple Choice Questions (2 points each)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                  10 Identification Questions (3 points each)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                  Total: 70 Points
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                  Time Limit: 60 Minutes
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                  Passing Score: 60%
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className="glass-card p-8 mt-8 border-l-4 border-l-yellow-500 animate-slide-in stagger-5 opacity-0">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-400">
            <Shield className="w-5 h-5" />
            Important Rules
          </h2>
          <ul className="space-y-2 text-exam-muted">
            <li>• Do not switch tabs or leave the exam window</li>
            <li>• Copying, right-clicking, and screenshots are disabled</li>
            <li>• You have 3 warnings for tab switches before auto-submission</li>
            <li>• Answers are auto-saved every 30 seconds</li>
            <li>• Once submitted, you cannot retake the exam</li>
            <li>• Ensure stable internet connection before starting</li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-20 py-8 border-t border-exam-border/30">
        <div className="max-w-7xl mx-auto px-6 text-center text-exam-muted text-sm">
          <p>Computer Programming 2 - Grade 11 | Midterm Examination</p>
          <p className="mt-2 text-xs opacity-60">
            {process.env.NEXT_PUBLIC_SCHOOL_NAME || 'Senior High School Department'}
          </p>
        </div>
      </footer>
    </div>
  )
}
