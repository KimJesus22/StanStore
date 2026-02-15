
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CurrencyProvider, useCurrency } from '@/context/CurrencyContext';
import CurrencySwitcher from '@/components/CurrencySwitcher';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { getCookie, setCookie } from 'cookies-next';

// --- Mocks ---

// Mock next/navigation (y @/navigation)
const routerReplace = vi.fn();
vi.mock('@/navigation', () => ({
    useRouter: () => ({
        replace: routerReplace,
        push: vi.fn(),
    }),
    usePathname: () => '/',
    Link: ({ children, href }: any) => <a href={href}>{children}</a>
}));

// Mock cookies-next
vi.mock('cookies-next', () => ({
    getCookie: vi.fn(),
    setCookie: vi.fn(),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
    NextIntlClientProvider: ({ children, locale, messages }: any) => (
        <div data-locale={locale}>
            {children}
        </div>
    ),
    useTranslations: (namespace: string) => (key: string) => {
        if (namespace === 'Navbar') {
            return key === 'cart' ? 'Carrito' : key;
        }
        return key;
    },
    useLocale: () => 'es',
}));

// Mock LanguageSwitcher component
vi.mock('@/components/LanguageSwitcher', () => ({
    default: () => (
        <select
            data-testid="language-switcher"
            onChange={(e) => routerReplace('/', { locale: e.target.value })}
        >
            <option value="es">Español</option>
            <option value="en">English</option>
        </select>
    )
}));


// --- Test Component ---
const TestComponent = () => {
    const { currency, convertPrice } = useCurrency();
    return (
        <div>
            <span data-testid="currency-value">{currency}</span>
            <span data-testid="price-display">{convertPrice(100)}</span>

            <LanguageSwitcher />
            <CurrencySwitcher />
        </div>
    );
};


describe('I18n & Currency Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (getCookie as any).mockReturnValue(undefined);
    });

    const renderApp = (locale = 'es') => {
        return render(
            // @ts-ignore
            <CurrencyProvider>
                <TestComponent />
            </CurrencyProvider>
        );
    };

    it('Test 1 (Independencia): Cambiar idioma no debe afectar la moneda', async () => {
        // Setup: Cookie returns MXN
        (getCookie as any).mockReturnValue('MXN');

        const { rerender } = renderApp('es');

        // Verificar estado inicial
        expect(screen.getByTestId('currency-value')).toHaveTextContent('MXN');
        expect(screen.getByTestId('price-display')).toHaveTextContent('MXN');

        // Acción: Cambiar idioma a Inglés
        const langSelect = screen.getByTestId('language-switcher');
        fireEvent.change(langSelect, { target: { value: 'en' } });

        expect(routerReplace).toHaveBeenCalledWith('/', { locale: 'en' });

        expect(screen.getByTestId('currency-value')).toHaveTextContent('MXN');
    });

    it('Test 2 (Cambio de Moneda): Seleccionar moneda actualiza cookie y precios', () => {
        (getCookie as any).mockReturnValue(undefined);

        renderApp('es');

        const currencySelect = screen.getByLabelText('Seleccionar Moneda');
        fireEvent.change(currencySelect, { target: { value: 'USD' } });

        expect(setCookie).toHaveBeenCalledWith('NEXT_CURRENCY', 'USD');
        expect(screen.getByTestId('currency-value')).toHaveTextContent('USD');
        expect(screen.getByTestId('price-display')).toHaveTextContent('$100.00');
    });

    it('Test 2b (Cambio de Moneda a KRW)', () => {
        (getCookie as any).mockReturnValue(undefined);
        renderApp('es');

        const currencySelect = screen.getByLabelText('Seleccionar Moneda');
        fireEvent.change(currencySelect, { target: { value: 'KRW' } });

        expect(setCookie).toHaveBeenCalledWith('NEXT_CURRENCY', 'KRW');
        expect(screen.getByTestId('currency-value')).toHaveTextContent('KRW');
        expect(screen.getByTestId('price-display')).toHaveTextContent('₩130,000');
    });
});
