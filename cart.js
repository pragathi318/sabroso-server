const DELIVERY_FEE = 49;
const FREE_DELIVERY_MIN = 500;
let cart = [];
let promoApplied = false;
let promoDiscount = 0;

// ── INIT ──
function init() {
    const stored = localStorage.getItem('sabroso_cart');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            // Ignore/clear out corrupted items without name/price
            cart = parsed.filter(item => item && item.name && typeof item.price === 'number' && !isNaN(item.price));
            localStorage.setItem('sabroso_cart', JSON.stringify(cart));
        } catch(e) {
            cart = [];
        }
    } else {
        cart = [];
    }
    render();
}

function saveCart() {
    localStorage.setItem('sabroso_cart', JSON.stringify(cart));
}

// ── RENDER ──
function render() {
    const emptyEl = document.getElementById('emptyCart');
    const layoutEl = document.getElementById('cartLayout');
    const totalItems = (cart || []).reduce((s, i) => s + (i.quantity || 1), 0);

    document.getElementById('heroItemCount').textContent = totalItems;
    document.getElementById('navCartCount').textContent = totalItems;

    if (!cart || cart.length === 0) {
        emptyEl.style.display = 'block';
        layoutEl.style.display = 'none';
        return;
    }
    emptyEl.style.display = 'none';
    layoutEl.style.display = 'grid';

    renderItems();
    updateSummary();
}

function renderItems() {
    const list = document.getElementById('cartItemsList');
    list.innerHTML = cart.map((item, i) => `
    <div class="cart-item" id="cartItem-${i}">
      <div class="cart-item-img">
        <img src="${item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'}" alt="${item.name}"/>
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-country">${item.country || 'Global'}</div>
        <div class="cart-item-unit">₹${item.price.toFixed(0)} each</div>
      </div>
      <div class="cart-item-qty">
        <button onclick="changeQty(${i}, -1)"><i class="fas fa-minus"></i></button>
        <span>${item.quantity || 1}</span>
        <button onclick="changeQty(${i}, 1)"><i class="fas fa-plus"></i></button>
      </div>
      <div class="cart-item-total">₹${(item.price * (item.quantity || 1)).toFixed(0)}</div>
      <button class="cart-item-remove" onclick="removeItem(${i})" title="Remove"><i class="fas fa-times"></i></button>
    </div>
  `).join('');
}

// ── QUANTITY ──
function changeQty(idx, delta) {
    if (!cart[idx].quantity) cart[idx].quantity = 1;
    cart[idx].quantity = Math.max(1, Math.min(10, cart[idx].quantity + delta));
    saveCart();
    render();
}

// ── REMOVE ITEM ──
function removeItem(idx) {
    const el = document.getElementById(`cartItem-${idx}`);
    if (el) el.classList.add('removing');
    setTimeout(() => {
        const name = cart[idx].name;
        cart.splice(idx, 1);
        saveCart();
        render();
        showToast(`🗑️ ${name} removed from cart`);
    }, 300);
}

// ── CLEAR CART ──
function clearCart() {
    if (!confirm('Remove all items from your cart?')) return;
    cart = [];
    promoApplied = false;
    promoDiscount = 0;
    saveCart();
    render();
    showToast('🗑️ Cart cleared');
}

// ── UPDATE SUMMARY ──
function updateSummary() {
    const subtotal = (cart || []).reduce((s, i) => s + i.price * (i.quantity || 1), 0);
    const delivery = subtotal >= FREE_DELIVERY_MIN ? 0 : DELIVERY_FEE;
    const discount = promoApplied ? subtotal * promoDiscount : 0;
    const total = subtotal + delivery - discount;

    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(0)}`;
    document.getElementById('deliveryFee').textContent = delivery === 0 ? 'FREE' : `₹${delivery.toFixed(0)}`;
    document.getElementById('deliveryFee').style.color = delivery === 0 ? '#10b981' : '';

    const discountRow = document.getElementById('discountRow');
    if (promoApplied) {
        discountRow.style.display = 'flex';
        document.getElementById('discountAmt').textContent = `-₹${discount.toFixed(0)}`;
    } else {
        discountRow.style.display = 'none';
    }

    document.getElementById('totalAmount').textContent = `₹${total.toFixed(0)}`;
}

// ── PROMO CODE ──
function applyPromo() {
    const input = document.getElementById('promoInput');
    const hint = document.getElementById('promoHint');
    const code = input.value.trim().toUpperCase();

    if (code === 'SABROSO10') {
        promoApplied = true;
        promoDiscount = 0.10;
        hint.textContent = '✅ 10% discount applied!';
        hint.className = 'promo-hint success';
        showToast('🎉 Promo code applied! 10% off');
    } else if (code === 'TASTY20') {
        promoApplied = true;
        promoDiscount = 0.20;
        hint.textContent = '✅ 20% discount applied!';
        hint.className = 'promo-hint success';
        showToast('🎉 Promo code applied! 20% off');
    } else {
        promoApplied = false;
        promoDiscount = 0;
        hint.textContent = '❌ Invalid promo code. Try SABROSO10';
        hint.className = 'promo-hint error';
    }
    updateSummary();
}

// ── CHECKOUT ──
function proceedCheckout() {
    window.location.href = 'checkout.html';
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

function subscribeNewsletter() {
    const email = document.getElementById('newsletterEmail').value.trim();
    if (email && email.includes('@')) {
        showToast(`📬 Subscribed! Welcome to Sabroso, ${email.split('@')[0]}!`);
        document.getElementById('newsletterEmail').value = '';
    } else {
        showToast('⚠️ Please enter a valid email address.');
    }
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
