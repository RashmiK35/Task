const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');
const { format } = require('date-fns');


const app = express();
const PORT = 5000;

mongoose.connect('mongodb://127.0.0.1:27017/task');

const dataSchema = new mongoose.Schema({}, { strict: false });
const DataModel = mongoose.model('Data', dataSchema);


app.use(cors());
//app.use(express.json());
//app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


//to upload the data
const processAndUpload = async (fileBuffer,) => {
  const workbook = xlsx.read(fileBuffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(sheet);


  // Formatting date fields into desired format
  const formattedData = jsonData.map((entry) => {
    const utcDate = new Date(entry['Report Date']);
    
    const timeZoneOffset = utcDate.getTimezoneOffset() * 60000;
    const localDate = new Date(utcDate.getTime() - timeZoneOffset);

    return {
      ...entry,
      'Report Date': format(localDate, 'dd-MM-yyyy'), // Formatting 'Report Date' field to local timezone
    };
  });


    try {
      await DataModel.insertMany(formattedData);
      console.log('Data inserted into MongoDB');
    } catch (err) {
      console.error('Error inserting batch into MongoDB:', err);
      throw err;
    }

};


app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }
    await processAndUpload(req.file.buffer);
    res.status(200).send('File uploaded and data inserted into MongoDB');
  } catch (err) {
    console.error('Error processing file upload:', err);
    res.status(500).send('Failed to process file upload');
  }
});


/*
// for the whole data
app.get('/api/data', async (req, res) => {
  try {
    const data = await DataModel.find({}, '-_id -__v'); // Fetch all data without pagination
    res.json({ data });
  } catch (err) {
    console.error('Error fetching data from MongoDB:', err);
    res.status(500).json({ error: 'Failed to fetch data from MongoDB' });
  }
});
*/

app.get('/api/data', async (req, res) => {
  const { page, limit } = req.query;

  if (page && limit) {
    // Paginated request
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
  } else {
    // Full data fetch
    try {
      const data = await DataModel.find({}, '-_id -__v'); // Fetch all data
      res.json({ data });
    } catch (err) {
      console.error('Error fetching data from MongoDB:', err);
      res.status(500).json({ error: 'Failed to fetch data from MongoDB' });
    }
  }
});


app.listen(PORT, () => {
  console.log('Server is Running');
});
