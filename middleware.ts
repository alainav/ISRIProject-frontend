import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // For client-side authentication, we'll handle this in the components
  // since sessionStorage is not available in middleware
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/voting/:path*"],
}
