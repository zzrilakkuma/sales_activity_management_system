import { NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'
import { hasPermission, Permission } from '@/types/auth'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    
    // Allow access to login page
    if (path === '/login') {
      // If user is already logged in, redirect to dashboard
      if (token) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      return NextResponse.next()
    }

    // Allow access to root page
    if (path === '/') {
      return NextResponse.next()
    }

    // Check if user is authenticated
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Role-based access control for protected routes
    const userRole = token.role as string
    const routePermissions: Record<string, Permission> = {
      '/inventory': 'read',
      '/inventory/stock': 'read',
      '/inventory/allocation': 'read',
      '/orders/new': 'create_orders',
      '/users': 'manage_users',
    }

    const requiredPermission = routePermissions[path]
    if (requiredPermission && !hasPermission(userRole, requiredPermission)) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => true, // Let the middleware handle the auth check
    },
  }
)

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)', '/api/:path*']
}
