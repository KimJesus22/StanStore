
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { CurrencyProvider, useCurrency } from '@/context/CurrencyContext';
import CurrencySelector from '@/components/CurrencySelector';
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
    Link: ({ children, href }: { children: React.ReactNode, href: string }) => <a href={href}>{children}</a>
}));

// Mock cookies-next
vi.mock('cookies-next', () => ({
    getCookie: vi.fn(),
    setCookie: vi.fn(),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
    NextIntlClientProvider: ({ children, locale }: { children: React.ReactNode, locale: string }) => (
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
    const { currency, formatPrice } = useCurrency();
    return (
        <div>
            <span data-testid="currency-value">{currency}</span>
            <span data-testid="price-display">{formatPrice(100)}</span>

            <LanguageSwitcher />
            <CurrencySelector />
        </div>
    );
};


describe('I18n & Currency Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (getCookie as unknown as Mock).mockReturnValue(undefined);
    });

    const renderApp = (locale = 'es') => {
        return render(
            <div data-locale={locale}>
                <CurrencyProvider>
                    <TestComponent />
                </CurrencyProvider>
            </div>
        );
    };

    it('Test 1 (Independencia): Cambiar idioma no debe afectar la moneda', async () => {
        // Setup: Cookie returns MXN
        (getCookie as unknown as Mock).mockReturnValue('MXN');

        renderApp('es');

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
        (getCookie as unknown as Mock).mockReturnValue(undefined);

        renderApp('es');

        const currencySelect = screen.getByLabelText('Seleccionar Moneda');
        fireEvent.change(currencySelect, { target: { value: 'USD' } });

        expect(setCookie).toHaveBeenCalledWith('NEXT_CURRENCY', 'USD');
        expect(screen.getByTestId('currency-value')).toHaveTextContent('USD');
        expect(screen.getByTestId('price-display')).toHaveTextContent('$100.00');
    });

    it('Test 2b (Cambio de Moneda a KRW)', () => {
        (getCookie as unknown as Mock).mockReturnValue(undefined);
        renderApp('es');

        const currencySelect = screen.getByLabelText('Seleccionar Moneda');
        fireEvent.change(currencySelect, { target: { value: 'KRW' } });

        expect(setCookie).toHaveBeenCalledWith('NEXT_CURRENCY', 'KRW');
        expect(screen.getByTestId('currency-value')).toHaveTextContent('KRW');
        expect(screen.getByTestId('price-display')).toHaveTextContent('₩130,000'); // formatPrice logic uses rate 1300 but input is 100 on test
    });
});
