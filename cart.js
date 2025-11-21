// -----------------------------
// CART SYSTEM with + / - Buttons & Images
// -----------------------------
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function renderCart() {
  const tbody = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  tbody.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4">Your cart is empty</td></tr>`;
  } else {
    cart.forEach((item, index) => {
      const subtotal = item.price * item.quantity;
      total += subtotal;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="product-info-cell">
          <img src="${item.image}" alt="${item.name}" class="cart-product-img">
          <span class="product-name">${item.name}</span>
        </td>
        <td class="qty-cell">
          <button class="qty-btn decrease" data-index="${index}">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn increase" data-index="${index}">＋</button>
        </td>
        <td>¥${subtotal.toLocaleString()}</td>
        <td><button class="remove-btn" data-index="${index}">✕</button></td>
      `;
      tbody.appendChild(row);
    });
  }

  totalEl.textContent = `¥${total.toLocaleString()}`;
  saveCart();
}

// Handle increase/decrease/remove
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("increase")) {
    const i = e.target.dataset.index;
    cart[i].quantity += 1;
    renderCart();
  }

  if (e.target.classList.contains("decrease")) {
    const i = e.target.dataset.index;
    if (cart[i].quantity > 1) {
      cart[i].quantity -= 1;
    } else {
      if (confirm("Remove this item?")) {
        cart.splice(i, 1);
      }
    }
    renderCart();
  }

  if (e.target.classList.contains("remove-btn")) {
    const i = e.target.dataset.index;
    cart.splice(i, 1);
    renderCart();
  }
});

// Checkout → order.html
document.getElementById("checkout-btn").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }
  localStorage.setItem("orderData", JSON.stringify(cart));
  window.location.href = "order.html";
});

renderCart();

// -----------------------------
// NAVBAR LOGIN/LOGOUT UPDATE
// -----------------------------
document.addEventListener("DOMContentLoaded", function() {
    const loginNav = document.getElementById("loginNav");
    if(!loginNav) return; // skip if navbar not present

    const currentUser = JSON.parse(localStorage.getItem("crochetLoggedIn"));

    if(currentUser) {
        loginNav.textContent = `Logout`;
        loginNav.removeAttribute("href"); // remove login link
        loginNav.addEventListener("click", function() {
            localStorage.removeItem("crochetLoggedIn");
            location.reload(); // reload to update navbar
        });
    } else {
        loginNav.textContent = "Log in";
        loginNav.href = "login.html";
    }
});