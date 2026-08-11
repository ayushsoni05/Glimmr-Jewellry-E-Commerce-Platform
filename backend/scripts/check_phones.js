require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).limit(20).toArray();
    
    console.log('\n=== Users in Database ===');
    users.forEach(u => {
      console.log(`Phone: "${u.phone}" | Email: ${u.email} | Name: ${u.name}`);
    });
    
    console.log(`\nTotal users: ${users.length}`);
    process.exit(0);
  })
  .catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
  });
