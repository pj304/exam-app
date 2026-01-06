'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          router.push('/login?error=auth_failed')
          return
        }

        if (session?.user) {
          // Check user role
          const { data: userData } = await supabase
            .from('users')
            .select('role, is_approved')
            .eq('id', session.user.id)
            .single()

          if (userData) {
            if (!userData.is_approved) {
              // User not approved
              router.push('/login?error=not_approved')
              return
            }

            if (userData.role === 'teacher') {
              router.push('/dashboard')
            } else {
              router.push('/exam')
            }
          } else {
            // New user, redirect to exam (user will be created by trigger)
            router.push('/exam')
          }
        } else {
          router.push('/login')
        }
      } catch (err) {
        console.error('Callback handling error:', err)
        router.push('/login?error=unknown')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="spinner mx-auto"></div>
        <p className="text-exam-muted">Verifying your account...</p>
      </div>
    </div>
  )
}
