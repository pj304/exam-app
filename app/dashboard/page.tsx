'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import { EXAM_QUESTIONS, TOTAL_POINTS } from '@/lib/questions'
import { EXAM_CONFIG } from '@/lib/config'
import { formatDateTime, getScoreGrade, calculatePercentage } from '@/lib/utils'
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  LogOut,
  RefreshCw,
  Download,
  Eye,
  BarChart3,
  Award,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Trash2
} from 'lucide-react'

// Force dynamic rendering

interface StudentResult {
  user_id: string
  email: string
  full_name: string | null
  session_id: string
  started_at: string
  submitted_at: string | null
  score: number | null
  total_points: number | null
  tab_switches: number
  is_submitted: boolean
  warnings: string[]
  answers: Record<string, string>
}

interface Stats {
  totalStudents: number
  submittedCount: number
  passedCount: number
  averageScore: number
  highestScore: number
  lowestScore: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<StudentResult[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'in_progress'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'time'>('time')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  async function checkAuthAndLoadData() {
    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        router.push('/login')
        return
      }

      // Check if user is a teacher
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (!userData || userData.role !== 'teacher') {
        router.push('/')
        return
      }

      await loadResults()
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  async function loadResults() {
    try {
      setRefreshing(true)
      const supabase = getSupabaseClient()

      // Get all students and their exam sessions
      const { data: students, error: studentsError } = await supabase
        .from('users')
        .select('id, email, full_name')
        .eq('role', 'student')

      if (studentsError) {
        console.error('Students fetch error:', studentsError)
        return
      }

      // Get all exam sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('exam_sessions')
        .select('*')
        .order('submitted_at', { ascending: false })

      if (sessionsError) {
        console.error('Sessions fetch error:', sessionsError)
        return
      }

      // Combine data
      const combinedResults: StudentResult[] = []
      const sessionMap = new Map(sessions?.map((s: any) => [s.user_id, s]) || [])

      students?.forEach(student => {
        const session = sessionMap.get(student.id)
        if (session) {
          combinedResults.push({
            user_id: student.id,
            email: student.email,
            full_name: student.full_name,
            session_id: session.id,
            started_at: session.started_at,
            submitted_at: session.submitted_at,
            score: session.score,
            total_points: session.total_points,
            tab_switches: session.tab_switches,
            is_submitted: session.is_submitted,
            warnings: session.warnings || [],
            answers: session.answers || {}
          })
        } else {
          // Student hasn't started exam
          combinedResults.push({
            user_id: student.id,
            email: student.email,
            full_name: student.full_name,
            session_id: '',
            started_at: '',
            submitted_at: null,
            score: null,
            total_points: null,
            tab_switches: 0,
            is_submitted: false,
            warnings: [],
            answers: {}
          })
        }
      })

      setResults(combinedResults)
      calculateStats(combinedResults)
    } catch (error) {
      console.error('Load results error:', error)
    } finally {
      setRefreshing(false)
    }
  }

  function calculateStats(data: StudentResult[]) {
    const submitted = data.filter(r => r.is_submitted && r.score !== null)
    const passed = submitted.filter(r => {
      const percentage = calculatePercentage(r.score!, r.total_points!)
      return percentage >= EXAM_CONFIG.PASSING_PERCENTAGE
    })

    const scores = submitted.map(r => r.score!)
    
    setStats({
      totalStudents: data.length,
      submittedCount: submitted.length,
      passedCount: passed.length,
      averageScore: scores.length > 0 
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0,
      highestScore: scores.length > 0 ? Math.max(...scores) : 0,
      lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
    })
  }

  async function handleLogout() {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  function exportToCSV() {
    const headers = ['Name', 'Email', 'Status', 'Score', 'Percentage', 'Tab Switches', 'Submitted At']
    const rows = filteredResults.map(r => [
      r.full_name || 'N/A',
      r.email,
      r.is_submitted ? 'Submitted' : r.started_at ? 'In Progress' : 'Not Started',
      r.score !== null ? `${r.score}/${r.total_points}` : 'N/A',
      r.score !== null ? `${calculatePercentage(r.score, r.total_points!)}%` : 'N/A',
      r.tab_switches,
      r.submitted_at ? formatDateTime(r.submitted_at) : 'N/A'
    ])

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `exam_results_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Filter and sort
  const filteredResults = results
    .filter(r => {
      const matchesSearch = 
        (r.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        r.email.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesFilter = 
        filterStatus === 'all' ||
        (filterStatus === 'submitted' && r.is_submitted) ||
        (filterStatus === 'in_progress' && !r.is_submitted && r.started_at)
      
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = (a.full_name || a.email).localeCompare(b.full_name || b.email)
          break
        case 'score':
          comparison = (a.score || 0) - (b.score || 0)
          break
        case 'time':
          comparison = new Date(a.submitted_at || a.started_at || 0).getTime() - 
                      new Date(b.submitted_at || b.started_at || 0).getTime()
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="spinner mx-auto"></div>
          <p className="text-exam-muted">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
            <p className="text-exam-muted">{EXAM_CONFIG.TITLE}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadResults}
              disabled={refreshing}
              className="btn-secondary"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button onClick={exportToCSV} className="btn-secondary">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
            <button onClick={handleLogout} className="btn-primary">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      {stats && (
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
                <p className="text-xs text-exam-muted">Total Students</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.submittedCount}</p>
                <p className="text-xs text-exam-muted">Submitted</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.passedCount}</p>
                <p className="text-xs text-exam-muted">Passed</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.averageScore}</p>
                <p className="text-xs text-exam-muted">Avg Score</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <ChevronUp className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.highestScore}</p>
                <p className="text-xs text-exam-muted">Highest</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <ChevronDown className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.lowestScore}</p>
                <p className="text-xs text-exam-muted">Lowest</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="glass-card p-4 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-exam-muted" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="exam-input pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-exam-muted" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="exam-input w-auto"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="in_progress">In Progress</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="exam-input w-auto"
            >
              <option value="time">Sort by Time</option>
              <option value="name">Sort by Name</option>
              <option value="score">Sort by Score</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded-lg bg-exam-border hover:bg-exam-card transition-colors"
            >
              {sortOrder === 'asc' ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="max-w-7xl mx-auto">
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-exam-border">
                  <th className="text-left p-4 text-sm font-medium text-exam-muted">Student</th>
                  <th className="text-left p-4 text-sm font-medium text-exam-muted">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-exam-muted">Score</th>
                  <th className="text-left p-4 text-sm font-medium text-exam-muted">Percentage</th>
                  <th className="text-left p-4 text-sm font-medium text-exam-muted">Warnings</th>
                  <th className="text-left p-4 text-sm font-medium text-exam-muted">Submitted</th>
                  <th className="text-right p-4 text-sm font-medium text-exam-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result) => {
                  const percentage = result.score !== null 
                    ? calculatePercentage(result.score, result.total_points!) 
                    : null
                  const isPassed = percentage !== null && percentage >= EXAM_CONFIG.PASSING_PERCENTAGE
                  const { grade, color } = percentage !== null 
                    ? getScoreGrade(percentage) 
                    : { grade: 'N/A', color: 'text-exam-muted' }

                  return (
                    <tr 
                      key={result.user_id} 
                      className="border-b border-exam-border/50 hover:bg-exam-border/20 transition-colors"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{result.full_name || 'No Name'}</p>
                          <p className="text-xs text-exam-muted">{result.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        {result.is_submitted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                            <CheckCircle className="w-3 h-3" />
                            Submitted
                          </span>
                        ) : result.started_at ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                            <Clock className="w-3 h-3" />
                            In Progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded">
                            <XCircle className="w-3 h-3" />
                            Not Started
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {result.score !== null ? (
                          <span className={`font-mono font-bold ${isPassed ? 'text-green-400' : 'text-red-400'}`}>
                            {result.score}/{result.total_points}
                          </span>
                        ) : (
                          <span className="text-exam-muted">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        {percentage !== null ? (
                          <span className={`font-bold ${color}`}>
                            {percentage}% ({grade})
                          </span>
                        ) : (
                          <span className="text-exam-muted">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        {result.tab_switches > 0 ? (
                          <span className="inline-flex items-center gap-1 text-yellow-400">
                            <AlertTriangle className="w-4 h-4" />
                            {result.tab_switches}
                          </span>
                        ) : (
                          <span className="text-exam-muted">0</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-exam-muted">
                        {result.submitted_at 
                          ? formatDateTime(result.submitted_at)
                          : '—'
                        }
                      </td>
                      <td className="p-4 text-right">
                        {result.is_submitted && (
                          <button
                            onClick={() => setSelectedStudent(result)}
                            className="p-2 rounded-lg bg-exam-border hover:bg-cyan-500/20 hover:text-cyan-400 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filteredResults.length === 0 && (
              <div className="text-center py-12 text-exam-muted">
                No students found matching your criteria.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-card p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">{selectedStudent.full_name || 'Student'}</h2>
                <p className="text-sm text-exam-muted">{selectedStudent.email}</p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 rounded-lg bg-exam-border hover:bg-red-500/20 hover:text-red-400 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Score Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-exam-bg/50 rounded-lg p-4">
                <p className="text-sm text-exam-muted">Score</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {selectedStudent.score}/{selectedStudent.total_points}
                </p>
              </div>
              <div className="bg-exam-bg/50 rounded-lg p-4">
                <p className="text-sm text-exam-muted">Percentage</p>
                <p className="text-2xl font-bold">
                  {calculatePercentage(selectedStudent.score!, selectedStudent.total_points!)}%
                </p>
              </div>
              <div className="bg-exam-bg/50 rounded-lg p-4">
                <p className="text-sm text-exam-muted">Tab Switches</p>
                <p className={`text-2xl font-bold ${selectedStudent.tab_switches > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {selectedStudent.tab_switches}
                </p>
              </div>
              <div className="bg-exam-bg/50 rounded-lg p-4">
                <p className="text-sm text-exam-muted">Submitted</p>
                <p className="text-sm">
                  {selectedStudent.submitted_at ? formatDateTime(selectedStudent.submitted_at) : 'N/A'}
                </p>
              </div>
            </div>

            {/* Answers Detail */}
            <h3 className="font-semibold mb-4">Answer Details</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {EXAM_QUESTIONS.map((question, index) => {
                const userAnswer = selectedStudent.answers[question.id] || ''
                const isCorrect = userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
                
                return (
                  <div 
                    key={question.id}
                    className={`p-4 rounded-lg border ${
                      isCorrect 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-2">
                          <span className="text-exam-muted">Q{index + 1}.</span> {question.question}
                        </p>
                        <div className="grid md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-exam-muted">Student Answer: </span>
                            <span className={userAnswer ? '' : 'text-gray-500 italic'}>
                              {userAnswer || 'No answer'}
                            </span>
                          </div>
                          <div>
                            <span className="text-exam-muted">Correct Answer: </span>
                            <span className="text-green-400">{question.correctAnswer}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                        <span className={`text-sm font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                          {isCorrect ? question.points : 0}/{question.points}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Warnings Log */}
            {selectedStudent.warnings.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-yellow-400">
                  <AlertTriangle className="w-4 h-4" />
                  Warning Log
                </h3>
                <div className="space-y-2">
                  {selectedStudent.warnings.map((warning, i) => (
                    <div key={i} className="text-sm text-exam-muted p-2 bg-yellow-500/10 rounded">
                      {warning}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
