import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { mockSupabase } from './src/test/mocks/supabase';

vi.mock('@/lib/supabaseClient', () => ({
    supabase: mockSupabase,
}));

// Polyfill TextEncoder for jsdom environment (Node 18 should have it globally but some libs might need this)
import { TextEncoder, TextDecoder } from 'util';
Object.assign(globalThis, { TextEncoder, TextDecoder });

// Polyfill matchMedia for jsdom
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});
