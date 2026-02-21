import { createServerClient } from '@supabase/ssr';
import { NextFetchEvent, NextMiddleware, NextRequest, NextResponse } from 'next/server';
import { MiddlewareFactory } from './chain';

export const withAuth: MiddlewareFactory = (next: NextMiddleware) => {
    return async (request: NextRequest, event: NextFetchEvent) => {
        // Obtenemos la respuesta inicial del siguiente middleware (ej: i18n)
        // Esto es crucial porque necesitamos manipular las cookies en ESA respuesta
        // para que persistan.
        const response = await next(request, event);

        // Si no hay respuesta (extraño), creamos una base o retornamos
        if (!response) {
            // Esto no debería pasar si withI18n está al final de la cadena
            return NextResponse.next();
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        // Si Supabase no está configurado (ej: CI/Lighthouse sin secrets), omitir auth
        if (!supabaseUrl || !supabaseAnonKey) {
            return response;
        }

        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) => {
                            request.cookies.set(name, value);
                        });
                        cookiesToSet.forEach(({ name, value, options }) => {
                            (response as NextResponse).cookies.set(name, value, options);
                        });
                    },
                },
            }
        );

        let user = null;
        try {
            const { data } = await supabase.auth.getUser();
            user = data.user;
        } catch {
            // Supabase no alcanzable (CI, red caída, etc.) → continuar sin auth
            return response;
        }

        // Lógica de Protección de Rutas
        const pathname = request.nextUrl.pathname;

        // 1. Proteger /admin — solo usuarios con email @stanstore.com
        if (pathname.startsWith('/admin') || pathname.includes('/admin/')) {
            const isAdmin = user?.email?.endsWith('@stanstore.com') ?? false;
            if (!isAdmin) {
                const url = request.nextUrl.clone();
                url.pathname = '/';
                return NextResponse.redirect(url);
            }
        }

        // 2. Proteger /dashboard (ejemplo)
        if (pathname.startsWith('/dashboard')) {
            if (!user) {
                const url = request.nextUrl.clone();
                url.pathname = '/login';
                return NextResponse.redirect(url);
            }
        }

        // 3. Redirigir si ya está logueado e intenta ir a login/register
        if (['/login', '/register'].some(path => pathname.includes(path))) {
            if (user) {
                const url = request.nextUrl.clone();
                url.pathname = '/dashboard';
                return NextResponse.redirect(url);
            }
        }

        return response;
    };
};
