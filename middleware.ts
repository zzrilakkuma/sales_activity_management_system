import { NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'
import { hasPermission, Permission } from '@/types/auth'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    
    // Public routes
    if (req.nextUrl.pathname === '/') {
      return NextResponse.next()
    }

    // Check if user is authenticated
    if (!token) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Role-based access control
    const userRole = token.role as string
    const path = req.nextUrl.pathname

    // Define route permissions
    const routePermissions: Record<string, Permission> = {
      '/inventory': 'read',
      '/inventory/stock': 'read',
      '/inventory/allocation': 'read',
      '/orders/new': 'create_orders',
      '/users': 'manage_users',
    }

    const requiredPermission = routePermissions[path]
    if (requiredPermission && !hasPermission(userRole, requiredPermission)) {
      // Redirect to dashboard if user doesn't have permission
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

// Protect all routes under /api and /(auth)
export const config = {
  matcher: ['/api/:path*', '/(auth)/:path*'],
}
