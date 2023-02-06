import { NextRequest, NextResponse } from 'next/server';

export function middleware(req) {  console.log('middle', req)
  const basicAuth = req.headers.get('authorization');
  //auhorization: Beaer <token>
  if (basicAuth) {
    const auth = basicAuth.split(' ')[1];
    const token = Buffer.from(auth, 'base64').toString().split(' ');
    const validToken=false

    if (validToken) {
      return NextResponse.next();
    }
  }

  return NextResponse.redirect(new URL('/auth/login', request.url))
}

function validateToken(token) {
  //logic to validate token
  return true
}

export const config = {
  matcher: '/dashboard/:path*',
}