import { useCallback, useEffect, useRef, useState } from 'react';

type CopyState = 'idle' | 'copied' | 'error';

export interface CopyToClipboardButtonProps {
  /** The text that will be written to the clipboard when the button is pressed. */
  text: string;
  /** Label shown in the default (idle) state. */
  label?: string;
  /** Label shown briefly after a successful copy. */
  copiedLabel?: string;
  /** Label shown when clipboard access is unavailable or the copy fails. */
  errorLabel?: string;
  /** How long (ms) the confirmation/error state is shown before reverting. */
  resetDelay?: number;
  className?: string;
}

/**
 * A small, self-contained copy-to-clipboard button.
 *
 * Attempts to use the async Clipboard API and gracefully falls back to the
 * legacy `document.execCommand('copy')` approach. If neither is available the
 * button surfaces an error state instead of failing silently.
 */
export default function CopyToClipboardButton({
  text,
  label = 'Copy',
  copiedLabel = 'Copied!',
  errorLabel = 'Copy failed',
  resetDelay = 2000,
  className,
}: CopyToClipboardButtonProps) {
  const [state, setState] = useState<CopyState>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPendingReset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => clearPendingReset, [clearPendingReset]);

  const scheduleReset = useCallback(() => {
    clearPendingReset();
    timeoutRef.current = setTimeout(() => setState('idle'), resetDelay);
  }, [clearPendingReset, resetDelay]);

  const copy = useCallback(async () => {
    const succeeded = await writeToClipboard(text);
    setState(succeeded ? 'copied' : 'error');
    scheduleReset();
  }, [text, scheduleReset]);

  const currentLabel =
    state === 'copied' ? copiedLabel : state === 'error' ? errorLabel : label;

  return (
    <button
      type="button"
      className={className}
      onClick={copy}
      data-state={state}
      aria-live="polite"
    >
      {currentLabel}
    </button>
  );
}

/**
 * Writes the given text to the clipboard, returning whether it succeeded.
 * Handles environments where clipboard access is unavailable.
 */
async function writeToClipboard(text: string): Promise<boolean> {
  try {
    if (
      typeof navigator !== 'undefined' &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function'
    ) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy approach below.
  }

  return legacyCopy(text);
}

/** Fallback copy using a temporary textarea and execCommand. */
function legacyCopy(text: string): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
