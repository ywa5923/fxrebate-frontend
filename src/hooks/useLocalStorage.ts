import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>]{
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error loading localStorage item ${key}:`, error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            if (typeof window === 'undefined') {
                return;
            }
            if (storedValue === undefined || storedValue === null) {
                window.localStorage.removeItem(key);
                return;
            }
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error(`Error saving localStorage item ${key}:`, error);
        }
    }, [storedValue]);

    return [storedValue, setStoredValue];
}