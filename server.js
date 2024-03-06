const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: 'PHW#84#vic', // Replace with your MySQL password
    database: 'hotel_ordering'
});

connection.connect();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/menu', (req, res) => {
    connection.query('SELECT * FROM menu_items', (error, results) => {
        if (error) {
            res.status(500).send('Error fetching menu');
            return;
        }
        res.json(results);
    });
});

app.post('/order', (req, res) => {
    const { items } = req.body;
    if (!items || !items.length) {
        res.status(400).send('Invalid order');
        return;
    }

    const status = 'placed';
    const totalPrice = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    connection.query('INSERT INTO orders (status, total_price) VALUES (?, ?)', [status, totalPrice], (error, results) => {
        if (error) {
            res.status(500).send('Error placing order');
            return;
        }

        const orderId = results.insertId;
        items.forEach(item => {
            connection.query('INSERT INTO order_items (order_id, item_id, quantity) VALUES (?, ?, ?)', [orderId, item.item_id, item.quantity]);
        });

        res.status(201).json({ orderId, status, items, totalPrice });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
