const axios = require('axios');

const testPriceFiltering = async () => {
  try {
    const baseURL = 'http://localhost:5002/api';
    
    console.log('🧪 Testing Price Filtering...\n');

    // Test 1: Get all products
    console.log('📊 Test 1: Fetching all products...');
    const allRes = await axios.get(`${baseURL}/products`);
    const allProducts = allRes.data.products;
    console.log(`✓ Total products: ${allProducts.length}`);
    
    if (allProducts.length > 0) {
      const prices = allProducts.map(p => p.price).filter(p => p !== undefined && p !== null);
      console.log(`  Min price in DB: ₹${Math.min(...prices)}`);
      console.log(`  Max price in DB: ₹${Math.max(...prices)}`);
      console.log(`  Sample products:`, allProducts.slice(0, 3).map(p => ({name: p.name, price: p.price})));
    }

    // Fetch live per-gram for verification
    const pricesLatest = await axios.get(`${baseURL}/prices/latest?currency=inr`).catch(() => ({ data: {} }));
    const gpg = Number(pricesLatest.data?.gold?.price || 6500);
    const spg = Number(pricesLatest.data?.silver?.price || 75);

    const computeLive = (p) => {
      const mat = String(p.material || '').toLowerCase();
      const w = Number(p.weight || 0);
      if (w <= 0) return 0;
      if (mat === 'gold') {
        const karat = Number(p.karat || 24);
        const purity = karat === 24 ? 1.0 : karat === 22 ? 22/24 : karat === 18 ? 18/24 : karat/24;
        return Math.round(gpg * w * purity);
      } else if (mat === 'silver') {
        return Math.round(spg * w);
      }
      return Number(p.price || 0);
    };

    // Test 2: Min price filter
    console.log('\n📊 Test 2: Filter minPrice=20000 (live)...');
    const minRes = await axios.get(`${baseURL}/products?minPrice=20000`);
    const minProducts = minRes.data.products;
    console.log(`✓ Found ${minProducts.length} products with live price >= 20000`);
    
    const failedMinFilter = minProducts.filter(p => computeLive(p) < 20000);
    if (failedMinFilter.length > 0) {
      console.log(`❌ ERROR: ${failedMinFilter.length} products have live price < 20000!`);
      failedMinFilter.forEach(p => console.log(`   - ${p.name}: live=₹${computeLive(p)} (stored=₹${p.price})`));
    } else {
      console.log('✓ All products meet minPrice (live)');
    }

    // Test 3: Max price filter
    console.log('\n📊 Test 3: Filter maxPrice=50000 (live)...');
    const maxRes = await axios.get(`${baseURL}/products?maxPrice=50000`);
    const maxProducts = maxRes.data.products;
    console.log(`✓ Found ${maxProducts.length} products with live price <= 50000`);
    
    const failedMaxFilter = maxProducts.filter(p => computeLive(p) > 50000);
    if (failedMaxFilter.length > 0) {
      console.log(`❌ ERROR: ${failedMaxFilter.length} products have live price > 50000!`);
      failedMaxFilter.forEach(p => console.log(`   - ${p.name}: live=₹${computeLive(p)} (stored=₹${p.price})`));
    } else {
      console.log('✓ All products meet maxPrice (live)');
    }

    // Test 4: Both min and max price (live)
    console.log('\n📊 Test 4: Filter minPrice=15000 & maxPrice=45000 (live)...');
    const rangeRes = await axios.get(`${baseURL}/products?minPrice=15000&maxPrice=45000`);
    const rangeProducts = rangeRes.data.products;
    console.log(`✓ Found ${rangeProducts.length} products in range 15000-45000 (live)`);
    
    const failedRangeFilter = rangeProducts.filter(p => {
      const live = computeLive(p);
      return live < 15000 || live > 45000;
    });
    if (failedRangeFilter.length > 0) {
      console.log(`❌ ERROR: ${failedRangeFilter.length} products outside live range!`);
      failedRangeFilter.forEach(p => console.log(`   - ${p.name}: live=₹${computeLive(p)} (stored=₹${p.price})`));
    } else {
      console.log('✓ All products are within the live price range');
    }

    // Test 5: Check response structure
    console.log('\n📊 Test 5: Response structure check...');
    if (rangeRes.data.products && Array.isArray(rangeRes.data.products)) {
      console.log('✓ Response has products array');
    }
    if (rangeRes.data.totalPages !== undefined && rangeRes.data.currentPage !== undefined) {
      console.log(`✓ Pagination info present: Page ${rangeRes.data.currentPage} of ${rangeRes.data.totalPages}`);
    }

    console.log('\n✅ Price filtering tests completed!');

  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
  }
};

testPriceFiltering();
