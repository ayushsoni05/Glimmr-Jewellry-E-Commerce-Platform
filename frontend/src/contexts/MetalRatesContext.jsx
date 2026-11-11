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
    // Refresh every 30 seconds for live Himanshu Bullion synchronization
    const interval = setInterval(fetchMetalRates, 30 * 1000);
    return () => clearInterval(interval);
  }, [fetchMetalRates]);

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
