import { useEffect } from 'react';

type ShortcutCallback = () => void;

interface ShortcutMap {
  [key: string]: ShortcutCallback;
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap, deps: React.DependencyList = []) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs/textareas
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement).isContentEditable
      ) {
        // Allow Escape to work even in inputs
        if (event.key !== 'Escape') {
          return;
        }
      }

      const keyCombo = [
        event.ctrlKey || event.metaKey ? 'Ctrl' : '',
        event.altKey ? 'Alt' : '',
        event.shiftKey ? 'Shift' : '',
        event.key !== 'Control' && event.key !== 'Alt' && event.key !== 'Shift'
          ? event.key.length === 1 ? event.key.toUpperCase() : event.key
          : ''
      ].filter(Boolean).join('+');

      if (shortcuts[keyCombo]) {
        event.preventDefault();
        shortcuts[keyCombo]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, deps);
}
