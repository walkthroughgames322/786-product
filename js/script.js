const sheetID = "1gYBzv3UDQ2i1vSvsJcZJCxxmwxz409FpieLlEQ6ySKY";
const sheetName = "Sheet1";
const sheetURL = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;

let allProducts = [];

fetch(sheetURL)
  .then(response => response.text())
  .then(csvText => {
    const rows = csvText.split("\n").slice(1);
    const products = rows.map(row => {
      const [name, image, link, tags] = row.split(",");
      return { name, image, link, tags };
    });

    allProducts = products;
    displayProducts(products);
  });

function displayProducts(products) {
  const productList = document.getElementById("product-list");
  productList.innerHTML = "";
  products.forEach(product => {
    if (!product.name || !product.link || !product.image) return;
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <a href="${product.link}" target="_blank">Buy Now</a>
    `;
    productList.appendChild(card);
  });
}

// Search filter
document.getElementById("searchInput").addEventListener("input", function () {
  const searchText = this.value.toLowerCase();
  const filtered = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchText) ||
    (product.tags && product.tags.toLowerCase().includes(searchText))
  );
  displayProducts(filtered);
});

// Navigation buttons
const navHomeBtn = document.getElementById("nav-home");
const navAboutBtn = document.getElementById("nav-about");
const aboutSection = document.getElementById("about-section");
const productList = document.getElementById("product-list");
const searchInput = document.getElementById("searchInput");
const playlistsSection = document.getElementById("playlists");

navHomeBtn.addEventListener("click", () => {
  navHomeBtn.classList.add("active");
  navAboutBtn.classList.remove("active");
  aboutSection.style.display = "none";
  productList.style.display = "grid";
  playlistsSection.style.display = "block";
  searchInput.style.display = "block";
  displayProducts(allProducts);
});

navAboutBtn.addEventListener("click", () => {
  navAboutBtn.classList.add("active");
  navHomeBtn.classList.remove("active");
  aboutSection.style.display = "block";
  productList.style.display = "none";
  playlistsSection.style.display = "none";
  searchInput.style.display = "none";
});

// Playlist buttons to filter products by category
const playlistButtons = document.querySelectorAll(".playlist-btn");

playlistButtons.forEach(button => {
  button.addEventListener("click", () => {
    const category = button.getAttribute("data-category");
    const filtered = allProducts.filter(product =>
      product.tags && product.tags.toLowerCase().includes(category.toLowerCase())
    );
    displayProducts(filtered);
  });
});
