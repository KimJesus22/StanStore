'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCookie, setCookie } from 'cookies-next';
import { useLocale } from 'next-intl';

type Currency = 'USD' | 'MXN' | 'KRW';

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    formatPrice: (amountInMXN: number) => string;
    exchangeRate: number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const rates = {
    USD: 0.055,
    KRW: 75,
    MXN: 1,
};

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrency] = useState<Currency>('USD');
    const [exchangeRate, setExchangeRate] = useState(1); // 1 USD = 1 USD
    const locale = useLocale(); // Get current locale from next-intl (e.g., 'es', 'en')

    // Rates defined inside component cause re-renders if added to dependencies
    // Moving them out or using useMemo is better. Since they are constant for now:
    // (See below)

    // Moved up to be accessible by useEffect
    const updateExchangeRate = React.useCallback((curr: Currency) => {
        setExchangeRate(rates[curr]);
    }, []);

    useEffect(() => {
        // Check localStorage first
        const savedCurrency = localStorage.getItem('app_currency') as Currency;

        if (savedCurrency && ['USD', 'MXN', 'KRW'].includes(savedCurrency)) {
            setCurrency(savedCurrency);
            updateExchangeRate(savedCurrency);
        } else {
            // Fallback to cookie set by middleware
            const cookieCurrency = getCookie('NEXT_CURRENCY') as Currency;
            if (cookieCurrency && ['USD', 'MXN', 'KRW'].includes(cookieCurrency)) {
                setCurrency(cookieCurrency);
                updateExchangeRate(cookieCurrency);
            } else {
                // Default to USD if nothing found
                setCurrency('USD');
                updateExchangeRate('USD');
            }
        }
    }, [updateExchangeRate]);

    const handleCurrencyChange = (newCurrency: Currency) => {
        setCurrency(newCurrency);
        updateExchangeRate(newCurrency);
        setCookie('NEXT_CURRENCY', newCurrency);
        localStorage.setItem('app_currency', newCurrency);
    };

    const formatPrice = (amountInMXN: number) => {
        const rate = rates[currency];
        const converted = amountInMXN * rate;

        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: currency === 'KRW' ? 0 : 2,
            maximumFractionDigits: currency === 'KRW' ? 0 : 2,
        }).format(converted);
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency: handleCurrencyChange, formatPrice, exchangeRate }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
