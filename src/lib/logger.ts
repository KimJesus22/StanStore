/**
 * Fire-and-forget logger utility for Supabase Edge Functions.
 * 
 * Este logger envía eventos a la Edge Function 'log-event' sin esperar la respuesta (no usa await).
 * Esto evita añadir latencia a la respuesta del usuario principal.
 */

const EDGE_FUNCTION_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/log-event`
    : 'http://localhost:54321/functions/v1/log-event'; // Default local development URL

// Secret key sharing between Next.js backend and Edge Function
const LOG_SECRET = process.env.LOG_EVENT_SECRET;

interface LogEventParams {
    action: string;
    userId?: string;
    ip?: string;
    userAgent?: string;
    status?: 'SUCCESS' | 'ERROR' | 'WARNING';
    duration?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details?: Record<string, any>;
}

export const logEvent = (params: LogEventParams) => {
    // Safe check to avoid crashing if env vars are missing
    if (!LOG_SECRET) {
        console.warn('⚠️ LOG_EVENT_SECRET not set. Skipping remote log.', params.action);
        return;
    }

    // FIRE AND FORGET PATTERN:
    // We explicitly do NOT await this fetch call.
    // We attach a catch handler to log errors silently in the background
    // so unhandled promise rejections don't crash the Node process.
    fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-log-secret': LOG_SECRET,
        },
        body: JSON.stringify({
            action: params.action,
            user_id: params.userId,
            ip: params.ip,
            user_agent: params.userAgent,
            status: params.status,
            duration: params.duration,
            details: params.details,
        }),
    }).catch((err) => {
        // In production, you might want to send this to Sentry, 
        // but for now we just console.error to avoid infinite loops if Sentry is down.
        console.error('Failed to send log event:', err);
    });
};

/**
 * Higher-Order Function to wrap Server Actions or API Routes with automatic audit logging.
 * 
 * @param actionName The name of the action to log (e.g., 'CHECKOUT', 'LOGIN')
 * @param handler The original function to execute
 * @returns A wrapped function that logs execution details
 */
export const withAuditLog = <TArgs extends unknown[], TResult>(
    actionName: string,
    handler: (...args: TArgs) => Promise<TResult>
) => {
    return async (...args: TArgs): Promise<TResult> => {
        const startTime = performance.now();

        // Try to identify user ID from args if available (convention: first arg might be context or contain userId)
        // This is a heuristic and might need adjustment based on your specific argument patterns
        // For strict typing, you might pass userId explicitly or extract it from a consistent context object
        const userId: string | undefined = undefined;

        try {
            // Execute the original handler
            const result = await handler(...args);

            // Calculate duration
            const duration = Math.round(performance.now() - startTime);

            // Log Success
            logEvent({
                action: actionName,
                userId, // You might need to extract this from result if it returns user context
                status: 'SUCCESS',
                duration,
                details: { args } // Be careful logging args if they contain sensitive data!
            });

            return result;
        } catch (error) {
            // Calculate duration
            const duration = Math.round(performance.now() - startTime);

            // Log Error
            logEvent({
                action: actionName,
                userId,
                status: 'ERROR',
                duration,
                details: {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined,
                    args // detailed context for debugging
                }
            });

            // Re-throw so the frontend knows something went wrong
            throw error;
        }
    };
};
