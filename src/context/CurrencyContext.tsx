'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCookie, setCookie } from 'cookies-next';

type Currency = 'USD' | 'MXN' | 'KRW';

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
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
            setExchangeRate(20.50);
        } else if (cookieCurrency === 'KRW') {
            setCurrency('KRW');
            setExchangeRate(1300);
        } else {
            setCurrency('USD');
            setExchangeRate(1);
        }
    }, []);

    const handleCurrencyChange = (newCurrency: Currency) => {
        setCurrency(newCurrency);
        setCookie('NEXT_CURRENCY', newCurrency);
        if (newCurrency === 'MXN') {
            setExchangeRate(20.50);
        } else if (newCurrency === 'KRW') {
            setExchangeRate(1300);
        } else {
            setExchangeRate(1);
        }
    };

    const convertPrice = (priceInUSD: number) => {
        const converted = priceInUSD * exchangeRate;

        let locale = 'en-US';
        if (currency === 'MXN') locale = 'es-MX';
        if (currency === 'KRW') locale = 'ko-KR';

        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: currency === 'KRW' ? 0 : 2,
            maximumFractionDigits: currency === 'KRW' ? 0 : 2,
        }).format(converted);
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency: handleCurrencyChange, convertPrice, exchangeRate }}>
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
