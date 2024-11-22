const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(bodyParser.json()); // Parse JSON request bodies

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Sunkee@123', // Add your MySQL password
  database: 'qr_data_db', // Your database name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database');
});

// Endpoint to save scanned data
app.post('/api/save-scanned-data', (req, res) => {
  const qrData = req.body.qrData;

  // Assuming the data is in a specific format
  const parsedData = parseScannedData(qrData);

  const query = `INSERT INTO scanned_data (name, usn, branch, dob, passout, mobile_no) 
                 VALUES (?, ?, ?, ?, ?, ?)`;

  const values = [
    parsedData.name,
    parsedData.usn,
    parsedData.branch,
    parsedData.dob,
    parsedData.passout,
    parsedData.mobile_no,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error saving data:', err);
      return res.status(500).json({ message: 'Failed to save data' });
    }
    console.log('Data saved:', result);
    res.status(200).json({ message: 'Data saved successfully' });
  });
});

// Function to validate date format (YYYY-MM-DD)
function isValidDate(date) {
  const regex = /^\d{4}-\d{2}-\d{2}$/; // Format: YYYY-MM-DD
  return regex.test(date);
}

// Function to parse the scanned QR data (based on your format)
function parseScannedData(data) {
  const parts = data.split(" ");
  if (parts.length >= 8) {
    return {
      name: `${parts[0]} ${parts[1]} ${parts[2]}`,
      usn: parts[3],
      branch: parts[4],
      dob: isValidDate(parts[5]) ? parts[5] : null, // Use null if dob is empty or invalid
      passout: parts[6],
      mobile_no: parts[7],
    };
  } else {
    return {
      name: 'Invalid data',
      usn: '',
      branch: '',
      dob: null, // Set to null if data is invalid
      passout: '',
      mobile_no: '',
    };
  }
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
