export type ActionResponse<T> =
    | { success: true; data: T; error?: never }
    | { success: false; error: string; data?: never };
