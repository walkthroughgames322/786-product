// DOM Elements
const adminButton = document.getElementById('adminButton');
const adminModal = document.getElementById('adminModal');
const playlistModal = document.getElementById('playlistModal');
const closeButtons = document.querySelectorAll('.close');
const productForm = document.getElementById('productForm');
const productImage = document.getElementById('productImage');
const imagePreview = document.getElementById('imagePreview');
const productsContainer = document.getElementById('productsContainer');
const searchInput = document.getElementById('searchInput');
const playlistFilter = document.getElementById('playlistFilter');
const managePlaylistsBtn = document.getElementById('managePlaylistsBtn');
const playlistList = document.getElementById('playlistList');
const newPlaylistName = document.getElementById('newPlaylistName');
const addPlaylistBtn = document.getElementById('addPlaylistBtn');
const productPlaylist = document.getElementById('productPlaylist');

// Admin state
const isAdmin = true; // Change to false for visitors
if (isAdmin) document.body.classList.add('admin-view');

// Initialize the app
function init() {
    // Only show admin button if user is admin
    adminButton.style.display = isAdmin ? 'flex' : 'none';
    
    // Load initial data
    loadPlaylists();
    loadProducts();
    
    // Set up event listeners
    setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
    // Admin button click
    adminButton.addEventListener('click', () => {
        adminModal.style.display = 'block';
    });
    
    // Close modals
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            adminModal.style.display = 'none';
            playlistModal.style.display = 'none';
            resetForm();
        });
    });
    
    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target === adminModal || e.target === playlistModal) {
            adminModal.style.display = 'none';
            playlistModal.style.display = 'none';
            resetForm();
        }
    });
    
    // Image preview
    productImage.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                imagePreview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Form submission
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addProduct();
    });
    
    // Search functionality
    searchInput.addEventListener('input', () => {
        filterProducts();
    });
    
    // Playlist filter
    playlistFilter.addEventListener('change', () => {
        filterProducts();
    });
    
    // Manage playlists button
    managePlaylistsBtn.addEventListener('click', () => {
        playlistModal.style.display = 'block';
    });
    
    // Add new playlist
    addPlaylistBtn.addEventListener('click', addPlaylist);
}

// Data Management Functions
function getPlaylists() {
    return JSON.parse(localStorage.getItem('playlists')) || [];
}

function getProducts() {
    return JSON.parse(localStorage.getItem('products')) || [];
}

function savePlaylists(playlists) {
    localStorage.setItem('playlists', JSON.stringify(playlists));
}

function saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
}

// Playlist Functions
function loadPlaylists() {
    const playlists = getPlaylists();
    
    // Update playlist dropdown in product form
    productPlaylist.innerHTML = '<option value="">Select a playlist</option>';
    playlists.forEach(playlist => {
        productPlaylist.innerHTML += `<option value="${playlist.id}">${playlist.name}</option>`;
    });
    
    // Update playlist filter
    playlistFilter.innerHTML = '<option value="all">All Playlists</option>';
    playlists.forEach(playlist => {
        playlistFilter.innerHTML += `<option value="${playlist.id}">${playlist.name}</option>`;
    });
    
    // Update playlist management list
    playlistList.innerHTML = '';
    playlists.forEach(playlist => {
        const playlistItem = document.createElement('div');
        playlistItem.className = 'playlist-item';
        playlistItem.innerHTML = `
            <span>${playlist.name}</span>
            <div class="playlist-actions">
                <button class="small-btn delete-btn" data-id="${playlist.id}">Delete</button>
            </div>
        `;
        playlistList.appendChild(playlistItem);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.playlist-item .delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            deletePlaylist(e.target.getAttribute('data-id'));
        });
    });
}

function addPlaylist() {
    const name = newPlaylistName.value.trim();
    if (!name) return;
    
    const playlists = getPlaylists();
    const newPlaylist = {
        id: Date.now().toString(),
        name: name
    };
    
    playlists.push(newPlaylist);
    savePlaylists(playlists);
    newPlaylistName.value = '';
    loadPlaylists();
}

function deletePlaylist(playlistId) {
    if (!confirm('Delete this playlist? Products will remain but lose their playlist association.')) return;
    
    // Remove playlist
    let playlists = getPlaylists().filter(p => p.id !== playlistId);
    savePlaylists(playlists);
    
    // Remove playlist reference from products
    let products = getProducts();
    products = products.map(product => {
        if (product.playlistId === playlistId) {
            return {...product, playlistId: ''};
        }
        return product;
    });
    saveProducts(products);
    
    loadPlaylists();
    loadProducts();
}

// Product Functions
function loadProducts() {
    const products = getProducts();
    const playlists = getPlaylists();
    
    // Clear container
    productsContainer.innerHTML = '';
    
    if (products.length === 0) {
        productsContainer.innerHTML = '<p class="no-products">No products available yet.</p>';
        return;
    }
    
    // Add each product to the container
    products.forEach(product => {
        const playlist = playlists.find(p => p.id === product.playlistId);
        
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            ${playlist ? `<span class="playlist-tag">${playlist.name}</span>` : ''}
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">
                    <a href="${product.link}" target="_blank">${product.name}</a>
                </h3>
            </div>
            <div class="product-actions admin-only">
                <button class="action-btn edit-btn" data-id="${product.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" data-id="${product.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        productsContainer.appendChild(productCard);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            editProduct(e.target.closest('button').getAttribute('data-id'));
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            deleteProduct(e.target.closest('button').getAttribute('data-id'));
        });
    });
    
    // Apply current filters
    filterProducts();
}

function addProduct() {
    const playlistId = productPlaylist.value;
    const productName = document.getElementById('productName').value;
    const productLink = document.getElementById('productLink').value;
    const imageFile = productImage.files[0];
    
    if (!playlistId || !productName || !productLink || !imageFile) {
        alert('Please fill in all fields');
        return;
    }
    
    // Create product object
    const product = {
        id: Date.now().toString(),
        playlistId: playlistId,
        name: productName,
        link: productLink,
        image: '' // Will be replaced with data URL
    };
    
    // Convert image to data URL
    const reader = new FileReader();
    reader.onload = (event) => {
        product.image = event.target.result;
        
        // Get existing products
        let products = getProducts();
        
        // Add new product
        products.push(product);
        
        // Save to localStorage
        saveProducts(products);
        
        // Reset form and close modal
        resetForm();
        adminModal.style.display = 'none';
        
        // Reload products
        loadProducts();
    };
    reader.readAsDataURL(imageFile);
}

function editProduct(productId) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Open the admin modal with product data
    adminModal.style.display = 'block';
    productPlaylist.value = product.playlistId || '';
    document.getElementById('productName').value = product.name;
    document.getElementById('productLink').value = product.link;
    
    // Show existing image
    imagePreview.innerHTML = `<img src="${product.image}" alt="Preview">`;
    imagePreview.style.display = 'block';
    
    // Change form to edit mode
    productForm.onsubmit = (e) => {
        e.preventDefault();
        updateProduct(productId);
    };
    document.querySelector('#productForm .submit-btn').textContent = 'Update Product';
}

function updateProduct(productId) {
    const playlistId = productPlaylist.value;
    const productName = document.getElementById('productName').value;
    const productLink = document.getElementById('productLink').value;
    const imageFile = productImage.files[0];
    
    if (!playlistId || !productName || !productLink) {
        alert('Please fill in all fields');
        return;
    }
    
    let products = getProducts();
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex === -1) return;
    
    // Update product data
    products[productIndex] = {
        ...products[productIndex],
        playlistId: playlistId,
        name: productName,
        link: productLink
    };
    
    // If new image was uploaded
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = (event) => {
            products[productIndex].image = event.target.result;
            saveProducts(products);
            resetForm();
            adminModal.style.display = 'none';
            loadProducts();
        };
        reader.readAsDataURL(imageFile);
    } else {
        saveProducts(products);
        resetForm();
        adminModal.style.display = 'none';
        loadProducts();
    }
}

function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    let products = getProducts();
    products = products.filter(p => p.id !== productId);
    saveProducts(products);
    loadProducts();
}

function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const playlistId = playlistFilter.value;
    
    document.querySelectorAll('.product-card').forEach(card => {
        const name = card.querySelector('.product-name').textContent.toLowerCase();
        const cardPlaylistId = card.querySelector('.playlist-tag')?.textContent || '';
        
        const matchesSearch = name.includes(searchTerm);
        const matchesPlaylist = playlistId === 'all' || cardPlaylistId === playlistId;
        
        card.style.display = matchesSearch && matchesPlaylist ? 'block' : 'none';
    });
}

// Reset the form
function resetForm() {
    productForm.reset();
    imagePreview.style.display = 'none';
    imagePreview.innerHTML = '';
    productForm.onsubmit = (e) => {
        e.preventDefault();
        addProduct();
    };
    document.querySelector('#productForm .submit-btn').textContent = 'Add Product';
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);