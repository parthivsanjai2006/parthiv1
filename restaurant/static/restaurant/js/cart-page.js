// Cart ah screen la draw panra function
function renderCart() {
  const cart = getCart();
  const emptyBox = document.getElementById('cart-empty');
  const contentBox = document.getElementById('cart-content');
  const tbody = document.getElementById('cart-items');

  if (cart.length === 0) {
    emptyBox.classList.remove('d-none');
    contentBox.classList.add('d-none');
    return;
  }

  emptyBox.classList.add('d-none');
  contentBox.classList.remove('d-none');

  tbody.innerHTML = '';
  let total = 0;

  cart.forEach(function (item) {
    const subtotal = item.price * item.qty;
    total += subtotal;

    const row = document.createElement('tr');
    row.innerHTML =
      '<td><div class="d-flex align-items-center gap-3">' +
        '<img src="' + IMAGE_BASE + item.image + '" width="60" height="60" class="rounded" style="object-fit:cover">' +
        '<span class="dish-name"></span>' +
      '</div></td>' +
      '<td>' + item.price.toFixed(2) + '$</td>' +
      '<td><div class="d-flex align-items-center gap-2">' +
        '<button class="btn btn-sm btn-outline-danger" data-action="minus" data-id="' + item.id + '">-</button>' +
        '<span>' + item.qty + '</span>' +
        '<button class="btn btn-sm btn-outline-success" data-action="plus" data-id="' + item.id + '">+</button>' +
      '</div></td>' +
      '<td>' + subtotal.toFixed(2) + '$</td>' +
      '<td><button class="btn btn-sm btn-danger" data-action="remove" data-id="' + item.id + '">Remove</button></td>';

    row.querySelector('.dish-name').textContent = item.name;
    tbody.appendChild(row);
  });

  document.getElementById('cart-total').textContent = total.toFixed(2);
}

// + / - / Remove buttons handle panra code
document.getElementById('cart-items').addEventListener('click', function (e) {
  const button = e.target.closest('button[data-action]');
  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;
  let cart = getCart();
  const item = cart.find(function (i) {
    return String(i.id) === id;
  });
  if (!item) return;

  if (action === 'plus') {
    item.qty += 1;
  } else if (action === 'minus') {
    item.qty -= 1;
    if (item.qty < 1) {
      cart = cart.filter(function (i) { return i !== item; });
    }
  } else if (action === 'remove') {
    cart = cart.filter(function (i) { return i !== item; });
  }

  saveCart(cart);
  renderCart();
});

// Place Order click panna
document.getElementById('order-form')?.addEventListener('submit', function (e) {
  e.preventDefault();

  const cart = getCart();
  if (cart.length === 0) return;

  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
  const message = document.getElementById('order-message');

  const payload = {
    name: document.getElementById('order-name').value,
    phone: document.getElementById('order-phone').value,
    address: document.getElementById('order-address').value,
    items: cart.map(function (i) {
      return { id: i.id, qty: i.qty };
    })
  };

  fetch(PLACE_ORDER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken
    },
    body: JSON.stringify(payload)
  })
    .then(function (response) { return response.json(); })
    .then(function (data) {
      if (data.success) {
        saveCart([]);
        document.getElementById('cart-content').classList.add('d-none');
        message.innerHTML = '<div class="alert alert-success fs-5">Order #' + data.order_id + ' place aayiduchu! Nanri 🎉</div>';
      } else {
        message.innerHTML = '<div class="alert alert-danger">' + data.error + '</div>';
      }
    })
    .catch(function () {
      message.innerHTML = '<div class="alert alert-danger">Edho thappu nadandhuchu. Marubadi try pannunga.</div>';
    });
});

// Page open aanadhum cart ah kaattu
renderCart();