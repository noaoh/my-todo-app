import { useState, useEffect } from "react";

export function useLocalStorage(key, defaultValue, initializer) {
    const [value, setValue] = useState(() => {
        const storedValue = localStorage.getItem(key);
        const initialValue = storedValue ? JSON.parse(storedValue) : defaultValue;
        if (initializer) {
            const value = initializer(initialValue);
            return value;
        } else {
            return initialValue;
        }
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
        console.log(value);
    }, [key, value]);

    return [value, setValue];
}
