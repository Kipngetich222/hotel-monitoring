document.addEventListener('DOMContentLoaded', function() {
    fetchMenu();
});

function fetchMenu() {
    fetch('http://localhost:3000/menu')
        .then(response => response.json())
        .then(data => displayMenu(data))
        .catch(error => console.error('Error fetching menu:', error));
}

function displayMenu(menuItems) {
    const menuDiv = document.getElementById('menu');
    menuItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'menu-item';
        itemDiv.innerHTML = `<h3>${item.name}</h3><p>$${item.price}</p>`;
        itemDiv.onclick = function() { addItemToOrder(item); };
        menuDiv.appendChild(itemDiv);
    });
}

function addItemToOrder(item) {
    const orderItemsDiv = document.getElementById('order-items');
    const itemDiv = document.createElement('div');
    itemDiv.className = 'order-item';
    itemDiv.innerHTML = `<h4>${item.name}</h4><input type="number" value="1" min="1" data-item-id="${item.item_id}" /><button type="button">Remove</button>`;
    orderItemsDiv.appendChild(itemDiv);
    itemDiv.querySelector('button').onclick = function() {
        orderItemsDiv.removeChild(itemDiv);
    };
}

document.getElementById('order-form').onsubmit = function(event) {
    event.preventDefault();
    const orderItems = [];
    document.querySelectorAll('#order-items input').forEach(input => {
        orderItems.push({
            item_id: input.getAttribute('data-item-id'),
            quantity: parseInt(input.value, 10)
        });
    });

    fetch('http://localhost:3000/order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: orderItems }),
    })
    .then(response => response.json())
    .then(data => {
        alert('Order placed successfully!');
        console.log(data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
};
