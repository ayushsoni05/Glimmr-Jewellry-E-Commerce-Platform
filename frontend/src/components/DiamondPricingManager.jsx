import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const DiamondPricingManager = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [message, setMessage] = useState('');
  const [previewCalc, setPreviewCalc] = useState(null);

  // Custom Framer Motion Dropdown States
  const [isPreviewCutOpen, setIsPreviewCutOpen] = useState(false);
  const [isPreviewColorOpen, setIsPreviewColorOpen] = useState(false);
  const [isPreviewClarityOpen, setIsPreviewClarityOpen] = useState(false);

  // Preview calculation form
  const [previewForm, setPreviewForm] = useState({
    carat: 1.0,
    cut: 'excellent',
    color: 'G',
    clarity: 'VS1',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      setLoading(true);
      const res = await api.get('/admin/diamond-pricing');
      setConfig(res.data.config);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Error fetching diamond pricing:', error);
        setMessage('Failed to load diamond pricing configuration');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBaseRateChange = (value) => {
    setConfig({ ...config, baseRatePerCarat: Number(value) });
  };

  const handleMultiplierChange = (type, key, value) => {
    setConfig({
      ...config,
      [type]: {
        ...config[type],
        [key]: Number(value),
      },
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');
      await api.put('/admin/diamond-pricing', config);
      setMessage('✓ Diamond pricing configuration saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving diamond pricing:', error);
      setMessage('✗ Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleRecalculate = async () => {
    if (!window.confirm('This will recalculate prices for all diamond products. Continue?')) {
      return;
    }

    try {
      setRecalculating(true);
      setMessage('');
      const res = await api.post('/admin/recalc-diamond', {});
      setMessage(`✓ ${res.data.message} (${res.data.updated}/${res.data.total} products updated)`);
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Error recalculating diamond prices:', error);
      setMessage('✗ Failed to recalculate prices');
    } finally {
      setRecalculating(false);
    }
  };

  const handlePreviewCalculation = async () => {
    try {
      const res = await api.post('/admin/calculate-diamond-price', previewForm);
      setPreviewCalc(res.data);
    } catch (error) {
      console.error('Error calculating preview:', error);
      setMessage('✗ Failed to calculate preview');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!config) {
    return <div className="text-red-500">Failed to load configuration</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-textPrimary">Diamond Pricing Configuration</h2>
        <div className="flex gap-3">
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className={`px-4 py-2 rounded-lg font-semibold ${
              recalculating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {recalculating ? 'Recalculating...' : 'Recalculate All Prices'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 rounded-lg font-semibold ${
              saving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90 text-white'
            }`}
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('✓') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Base Rate Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4 text-textPrimary">Base Rate</h3>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-textPrimary">
            Base Rate Per Carat (INR)
          </label>
          <input
            type="number"
            value={config.baseRatePerCarat}
            onChange={(e) => handleBaseRateChange(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            step="1000"
          />
          <p className="text-sm text-gray-500">
            Current: ₹{config.baseRatePerCarat.toLocaleString()} per carat
          </p>
        </div>
      </div>

      {/* Cut Multipliers */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4 text-textPrimary">Cut Multipliers</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(config.cutMultipliers).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-textPrimary capitalize mb-1">
                {key.replace('-', ' ')}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => handleMultiplierChange('cutMultipliers', key, e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                step="0.05"
                min="0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Color Multipliers */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4 text-textPrimary">Color Multipliers (D-M Scale)</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
          {Object.entries(config.colorMultipliers).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-textPrimary mb-1">
                {key}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => handleMultiplierChange('colorMultipliers', key, e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                step="0.05"
                min="0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Clarity Multipliers */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4 text-textPrimary">Clarity Multipliers</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Object.entries(config.clarityMultipliers).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-textPrimary mb-1">
                {key}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => handleMultiplierChange('clarityMultipliers', key, e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                step="0.05"
                min="0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Additional Charges */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4 text-textPrimary">Additional Charges</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1">
              Making Charge (%)
            </label>
            <input
              type="number"
              value={config.makingChargePercent}
              onChange={(e) => setConfig({ ...config, makingChargePercent: Number(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              step="1"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1">
              GST (%)
            </label>
            <input
              type="number"
              value={config.gstPercent}
              onChange={(e) => setConfig({ ...config, gstPercent: Number(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              step="0.5"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Price Preview Calculator */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4 text-textPrimary">Price Preview Calculator</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1">Carat</label>
            <input
              type="number"
              value={previewForm.carat}
              onChange={(e) => setPreviewForm({ ...previewForm, carat: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              step="0.1"
              min="0.1"
            />
          </div>
          <div className="relative">
            <label className="block text-xs font-body font-bold text-[#222222] uppercase tracking-wider mb-1">Cut</label>
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                setIsPreviewCutOpen(!isPreviewCutOpen);
                setIsPreviewColorOpen(false);
                setIsPreviewClarityOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-gray-200 text-xs font-body text-[#222222] uppercase tracking-wider text-left focus:outline-none cursor-pointer"
            >
              <span className="capitalize">{previewForm.cut ? previewForm.cut.replace('-', ' ') : 'Select cut'}</span>
              <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isPreviewCutOpen ? 'rotate-180 text-[#222222]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.button>
            <AnimatePresence>
              {isPreviewCutOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  className="absolute left-0 right-0 mt-1 bg-white border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.1)] z-50 py-1"
                >
                  {Object.keys(config.cutMultipliers).map((cut) => (
                    <button
                      key={cut}
                      type="button"
                      onClick={() => {
                        setPreviewForm({ ...previewForm, cut });
                        setIsPreviewCutOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-body tracking-wider uppercase hover:bg-[#FAF9F7] ${previewForm.cut === cut ? 'font-bold text-[#222222] bg-gray-50' : 'text-gray-600'}`}
                    >
                      {cut.replace('-', ' ')}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <label className="block text-xs font-body font-bold text-[#222222] uppercase tracking-wider mb-1">Color</label>
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                setIsPreviewColorOpen(!isPreviewColorOpen);
                setIsPreviewCutOpen(false);
                setIsPreviewClarityOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-gray-200 text-xs font-body text-[#222222] uppercase tracking-wider text-left focus:outline-none cursor-pointer"
            >
              <span>Color {previewForm.color}</span>
              <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isPreviewColorOpen ? 'rotate-180 text-[#222222]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.button>
            <AnimatePresence>
              {isPreviewColorOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.1)] z-50 py-1"
                >
                  {Object.keys(config.colorMultipliers).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        setPreviewForm({ ...previewForm, color });
                        setIsPreviewColorOpen(false);
                      }}
                      className={`w-full text-left px-4 py-1.5 text-xs font-body hover:bg-[#FAF9F7] ${previewForm.color === color ? 'font-bold text-[#222222] bg-gray-50' : 'text-gray-600'}`}
                    >
                      Color {color}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <label className="block text-xs font-body font-bold text-[#222222] uppercase tracking-wider mb-1">Clarity</label>
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                setIsPreviewClarityOpen(!isPreviewClarityOpen);
                setIsPreviewCutOpen(false);
                setIsPreviewColorOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-gray-200 text-xs font-body text-[#222222] uppercase tracking-wider text-left focus:outline-none cursor-pointer"
            >
              <span>Clarity {previewForm.clarity}</span>
              <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isPreviewClarityOpen ? 'rotate-180 text-[#222222]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.button>
            <AnimatePresence>
              {isPreviewClarityOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.1)] z-50 py-1"
                >
                  {Object.keys(config.clarityMultipliers).map((clarity) => (
                    <button
                      key={clarity}
                      type="button"
                      onClick={() => {
                        setPreviewForm({ ...previewForm, clarity });
                        setIsPreviewClarityOpen(false);
                      }}
                      className={`w-full text-left px-4 py-1.5 text-xs font-body hover:bg-[#FAF9F7] ${previewForm.clarity === clarity ? 'font-bold text-[#222222] bg-gray-50' : 'text-gray-600'}`}
                    >
                      Clarity {clarity}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <button
          onClick={handlePreviewCalculation}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Calculate Price
        </button>

        {previewCalc && (
          <div className="mt-6 bg-white rounded-lg p-6 space-y-3">
            <h4 className="font-semibold text-lg text-textPrimary border-b pb-2">Calculation Result</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Carat:</span>
                <span className="ml-2 font-semibold">{previewCalc.carat}</span>
              </div>
              <div>
                <span className="text-gray-600">Cut:</span>
                <span className="ml-2 font-semibold">{previewCalc.cut} ({previewCalc.cutMultiplier}x)</span>
              </div>
              <div>
                <span className="text-gray-600">Color:</span>
                <span className="ml-2 font-semibold">{previewCalc.color} ({previewCalc.colorMultiplier}x)</span>
              </div>
              <div>
                <span className="text-gray-600">Clarity:</span>
                <span className="ml-2 font-semibold">{previewCalc.clarity} ({previewCalc.clarityMultiplier}x)</span>
              </div>
              <div className="col-span-2 border-t pt-2">
                <span className="text-gray-600">Base Cost:</span>
                <span className="ml-2 font-semibold">₹{previewCalc.baseCost.toLocaleString()}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">With Multipliers:</span>
                <span className="ml-2 font-semibold text-primary text-xl">₹{Math.round(previewCalc.withMultipliers).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiamondPricingManager;




