import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';
import { calculateProductLivePrice } from '../utils/productPricing';

const MetalRatesContext = createContext(null);

export const MetalRatesProvider = ({ children }) => {
  const [liveRates, setLiveRates] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetalRates = useCallback(async () => {
    try {
      const res = await api.get('/prices?currency=inr');
      if (res.data) {
        setLiveRates(res.data);
      }
    } catch (err) {
      console.warn('[MetalRatesContext] Failed to fetch live metal rates, using cached/fallback rates:', err?.message || err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetalRates();
    // Automatically refresh every 1 hour (3,600,000 ms)
    const interval = setInterval(fetchMetalRates, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchMetalRates]);

  const getLiveProductPrice = useCallback((product) => {
    return calculateProductLivePrice(product, liveRates);
  }, [liveRates]);

  return (
    <MetalRatesContext.Provider 
      value={{ 
        liveRates, 
        loading, 
        fetchMetalRates, 
        getLiveProductPrice 
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
