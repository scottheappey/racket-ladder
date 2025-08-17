import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = await getToken({ req: request })
    
    if (!token) {
      // Redirect to login if not authenticated
      const loginUrl = new URL('/api/auth/signin', request.url)
      loginUrl.searchParams.set('callbackUrl', request.url)
      return NextResponse.redirect(loginUrl)
    }
    
    // Check if user has admin or club admin role
    if (token.role !== 'ADMIN' && token.role !== 'CLUB_ADMIN') {
      // Redirect to unauthorized page
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
