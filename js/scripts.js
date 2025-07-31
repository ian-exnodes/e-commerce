// Load products from JSON and render list
async function loadProducts() {
  const res = await fetch("data/products.json");
  const products = await res.json();
  return products;
}
console.log("renderProducts");
async function renderProducts() {
  const container = document.getElementById("product-list");
  console.log(container);
  if (!container) return;
  const products = await loadProducts();
  container.innerHTML = products
    .map(
      (p) => `
      <div class="product-card">
        <img src="images/${p.image}" alt="${p.name}" width="150" height="150">
        <h3><a href="product-details.html?id=${p.id}">${p.name}</a></h3>
        <p>$${p.price}</p>
        <button onclick="addToCart(${p.id})">Add to Cart</button>
      </div>
    `
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  renderProductDetails();
  renderCart();
  faqToggle();
  bannerSlider();
});

function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}
function addToCart(id) {
  const cart = getCart();
  cart.push(id);
  saveCart(cart);
  alert("Added to cart");
}

async function renderProductDetails() {
  const container = document.getElementById("product-detail");
  if (!container) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const products = await loadProducts();
  const product = products.find((p) => p.id == id);
  if (!product) {
    container.innerHTML = "Product not found";
    return;
  }
  container.innerHTML = `
      <h2>${product.name}</h2>
      <img src="images/${product.image}" alt="${product.name}" width="300" height="300">
      <p>${product.description}</p>
      <table class="table"><tr><th>Category</th><td>${product.category}</td></tr>
      <tr><th>Rating</th><td>${product.rating}</td></tr>
      <tr><th>Price</th><td>$${product.price}</td></tr></table>
      <button onclick="addToCart(${product.id})">Add to Cart</button>
    `;
}

async function renderCart() {
  const container = document.getElementById("cart-items");
  if (!container) return;
  const products = await loadProducts();
  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }
  container.innerHTML = cart
    .map((id) => {
      const p = products.find((prod) => prod.id == id);
      return `<div class="cart-item"><img src="images/${p.image}" alt="${p.name}"><span>${p.name}</span><span>$${p.price}</span></div>`;
    })
    .join("");
}

// Form validation
document.addEventListener("submit", function (e) {
  const form = e.target.closest("form");
  if (!form || !form.classList.contains("needs-validation")) return;
  e.preventDefault();
  const name = form.querySelector("[name=name]");
  const email = form.querySelector("[name=email]");
  const message = form.querySelector("[name=message]");
  let valid = true;
  form.querySelectorAll(".form-error").forEach((el) => (el.textContent = ""));
  if (!name.value) {
    form.querySelector(".name-error").textContent = "Name required";
    valid = false;
  }
  if (!email.value || !/^[^@]+@[^@]+\.[^@]+$/.test(email.value)) {
    form.querySelector(".email-error").textContent = "Valid email required";
    valid = false;
  }
  if (!message.value) {
    form.querySelector(".message-error").textContent = "Message required";
    valid = false;
  }
  if (valid) {
    alert("Form submitted");
    form.reset();
  }
});

function faqToggle() {
  document.querySelectorAll(".faq-item h3").forEach((h) => {
    h.addEventListener("click", () => {
      const item = h.parentElement;
      item.classList.toggle("open");
      const ans = item.querySelector(".faq-answer");
      ans.style.display = item.classList.contains("open") ? "block" : "none";
    });
  });
}

function bannerSlider() {
  const slider = document.getElementById("banner-slider");
  if (!slider) return;
  const images = ["slider1.jpg", "slider2.jpg"];
  let idx = 0;
  setInterval(() => {
    idx = (idx + 1) % images.length;
    slider.style.backgroundImage = `url(images/${images[idx]})`;
  }, 3000);
}
