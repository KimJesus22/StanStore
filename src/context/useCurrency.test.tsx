import { renderHook, act } from '@testing-library/react';
import { CurrencyProvider, useCurrency } from './CurrencyContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock external dependencies
const mockSetCookie = vi.fn();
const mockGetCookie = vi.fn();

vi.mock('cookies-next', () => ({
    setCookie: (...args: unknown[]) => mockSetCookie(...args),
    getCookie: (...args: unknown[]) => mockGetCookie(...args),
}));

vi.mock('next-intl', () => ({
    useLocale: () => 'en',
}));

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value.toString();
        }),
        clear: vi.fn(() => {
            store = {};
        }),
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('useCurrency Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.clear();
        mockGetCookie.mockReturnValue(null); // Default to null
    });

    it('should initialize with default currency (USD) if no cookie/storage', () => {
        const { result } = renderHook(() => useCurrency(), {
            wrapper: CurrencyProvider,
        });

        expect(result.current.currency).toBe('USD');
    });

    it('should initialize with MXN if passed via cookie', () => {
        mockGetCookie.mockReturnValue('MXN');

        const { result } = renderHook(() => useCurrency(), {
            wrapper: CurrencyProvider,
        });

        expect(result.current.currency).toBe('MXN');
    });

    it('should change currency and update formatted price correctly', () => {
        // Start with default USD
        const { result } = renderHook(() => useCurrency(), {
            wrapper: CurrencyProvider,
        });

        expect(result.current.currency).toBe('USD');

        // Action: Change to MXN
        act(() => {
            result.current.setCurrency('MXN');
        });

        expect(result.current.currency).toBe('MXN');

        // 100 USD (base is irrelevant, formatter takes amountInMXN)
        // Wait, formatPrice(amountInMXN).
        // If currency is MXN, rate is 1. result = 100 * 1 = 100.
        // Formatted: MX$100.00 (or similar)
        const formattedMXN = result.current.formatPrice(100);
        expect(formattedMXN).toContain('100.00'); // Loose check for number format

        // Action: Change to USD
        act(() => {
            result.current.setCurrency('USD');
        });

        expect(result.current.currency).toBe('USD');

        // 100 MXN * 0.055 = 5.5 USD
        const formattedUSD = result.current.formatPrice(100);
        expect(formattedUSD).toContain('5.50');
    });
});
