import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Logique de middleware (auth, CORS, etc.)
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};