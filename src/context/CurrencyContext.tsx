'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';

type Currency = 'USD' | 'MXN';

interface CurrencyContextType {
    currency: Currency;
    convertPrice: (priceInUSD: number) => string;
    exchangeRate: number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrency] = useState<Currency>('USD');
    const [exchangeRate, setExchangeRate] = useState(1); // 1 USD = 1 USD

    useEffect(() => {
        // Read cookie set by middleware
        const cookieCurrency = getCookie('NEXT_CURRENCY') as Currency;
        if (cookieCurrency === 'MXN') {
            setCurrency('MXN');
            setExchangeRate(20.50); // Hardcoded for demo/stability. Ideally fetch from API.
        } else {
            setCurrency('USD');
            setExchangeRate(1);
        }
    }, []);

    const convertPrice = (priceInUSD: number) => {
        const converted = priceInUSD * exchangeRate;
        return new Intl.NumberFormat(currency === 'MXN' ? 'es-MX' : 'en-US', {
            style: 'currency',
            currency: currency,
        }).format(converted);
    };

    return (
        <CurrencyContext.Provider value={{ currency, convertPrice, exchangeRate }}>
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
