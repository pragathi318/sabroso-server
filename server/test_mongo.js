const mongoose = require('mongoose');
const MONGO_URI = 'mongodb+srv://garipallypragathi_db_user:Sabroso2026@cluster0.n2vowwi.mongodb.net/sabroso';

console.log('Testing connection to:', MONGO_URI);

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Connection successful!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    });
