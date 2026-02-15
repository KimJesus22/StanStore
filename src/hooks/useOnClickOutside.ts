import { useEffect, RefObject } from 'react';

type Event = MouseEvent | TouchEvent;

export const useOnClickOutside = <T extends HTMLElement = HTMLElement>(
    ref: RefObject<T | null> | RefObject<T | null>[],
    handler: (event: Event) => void
) => {
    useEffect(() => {
        const listener = (event: Event) => {
            const refs = Array.isArray(ref) ? ref : [ref];

            const isInside = refs.some((r) => {
                const el = r.current;
                return el && el.contains((event?.target as Node) || null);
            });

            if (isInside) {
                return;
            }

            handler(event);
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
};
