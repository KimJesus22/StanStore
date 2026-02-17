declare namespace NodeJS {
    interface ProcessEnv {
        STRIPE_API_VERSION: '2025-01-27.acacia';
        STRIPE_SECRET_KEY: string;
        NEXT_PUBLIC_SUPABASE_URL: string;
        NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
        SUPABASE_SERVICE_ROLE_KEY?: string;
        [key: string]: string | undefined;
    }
}
