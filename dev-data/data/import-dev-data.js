const fs = require('fs');

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '../../config.env' });

const Tour = require('./../../models/tourModel');

mongoose
  .connect(`${process.env.DATABASE_URL}`)
  .then(() => {
    console.log('database connected successfully');
  })
  .catch((err) => console.log(err));

//read JSON File

const tour = fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8');

// import data into DB
const importData = async () => {
  try {
    await Tour.create(JSON.parse(tour));
    console.log('Data successfully loaded');
  } catch (err) {
    x;
    console.log(err);
  }
  process.exit();
};

// delete all data from DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
