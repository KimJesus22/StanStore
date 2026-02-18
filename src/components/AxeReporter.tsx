'use client';

import { useEffect } from 'react';
import React from 'react';
import ReactDOM from 'react-dom';

export default function AxeReporter() {
    useEffect(() => {
        if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
            import('@axe-core/react').then((axe) => {
                axe.default(React, ReactDOM, 1000);
            });
        }
    }, []);

    return null;
}
