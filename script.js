//---- for header -----

const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");

hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("show");
});


//---------------------------------------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  const id = Number(params.get("id"));

  if (category && id) {
    loadProductDetail(category, id);
  }
});

async function loadProductDetail(category, id) {
  try {
    const res = await fetch(`data/${category}.json`);
    const products = await res.json();
    const product = products.find(p => p.id === id);

    if (!product) {
      console.error("Product not found");
      return;
    }

    // --- Update slides ---
    const slidesEl = document.querySelector(".slides");
    slidesEl.innerHTML = ""; // clear previous slides

    product.images.forEach((src, i) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = product.name;
      if (i === 0) img.classList.add("active");
      slidesEl.appendChild(img);
    });

    // --- Update text ---
    const titleEl = document.querySelector(".text h3");
    const infoEl = document.querySelector(".text p");

    titleEl.textContent = product.name;
    infoEl.innerHTML = `
      Price - ¥${product.price}<br>
      Waiting time - ${product.waiting}<br>
      Available color - ${product.colors}
    `;

    // --- Slider functionality ---
    const slides = slidesEl.querySelectorAll("img");
    let currentSlide = 0;

    window.moveSlide = function (step) {
      slides[currentSlide].classList.remove("active");
      currentSlide = (currentSlide + step + slides.length) % slides.length;
      slides[currentSlide].classList.add("active");
    };

  } catch (error) {
    console.error("Error loading product detail:", error);
  }
}


//--------------------------------------------------------------------------------------------------------

// --------------------
// Firebase (optional)
// --------------------
 const firebaseConfig = {
  apiKey: "AIzaSyCpb7YUbR3lzYjHYKNJnLG2y6XuQe3GMSc",
  authDomain: "crochet-diary.firebaseapp.com",
  projectId: "crochet-diary",
  storageBucket: "crochet-diary.firebasestorage.app",
  messagingSenderId: "1086340996673",
  appId: "1:1086340996673"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Initialize EmailJS
emailjs.init("qwR8RPhNN4JrPcNVr");

// -----------------------------
// SIGNUP LOGIC
// -----------------------------
const signupForm = document.getElementById("signupForm");
if(signupForm){
  signupForm.addEventListener("submit", function(e){
    e.preventDefault();

    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value; // make sure your HTML has this ID

    if(password !== confirmPassword){
      alert("Passwords do not match!");
      return;
    }

    const userData = {
      name: document.getElementById("signupName").value,
      email: document.getElementById("signupEmail").value,
      password: password,
      tel: document.getElementById("signupTel").value,
      postal: document.getElementById("signupPostal").value,
      address: document.getElementById("signupAddress").value
    };

    // Store multiple users in localStorage
    let users = JSON.parse(localStorage.getItem("crochetUsers")) || [];

    // Check if email already exists
    if(users.some(u => u.email === userData.email)){
      alert("This email is already registered. Please login.");
      return;
    }

    users.push(userData);
    localStorage.setItem("crochetUsers", JSON.stringify(users));

    alert("Sign-up successful! Please login.");
    signupForm.reset();
    window.location.href = "login.html";
  });
}

// -----------------------------
// LOGIN LOGIC
// -----------------------------
const loginForm = document.getElementById("loginForm");
if(loginForm){
  loginForm.addEventListener("submit", function(e){
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    const users = JSON.parse(localStorage.getItem("crochetUsers")) || [];
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if(user){
      // Save logged-in user
      localStorage.setItem("crochetLoggedIn", JSON.stringify(user));
      alert("Login successful!");
      window.location.href = "order.html";
    } else {
      alert("Email or password incorrect.");
    }
  });
}

// -----------------------------
// ORDER FORM + EMAILJS + LOGIN CHECK
// -----------------------------

const orderForm = document.getElementById("orderForm");

if (orderForm) {
  // Check login
  const currentUser = JSON.parse(localStorage.getItem("crochetLoggedIn"));
  if (!currentUser) {
    alert("Please login first.");
    window.location.href = "login.html";
  } else {
    // Prefill order form with user info
    document.getElementById("orderName").value = currentUser.name;
    document.getElementById("orderEmail").value = currentUser.email;
    document.getElementById("orderTel").value = currentUser.tel;
    document.getElementById("orderPostal").value = currentUser.postal;
    document.getElementById("orderAddress").value = currentUser.address;
  }

  // ✅ Load selected products from cart
  const cartData = JSON.parse(localStorage.getItem("orderData")) || [];
  if (cartData.length > 0) {
    const productList = cartData.map(p => `${p.name} ×${p.quantity}`).join(", ");
    document.getElementById("productName").value = productList;
  }


  // Handle form submission
  orderForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const orderMessage = document.getElementById("orderDetails").value;

    const emailParams = {
      name: currentUser.name,
      email: currentUser.email,
      tel: currentUser.tel,
      postal: currentUser.postal,
      address: currentUser.address,
      product: document.getElementById("productName").value,
      message: orderMessage,
    };

    // ✅ Send with EmailJS
    emailjs.send("service_qw97qba", "template_x2wmgjl", emailParams)
      .then(() => {
        alert("✅ Order sent successfully!");
        orderForm.reset();
        localStorage.removeItem("cart");
        localStorage.removeItem("orderData");

        // Refill readonly fields
        document.getElementById("orderName").value = currentUser.name;
        document.getElementById("orderEmail").value = currentUser.email;
        document.getElementById("orderTel").value = currentUser.tel;
        document.getElementById("orderPostal").value = currentUser.postal;
        document.getElementById("orderAddress").value = currentUser.address;
      })
      .catch((err) => {
        console.error("EmailJS error:", err);
        alert("❌ Failed to send order. Please try again.");
      });
  });
}

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


// -----------------------------
// ADD TO CART (shop page)
// -----------------------------

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Add to cart button
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("add-to-cart-btn")) {
    const btn = e.target;
    const product = {
      id: btn.dataset.id,
      name: btn.dataset.name,
      price: parseInt(btn.dataset.price),
      image: btn.dataset.image,
      quantity: 1
    };

    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push(product);
    }

    saveCart();
    alert(`${product.name} added to cart!`);
  }
});
















