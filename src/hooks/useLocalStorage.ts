import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for persisting state in localStorage.
 * Data survives page refreshes and browser restarts.
 * 
 * @param key - unique key to identify the data in localStorage
 * @param defaultValue - fallback value when no data exists yet
 * @returns [storedValue, setValue] - just like useState
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  // Sync to localStorage whenever value changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error writing localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Wrapper to support functional updates like setState((prev) => ...)
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const nextValue = value instanceof Function ? value(prev) : value;
      return nextValue;
    });
  }, []);

  return [storedValue, setValue];
}

/**
 * Utility to update the "last modified" timestamp in localStorage.
 * Call this whenever any data is changed by the user.
 */
export function updateLastModified(): void {
  localStorage.setItem('wellibuilds_last_modified', new Date().toISOString());
}

export function getLastModified(): string | null {
  return localStorage.getItem('wellibuilds_last_modified');
}
