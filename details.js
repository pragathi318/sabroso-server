let allDishes = [];
let currentQty = 1;
let currentDish = null;

// ── GET DISH ID ──
function getDishId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// ── INIT ──
async function init() {
    const id = getDishId();
    if (!id) {
        showToast('⚠️ No dish ID found');
        return;
    }

    try {
        currentDish = await apiFetch(`/dishes/${id}`);
        // Fetch others for related
        const response = await apiFetch('/dishes');
        allDishes = response.dishes || [];

        document.title = `${currentDish.name} – Sabroso | Global Cloud Kitchen`;
        renderDish(currentDish);
        renderReviews(currentDish);
        renderRelated(currentDish);
    } catch (error) {
        console.error('Error fetching dish:', error);
        showToast('❌ Failed to load dish details');
    }
}

// ── REVIEWS DB ──
const reviewsDB = {
    0: [
        { name: "Arjun Mehta", date: "Feb 2026", rating: 5, text: "Absolutely divine! The ragù tastes like it simmered for hours. Authentic Italian flavour right at home." },
        { name: "Sophie Laurent", date: "Jan 2026", rating: 5, text: "Best bolognese I've ever had delivered. The pasta was perfectly al dente and the parmesan was generous." },
        { name: "Carlos Ruiz", date: "Jan 2026", rating: 4, text: "Great flavour and generous portion. Would love a spicier option but otherwise fantastic." }
    ],
    1: [
        { name: "Yuki Tanaka", date: "Feb 2026", rating: 5, text: "The freshness of the fish is incredible. Tastes like I'm sitting in a Tokyo sushi bar!" },
        { name: "Emma Wilson", date: "Feb 2026", rating: 5, text: "Beautiful presentation and the salmon just melts in your mouth. Worth every penny." },
        { name: "Raj Patel", date: "Jan 2026", rating: 5, text: "I'm a sushi snob and this exceeded my expectations. The rice seasoning is spot on." }
    ],
    2: [
        { name: "Lena Park", date: "Feb 2026", rating: 5, text: "The stone pot keeps the rice crispy at the bottom — just like in Seoul! Amazing gochujang." },
        { name: "David Kim", date: "Jan 2026", rating: 4, text: "Colorful, healthy, and delicious. A perfect weeknight dinner." },
        { name: "Maria Santos", date: "Jan 2026", rating: 5, text: "Love the vegetarian option! So satisfying and full of flavour." }
    ],
    3: [
        { name: "Sofia Reyes", date: "Feb 2026", rating: 5, text: "These tacos are the real deal! The salsa verde is perfectly balanced." },
        { name: "Jake Thompson", date: "Jan 2026", rating: 4, text: "Tasty and authentic. The grilled chicken is juicy and well-seasoned." },
        { name: "Ana Garcia", date: "Dec 2025", rating: 5, text: "Reminds me of street tacos in Mexico City. The lime makes everything pop!" }
    ],
    4: [
        { name: "Ade Okonkwo", date: "Feb 2026", rating: 5, text: "Finally, authentic African cuisine delivered! The palm nut sauce is rich and flavourful." },
        { name: "Clara Dupont", date: "Jan 2026", rating: 4, text: "A unique and delicious dish. The spice level is perfect." },
        { name: "James Obi", date: "Jan 2026", rating: 5, text: "Tastes just like home. The okra and chicken melt together beautifully." }
    ],
    5: [
        { name: "Luca Romano", date: "Feb 2026", rating: 5, text: "The truffle oil elevates this to restaurant quality. Creamy, earthy perfection." },
        { name: "Hannah Foster", date: "Jan 2026", rating: 5, text: "Best vegetarian option on the menu. Rich and satisfying without being heavy." },
        { name: "Pierre Blanc", date: "Jan 2026", rating: 4, text: "Beautifully made risotto. The porcini mushrooms add incredible depth." }
    ],
    6: [
        { name: "Kenji Watanabe", date: "Feb 2026", rating: 5, text: "The broth is unbelievably rich. I can tell they take hours to make it. Pure umami heaven!" },
        { name: "Arjun Mehta", date: "Feb 2026", rating: 5, text: "Felt like eating in a tiny Tokyo alley. The chashu pork is melt-in-your-mouth tender." },
        { name: "Lisa Chen", date: "Jan 2026", rating: 5, text: "That soft-boiled egg with the jammy yolk... perfection! I order this every week now." }
    ],
    7: [
        { name: "Minji Choi", date: "Feb 2026", rating: 5, text: "This jjigae hits all the right notes. Spicy, tangy, and warming. A true Korean comfort bowl." },
        { name: "Alex Novak", date: "Jan 2026", rating: 4, text: "Bold flavours and the tofu is silky smooth. Great for a cold evening." },
        { name: "Soo-Jin Lee", date: "Jan 2026", rating: 4, text: "Authentic kimchi stew! The aged kimchi makes all the difference in the broth." }
    ]
};

// Handled in init() asyncly


// ── RENDER DISH ──
function renderDish(d) {
    document.getElementById('breadcrumbDish').textContent = d.name;
    document.getElementById('mainImage').src = d.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500';
    document.getElementById('mainImage').alt = d.name;
    document.getElementById('galleryBadge').textContent = d.isFeatured ? '🔥 Featured' : d.cuisine;

    // Gallery thumbs
    const thumbs = document.getElementById('galleryThumbs');
    const gallery = [d.image, ...(d.gallery || [])].filter(Boolean);
    thumbs.innerHTML = gallery.map((src, i) =>
        `<img src="${src}" alt="${d.name} view ${i + 1}" class="${i === 0 ? 'active' : ''}" onclick="switchImage('${src}', this)"/>`
    ).join('');

    // Info
    document.getElementById('infoCountry').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${d.country}`;
    document.getElementById('infoName').textContent = d.name;

    const fullStars = Math.floor(d.rating);
    const halfStar = d.rating % 1 >= 0.5;
    let starsHtml = '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(5 - fullStars - (halfStar ? 1 : 0));
    document.getElementById('infoRating').innerHTML = `
    <span class="stars">${starsHtml}</span>
    <span class="rating-num">${d.rating}</span>
    <span class="review-count">(${d.reviews} reviews)</span>`;

    document.getElementById('infoDesc').textContent = d.desc;
    document.getElementById('infoPrice').textContent = `$${d.price.toFixed(2)}`;

    const diet = d.tags?.includes('vegetarian') || d.tags?.includes('veg') ? 'veg' : 'non-veg';
    const dietEl = document.getElementById('infoDiet');
    dietEl.className = `info-diet ${diet}`;
    dietEl.innerHTML = diet === 'veg' ? '🌱 Vegetarian' : '🍗 Non-Vegetarian';

    // Ingredients
    document.getElementById('ingredientsList').innerHTML =
        d.ingredients.map(ing => `<li>${ing}</li>`).join('');

    // Price
    updateTotal();

    // Meta (mocking some that are not in backend yet)
    document.getElementById('metaPrep').textContent = d.prepTime || '20 min';
    document.getElementById('metaCal').textContent = d.calories || '450 kcal';
    document.getElementById('metaServes').textContent = d.serves || '1 person';
}

// ── GALLERY ──
function switchImage(src, thumbEl) {
    document.getElementById('mainImage').src = src;
    document.querySelectorAll('.gallery-thumbs img').forEach(t => t.classList.remove('active'));
    thumbEl.classList.add('active');
}

// ── QUANTITY ──
function changeQty(delta) {
    currentQty = Math.max(1, Math.min(10, currentQty + delta));
    document.getElementById('qtyVal').textContent = currentQty;
    updateTotal();
}

function updateTotal() {
    if (!currentDish) return;
    document.getElementById('totalPrice').textContent = `$${(currentDish.price * currentQty).toFixed(2)}`;
}

// ── CART ──
function addToCart() {
    const cart = JSON.parse(localStorage.getItem('sabroso_cart') || '[]');
    const existing = cart.find(item => (item._id || item.id) === (currentDish._id || currentDish.id));

    if (existing) {
        existing.quantity += currentQty;
    } else {
        cart.push({ ...currentDish, quantity: currentQty });
    }

    localStorage.setItem('sabroso_cart', JSON.stringify(cart));

    const btn = document.getElementById('addCartBtn');
    btn.classList.add('added');
    btn.innerHTML = '<i class="fas fa-check"></i> Added!';

    // Update nav counter
    const navCounter = document.getElementById('cartCount');
    if (navCounter) {
        const total = cart.reduce((s, i) => s + (i.quantity || 1), 0);
        navCounter.textContent = total;
    }

    showToast(`🛒 ${currentQty}× ${currentDish.name} added to cart!`);
    setTimeout(() => {
        btn.classList.remove('added');
        btn.innerHTML = `<i class="fas fa-cart-plus"></i> Add to Cart — <span id="totalPrice">$${(currentDish.price * currentQty).toFixed(2)}</span>`;
    }, 2500);
}

// ── FAVOURITE ──
function toggleFav() {
    const btn = document.getElementById('favBtn');
    btn.classList.toggle('active');
    showToast(btn.classList.contains('active') ? '❤️ Added to favourites!' : '💔 Removed from favourites');
}

// ── RENDER REVIEWS ──
function renderReviews(d) {
    const revs = reviewsDB[d.id] || [];
    const avg = d.rating;
    const total = d.reviews;

    // Summary bar
    document.getElementById('reviewSummary').innerHTML = `
    <div style="text-align:center">
      <div class="big-rating">${avg}</div>
      <div class="stars-big">${'★'.repeat(Math.round(avg))}${'☆'.repeat(5 - Math.round(avg))}</div>
      <div class="review-total">${total} reviews</div>
    </div>
    <div class="review-bars">
      <div class="review-bar-row"><span>5★</span><div class="review-bar"><div class="review-bar-fill" style="width:72%"></div></div><span>72%</span></div>
      <div class="review-bar-row"><span>4★</span><div class="review-bar"><div class="review-bar-fill" style="width:20%"></div></div><span>20%</span></div>
      <div class="review-bar-row"><span>3★</span><div class="review-bar"><div class="review-bar-fill" style="width:5%"></div></div><span>5%</span></div>
      <div class="review-bar-row"><span>2★</span><div class="review-bar"><div class="review-bar-fill" style="width:2%"></div></div><span>2%</span></div>
      <div class="review-bar-row"><span>1★</span><div class="review-bar"><div class="review-bar-fill" style="width:1%"></div></div><span>1%</span></div>
    </div>`;

    // Review cards
    document.getElementById('reviewsGrid').innerHTML = revs.map(r => `
    <div class="review-card fade-up">
      <div class="review-user">
        <div class="review-avatar">${r.name.charAt(0)}</div>
        <div>
          <div class="review-user-name">${r.name}</div>
          <div class="review-user-date">${r.date}</div>
        </div>
      </div>
      <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
      <p class="review-text">"${r.text}"</p>
    </div>`).join('');
}

// ── RENDER RELATED ──
function renderRelated(d) {
    const related = allDishes.filter(dish => dish._id !== d._id).slice(0, 4);
    document.getElementById('relatedGrid').innerHTML = related.map(r => `
    <a href="details.html?id=${r._id}" class="related-card" style="text-decoration:none">
      <div class="related-img">
        <img src="${r.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'}" alt="${r.name}" loading="lazy"/>
      </div>
      <div class="related-body">
        <div class="related-country">${r.country || r.cuisine}</div>
        <div class="related-name">${r.name}</div>
        <div class="related-footer">
          <span class="related-price">$${r.price.toFixed(2)}</span>
          <span class="related-rating">★ ${r.rating || '4.5'} <span>(4k+)</span></span>
        </div>
      </div>
    </a>`).join('');
}

// ── TOAST ──
let toastTimer;
function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── SCROLL ──
window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    const st = document.getElementById('scrollTop');
    if (window.scrollY > 80) {
        nav.style.background = 'rgba(255,248,240,0.98)';
        nav.style.boxShadow = '0 2px 20px rgba(230,57,70,0.1)';
        st.style.display = 'flex';
    } else {
        nav.style.background = 'rgba(255,248,240,0.92)';
        nav.style.boxShadow = 'none';
        st.style.display = 'none';
    }
});

// ── START ──
init();
