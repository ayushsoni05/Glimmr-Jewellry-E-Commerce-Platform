const mongoose = require('mongoose');
require('dotenv').config();

async function dropPhoneIndex() {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/glimmr';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    const coll = mongoose.connection.db.collection('users');
    
    // List all indexes
    const indexes = await coll.indexes();
    console.log('\nCurrent indexes:');
    indexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    // Try to drop phone_1 index
    try {
      await coll.dropIndex('phone_1');
      console.log('\n✓ Dropped phone_1 index successfully');
    } catch (err) {
      if (err.message.includes('index not found')) {
        console.log('\n✓ phone_1 index does not exist (already removed)');
      } else {
        console.error('\n✗ Error dropping index:', err.message);
      }
    }

    await mongoose.connection.close();
    console.log('✅ Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

dropPhoneIndex();
