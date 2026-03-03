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

async function shouldRedirectToCompanySetup(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    if (!token) return false;

    try {
        const response = await fetch(`${request.nextUrl.origin}/api/settings/company/status`, {
            headers: {
                cookie: request.headers.get('cookie') ?? '',
            },
            cache: 'no-store',
        });

        if (!response.ok) return false;
        const data = await response.json();
        return !data?.hasCompany;
    } catch {
        return false;
    }
}

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const pathname = request.nextUrl.pathname;

    if (pathname.startsWith('/dashboard')) {
        if (!token || !isTokenValid(token)) {
            const response = NextResponse.redirect(new URL('/', request.url));
            response.cookies.delete('token');
            return response;
        }

        const companyMissing = await shouldRedirectToCompanySetup(request);

        if (companyMissing && !pathname.startsWith('/dashboard/settings')) {
            const target = new URL('/dashboard/settings', request.url);
            target.searchParams.set('tab', 'company');
            return NextResponse.redirect(target);
        }

        if (companyMissing && pathname.startsWith('/dashboard/settings')) {
            const currentTab = request.nextUrl.searchParams.get('tab');
            if (currentTab !== 'company') {
                const target = request.nextUrl.clone();
                target.searchParams.set('tab', 'company');
                return NextResponse.redirect(target);
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*'],
}
