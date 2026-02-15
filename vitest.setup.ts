import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { mockSupabase } from './src/test/mocks/supabase';

vi.mock('@/lib/supabaseClient', () => ({
    supabase: mockSupabase,
}));
