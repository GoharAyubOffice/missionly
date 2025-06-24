import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith('/register') || pathname.startsWith('/login');
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/profile');
  const isPublicRoute = pathname === '/' || pathname.startsWith('/about') || pathname.startsWith('/contact');

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (user && pathname === '/') {
    try {
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user`, {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        const url = request.nextUrl.clone();
        url.pathname = userData.role === 'CLIENT' ? '/dashboard/client' : '/dashboard/freelancer';
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error('Error fetching user data in middleware:', error);
    }
  }

  const redirectParam = request.nextUrl.searchParams.get('redirect');
  if (user && isAuthRoute && redirectParam) {
    const url = request.nextUrl.clone();
    url.pathname = redirectParam;
    url.searchParams.delete('redirect');
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};