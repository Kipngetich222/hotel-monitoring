document.addEventListener('DOMContentLoaded', function() {
    fetchMenu();
  });
  document.getElementById('place-order-btn').addEventListener('click', submitOrder);
  
  function fetchMenu() {
    const loadingIndicator = document.getElementById('loading-indicator');
    loadingIndicator.style.display = 'block';
  
    fetch('http://localhost:3000/menu')
      .then(response => response.json())
      .then(data => displayMenu(data))
      .catch(error => console.error('Error fetching menu:', error))
      .finally(() => {
        loadingIndicator.style.display = 'none';
      });
  }
  
  function displayMenu(menuItems) {
    const menuDiv = document.getElementById('menu');
    menuDiv.innerHTML = '';
  
    menuItems.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'menu-item';
      itemDiv.innerHTML = `<h3>${item.name}</h3><p>$${item.price}</p><button onclick="addItemToOrder('${item.item_id}', '${item.name}', ${item.price})">Add to Order</button>`;
  
      menuDiv.appendChild(itemDiv);
    });
  }
  
  let orderItems = []; // Initialize an empty array to keep track of order items
  
  function addItemToOrder(itemId, itemName, itemPrice) {
    // Check if the item already exists in the order
    let item = orderItems.find(item => item.item_id === itemId);
    if (item) {
      item.quantity += 1; // Increment quantity if item exists
    } else {
      // Add new item to the order
      orderItems.push({ item_id: itemId, quantity: 1, name: itemName, price: itemPrice });
    }
  
    updateOrderUI(); // Call a function to update the UI based on the orderItems array
  }
  
  function updateOrderUI() {
    const orderItemsDiv = document.getElementById('order-items');
    orderItemsDiv.innerHTML = ''; // Clear existing items
  
    orderItems.forEach((item, index) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'order-item';
      itemDiv.innerHTML = `<h4>${item.name}</h4><input type="number" value="${item.quantity}" min="1" onchange="updateItemQuantity('${item.item_id}', this.value)" /><button type="button" onclick="removeItemFromOrder('${item.item_id}')">Remove</button>`;
      orderItemsDiv.appendChild(itemDiv);
    });
  }
  
  function updateItemQuantity(itemId, newQuantity) {
    let item = orderItems.find(item => item.item_id === itemId);
    if (item) {
      item.quantity = parseInt(newQuantity, 10);
      if (item.quantity <= 0) {
        removeItemFromOrder(itemId); // Remove item if quantity is less than or equal to 0
      }
    }
  }
  
  function removeItemFromOrder(itemId) {
    orderItems = orderItems.filter(item => item.item_id !== itemId);
    updateOrderUI(); // Update UI after removing item
  }
  
  document.getElementById('order-form').onsubmit = function(event) {
    event.preventDefault();
    const loadingIndicator = document.getElementById('loading-indicator');
    loadingIndicator.style.display = 'block';
  
    fetch('http://localhost:3000/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: orderItems }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to place order');
        }
        return response.json();
      })
      .then(data => {
        // Option to use localStorage or redirect with query parameters
        localStorage.setItem('orderId', data.orderId); // Assuming the response contains an orderId
        window.location.href = "order-confirmation.html";
      })
      .catch((error) => {
        console.error('Error placing order:', error);
        alert('Failed to place order. Please try again.');
      })
      .finally(() => {
        loadingIndicator.style.display = 'none';
      });
  };
  
  // Additional function if needed to handle dynamic quantity updates directly from the input field
  function updateItemQuantity(itemId, quantity) {
    const itemIndex = orderItems.findIndex(item => item.item_id === itemId);
    if (itemIndex !== -1) {
      orderItems[itemIndex].quantity = parseInt(quantity, 10);
      if (orderItems[itemIndex].quantity <= 0) {
        orderItems.splice(itemIndex, 1); // Remove the item if its quantity is 0 or negative
      }
    }
  }

  


  function submitOrder() {
    const loadingIndicator = document.getElementById('loading-indicator');
    loadingIndicator.style.display = 'block';

    console.log('Order items:', orderItems); // Log order items being sent

    fetch('http://localhost:3000/order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: orderItems }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to place order: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        // Assuming the response includes the total amount, order ID, and detailed items with prices and quantities
        localStorage.setItem('orderConfirmationDetails', JSON.stringify(data));
        window.location.href = 'order-confirmation.html';
    })
    .catch(error => {
        console.error('Order Submission Error:', error);
        alert('There was a problem with your order. Please try again.');
    })
    .finally(() => {
        loadingIndicator.style.display = 'none';
    });
}



