import { useEffect, useRef } from 'react';

/**
 * Custom hook to detect hardware laser/QR scanner inputs (keyboard wedge)
 * Hardware scanners type characters extremely quickly (usually < 35ms between keys)
 * followed by an Enter key.
 */
export function useBarcodeScanner({ onScan, enabled = true, minLength = 3 }) {
  const bufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      // Ignore functional modifier keys
      if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') {
        return;
      }

      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // If key gap is > 80ms, human typed it; reset buffer unless buffer is empty
      if (timeDiff > 80 && bufferRef.current.length > 0) {
        bufferRef.current = '';
      }

      if (e.key === 'Enter') {
        const scannedText = bufferRef.current.trim();
        bufferRef.current = '';

        if (scannedText.length >= minLength) {
          // If focus is in a normal text input, scanner may press Enter; prevent form submit
          if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
            // Check if current input was manually being typed into
            // If it was typed quickly by scanner, consume the Enter
            if (timeDiff < 80) {
              e.preventDefault();
            }
          }

          // Try parsing JSON if QR code contained structured payload
          let cleanCode = scannedText;
          try {
            if (scannedText.startsWith('{') && scannedText.endsWith('}')) {
              const parsed = JSON.parse(scannedText);
              cleanCode = parsed.sku || parsed.barcode || parsed.huid || parsed.id || scannedText;
            }
          } catch {
            // Not JSON, use raw scannedText
          }

          if (onScan) {
            onScan(cleanCode, scannedText);
          }
        }
      } else if (e.key.length === 1) {
        // Printable character
        bufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onScan, enabled, minLength]);
}
