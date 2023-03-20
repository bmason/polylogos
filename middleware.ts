
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
//import localStorage from './localStorage';




// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) { 

  return  NextResponse.next()

 // return localStorage.getItem('jwt') ? NextResponse.next() : NextResponse.redirect(new URL('/auth/login', request.url))
  
/*   if (basicAuth) {
    const auth = basicAuth.split(' ')[1];
    const token = Buffer.from(auth, 'base64').toString().split(' ');
    const validToken=validateToken(token)

    if (validToken) {
      return NextResponse.next();
    }
  }

  return NextResponse.redirect(new URL('/auth/login', request.url)) */
}

function validateToken(token) {console.log('jwts', token, localStorage.getItem('jwt'))
  return token == localStorage.getItem('jwt');
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/events',
}