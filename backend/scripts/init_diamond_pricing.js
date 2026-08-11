/**
 * Script to initialize Diamond Pricing Configuration in MongoDB
 * Run this once to set up the diamond pricing system
 */

require('dotenv').config();
const mongoose = require('mongoose');
const DiamondPricing = require('../models/DiamondPricing');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/glimmrr';

async function initializeDiamondPricing() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // Check if configuration already exists
    let config = await DiamondPricing.findOne();
    
    if (config) {
      console.log('\n✓ Diamond pricing configuration already exists');
      console.log('Current Base Rate:', `₹${config.baseRatePerCarat.toLocaleString()} per carat`);
      console.log('Making Charge:', `${config.makingChargePercent}%`);
      console.log('GST:', `${config.gstPercent}%`);
    } else {
      console.log('\nCreating new diamond pricing configuration...');
      config = await DiamondPricing.create({});
      console.log('✓ Diamond pricing configuration created successfully!');
      console.log('Base Rate:', `₹${config.baseRatePerCarat.toLocaleString()} per carat`);
      console.log('Making Charge:', `${config.makingChargePercent}%`);
      console.log('GST:', `${config.gstPercent}%`);
    }

    console.log('\nDiamond pricing system is ready!');
    console.log('You can now manage pricing from the admin panel.');
    
  } catch (error) {
    console.error('Error initializing diamond pricing:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
}

initializeDiamondPricing();
