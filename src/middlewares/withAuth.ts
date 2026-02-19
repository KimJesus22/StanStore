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

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            request.cookies.set(name, value);
                        });
                        cookiesToSet.forEach(({ name, value, options }) => {
                            (response as NextResponse).cookies.set(name, value, options);
                        });
                    },
                },
            }
        );

        // IMPORTANTE: Do not protect pages here.
        // https://supabase.com/docs/guides/auth/server-side/nextjs
        // "Ideally, you should not invoke getUser in Middleware..."
        // PERO el usuario pidió explícitamente proteger /admin aquí.
        // Así que usamos getUser() que es seguro (valida contra supabase auth api).

        const {
            data: { user },
        } = await supabase.auth.getUser();

        // Lógica de Protección de Rutas
        const pathname = request.nextUrl.pathname;

        // 1. Proteger /admin
        if (pathname.startsWith('/admin') || pathname.includes('/admin/')) {
            if (!user) {
                // Redirigir a login si no hay usuario
                const url = request.nextUrl.clone();
                url.pathname = '/login';
                // Mantenemos la respuesta limpia, pero cambiamos a redirect
                return NextResponse.redirect(url);
            }
            // Aquí podríamos chequear roles también si tuviéramos un custom claim
            // if (user.role !== 'admin') ...
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
