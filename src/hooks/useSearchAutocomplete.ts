import { useState, useEffect, useRef } from 'react';
import { productsAPI } from '@/src/lib/api';
import type { Product } from '@/src/types';

interface UseSearchAutocompleteOptions {
    debounceMs?: number;
    limit?: number;
    minQueryLength?: number;
}

export function useSearchAutocomplete(
    query: string,
    options: UseSearchAutocompleteOptions = {}
) {
    const {
        debounceMs = 300,
        limit = 8,
        minQueryLength = 2,
    } = options;

    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        // Reset if query is too short
        if (query.length < minQueryLength) {
            setSuggestions([]);
            setIsLoading(false);
            setError(null);
            return;
        }

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        setIsLoading(true);
        setError(null);

        const timeoutId = setTimeout(async () => {
            try {
                abortControllerRef.current = new AbortController();

                const response = await productsAPI.search(query, {
                    page: 0,
                    limit: limit,
                });

                setSuggestions(response.content || []);
                setIsLoading(false);
            } catch (err: any) {
                if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
                    console.error('Search autocomplete error:', err);
                    setError('Failed to fetch suggestions');
                    setSuggestions([]);
                }
                setIsLoading(false);
            }
        }, debounceMs);

        return () => {
            clearTimeout(timeoutId);
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [query, debounceMs, limit, minQueryLength]);

    return { suggestions, isLoading, error };
}
