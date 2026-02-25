import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decodeJwt } from 'jose'

function isTokenValid(token: string) {
    try {
        const payload = decodeJwt(token);

        if (payload.exp) {
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp > currentTime;
        }

        return true;
    } catch (error) {
        return false;
    }
}

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;

    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (!token || !isTokenValid(token)) {
            const response = NextResponse.redirect(new URL('/', request.url));
            response.cookies.delete('token');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*'],
}
