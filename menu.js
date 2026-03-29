// ── GLOBAL STATE ──
let allDishes = [];
let cartCount = 0;

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  // Check for search query in URL
  const urlParams = new URLSearchParams(window.location.search);
  const searchVal = urlParams.get('search');
  if (searchVal) {
    const searchInput = document.getElementById('menuSearch');
    if (searchInput) {
      searchInput.value = searchVal;
    }
  }

  fetchDishes();
  updateAuthUI();
  updateCartCount();

  // Mobile Menu Toggle
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuClose = document.getElementById('mobileMenuClose');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  if (mobileMenuClose && mobileMenu) {
    mobileMenuClose.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
});

// ── AUTH UI ──
function updateAuthUI() {
  const user = auth.getUser();
  const authBtn = document.getElementById('authBtn');
  if (user && authBtn) {
    authBtn.innerHTML = `<i class="fas fa-user-circle"></i> ${user.name}`;
    authBtn.href = user.role === 'admin' ? 'admin.html' : '#';
    if (user.role !== 'admin') {
      authBtn.onclick = (e) => {
        e.preventDefault();
        if (confirm('Do you want to logout?')) auth.logout();
      };
    }
  }
}

// ── FETCH DATA ──
async function fetchDishes() {
  const grid = document.getElementById('dishesGrid');
  grid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading flavours...</div>';

  try {
    const response = await apiFetch('/dishes');
    allDishes = response.dishes;
    filterDishes();
  } catch (error) {
    grid.innerHTML = `<div class="error-msg">❌ Failed to load menu: ${error.message}</div>`;
  }
}

// ── RENDER DISHES ──
function renderDishes(list) {
  const grid = document.getElementById('dishesGrid');
  const noRes = document.getElementById('noResults');
  document.getElementById('resultCount').textContent = list.length;

  if (list.length === 0) {
    grid.innerHTML = '';
    noRes.style.display = 'flex';
    return;
  }
  noRes.style.display = 'none';

  const favs = JSON.parse(localStorage.getItem('sabroso_favs') || '[]');

  grid.innerHTML = list.map((d, i) => {
    const stars = '★'.repeat(Math.floor(d.rating)) + (d.rating % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(d.rating));
    // Determine badge and diet (mocking diet for now since it's not in backend yet)
    const badge = d.isFeatured ? '🔥 Featured' : d.cuisine;
    const isVeg = d.tags.includes('vegetarian') || d.tags.includes('veg');

    return `
    <div class="dish-card" style="animation-delay:${i * 0.05}s" id="dish-${d._id}">
      <div class="dish-img-wrap">
        <img src="${d.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'}" alt="${d.name}" loading="lazy"/>
        <span class="dish-badge">${badge}</span>
        <span class="dish-diet-badge ${isVeg ? 'veg' : 'non-veg'}">${isVeg ? '🌱' : '🍗'}</span>
        <button class="dish-fav ${favs.includes(d._id) ? 'active' : ''}" onclick="toggleFav(this, '${d._id}', '${d.name}')" aria-label="Favourite"><i class="fas fa-heart"></i></button>
      </div>
      <div class="dish-body">
        <div class="dish-country">${d.country || d.cuisine}</div>
        <div class="dish-name">${d.name}</div>
        <div class="dish-desc">${d.description}</div>
        <div class="dish-stars">${stars} <span>(4.${Math.floor(Math.random() * 9)}k orders)</span></div>
        <div class="dish-footer">
          <div class="dish-price">₹${d.price.toFixed(0)}</div>
          <div class="dish-actions">
            <button class="btn-details" onclick="viewDetails('${d._id}')"><i class="fas fa-eye"></i> Details</button>
            <button class="btn-cart" onclick="addToCart(this, '${d._id}', '${d.name}')"><i class="fas fa-cart-plus"></i> Add</button>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ── FILTER LOGIC ──
function filterDishes() {
  const search = document.getElementById('menuSearch').value.toLowerCase().trim();
  const cuisineBoxes = document.querySelectorAll('.filter-group:nth-child(2) input[type=checkbox]:checked');
  const cuisines = [...cuisineBoxes].map(cb => cb.value);
  const maxPrice = parseFloat(document.getElementById('priceRange').value);
  const minRating = parseFloat(document.querySelector('input[name=rating]:checked').value);
  const diet = document.querySelector('input[name=diet]:checked').value;
  const sort = document.getElementById('sortSelect').value;

  const showFavs = document.getElementById('favFilter') ? document.getElementById('favFilter').checked : false;
  const favs = JSON.parse(localStorage.getItem('sabroso_favs') || '[]');

  let filtered = allDishes.filter(d => {
    if (showFavs && !favs.includes(d._id)) return false;
    if (search && !d.name.toLowerCase().includes(search) && !d.description.toLowerCase().includes(search)) return false;
    if (cuisines.length > 0 && !cuisines.includes(d.cuisine)) return false;
    if (d.price > maxPrice) return false;
    if (minRating > 0 && d.rating < minRating) return false;

    // Veg/Non-veg filter
    const isVeg = d.tags.includes('vegetarian') || d.tags.includes('veg');
    if (diet === 'veg' && !isVeg) return false;
    if (diet === 'non-veg' && isVeg) return false;

    return true;
  });

  // Sort
  switch (sort) {
    case 'price-low': filtered.sort((a, b) => a.price - b.price); break;
    case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
    case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
    case 'name': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
    default: filtered.sort((a, b) => b.totalOrders - a.totalOrders); break;
  }

  renderDishes(filtered);
}

function updatePriceLabel() {
  document.getElementById('priceVal').textContent = '₹' + document.getElementById('priceRange').value;
}

function resetFilters() {
  document.getElementById('menuSearch').value = '';
  document.querySelectorAll('.filter-group input[type=checkbox]').forEach(cb => cb.checked = false);
  if (document.getElementById('favFilter')) document.getElementById('favFilter').checked = false;
  document.getElementById('priceRange').value = 2500;
  updatePriceLabel();
  document.querySelector('input[name=rating][value="0"]').checked = true;
  document.querySelector('input[name=diet][value="all"]').checked = true;
  document.getElementById('sortSelect').value = 'popular';
  filterDishes();
}

// ── CART ──
function updateCartCount() {
  try {
      const parsed = JSON.parse(localStorage.getItem('sabroso_cart') || '[]');
      const cart = parsed.filter(item => item && item.name && typeof item.price === 'number' && !isNaN(item.price));
      localStorage.setItem('sabroso_cart', JSON.stringify(cart));
      cartCount = cart.length;
      document.getElementById('cartCount').textContent = cartCount;
  } catch (e) {
      document.getElementById('cartCount').textContent = '0';
  }
}

function addToCart(btn, id, name) {
  const cart = JSON.parse(localStorage.getItem('sabroso_cart') || '[]');
  const dish = allDishes.find(d => d._id === id);

  cart.push({ ...dish, quantity: 1 });
  localStorage.setItem('sabroso_cart', JSON.stringify(cart));

  btn.classList.add('added');
  btn.innerHTML = '<i class="fas fa-check"></i> Added!';

  updateCartCount();
  showToast(`🛒 ${name} added!`);

  setTimeout(() => {
    btn.classList.remove('added');
    btn.innerHTML = '<i class="fas fa-cart-plus"></i> Add';
  }, 2500);
}

// ── VIEW DETAILS ──
function viewDetails(id) {
  window.location.href = `details.html?id=${id}`;
}

// ── FAVOURITES ──
function toggleFav(btn, id, name) {
  btn.classList.toggle('active');
  const icon = btn.querySelector('i');
  const isFav = btn.classList.contains('active');

  if (icon) {
    icon.style.transform = 'scale(1.3)';
    setTimeout(() => icon.style.transform = 'scale(1)', 300);
  }

  let favs = JSON.parse(localStorage.getItem('sabroso_favs') || '[]');
  if (isFav) {
    if (!favs.includes(id)) favs.push(id);
    showToast(`❤️ Added ${name} to favourites!`);
  } else {
    favs = favs.filter(f => f !== id);
    showToast(`💔 Removed from favourites`);
  }
  localStorage.setItem('sabroso_favs', JSON.stringify(favs));
}

// ── TOAST ──
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── NAVIGATION & SCROLL ──
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  const st = document.getElementById('scrollTop');
  if (!nav) return;
  if (window.scrollY > 80) {
    nav.style.background = 'rgba(255,248,240,0.98)';
    nav.style.boxShadow = '0 2px 20px rgba(230,57,70,0.1)';
    if (st) st.style.display = 'flex';
  } else {
    nav.style.background = 'rgba(255,248,240,0.92)';
    nav.style.boxShadow = 'none';
    if (st) st.style.display = 'none';
  }
});

function subscribeNewsletter() {
  const email = document.getElementById('newsletterEmail').value.trim();
  if (email && email.includes('@')) {
    showToast(`📬 Subscribed! Welcome to Sabroso, ${email.split('@')[0]}!`);
    document.getElementById('newsletterEmail').value = '';
  } else {
    showToast('⚠️ Please enter a valid email address.');
  }
}

function toggleMobileFilter() {
  document.getElementById('filterSidebar').classList.toggle('open');
}
