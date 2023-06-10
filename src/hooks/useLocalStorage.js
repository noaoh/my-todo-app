import { useState, useEffect } from 'react';

export default function useLocalStorage(key, defaultValue, initializer) {
  const [value, setValue] = useState(() => {
    const storedValue = localStorage.getItem(key);
    const initialValue = storedValue ? JSON.parse(storedValue) : defaultValue;
    if (initializer) {
      const initializedValue = initializer(initialValue);
      return initializedValue;
    }
    return initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
