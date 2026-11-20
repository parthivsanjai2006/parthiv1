// 1. Cart ah localStorage la irundhu edukkura function
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('cart')) || [];
  } catch (e) {
    return [];
  }
}

// 2. Cart ah localStorage la save panra function
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// 3. Navbar la cart count update panra function
function updateCartCount() {
  const cart = getCart();
  let total = 0;
  cart.forEach(function (item) {
    total += item.qty;
  });
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = total;
  }
}

// 4. Dish ah cart la add panra function
function addToCart(dish) {
  const cart = getCart();
  const existing = cart.find(function (item) {
    return item.id === dish.id;
  });

  if (existing) {
    existing.qty += 1;       // already irundha quantity mattum +1
  } else {
    dish.qty = 1;            // pudhu dish na add pannu
    cart.push(dish);
  }

  saveCart(cart);
  updateCartCount();
}

// 5. Toast message kaattura function
function showToast(message) {
  document.getElementById('cartToastBody').textContent = message;
  const toast = new bootstrap.Toast(document.getElementById('cartToast'), { delay: 2000 });
  toast.show();
}

// 6. Page load aanadhum run aagura code
document.addEventListener('DOMContentLoaded', function () {
  updateCartCount();

  const buttons = document.querySelectorAll('.add-to-cart');
  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      const dish = {
        id: button.dataset.id,
        name: button.dataset.name,
        price: parseFloat(button.dataset.price),
        image: button.dataset.image
      };
      addToCart(dish);
      showToast(dish.name + ' added to cart!');
    });
  });
});