document.addEventListener("DOMContentLoaded", () => {
  // Only run product page logic if the product list container exists
  const productListContainer = document.getElementById("product-list");
  if (productListContainer) {
    initializeProductPage();
  }

  // Run other initializers
  renderProductDetails();
  renderCart();
  faqToggle();
  bannerSlider();
});

// State variables for the product page
let allProducts = [];
let currentPage = 1;
const productsPerPage = 6;

async function initializeProductPage() {
  const productList = document.getElementById("product-list");
  const brandFilter = document.getElementById("brand-filter");
  const categoryFilter = document.getElementById("category-filter");
  const sortBy = document.getElementById("sort-by");
  const searchInput = document.getElementById("search-input");
  const suggestionsBox = document.getElementById("suggestions-box");

  // Fetch products and initialize
  try {
    const response = await fetch("data/products.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    allProducts = await response.json();

    populateFilters();
    displayProducts();

    // Add event listeners
    brandFilter.addEventListener("change", () => {
      currentPage = 1;
      displayProducts();
    });
    categoryFilter.addEventListener("change", () => {
      currentPage = 1;
      displayProducts();
    });
    sortBy.addEventListener("change", () => {
      currentPage = 1;
      displayProducts();
    });
    searchInput.addEventListener("input", handleSearchInput);
    searchInput.addEventListener("blur", () => setTimeout(() => suggestionsBox.style.display = 'none', 100));


  } catch (error) {
    console.error("Could not fetch products:", error);
    productList.innerHTML = "<p>Không thể tải sản phẩm. Vui lòng thử lại sau.</p>";
  }
}

function populateFilters() {
  const brandFilter = document.getElementById("brand-filter");
  const categoryFilter = document.getElementById("category-filter");

  const brands = ["all", ...new Set(allProducts.map(p => p.brand))];
  const categories = ["all", ...new Set(allProducts.map(p => p.category))];

  brandFilter.innerHTML = brands.map(brand =>
    `<option value="${brand}">${brand === 'all' ? 'Tất cả' : brand}</option>`
  ).join('');

  categoryFilter.innerHTML = categories.map(category =>
    `<option value="${category}">${category === 'all' ? 'Tất cả' : category}</option>`
  ).join('');
}


function displayProducts() {
  const productList = document.getElementById("product-list");
  const paginationContainer = document.getElementById("pagination-container");

  let filteredProducts = getFilteredAndSortedProducts();

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const start = (currentPage - 1) * productsPerPage;
  const end = start + productsPerPage;
  const paginatedProducts = filteredProducts.slice(start, end);

  // Render products
  productList.innerHTML = "";
  if (paginatedProducts.length === 0) {
    productList.innerHTML = "<p>Không tìm thấy sản phẩm nào phù hợp.</p>";
  } else {
    paginatedProducts.forEach(product => {
      const productCard = document.createElement("div");
      productCard.className = "product-card";
      productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null;this.src='https://placehold.co/300x200/E0E0E0/757575?text=Image+Not+Found';">
            <h3><a href="product-details.html?id=${product.id}">${product.name}</a></h3>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <p class="product-desc">${product.description}</p>
            <button onclick="addToCart(${product.id})">Thêm vào giỏ</button>
        `;
      productList.appendChild(productCard);
    });
  }

  // Render pagination buttons
  renderPagination(totalPages);
}

function getFilteredAndSortedProducts() {
  const brandFilter = document.getElementById("brand-filter").value;
  const categoryFilter = document.getElementById("category-filter").value;
  const sortBy = document.getElementById("sort-by").value;
  const searchTerm = document.getElementById("search-input").value.toLowerCase();

  let tempProducts = [...allProducts];

  // Filtering
  if (brandFilter !== "all") {
    tempProducts = tempProducts.filter(p => p.brand === brandFilter);
  }
  if (categoryFilter !== "all") {
    tempProducts = tempProducts.filter(p => p.category === categoryFilter);
  }

  // Searching
  if (searchTerm) {
    tempProducts = tempProducts.filter(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm) ||
      p.brand.toLowerCase().includes(searchTerm)
    );
  }

  // Sorting
  switch (sortBy) {
    case "price-asc":
      tempProducts.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      tempProducts.sort((a, b) => b.price - a.price);
      break;
    case "name-asc":
      tempProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      tempProducts.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "newest":
      tempProducts.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
      break;
  }

  return tempProducts;
}

function renderPagination(totalPages) {
  const paginationContainer = document.getElementById("pagination-container");
  paginationContainer.innerHTML = "";

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    button.className = "pagination-btn";
    if (i === currentPage) {
      button.classList.add("active");
    }
    button.addEventListener("click", () => {
      currentPage = i;
      displayProducts();
      window.scrollTo(0, 0); // Scroll to top on page change
    });
    paginationContainer.appendChild(button);
  }
}

function handleSearchInput() {
  const searchInput = document.getElementById("search-input");
  const suggestionsBox = document.getElementById("suggestions-box");
  const searchTerm = searchInput.value.toLowerCase();

  // Display products based on search term immediately
  currentPage = 1;
  displayProducts();

  // Handle suggestions
  if (searchTerm.length < 2) {
    suggestionsBox.innerHTML = "";
    suggestionsBox.style.display = "none";
    return;
  }

  const suggestions = allProducts.filter(p => p.name.toLowerCase().includes(searchTerm)).slice(0, 5);

  if (suggestions.length > 0) {
    suggestionsBox.innerHTML = suggestions.map(s => `<div class="suggestion-item" data-name="${s.name}">${s.name}</div>`).join('');
    suggestionsBox.style.display = "block";

    document.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('mousedown', (e) => {
        searchInput.value = e.target.getAttribute('data-name');
        suggestionsBox.innerHTML = '';
        suggestionsBox.style.display = 'none';
        displayProducts();
      });
    });
  } else {
    suggestionsBox.innerHTML = "";
    suggestionsBox.style.display = "none";
  }
}


// --- Existing Functions (Cart, Details, etc.) ---

function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}
function addToCart(id) {
  const cart = getCart();
  // Prevent duplicates, instead, you might want to handle quantity later
  if (!cart.includes(id)) {
    cart.push(id);
  }
  saveCart(cart);
  alert("Sản phẩm đã được thêm vào giỏ hàng");
}

async function renderProductDetails() {
  const container = document.getElementById("product-detail");
  if (!container) return;
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"));
  if (!id) {
    container.innerHTML = "<p>Sản phẩm không hợp lệ.</p>";
    return;
  }

  const products = await loadProducts();
  const product = products.find((p) => p.id === id);
  if (product) {
    container.innerHTML = `
      <h2>${product.name}</h2>
      <img src="${product.image}" alt="${product.name}" width="400">
      <p>${product.description}</p>
      <p><strong>Giá:</strong> $${product.price.toFixed(2)}</p>
      <button onclick="addToCart(${product.id})">Thêm vào giỏ</button>
    `;
  } else {
    container.innerHTML = "<p>Không tìm thấy sản phẩm.</p>";
  }
}

async function renderCart() {
  const container = document.getElementById("cart-items");
  if (!container) return;
  const cartIds = getCart();
  if (cartIds.length === 0) {
    container.innerHTML = "<p>Giỏ hàng của bạn đang trống.</p>";
    return;
  }
  const products = await loadProducts();
  const cartProducts = products.filter((p) => cartIds.includes(p.id));
  container.innerHTML = cartProducts
    .map(
      (p) => `
      <div class="cart-item">
        <img src="${p.image}" alt="${p.name}" width="100">
        <div>
          <h4>${p.name}</h4>
          <p>$${p.price.toFixed(2)}</p>
        </div>
      </div>
    `
    )
    .join("");
}

// Helper to load products for details and cart pages
async function loadProducts() {
  if (allProducts.length > 0) {
    return allProducts;
  }
  const res = await fetch("data/products.json");
  const products = await res.json();
  allProducts = products; // Cache products
  return products;
}


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
  // Placeholder for banner slider logic
}

document.addEventListener("submit", (e) => {
  const form = e.target.closest("form");
  if (!form || !form.classList.contains("needs-validation")) return;
  e.preventDefault();
  // Placeholder for form validation logic
  alert("Biểu mẫu đã được gửi");
  form.reset();
});
