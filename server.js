const express = require('express');
const mysql = require('mysql2/promise');  // Using mysql2 for promise support
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // Replace with your MySQL username
  password: 'PHW#84#vic', // Replace with your MySQL password (securely store this)
  database: 'hotel',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/menu', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM menu_items');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/order', async (req, res) => {
    try {
        const orderData = req.body; // Expecting an array of objects with { item_id, quantity }

        console.log('Received order data:', orderData); // Log received order data

        // Validate order data
        if (!Array.isArray(orderData) || orderData.length === 0) {
            console.log('Invalid order data:', orderData);
            return res.status(400).send('Invalid order data. Please add items to your order.');
        }

        let totalPrice = 0;
        const itemDetails = [];

        // Start a transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            for (const item of orderData) {
                const { item_id, quantity } = item; // Destructure properties

                // Validate item data (optional)
                if (typeof item_id === 'undefined' || typeof quantity === 'undefined' || quantity <= 0) {
                    console.warn('Skipping invalid item data:', item);
                    continue; // Skip processing invalid items
                }

                const [rows] = await connection.query('SELECT price FROM menu_items WHERE item_id = ?', [item_id]);
                if (!rows || !rows[0] || rows[0].length === 0) {
                    throw new Error(`Item not found with ID: ${item_id}`);
                }

                const price = rows[0].price;
                totalPrice += price * quantity;
                itemDetails.push({ ...item, price }); // Include retrieved price
            }

            const [orderInsertResult] = await connection.query('INSERT INTO orders (status, total_price) VALUES (?, ?)', ['placed', totalPrice]);
            const orderId = orderInsertResult.insertId;

            const orderItems = orderData.map(item => [orderId, item.item_id, item.quantity]); // Use original data for quantity

            await connection.query('INSERT INTO order_items (order_id, item_id, quantity) VALUES ?', [orderItems]);

            await connection.commit();
            res.status(201).json({ orderId, items: itemDetails, totalPrice });
        } catch (error) {
            await connection.rollback();
            console.error('Error placing order:', error);
            res.status(error.message ? 400 : 500).send(error.message || 'Internal Server Error'); // Provide more specific error messages
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).send('Internal Server Error');
    }
});

  
  


// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
