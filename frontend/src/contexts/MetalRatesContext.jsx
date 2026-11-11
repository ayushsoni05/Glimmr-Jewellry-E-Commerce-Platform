import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api, { API_BASE_URL } from '../api';
import { calculateProductLivePrice } from '../utils/productPricing';

const MetalRatesContext = createContext(null);

export const MetalRatesProvider = ({ children }) => {
  const [liveRates, setLiveRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [streamingActive, setStreamingActive] = useState(false);
  const [tickCount, setTickCount] = useState(0);
  const [lastTickTime, setLastTickTime] = useState(null);
  const [isTickFlashing, setIsTickFlashing] = useState(false);
  const [priceDeltas, setPriceDeltas] = useState({
    gold995: 'same',
    silverPeti: 'same',
    silverChorsa: 'same',
    copper: 'same',
    gold24k: 'same',
    gold22k: 'same',
    gold18k: 'same',
    silver1kg: 'same',
    mcxGold: 'same',
    mcxSilver: 'same'
  });

  const previousRatesRef = useRef(null);
  const flashTimeoutRef = useRef(null);
  const deltaResetTimeoutRef = useRef(null);

  // Helper to compare directional tick change
  const calcDelta = (newVal, oldVal) => {
    if (!oldVal || !newVal) return 'same';
    const n = Number(newVal);
    const o = Number(oldVal);
    if (isNaN(n) || isNaN(o) || n === o) return 'same';
    return n > o ? 'up' : 'down';
  };

  // Process incoming rates payload (from SSE or REST)
  const processIncomingRates = useCallback((newPayload) => {
    if (!newPayload) return;

    const prev = previousRatesRef.current;
    if (prev) {
      const prevHb = prev.himanshuBullion?.rates || {};
      const nextHb = newPayload.himanshuBullion?.rates || {};

      const nextDeltas = {
        gold995: calcDelta(nextHb.gold_995_ask || newPayload.gold_10g_24k, prevHb.gold_995_ask || prev.gold_10g_24k),
        silverPeti: calcDelta(nextHb.silver_999_1kg || newPayload.silver_1kg, prevHb.silver_999_1kg || prev.silver_1kg),
        silverChorsa: calcDelta(nextHb.silver_chorsa_1kg, prevHb.silver_chorsa_1kg),
        copper: calcDelta(nextHb.copper_1kg, prevHb.copper_1kg),
        gold24k: calcDelta(newPayload.gold_10g_24k, prev.gold_10g_24k),
        gold22k: calcDelta(newPayload.gold_10g_22k, prev.gold_10g_22k),
        gold18k: calcDelta(newPayload.gold_10g_18k, prev.gold_10g_18k),
        silver1kg: calcDelta(newPayload.silver_1kg, prev.silver_1kg),
        mcxGold: calcDelta(nextHb.mcx_gold, prevHb.mcx_gold),
        mcxSilver: calcDelta(nextHb.mcx_silver, prevHb.mcx_silver),
      };

      const hasChange = Object.values(nextDeltas).some((d) => d !== 'same');
      if (hasChange) {
        setPriceDeltas(nextDeltas);
        setIsTickFlashing(true);

        if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
        flashTimeoutRef.current = setTimeout(() => {
          setIsTickFlashing(false);
        }, 1200);

        if (deltaResetTimeoutRef.current) clearTimeout(deltaResetTimeoutRef.current);
        deltaResetTimeoutRef.current = setTimeout(() => {
          setPriceDeltas({
            gold995: 'same',
            silverPeti: 'same',
            silverChorsa: 'same',
            copper: 'same',
            gold24k: 'same',
            gold22k: 'same',
            gold18k: 'same',
            silver1kg: 'same',
            mcxGold: 'same',
            mcxSilver: 'same'
          });
        }, 3000);
      }
    }

    previousRatesRef.current = newPayload;
    setLiveRates(newPayload);
    setTickCount((c) => c + 1);
    setLastTickTime(newPayload.timestamp || new Date().toISOString());
    setLoading(false);
  }, []);

  // Polling fallback
  const fetchMetalRates = useCallback(async () => {
    try {
      const res = await api.get('/prices?currency=inr');
      if (res.data) {
        processIncomingRates(res.data);
      }
    } catch (err) {
      console.warn('[MetalRatesContext] Failed to fetch live metal rates:', err?.message || err);
    } finally {
      setLoading(false);
    }
  }, [processIncomingRates]);

  // Server-Sent Events (SSE) Real-Time Push Connection
  useEffect(() => {
    let eventSource = null;
    let reconnectTimer = null;
    let isCancelled = false;

    const connectSSE = () => {
      try {
        const streamUrl = `${API_BASE_URL}/prices/stream`;
        eventSource = new EventSource(streamUrl);

        eventSource.onopen = () => {
          if (!isCancelled) {
            setStreamingActive(true);
          }
        };

        eventSource.onmessage = (event) => {
          if (isCancelled) return;
          try {
            const data = JSON.parse(event.data);
            if (data?.payload) {
              processIncomingRates(data.payload);
            }
          } catch (e) {
            // non-json or ping message
          }
        };

        eventSource.onerror = () => {
          if (!isCancelled) {
            setStreamingActive(false);
            if (eventSource) {
              eventSource.close();
            }
            // Attempt auto-reconnect after 5 seconds
            reconnectTimer = setTimeout(() => {
              if (!isCancelled) connectSSE();
            }, 5000);
          }
        };
      } catch (err) {
        console.warn('[MetalRatesContext] SSE connection failed, falling back to polling:', err?.message || err);
        setStreamingActive(false);
      }
    };

    // Initial fetch to guarantee instant display while SSE establishes
    fetchMetalRates();

    // Start SSE stream
    connectSSE();

    // Secondary fallback poll interval (every 30 seconds)
    const pollInterval = setInterval(() => {
      if (!streamingActive) {
        fetchMetalRates();
      }
    }, 30 * 1000);

    return () => {
      isCancelled = true;
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      if (flashTimeoutRef.current) {
        clearTimeout(flashTimeoutRef.current);
      }
      if (deltaResetTimeoutRef.current) {
        clearTimeout(deltaResetTimeoutRef.current);
      }
      clearInterval(pollInterval);
    };
  }, [fetchMetalRates, processIncomingRates, streamingActive]);

  const getLiveProductPrice = useCallback((product) => {
    return calculateProductLivePrice(product, liveRates);
  }, [liveRates]);

  const himanshuBullion = liveRates?.himanshuBullion || null;
  const hbRates = liveRates?.himanshuBullion?.rates || liveRates?.rates_per_gram || null;
  const hbProducts = liveRates?.himanshuBullion?.products || [];
  const hbRefProducts = liveRates?.himanshuBullion?.refProduct || [];

  return (
    <MetalRatesContext.Provider 
      value={{ 
        liveRates, 
        loading, 
        streamingActive,
        tickCount,
        lastTickTime,
        isTickFlashing,
        priceDeltas,
        fetchMetalRates, 
        getLiveProductPrice,
        himanshuBullion,
        hbRates,
        hbProducts,
        hbRefProducts
      }}
    >
      {children}
    </MetalRatesContext.Provider>
  );
};

export const useMetalRates = () => {
  const context = useContext(MetalRatesContext);
  if (!context) {
    throw new Error('useMetalRates must be used within a MetalRatesProvider');
  }
  return context;
};
