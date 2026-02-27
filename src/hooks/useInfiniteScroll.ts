import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
    threshold?: number; // 0.0 to 1.0, percentage of element visible before triggering
    root?: Element | null;
    rootMargin?: string;
    enabled?: boolean;
}

export function useInfiniteScroll(
    callback: () => void,
    options: UseInfiniteScrollOptions = {}
) {
    const {
        threshold = 0.8,
        root = null,
        rootMargin = '0px',
        enabled = true,
    } = options;

    const observerRef = useRef<IntersectionObserver | null>(null);
    const targetRef = useRef<HTMLDivElement | null>(null);

    const handleIntersect = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries;
            if (entry.isIntersecting && enabled) {
                callback();
            }
        },
        [callback, enabled]
    );

    useEffect(() => {
        if (!enabled) return;

        const target = targetRef.current;
        if (!target) return;

        observerRef.current = new IntersectionObserver(handleIntersect, {
            root,
            rootMargin,
            threshold,
        });

        observerRef.current.observe(target);

        return () => {
            if (observerRef.current && target) {
                observerRef.current.unobserve(target);
                observerRef.current.disconnect();
            }
        };
    }, [handleIntersect, root, rootMargin, threshold, enabled]);

    return targetRef;
}
