let currentStage = 0;
let currentOrder = null;

const stages = [
    { id: 'Placed', title: "Order Placed", icon: "fa-clipboard-check", statusText: "Order Placed", pillClass: "" },
    { id: 'Preparing', title: "Kitchen Preparing", icon: "fa-fire-burner", statusText: "Kitchen Preparing", pillClass: "preparing" },
    { id: 'Out for Delivery', title: "Out for Delivery", icon: "fa-motorcycle", statusText: "Out for Delivery", pillClass: "delivering" },
    { id: 'Delivered', title: "Delivered", icon: "fa-house-circle-check", statusText: "Delivered", pillClass: "delivered" }
];

// ── INIT ──
async function init() {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');

    if (!orderId) {
        showToast('⚠️ No order ID found');
        return;
    }

    try {
        const order = await apiFetch(`/orders/track/${orderId}`);
        if (order) {
            currentOrder = order;
            currentStage = stages.findIndex(s => s.id === order.orderStatus);
            if (currentStage === -1) currentStage = 0;

            renderOrderData();
            updateTimeline();
        }
    } catch (error) {
        console.error('Error fetching order:', error);
        showToast('❌ Order not found');
    }
}

// ── RENDER ORDER DATA ──
function renderOrderData() {
    if (!currentOrder) return;

    // ID and Date
    document.getElementById('orderId').textContent = currentOrder.orderId;
    const createdAt = new Date(currentOrder.createdAt);
    document.getElementById('orderDate').textContent = formatDate(createdAt);

    // Step timings (mocked for now based on createdAt)
    document.getElementById('step0Time').textContent = formatTime(createdAt);
    if (currentStage >= 1) document.getElementById('step1Time').textContent = formatTime(new Date(createdAt.getTime() + 5 * 60000));
    if (currentStage >= 2) document.getElementById('step2Time').textContent = formatTime(new Date(createdAt.getTime() + 15 * 60000));
    if (currentStage >= 3) document.getElementById('step3Time').textContent = formatTime(new Date(createdAt.getTime() + 25 * 60000));

    // Address & Meta
    document.getElementById('addressVal').textContent = currentOrder.deliveryAddress.street + ', ' + currentOrder.deliveryAddress.city;
    document.getElementById('etaVal').textContent = currentOrder.estimatedDelivery || '25–35 min';

    // Order Items
    const container = document.getElementById('orderItems');
    if (container) {
        container.innerHTML = currentOrder.items.map(item => `
        <div class="order-item">
          <div class="order-item-img"><img src="${item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'}" alt="${item.name}"/></div>
          <div class="order-item-info">
            <div class="order-item-name">${item.name}</div>
            <div class="order-item-qty">${item.quantity} × $${item.price.toFixed(2)}</div>
          </div>
          <div class="order-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
      `).join('');
    }

    // Summary
    document.getElementById('orderSubtotal').textContent = `$${currentOrder.subtotal.toFixed(2)}`;
    document.getElementById('orderDelivery').textContent = currentOrder.deliveryFee === 0 ? 'FREE' : `$${currentOrder.deliveryFee.toFixed(2)}`;
    document.getElementById('orderTax').textContent = `$${currentOrder.tax.toFixed(2)}`;
    document.getElementById('orderTotal').textContent = `$${currentOrder.total.toFixed(2)}`;
    document.getElementById('orderPayment').textContent = currentOrder.paymentMethod.toUpperCase();
}

function formatTime(d) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDate(d) {
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + ' · ' + formatTime(d);
}

// ── UPDATE TIMELINE ──
function updateTimeline() {
    const steps = document.querySelectorAll('.timeline-step');
    const fill = document.getElementById('timelineFill');
    const pill = document.getElementById('statusPill');
    const statusText = document.getElementById('statusText');

    steps.forEach((step, i) => {
        step.classList.remove('done', 'active');
        if (i < currentStage) {
            step.classList.add('done');
        } else if (i === currentStage) {
            step.classList.add('active');
        }
    });

    // Fill percentage
    const pct = currentStage === 0 ? 0 : (currentStage / (stages.length - 1)) * 100;
    fill.style.height = pct + '%';

    // Status pill
    const stage = stages[currentStage];
    if (statusText) statusText.textContent = stage.statusText;
    if (pill) pill.className = 'status-pill ' + (stage.pillClass || 'active');

    // ETA update
    const etaEl = document.getElementById('etaVal');
    if (etaEl) {
        if (currentStage >= 3) {
            etaEl.textContent = 'Delivered! 🎉';
            etaEl.style.color = '#10b981';
        } else if (currentStage >= 2) {
            etaEl.textContent = '5–10 min';
        } else {
            etaEl.textContent = currentOrder?.estimatedDelivery || '25–35 min';
        }
    }

    // Disable button at final stage
    const btn = document.getElementById('simBtn');
    if (btn && currentStage >= 3) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-check"></i> Order Delivered';
    }
}

// ── SIMULATE PROGRESS ──
function simulateProgress() {
    if (currentStage >= 3) return;
    currentStage++;

    // Set time for this step
    const timeEl = document.getElementById(`step${currentStage}Time`);
    if (timeEl) {
        timeEl.textContent = formatTime(new Date());
    }

    updateTimeline();

    const msgs = [
        '📋 Order has been placed!',
        '👨‍🍳 Kitchen is preparing your food!',
        '🏍️ Your rider is on the way!',
        '🎉 Order delivered! Enjoy your meal!'
    ];
    showToast(msgs[currentStage] || 'Updated!');
}

// ── TOAST ──
let toastTimer;
function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    const msgEl = document.getElementById('toastMsg');
    if (msgEl) msgEl.textContent = msg;
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
    if (!nav) return;
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
