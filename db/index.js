const mongoose = require('mongoose');
const constant = require('../constants');

let _db;

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.DATABASE_URL}/${constant.DB_NAME}`,
    );
    _db = connectionInstance.connection.db;
    console.log('MONGODB connected');
  } catch (err) {
    console.log('MONGODB connection error', err);
    process.exit(1);
  }
};

const getDb = () => {
  if (!_db) {
    throw new Error('Database connection not initialized.');
  }
  return _db;
};

exports.connectDB = connectDB;
exports.getDb = getDb;
