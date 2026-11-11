import React, { useEffect, useRef } from 'react';

/**
 * Cloudflare Turnstile Security Component
 * 
 * Embeds Cloudflare's smart bot and human challenge widget.
 * Protects login, signup, and checkout flows against automated scrapers,
 * credential stuffing, and botnets.
 */
export default function CloudflareTurnstile({
  onVerify,
  onExpire,
  onError,
  theme = 'light',
  className = ''
}) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  // Cloudflare's official always-passing testing sitekey for local development
  // In production, set VITE_CLOUDFLARE_TURNSTILE_SITE_KEY in .env
  const siteKey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

  useEffect(() => {
    let isMounted = true;

    const renderWidget = () => {
      if (!isMounted || !containerRef.current || !window.turnstile) return;
      if (widgetIdRef.current !== null) return;

      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          callback: (token) => {
            if (isMounted && onVerify) onVerify(token);
          },
          'expired-callback': () => {
            if (isMounted && onExpire) onExpire();
          },
          'error-callback': (code) => {
            console.warn('[SECURITY] Cloudflare Turnstile widget error:', code);
            if (isMounted && onError) onError(code);
          }
        });
      } catch (err) {
        console.warn('[SECURITY] Cloudflare Turnstile render error:', err);
      }
    };

    // Load Cloudflare Turnstile script dynamically if not present
    if (typeof window !== 'undefined') {
      if (window.turnstile) {
        renderWidget();
      } else {
        const existingScript = document.getElementById('cf-turnstile-script');
        if (!existingScript) {
          const script = document.createElement('script');
          script.id = 'cf-turnstile-script';
          script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
          script.async = true;
          script.defer = true;
          script.onload = () => {
            renderWidget();
          };
          document.head.appendChild(script);
        } else {
          existingScript.addEventListener('load', renderWidget);
        }
      }
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined' && window.turnstile && widgetIdRef.current !== null) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch {}
      }
    };
  }, [siteKey, theme, onVerify, onExpire, onError]);

  return (
    <div className={`cloudflare-turnstile-wrapper my-2 flex flex-col items-center ${className}`}>
      <div ref={containerRef} className="cf-turnstile" />
      <div className="flex items-center gap-1.5 mt-1 text-[9px] font-mono uppercase tracking-wider text-gray-400">
        <span>Protected by Cloudflare Edge Security</span>
      </div>
    </div>
  );
}
