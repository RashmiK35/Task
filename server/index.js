const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

//const xlsx = require('xlsx');
//const { format } = require('date-fns');
//const { zonedTimeToUtc } = require('date-fns-tz');


const app = express();
const PORT = 5000;

mongoose.connect('mongodb://127.0.0.1:27017/task');

const dataSchema = new mongoose.Schema({}, { strict: false });
const DataModel = mongoose.model('Data', dataSchema);


app.use(cors());

/*//to upload the data
// it is a function to process and upload the Excel file in batches
const processAndUpload = async (filePath, batchSize = 10000) => {
  const workbook = xlsx.readFile(filePath, { cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(sheet);


  // Formatting date fields to desired format
  const formattedData = jsonData.map((entry) => {
    const utcDate = new Date(entry['Report Date']);
    
    // Get timezone offset in milliseconds and apply it to UTC date
    const timeZoneOffset = utcDate.getTimezoneOffset() * 60000;
    const localDate = new Date(utcDate.getTime() - timeZoneOffset);

    return {
      ...entry,
      'Report Date': format(localDate, 'dd-MM-yyyy'), // Formatting 'Report Date' field to local timezone
    };
  });

  // to split data into batches
  const batches = [];
  for (let i = 0; i < formattedData.length; i += batchSize) {
    batches.push(formattedData.slice(i, i + batchSize));
  }

  // now to insert batches into MongoDB
  for (const batch of batches) {
    try {
      await DataModel.insertMany(batch);
      console.log('Batch inserted into MongoDB');
    } catch (err) {
      console.error('Error inserting batch into MongoDB:', err);
    }
  }

  console.log('All data inserted into MongoDB');
  mongoose.disconnect();
};


const filePath = 'C:\\Users\\VOSTRO\\Desktop\\Testing Observations.xlsx';
processAndUpload(filePath);  
  
// excel file
const filePath = 'C:\\Users\\VOSTRO\\Desktop\\Testing Observations.xlsx';
processAndUpload(filePath)  
*/


// for the whole data
/*app.get('/api/data', async (req, res) => {
  try {
    const data = await DataModel.find({}, '-_id -__v'); // Fetch all data without pagination
    res.json({ data });
  } catch (err) {
    console.error('Error fetching data from MongoDB:', err);
    res.status(500).json({ error: 'Failed to fetch data from MongoDB' });
  }
});*/


app.get('/api/data', async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  try {
    const data = await DataModel.find({}, '-_id -__v')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await DataModel.countDocuments();

    res.json({
      data,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Error fetching data from MongoDB:', err);
    res.status(500).json({ error: 'Failed to fetch data from MongoDB' });
  }
});

app.listen(PORT, () => {
  console.log('Server is Running');
});
