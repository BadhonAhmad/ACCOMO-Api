const express = require("express");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`API is started on port ${PORT}`);
});

