import { useState, useEffect } from "react";

export function useLocalStorage(prefix, key, defaultValue) {
    const [value, setValue] = useState(() => {
        const storedValue = localStorage.getItem(`${prefix}:${key}`);
        const initialValue = storedValue ? JSON.parse(storedValue) : defaultValue;
        return initialValue;
    });

    useEffect(() => {
        localStorage.setItem(`${prefix}:${key}`, JSON.stringify(value));
    }, [value]);

    return [value, setValue];
}
