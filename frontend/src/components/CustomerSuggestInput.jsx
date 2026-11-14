import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  User,
  Phone,
  Calendar,
  Clock,
  Sparkles,
  ShoppingBag,
  CreditCard,
  AlertTriangle,
  ChevronRight,
  Search,
  CheckCircle2,
  ShieldCheck,
  Award
} from 'lucide-react';
import api from '../api';

/**
 * Format currency with Indian Comma notation (Lakhs/Crores)
 */
function formatRupees(amount) {
  const num = Number(amount) || 0;
  return 'Rs. ' + num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

/**
 * Format purchase date to human-readable format
 */
function formatPurchaseDate(rawDate) {
  if (!rawDate) return 'No previous bills';
  try {
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return 'Recent';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return 'Recent';
  }
}

/**
 * Get color styling for Patron Loyalty Tier
 */
function getTierStyle(tier) {
  const t = String(tier || '').toLowerCase();
  if (t.includes('royal')) {
    return {
      bg: 'bg-amber-950/80',
      border: 'border-amber-500/60',
      text: 'text-amber-300',
      label: 'Royal Atelier Patron'
    };
  }
  if (t.includes('gold')) {
    return {
      bg: 'bg-yellow-950/80',
      border: 'border-yellow-500/60',
      text: 'text-yellow-400',
      label: 'Gold Member'
    };
  }
  if (t.includes('silver')) {
    return {
      bg: 'bg-slate-800/80',
      border: 'border-slate-400/60',
      text: 'text-slate-200',
      label: 'Silver Patron'
    };
  }
  return {
    bg: 'bg-[#102A4C]',
    border: 'border-[#1E3A5F]',
    text: 'text-sky-300',
    label: 'Valued Customer'
  };
}

/**
 * CustomerSuggestInput
 * Real-time typeahead autosuggest component with dual-layer offline caching,
 * customer lifetime spend (LTV), past purchase dates, recent jewelry items, and khata balance.
 *
 * Strictly zero emojis in code and comments.
 */
export default function CustomerSuggestInput({
  value = '',
  onChange,
  onSelectCustomer,
  placeholder = 'Type customer name, phone, or PAN...',
  className = '',
  autoFocus = false,
  disabled = false,
  id = 'party-customer-search-input'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Retrieve cached customers from local storage
  const getLocalCache = useCallback(() => {
    try {
      const raw = localStorage.getItem('pos_customer_suggest_cache');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  // Update local storage cache with new customer records
  const updateLocalCache = useCallback((newRecords = []) => {
    try {
      const existing = getLocalCache();
      const map = new Map();
      existing.forEach(c => c.phone && map.set(c.phone, c));
      newRecords.forEach(c => c.phone && map.set(c.phone, c));
      const combined = Array.from(map.values()).slice(-200);
      localStorage.setItem('pos_customer_suggest_cache', JSON.stringify(combined));
    } catch {
      // Ignore quota errors
    }
  }, [getLocalCache]);

  // Execute Search query against dual-layer (Local Cache + Backend Mongo Aggregation)
  const executeSearch = useCallback((queryStr) => {
    const q = String(queryStr || '').trim().toLowerCase();
    if (!q || q.length < 1) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    // Step 1: Immediate instant lookup in local cache (0ms latency)
    const localMatches = getLocalCache().filter(c => {
      const nameMatch = (c.name || '').toLowerCase().includes(q);
      const phoneMatch = (c.phone || '').includes(q);
      const panMatch = (c.panNumber || '').toLowerCase().includes(q);
      return nameMatch || phoneMatch || panMatch;
    }).slice(0, 6);

    if (localMatches.length > 0) {
      setSuggestions(localMatches);
      setIsOpen(true);
    }

    // Step 2: Query backend MongoDB aggregation endpoint
    setIsLoading(true);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await api.get('/billing/customers/search', {
          params: { q }
        });
        const backendCustomers = res.data?.customers || [];
        setSuggestions(backendCustomers);
        if (backendCustomers.length > 0) {
          setIsOpen(true);
          updateLocalCache(backendCustomers);
        } else if (localMatches.length === 0) {
          setIsOpen(false);
        }
      } catch (err) {
        console.warn('[CUSTOMER_AUTOSUGGEST_FETCH_ERROR]', err.message);
      } finally {
        setIsLoading(false);
      }
    }, 200);
  }, [getLocalCache, updateLocalCache]);

  // Handle Input typing change
  const handleInputChange = (e) => {
    const nextVal = e.target.value;
    onChange(nextVal);
    setSelectedIndex(-1);
    executeSearch(nextVal);
  };

  // Keyboard navigation inside dropdown list
  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && value.trim().length > 0) {
        executeSearch(value);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault();
        handleSelectCustomer(suggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  // Customer selection handler
  const handleSelectCustomer = (customer) => {
    if (!customer) return;
    onChange(customer.name || '');
    if (onSelectCustomer) {
      onSelectCustomer(customer);
    }
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Field with Search Icon and Spinner */}
      <div className="relative flex items-center">
        <input
          id={id}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (value && value.trim().length > 0 && suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          autoFocus={autoFocus}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck="false"
          className={className || "w-full px-2.5 py-1.5 bg-white border border-slate-300 text-slate-900 rounded font-bold text-xs focus:outline-none focus:border-[#0B2545] focus:ring-1 focus:ring-[#0B2545] pr-8"}
        />

        <div className="absolute right-2.5 flex items-center pointer-events-none text-slate-400">
          {isLoading ? (
            <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="w-3.5 h-3.5" />
          )}
        </div>
      </div>

      {/* Floating Suggestions Palette */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-[380px] overflow-y-auto bg-[#071322] border border-[#B59A6C]/50 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.7)] divide-y divide-[#1A2E47] font-mono text-white">
          <div className="px-3 py-1.5 bg-[#040C17] border-b border-[#1A2E47] flex items-center justify-between text-[10px] text-[#B59A6C] font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Existing Showroom Patrons ({suggestions.length})</span>
            </span>
            <span className="text-[9px] text-slate-400 font-normal">Use Up/Down Keys & Enter to Select</span>
          </div>

          {suggestions.map((c, idx) => {
            const isSelected = selectedIndex === idx;
            const tierStyle = getTierStyle(c.patronTier);

            return (
              <div
                key={c._id || c.phone || idx}
                onClick={() => handleSelectCustomer(c)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`p-3 transition-colors cursor-pointer text-xs space-y-1.5 ${
                  isSelected ? 'bg-[#102A4C] border-l-4 border-[#B59A6C]' : 'hover:bg-[#0D1F35]'
                }`}
              >
                {/* Header Row: Name + Tier Badge + LTV */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#B59A6C] shrink-0" />
                    <span className="font-bold text-slate-100 text-sm">{c.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${tierStyle.bg} ${tierStyle.border} ${tierStyle.text}`}>
                      {tierStyle.label}
                    </span>
                  </div>

                  {/* Lifetime Value */}
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold text-xs block">
                      {formatRupees(c.totalSpent)}
                    </span>
                    <span className="text-[9px] text-slate-400 block">
                      Lifetime Spend ({c.totalBillsCount || 1} {c.totalBillsCount === 1 ? 'bill' : 'bills'})
                    </span>
                  </div>
                </div>

                {/* Second Row: Phone, PAN, Address */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{c.phone}</span>
                  </div>

                  {c.panNumber && (
                    <div className="flex items-center gap-1 text-amber-300 font-mono text-[10px]">
                      <span className="text-slate-400">PAN:</span>
                      <span className="font-bold">{c.panNumber}</span>
                    </div>
                  )}

                  {c.address && (
                    <div className="text-slate-400 text-[10px] truncate max-w-[220px]">
                      {c.address}
                    </div>
                  )}
                </div>

                {/* Third Row: Last Purchase Date and Last Bill Amount */}
                <div className="flex flex-wrap items-center gap-x-4 text-[10px] text-slate-400 pt-0.5">
                  <div className="flex items-center gap-1 text-slate-300">
                    <Calendar className="w-3 h-3 text-[#B59A6C]" />
                    <span>Last Bought:</span>
                    <span className="text-white font-bold">{formatPurchaseDate(c.lastPurchaseDate)}</span>
                  </div>

                  {c.lastBillAmount > 0 && (
                    <div className="flex items-center gap-1">
                      <span>Last Bill:</span>
                      <span className="text-amber-200 font-bold">{formatRupees(c.lastBillAmount)}</span>
                      {c.lastBillNumber && <span className="text-slate-500">({c.lastBillNumber})</span>}
                    </div>
                  )}

                  {/* Outstanding Khata Balance Alert */}
                  {c.totalOutstanding > 0 && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-700 text-rose-300 font-bold text-[9px] ml-auto">
                      <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                      <span>Pending Due: {formatRupees(c.totalOutstanding)}</span>
                    </div>
                  )}
                </div>

                {/* Fourth Row: Recent Items Purchased Tags */}
                {c.recentItems && c.recentItems.length > 0 && (
                  <div className="pt-1 flex flex-wrap items-center gap-1.5">
                    <span className="text-[9px] text-slate-400 uppercase font-bold flex items-center gap-1">
                      <ShoppingBag className="w-2.5 h-2.5 text-[#B59A6C]" />
                      <span>Past Pieces:</span>
                    </span>
                    {c.recentItems.map((item, iIdx) => (
                      <span
                        key={iIdx}
                        className="px-1.5 py-0.5 bg-[#08182B] border border-[#1A2E47] rounded text-[10px] text-slate-300 font-sans truncate max-w-[170px]"
                        title={`${item.name} (${item.weight}g)`}
                      >
                        {item.name} {item.weight ? `(${item.weight}g)` : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
