// Replace with your actual Google Sheets URL
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRGwweNAf5B5pnt3zjcUB3X2gaKjY6PAmh4SUXiQef_jiZ9cabx6senq_LEw7G36THrIbJVgj6JRbf4/pub?gid=0&single=true&output=csv';

// Add this function to handle CSV parsing correctly
function parseCSV(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    allProducts = [];
    
    for (let i = 1; i < lines.length; i++) {
        // Improved CSV parsing to handle commas in values
        const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        if (values.length === headers.length) {
            const product = {};
            for (let j = 0; j < headers.length; j++) {
                product[headers[j]] = values[j].trim().replace(/^"|"$/g, '');
            }
            allProducts.push(product);
        }
    }
    
    displayPlaylists();
}
// DOM Elements
const featuredPlaylistsEl = document.getElementById('featuredPlaylists');
const allPlaylistsEl = document.getElementById('allPlaylists');
const productsModal = document.getElementById('productsModal');
const modalTitle = document.getElementById('modalTitle');
const productsGrid = document.getElementById('productsGrid');
const closeModal = document.querySelector('.close-modal');
const globalSearch = document.getElementById('globalSearch');
const searchBtn = document.getElementById('searchBtn');
const modalSearch = document.getElementById('modalSearch');
const modalSearchBtn = document.getElementById('modalSearchBtn');

// Global Variables
let allProducts = [];
let currentPlaylist = '';
let currentProducts = [];

// Fetch data from Google Sheets
async function fetchData() {
    try {
        const response = await fetch(SHEET_URL);
        const csvData = await response.text();
        parseCSV(csvData);
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load products. Please try again later.');
    }
}

// Parse CSV data
function parseCSV(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    allProducts = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length === headers.length) {
            const product = {};
            for (let j = 0; j < headers.length; j++) {
                product[headers[j]] = values[j].trim();
            }
            allProducts.push(product);
        }
    }
    
    displayPlaylists();
}

// Display all playlists
function displayPlaylists() {
    featuredPlaylistsEl.innerHTML = '';
    allPlaylistsEl.innerHTML = '';
    
    // Get unique playlists
    const playlists = [...new Set(allProducts.map(product => product.Playlist))];
    
    // Create playlist cards
    playlists.forEach(playlist => {
        const playlistProducts = allProducts.filter(product => product.Playlist === playlist);
        const playlistCard = createPlaylistCard(playlist, playlistProducts.length);
        
        // Add to appropriate section
        if (playlistProducts.some(product => product.Featured === 'TRUE')) {
            featuredPlaylistsEl.appendChild(playlistCard.cloneNode(true));
        }
        allPlaylistsEl.appendChild(playlistCard);
    });
}

// Create playlist card element
function createPlaylistCard(playlistName, productCount) {
    const card = document.createElement('div');
    card.className = 'playlist-card';
    
    // Get first product image for playlist thumbnail
    const playlistProducts = allProducts.filter(product => product.Playlist === playlistName);
    const thumbnail = playlistProducts[0]?.ProductPhoto || 'default-image.jpg';
    
    card.innerHTML = `
        <img src="${thumbnail}" alt="${playlistName}" class="playlist-image">
        <div class="playlist-info">
            <h3 class="playlist-name">${playlistName}</h3>
            <p class="playlist-count">${productCount} products</p>
        </div>
    `;
    
    card.addEventListener('click', () => openProductsModal(playlistName));
    return card;
}

// Open modal with products from a playlist
function openProductsModal(playlistName) {
    currentPlaylist = playlistName;
    currentProducts = allProducts.filter(product => product.Playlist === playlistName);
    
    modalTitle.textContent = playlistName;
    displayProducts(currentProducts);
    productsModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Display products in modal
function displayProducts(products) {
    productsGrid.innerHTML = '';
    
    if (products.length === 0) {
        productsGrid.innerHTML = '<p>No products found in this collection.</p>';
        return;
    }
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <img src="${product.ProductPhoto}" alt="${product.ProductName}" class="product-img">
            <div class="product-details">
                <h3 class="product-title">${product.ProductName}</h3>
                <a href="${product.ProductLink}" class="product-link" target="_blank">View Product</a>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
}

// Close modal
function closeProductsModal() {
    productsModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    modalSearch.value = '';
}

// Search all products
function searchAllProducts() {
    const searchTerm = globalSearch.value.toLowerCase();
    if (!searchTerm) return;
    
    const filteredProducts = allProducts.filter(product => 
        product.ProductName.toLowerCase().includes(searchTerm) || 
        product.Playlist.toLowerCase().includes(searchTerm));
    
    if (filteredProducts.length === 0) {
        alert('No products found matching your search.');
        return;
    }
    
    modalTitle.textContent = `Search Results for "${searchTerm}"`;
    currentProducts = filteredProducts;
    displayProducts(filteredProducts);
    productsModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Search within current playlist
function searchInPlaylist() {
    const searchTerm = modalSearch.value.toLowerCase();
    const filteredProducts = currentProducts.filter(product => 
        product.ProductName.toLowerCase().includes(searchTerm));
    
    displayProducts(filteredProducts.length > 0 ? filteredProducts : currentProducts);
}

// Event Listeners
closeModal.addEventListener('click', closeProductsModal);
window.addEventListener('click', (e) => {
    if (e.target === productsModal) closeProductsModal();
});

searchBtn.addEventListener('click', searchAllProducts);
globalSearch.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchAllProducts();
});

modalSearchBtn.addEventListener('click', searchInPlaylist);
modalSearch.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchInPlaylist();
});

// Initialize
fetchData();
