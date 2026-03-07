// ── LOAD CART FROM LOCALSTORAGE ──
const DELIVERY_FEE = 3.99;
const FREE_DELIVERY_MIN = 25;
const TAX_RATE = 0.05;
let cart = [];

function init() {
    const stored = localStorage.getItem('sabroso_cart');
    if (stored) {
        cart = JSON.parse(stored);
    } else {
        cart = [];
    }
    renderSummary();
}

// ── RENDER ORDER SUMMARY ──
function renderSummary() {
    const container = document.getElementById('summaryItems');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding: 20px; color: var(--gray);">Your cart is empty.</p>';
        updateTotals();
        return;
    }

    container.innerHTML = cart.map(item => `
    <div class="summary-item">
      <div class="summary-item-img"><img src="${item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'}" alt="${item.name}"/></div>
      <div class="summary-item-info">
        <div class="summary-item-name">${item.name}</div>
        <div class="summary-item-qty">${item.quantity || 1} × $${item.price.toFixed(2)}</div>
      </div>
      <div class="summary-item-price">$${(item.price * (item.quantity || 1)).toFixed(2)}</div>
    </div>
  `).join('');

    updateTotals();
}

function updateTotals() {
    const subtotal = cart.reduce((s, i) => s + i.price * (i.quantity || 1), 0);
    const delivery = subtotal >= FREE_DELIVERY_MIN || subtotal === 0 ? 0 : DELIVERY_FEE;
    const tax = subtotal * TAX_RATE;
    const total = subtotal + delivery + tax;

    if (document.getElementById('subtotal')) document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    const feeEl = document.getElementById('deliveryFee');
    if (feeEl) {
        feeEl.textContent = delivery === 0 ? 'FREE' : `$${delivery.toFixed(2)}`;
        feeEl.style.color = delivery === 0 ? '#10b981' : '';
    }
    if (document.getElementById('taxAmt')) document.getElementById('taxAmt').textContent = `$${tax.toFixed(2)}`;
    if (document.getElementById('totalAmount')) document.getElementById('totalAmount').textContent = `$${total.toFixed(2)}`;
    if (document.getElementById('btnTotal')) document.getElementById('btnTotal').textContent = `$${total.toFixed(2)}`;
}

// ── PAYMENT METHOD ──
function selectPayment(method) {
    const upiField = document.getElementById('upiField');
    const cardField = document.getElementById('cardField');
    if (upiField) upiField.style.display = method === 'upi' ? 'block' : 'none';
    if (cardField) cardField.style.display = method === 'card' ? 'block' : 'none';
}

// ── FORM VALIDATION ──
function validateForm() {
    const fields = [
        { id: 'fullName', label: 'Full Name' },
        { id: 'phone', label: 'Phone Number' },
        { id: 'address', label: 'Address' },
        { id: 'city', label: 'City' },
        { id: 'pincode', label: 'Pincode' }
    ];

    let valid = true;
    let firstError = null;

    // Clear previous errors
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(el => el.classList.remove('error'));

    for (const f of fields) {
        const el = document.getElementById(f.id);
        if (!el || !el.value.trim()) {
            if (el) el.classList.add('error');
            if (!firstError) firstError = { el, label: f.label };
            valid = false;
        }
    }

    // Payment-specific validation
    const paymentOption = document.querySelector('input[name=payment]:checked');
    if (!paymentOption) {
        showToast('⚠️ Please select a payment method');
        return false;
    }
    const method = paymentOption.value;

    if (method === 'upi') {
        const upi = document.getElementById('upiId');
        if (!upi.value.trim() || !upi.value.includes('@')) {
            upi.classList.add('error');
            if (!firstError) firstError = { el: upi, label: 'UPI ID' };
            valid = false;
        }
    }
    if (method === 'card') {
        const cn = document.getElementById('cardNum');
        const ce = document.getElementById('cardExpiry');
        const cv = document.getElementById('cardCvv');
        if (!cn.value.trim() || cn.value.replace(/\s/g, '').length < 16) {
            cn.classList.add('error'); if (!firstError) firstError = { el: cn, label: 'Card Number' }; valid = false;
        }
        if (!ce.value.trim()) {
            ce.classList.add('error'); if (!firstError) firstError = { el: ce, label: 'Expiry' }; valid = false;
        }
        if (!cv.value.trim() || cv.value.length < 3) {
            cv.classList.add('error'); if (!firstError) firstError = { el: cv, label: 'CVV' }; valid = false;
        }
    }

    if (!valid && firstError) {
        showToast(`⚠️ Please fill in ${firstError.label}`);
        if (firstError.el) firstError.el.focus();
    }
    return valid;
}

// ── PLACE ORDER ──
async function placeOrder() {
    if (!validateForm()) return;
    if (cart.length === 0) { showToast('⚠️ Your cart is empty!'); return; }

    const user = auth.getUser();
    if (!user) {
        showToast('⚠️ Please login to place order');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    const btn = document.getElementById('placeOrderBtn');
    btn.classList.add('loading');
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    try {
        const subtotalValue = cart.reduce((s, i) => s + i.price * (i.quantity || 1), 0);
        const deliveryValue = subtotalValue >= FREE_DELIVERY_MIN ? 0 : DELIVERY_FEE;
        const taxValue = subtotalValue * TAX_RATE;
        const totalValue = subtotalValue + deliveryValue + taxValue;

        const orderData = {
            customer: user._id || user.id,
            customerName: document.getElementById('fullName').value,
            customerEmail: document.getElementById('email').value || user.email,
            customerPhone: document.getElementById('phone').value,
            items: cart.map(item => ({
                dish: item._id || item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity || 1,
                image: item.image
            })),
            subtotal: subtotalValue,
            deliveryFee: deliveryValue,
            tax: taxValue,
            total: totalValue,
            deliveryAddress: {
                street: document.getElementById('address').value,
                city: document.getElementById('city').value,
                pincode: document.getElementById('pincode').value,
                instructions: ''
            },
            paymentMethod: document.querySelector('input[name=payment]:checked').value
        };

        const response = await apiFetch('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });

        if (response) {
            btn.classList.remove('loading');
            btn.innerHTML = '<i class="fas fa-check-circle"></i> Order Placed!';

            // Show Success UI
            document.getElementById('orderId').textContent = response.orderId;
            document.getElementById('successAddr').textContent = orderData.deliveryAddress.street.substring(0, 40) + '...';
            document.getElementById('successModal').classList.add('active');

            // Clear Cart
            localStorage.removeItem('sabroso_cart');

            // Link to tracking page
            const trackBtn = document.querySelector('.modal-footer .btn-cta');
            if (trackBtn) {
                trackBtn.onclick = (e) => {
                    e.preventDefault();
                    window.location.href = `tracking.html?id=${response.orderId}`;
                };
            }
        }
    } catch (error) {
        console.error('Order placement failed:', error);
        showToast(`❌ Error: ${error.message || 'Something went wrong'}`);
        btn.classList.remove('loading');
        btn.innerHTML = originalContent;
    }
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
    if (window.scrollY > 80) {
        nav.style.background = 'rgba(255,248,240,0.98)';
        nav.style.boxShadow = '0 2px 20px rgba(230,57,70,0.1)';
    } else {
        nav.style.background = 'rgba(255,248,240,0.92)';
        nav.style.boxShadow = 'none';
    }
});

// ── START ──
init();
