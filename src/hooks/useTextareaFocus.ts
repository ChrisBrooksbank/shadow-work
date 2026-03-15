import { useEffect, useState } from 'react';

/**
 * Returns true whenever any textarea in the document has focus.
 * Used to hide the bottom nav while the keyboard is open.
 */
export function useTextareaFocus(): boolean {
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    function onFocusIn(e: FocusEvent) {
      if (e.target instanceof HTMLTextAreaElement) {
        setFocused(true);
      }
    }

    function onFocusOut(e: FocusEvent) {
      if (e.target instanceof HTMLTextAreaElement) {
        setFocused(false);
      }
    }

    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);

    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  return focused;
}
