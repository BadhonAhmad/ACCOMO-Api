const express = require("express");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
// const crypto = require('crypto-browserify');
const crypto = require('crypto');
dotenv.config({ path: './.env' });

const app = express();
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 40,
  queueLimit: 2
});

const queryAsync = async (sql, values) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(sql, values);
    return rows;
  } finally {
    connection.release();
  }
};

// POST endpoint to handle incoming data
// POST endpoint to handle incoming data
app.post("/owner", async (req, res) => {
  try {
    // Extract data from the request body
    const { name, address, mobile, email, bkash, password } = req.body;
    
    // Perform necessary validations on the data if needed

    // Example SQL query to insert data into a database table
    const sql = "INSERT INTO owner_info (name, address, mobile, email, bkash, password) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [name, address, mobile, email, bkash, password];

    // Execute the SQL query - you'll need to implement your own queryAsync function
    // For instance, using a MySQL library such as mysql2
    await queryAsync(sql, values);

    // Send a success response
    res.status(200).json({ message: "Data inserted successfully" });
  } catch (error) {
    // Send an error response if something goes wrong
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/renter", async (req, res) => {
  try {
    // Extract data from the request body
    const { name, address, email, mobile, password, nid } = req.body;
    
    // Perform necessary validations on the data if needed

    // Example SQL query to insert data into a database table
    const sql = "INSERT INTO renter_info (name, address, email, mobile, password, nid) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [name, address, email, mobile, password, nid];

    // Execute the SQL query - you'll need to implement your own queryAsync function
    // For instance, using a MySQL library such as mysql2
    await queryAsync(sql, values);

    // Send a success response
    res.status(200).json({ message: "Data inserted successfully" });
  } catch (error) {
    // Send an error response if something goes wrong
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get('/renterinfo', async (req, res) => {
  const { email, password } = req.query;
  // Validate inputs
  if (!email || !password) {
    res.status(400).json({ error: 'Bad Request: Registration number and date of birth are required' });
    return;
  }
  try {
    const results = await queryAsync('SELECT * FROM renter_info WHERE email = ? AND password = ?', [email, password]);

    if (results.length === 0) {
      res.status(404).json({ error: 'Record not found' });
    } else {
      res.json(results);
    }
  } catch (error) {
    console.error('Error executing MySQL query:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/ownerinfo', async (req, res) => {
  const { email, password } = req.query;

  if (!email || !password) {
    res.status(400).json({ error: 'Bad Request: Registration number and date of birth are required' });
    return;
  }
  try {
    const results = await queryAsync('SELECT * FROM owner_info WHERE email = ? AND password = ?', [email, password]);

    if (results.length === 0) {
      res.status(404).json({ error: 'Record not found' });
    } else {
      res.json(results);
    }
  } catch (error) {
    console.error('Error executing MySQL query:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});


app.get('/flatdetails', async (req, res) => {
  const { flatname } = req.query;

  if (!flatname) {
    res.status(400).json({ error: 'Bad Request: Registration number and date of birth are required' });
    return;
  }
  try {
    const results = await queryAsync('SELECT rent, gas,code FROM flat_info WHERE flatname = ?',[flatname]);

    if (results.length === 0) {
      res.status(404).json({ error: 'Record not found' });
    } else {
      res.json(results);
    }
  } catch (error) {
    console.error('Error executing MySQL query:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.post("/createflat", async (req, res) => {
  try {
    // Extract data from the request body
    const { owner, flatname, floor,unit, rent, gas} = req.body;
    
    // Perform necessary validations on the data if needed
    
    // Example SQL query to insert data into a database table
    for (let i = 1; i <= floor; i++) {
      let ch = 'A'.charCodeAt(0); // Get the ASCII code of 'A'
      let unt = flatname + "-" + i.toString();

      for (let j = 0; j < unit; j++, ch++) {
    
        let randomCode = generateRandomCode(6);
        let temp = unt +"-"+ String.fromCharCode(ch);
        const sql = "INSERT INTO flat_info (owner, flatname, code, rent, gas) VALUES (?, ?,?, ?, ?)";
        const values = [owner, temp, randomCode, rent, gas];
        await queryAsync(sql, values);
      }
    }
    res.status(200).json({ message: "Data inserted successfully" });
  } catch (error) {
    // Log the complete error details
    console.error("Error:", error);
  
    // Send an error response with the error details
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});


function generateRandomCode(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomCode = '';
  
  for (let k = 0; k < length; k++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomCode += characters.charAt(randomIndex);
  }

  return randomCode;
}



const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`API is started on port ${PORT}`);
});

