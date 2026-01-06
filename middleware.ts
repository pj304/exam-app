import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    let res = NextResponse.next({
        request: {
            headers: req.headers,
        },
    })

    // Skip if env vars not set (during build)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        return res
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll()
                },
                setAll(cookiesToSet: any) {
                    cookiesToSet.forEach(({ name, value, options }: any) => req.cookies.set(name, value))
                    res = NextResponse.next({
                        request: {
                            headers: req.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }: any) =>
                        res.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh session if it exists
    const { data: { session } } = await supabase.auth.getSession()

    // Protected routes
    const protectedRoutes = ['/exam', '/results', '/dashboard']
    const isProtectedRoute = protectedRoutes.some(route =>
        req.nextUrl.pathname.startsWith(route)
    )

    if (isProtectedRoute && !session) {
        const redirectUrl = new URL('/login', req.url)
        redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
    }

    return res
}

export const config = {
    matcher: ['/exam/:path*', '/results/:path*', '/dashboard/:path*']
}