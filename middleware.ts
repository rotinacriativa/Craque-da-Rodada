import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: DO NOT remove this. It refreshes the session if expired.
    const {
        data: { user },
        error
    } = await supabase.auth.getUser()

    // Debug logging for Vercel
    console.log("[Middleware] Path:", request.nextUrl.pathname);
    console.log("[Middleware] User found:", !!user);
    console.log("[Middleware] Cookies:", request.cookies.getAll().map(c => c.name).join(', '));
    
    if (error) {
        console.warn("[Middleware] Auth error:", error.message);
    }

    if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
        console.log("[Middleware] No user found for dashboard route, redirecting to login:", request.nextUrl.pathname);
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirectTo', request.nextUrl.pathname)
        return NextResponse.redirect(url)
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/dashboard',
        '/dashboard/:path*',
    ],
}
