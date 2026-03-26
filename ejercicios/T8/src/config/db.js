//src/config/db.js
import mongoose from 'mongoose';

const dbConnect = async () => {
    const DB_URI = process.env.MONGO_URI;
    try {
        await mongoose.connect(DB_URI);
        console.log('Conectado a MongoDB');
    } catch (err) {
        console.error('Error conectando a MongoDB:', err.message);
        process.exit(1);
    }
};

export default dbConnect;