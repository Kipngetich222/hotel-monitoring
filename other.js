for (const item of items) {
    const [rows] = await connection.query('SELECT price FROM menu_items WHERE id = ?', [item.item_id]);
    if (rows.length > 0) {
        const price = rows[0].price;
        totalPrice += price * item.quantity;
        itemDetails.push({ ...item, price }); // Add price to item details for future use
    } else {
        return res.status(404).send(`Item not found with ID: ${item.item_id}`);
    }
}



fetch('http://localhost:3000/order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: orderItems }),
    })
    .then(response => response.json())
    .then(data => {
        // Display order summary to the user
        let summary = `Order ID: ${data.orderId}\n\nItems Ordered:\n`;
        data.items.forEach(item => {
            summary += `- ${item.name} x ${item.quantity} @ $${item.price} each\n`;
        });
        summary += `\nTotal Price: $${data.totalPrice}`;
        alert(summary);
        // Clear the order items from the UI after successful order placement
        document.getElementById('order-items').innerHTML = '';
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('There was an error placing your order. Please try again.');
    });
