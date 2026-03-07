// ═══════════════════════════════════════
// SABROSO ADMIN DASHBOARD — JS
// ═══════════════════════════════════════

// ── GLOBAL STATE ──
let allOrders = [];
let allDishes = [];
let allUsers = [];

// ── INIT ──
async function init() {
    setDate();
    await fetchData();
    renderRecentOrders();
    renderAllOrders();
    renderDishesPage();
    renderUsers();
    renderTopDishes();
    updateOrderCounts();

    // Charts
    drawRevenueChart();
    drawCuisineChart();
    drawAnalyticsBarChart();
    drawPaymentChart();
}

async function fetchData() {
    try {
        const [ordersRes, dishesRes, usersRes] = await Promise.all([
            apiFetch('/orders'),
            apiFetch('/dishes'),
            apiFetch('/users') // Note: In a real app, only admins can do this
        ]);

        allOrders = ordersRes.orders;
        allDishes = dishesRes.dishes;
        allUsers = usersRes.users;
    } catch (error) {
        console.error('Failed to fetch admin data:', error);
        showToast('❌ Failed to load dashboard data');
    }
}

// ── DATE ──
function setDate() {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });
    document.getElementById('topbarDate').textContent = formatted;
    const welcomeDate = document.getElementById('welcomeDate');
    if (welcomeDate) welcomeDate.textContent = formatted;
}

// ── ORDER COUNTS ──
function updateOrderCounts() {
    const counts = { Delivered: 0, Preparing: 0, 'Out for Delivery': 0, Cancelled: 0, Placed: 0 };
    (allOrders || []).forEach(o => {
        if (counts[o.orderStatus] !== undefined) counts[o.orderStatus]++;
    });

    const mapping = {
        'countDelivered': counts.Delivered,
        'countPreparing': counts.Preparing,
        'countDelivery': counts['Out for Delivery'],
        'countCancelled': counts.Cancelled,
        'countOrders': counts.Placed + counts.Preparing + counts['Out for Delivery'] + counts.Delivered
    };

    for (const [id, val] of Object.entries(mapping)) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    }
}

// ═══════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════
function renderRecentOrders() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    tbody.innerHTML = (allOrders || []).slice(0, 7).map(o => orderRow(o)).join('');
}

function renderAllOrders(filter = 'all') {
    const tbody = document.getElementById('allOrdersBody');
    if (!tbody) return;
    const filtered = filter === 'all' ? allOrders : allOrders.filter(o => o.orderStatus === filter);
    tbody.innerHTML = (filtered || []).map(o => orderRowFull(o)).join('');
}

function filterOrders() {
    const val = document.getElementById('statusFilter').value;
    renderAllOrders(val);
}

function orderRow(o) {
    const customerName = o.customerName || 'Guest User';
    const initials = customerName.split(' ').map(n => n[0]).join('').toUpperCase();

    const statusClass = {
        'Delivered': 'badge-delivered',
        'Preparing': 'badge-preparing',
        'Out for Delivery': 'badge-delivery',
        'Cancelled': 'badge-cancelled',
        'Placed': 'badge-unpaid'
    }[o.orderStatus] || '';

    const payClass = {
        'Paid': 'badge-paid',
        'Unpaid': 'badge-unpaid',
        'Refunded': 'badge-cancelled'
    }[o.paymentStatus] || '';

    const statusIcon = {
        'Delivered': 'fa-check-circle',
        'Preparing': 'fa-fire',
        'Out for Delivery': 'fa-motorcycle',
        'Cancelled': 'fa-times-circle',
        'Placed': 'fa-clock'
    }[o.orderStatus] || 'fa-circle';

    const date = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dishName = o.items[0]?.name || 'Multiple Items';
    const dishCount = o.items.length > 1 ? ` (+${o.items.length - 1})` : '';

    return `<tr>
    <td class="td-id">${o.orderId}</td>
    <td><div class="td-customer"><div class="td-avatar">${initials}</div><span>${customerName}</span></div></td>
    <td>${dishName}${dishCount}</td>
    <td><strong>$${(o.total || 0).toFixed(2)}</strong></td>
    <td><span class="badge ${statusClass}"><i class="fas ${statusIcon}"></i> ${o.orderStatus}</span></td>
    <td><span class="badge ${payClass}">${o.paymentStatus}</span></td>
    <td>${date}</td>
  </tr>`;
}

function orderRowFull(o) {
    const customerName = o.customerName || 'Guest User';
    const initials = customerName.split(' ').map(n => n[0]).join('').toUpperCase();

    const statusClass = {
        'Delivered': 'badge-delivered',
        'Preparing': 'badge-preparing',
        'Out for Delivery': 'badge-delivery',
        'Cancelled': 'badge-cancelled',
        'Placed': 'badge-unpaid'
    }[o.orderStatus] || '';

    const payClass = {
        'Paid': 'badge-paid',
        'Unpaid': 'badge-unpaid',
        'Refunded': 'badge-cancelled'
    }[o.paymentStatus] || '';

    const statusIcon = {
        'Delivered': 'fa-check-circle',
        'Preparing': 'fa-fire',
        'Out for Delivery': 'fa-motorcycle',
        'Cancelled': 'fa-times-circle',
        'Placed': 'fa-clock'
    }[o.orderStatus] || 'fa-circle';

    const date = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const dishName = o.items[0]?.name || 'Multiple Items';
    const dishCount = o.items.length > 1 ? ` (+${o.items.length - 1} items)` : '';

    return `<tr>
    <td class="td-id">${o.orderId}</td>
    <td><div class="td-customer"><div class="td-avatar">${initials}</div><span>${customerName}</span></div></td>
    <td>${dishName}${dishCount}</td>
    <td><strong>$${(o.total || 0).toFixed(2)}</strong></td>
    <td><span class="badge ${statusClass}"><i class="fas ${statusIcon}"></i> ${o.orderStatus}</span></td>
    <td><span class="badge ${payClass}">${o.paymentStatus}</span></td>
    <td>${date}</td>
    <td><div class="td-actions">
      <button class="td-action-btn" title="View" onclick="showToast('📋 Viewing ${o.orderId}')"><i class="fas fa-eye"></i></button>
      <button class="td-action-btn danger" title="Delete" onclick="showToast('🗑️ Deleted ${o.orderId}')"><i class="fas fa-trash"></i></button>
    </div></td>
  </tr>`;
}

// ═══════════════════════════════════════
// DISHES
// ═══════════════════════════════════════
function renderDishesPage(filter = 'all') {
    const grid = document.getElementById('dishesGrid');
    if (!grid) return;
    const filtered = filter === 'all' ? allDishes : allDishes.filter(d => d.cuisine === filter);
    grid.innerHTML = (filtered || []).map(d => {
        const isVeg = d.tags?.includes('vegetarian') || d.tags?.includes('veg');
        return `
        <div class="dm-card">
          <div class="dm-card-img" style="background: url('${d.image || ''}') center/cover">
            <span class="dm-cuisine-tag">${d.cuisine}</span>
            <span class="dm-status-dot"></span>
            ${!d.image ? '🍽️' : ''}
          </div>
          <div class="dm-card-body">
            <div class="dm-card-name">${d.name} ${isVeg ? '🌱' : ''}</div>
            <div class="dm-card-meta">
              <span><i class="fas fa-clock"></i> 25 min</span>
              <span><i class="fas fa-fire"></i> Medium</span>
              <span><i class="fas fa-star"></i> ${d.rating || 4.5}</span>
            </div>
            <div class="dm-card-footer">
              <div class="dm-price">$${(d.price || 0).toFixed(2)}</div>
              <div class="dm-card-actions">
                <button class="dm-action" title="Edit" onclick="showToast('✏️ Editing ${d.name}')"><i class="fas fa-pen"></i></button>
                <button class="dm-action danger" title="Delete" onclick="showToast('🗑️ Removed ${d.name}')"><i class="fas fa-trash"></i></button>
              </div>
            </div>
          </div>
        </div>
    `;
    }).join('');
}

function filterDishes(cuisine, el) {
    document.querySelectorAll('.dish-filter').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    renderDishesPage(cuisine);
}

function openDishModal() {
    document.getElementById('dishModal').classList.add('active');
}

function closeDishModal() {
    document.getElementById('dishModal').classList.remove('active');
}

function saveDish() {
    const name = document.getElementById('dishName').value.trim();
    if (!name) {
        showToast('⚠️ Please enter a dish name');
        return;
    }
    closeDishModal();
    showToast(`✅ ${name} saved successfully!`);
    document.getElementById('dishName').value = '';
}

// ═══════════════════════════════════════
// USERS
// ═══════════════════════════════════════
function renderUsers(filter = 'all') {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    const filtered = filter === 'all' ? allUsers : allUsers.filter(u => u.role === filter);
    tbody.innerHTML = (filtered || []).map(u => {
        const initials = u.name.split(' ').map(n => n[0]).join('').toUpperCase();
        const roleClass = {
            'customer': 'badge-customer',
            'premium': 'badge-premium',
            'admin': 'badge-admin'
        }[u.role] || '';

        const joinedDate = new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        // Mocking some stats since they aren't in the DB yet
        const ordersCount = Math.floor(Math.random() * 20);
        const spentAmount = ordersCount * 15.5;

        return `<tr>
      <td><div class="td-customer"><div class="td-avatar">${initials}</div><span>${u.name}</span></div></td>
      <td>${u.email}</td>
      <td><span class="badge ${roleClass}">${u.role.toUpperCase()}</span></td>
      <td>${ordersCount}</td>
      <td><strong>$${spentAmount.toFixed(2)}</strong></td>
      <td>${joinedDate}</td>
      <td><span class="badge badge-active"><i class="fas fa-circle" style="font-size:.4rem"></i> Active</span></td>
    </tr>`;
    }).join('');
}

function filterUsers() {
    const val = document.getElementById('userRoleFilter').value;
    renderUsers(val);
}

// ═══════════════════════════════════════
// TOP DISHES (Analytics)
// ═══════════════════════════════════════
function renderTopDishes() {
    const tbody = document.getElementById('topDishesBody');
    if (!tbody) return;

    // In a real app we'd calculate this from orders
    const sorted = [...allDishes].sort((a, b) => (b.rating || 0) - (a.rating || 0));

    tbody.innerHTML = sorted.slice(0, 8).map((d, i) => {
        const sold = Math.floor(Math.random() * 500) + 100;
        const revenue = d.price * sold;
        const maxSold = 600;
        const pct = (sold / maxSold * 100).toFixed(0);
        const colors = ['#e63946', '#f4831f', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

        return `<tr>
      <td><strong style="color:var(--gray)">#${i + 1}</strong></td>
      <td><strong>${d.name}</strong></td>
      <td>${d.cuisine}</td>
      <td><strong>${sold}</strong></td>
      <td><strong>$${revenue.toFixed(2)}</strong></td>
      <td><span class="star-rating">${'★'.repeat(Math.round(d.rating || 4))}${'☆'.repeat(5 - Math.round(d.rating || 4))}</span> ${d.rating || 4.5}</td>
      <td><div class="trend-bar"><div class="trend-bar-track"><div class="trend-bar-fill" style="width:${pct}%;background:${colors[i % colors.length]}"></div></div><span style="font-size:.68rem;color:var(--gray)">${pct}%</span></div></td>
    </tr>`;
    }).join('');
}

// ═══════════════════════════════════════
// SIDEBAR NAVIGATION
// ═══════════════════════════════════════
function switchPage(page, el) {
    if (event) event.preventDefault();
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`).classList.add('active');

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (el) el.classList.add('active');

    const titles = {
        dashboard: 'Dashboard',
        dishes: 'Manage Dishes',
        orders: 'Orders',
        users: 'Users',
        analytics: 'Analytics'
    };
    document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';
    closeSidebar();

    // Re-draw charts if they are on this page
    if (page === 'analytics') {
        setTimeout(() => {
            drawAnalyticsBarChart();
            drawPaymentChart();
        }, 50);
    }
    if (page === 'dashboard') {
        setTimeout(() => {
            drawRevenueChart();
            drawCuisineChart();
        }, 50);
    }
}

// ═══════════════════════════════════════
// SIDEBAR TOGGLE
// ═══════════════════════════════════════
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');

    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.onclick = closeSidebar;
        document.body.appendChild(overlay);
    }
    overlay.classList.toggle('active');
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) overlay.classList.remove('active');
}

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        showToast('🖥️ Full screen mode enabled');
    } else {
        document.exitFullscreen();
    }
}

// ═══════════════════════════════════════
// REVENUE CHART (Canvas — smooth area)
// ═══════════════════════════════════════
function drawRevenueChart() {
    const canvas = document.getElementById('revenueChart');
    if (!canvas || !canvas.offsetParent) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    const w = rect.width;
    const h = rect.height;
    const pad = { t: 25, r: 25, b: 40, l: 55 };
    const chartW = w - pad.l - pad.r;
    const chartH = h - pad.t - pad.b;

    const data = [3200, 4100, 3800, 5200, 4800, 6100, 7400, 6800, 7200, 8100, 7600, 9200];
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const max = Math.max(...data) * 1.15;

    // Grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = pad.t + (chartH / 4) * i;
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.moveTo(pad.l, y);
        ctx.lineTo(w - pad.r, y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Inter';
        ctx.textAlign = 'right';
        ctx.fillText('$' + Math.round(max - (max / 4) * i).toLocaleString(), pad.l - 10, y + 4);
    }

    // X labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    data.forEach((_, i) => {
        const x = pad.l + (chartW / (data.length - 1)) * i;
        ctx.fillText(labels[i], x, h - 12);
    });

    // Points
    const points = data.map((v, i) => ({
        x: pad.l + (chartW / (data.length - 1)) * i,
        y: pad.t + chartH - (v / max) * chartH
    }));

    // Gradient fill
    const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + chartH);
    grad.addColorStop(0, 'rgba(230,57,70,0.15)');
    grad.addColorStop(1, 'rgba(230,57,70,0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        const cx1 = (points[i - 1].x + points[i].x) / 2;
        const cy1 = points[i - 1].y;
        const cx2 = (points[i - 1].x + points[i].x) / 2;
        const cy2 = points[i].y;
        ctx.bezierCurveTo(cx1, cy1, cx2, cy2, points[i].x, points[i].y);
    }
    ctx.lineTo(points[points.length - 1].x, pad.t + chartH);
    ctx.lineTo(points[0].x, pad.t + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        const cx1 = (points[i - 1].x + points[i].x) / 2;
        const cy1 = points[i - 1].y;
        const cx2 = (points[i - 1].x + points[i].x) / 2;
        const cy2 = points[i].y;
        ctx.bezierCurveTo(cx1, cy1, cx2, cy2, points[i].x, points[i].y);
    }
    ctx.strokeStyle = '#e63946';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Dots
    points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#e63946';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
    });
}

// ═══════════════════════════════════════
// CUISINE DONUT CHART
// ═══════════════════════════════════════
function drawCuisineChart() {
    const canvas = document.getElementById('cuisineChart');
    if (!canvas || !canvas.offsetParent) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    const data = [
        { label: 'European', value: 35, color: '#e63946' },
        { label: 'Japanese', value: 25, color: '#f4831f' },
        { label: 'Korean', value: 15, color: '#f59e0b' },
        { label: 'Mexican', value: 18, color: '#10b981' },
        { label: 'African', value: 7, color: '#3b82f6' }
    ];

    const total = data.reduce((s, d) => s + d.value, 0);
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const r = Math.min(cx, cy) - 15;
    const inner = r * 0.6;
    const gap = 0.03;

    let startAngle = -Math.PI / 2;
    data.forEach(d => {
        const sliceAngle = (d.value / total) * Math.PI * 2 - gap;
        ctx.beginPath();
        ctx.arc(cx, cy, r, startAngle, startAngle + sliceAngle);
        ctx.arc(cx, cy, inner, startAngle + sliceAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = d.color;
        ctx.fill();
        startAngle += sliceAngle + gap;
    });

    // Center text
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 20px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total + '%', cx, cy - 8);
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Inter';
    ctx.fillText('Total Orders', cx, cy + 10);

    // Legend
    const legendEl = document.getElementById('cuisineLegend');
    if (legendEl) {
        legendEl.innerHTML = data.map(d => `
      <div class="legend-item">
        <div class="legend-dot" style="background:${d.color}"></div>${d.label} (${d.value}%)
      </div>
    `).join('');
    }
}

// ═══════════════════════════════════════
// ANALYTICS BAR CHART
// ═══════════════════════════════════════
function drawAnalyticsBarChart() {
    const canvas = document.getElementById('analyticsBarChart');
    if (!canvas || !canvas.offsetParent) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    const w = rect.width;
    const h = rect.height;
    const pad = { t: 25, r: 25, b: 45, l: 55 };
    const chartW = w - pad.l - pad.r;
    const chartH = h - pad.t - pad.b;

    const ordersData = [120, 180, 150, 220, 190, 280, 310, 270, 290, 340, 300, 380];
    const revenueData = [3200, 4100, 3800, 5200, 4800, 6100, 7400, 6800, 7200, 8100, 7600, 9200];
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const maxOrders = Math.max(...ordersData) * 1.2;

    const barWidth = chartW / labels.length * 0.6;
    const barGap = chartW / labels.length;

    // Grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = pad.t + (chartH / 4) * i;
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.moveTo(pad.l, y);
        ctx.lineTo(w - pad.r, y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Inter';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(maxOrders - (maxOrders / 4) * i), pad.l - 10, y + 4);
    }

    // X labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';

    ordersData.forEach((v, i) => {
        const x = pad.l + barGap * i + barGap / 2;
        const barH = (v / maxOrders) * chartH;
        const y = pad.t + chartH - barH;

        // Bar
        const barGrad = ctx.createLinearGradient(0, y, 0, pad.t + chartH);
        barGrad.addColorStop(0, '#e63946');
        barGrad.addColorStop(1, '#f4831f');

        // Rounded rect
        const radius = 4;
        ctx.beginPath();
        ctx.moveTo(x - barWidth / 2 + radius, y);
        ctx.lineTo(x + barWidth / 2 - radius, y);
        ctx.quadraticCurveTo(x + barWidth / 2, y, x + barWidth / 2, y + radius);
        ctx.lineTo(x + barWidth / 2, pad.t + chartH);
        ctx.lineTo(x - barWidth / 2, pad.t + chartH);
        ctx.lineTo(x - barWidth / 2, y + radius);
        ctx.quadraticCurveTo(x - barWidth / 2, y, x - barWidth / 2 + radius, y);
        ctx.closePath();
        ctx.fillStyle = barGrad;
        ctx.fill();

        // X label
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(labels[i], x, h - 15);
    });

    // Revenue line overlay
    const revMax = Math.max(...revenueData) * 1.2;
    const revPoints = revenueData.map((v, i) => ({
        x: pad.l + barGap * i + barGap / 2,
        y: pad.t + chartH - (v / revMax) * chartH
    }));

    ctx.beginPath();
    ctx.moveTo(revPoints[0].x, revPoints[0].y);
    for (let i = 1; i < revPoints.length; i++) {
        const cx1 = (revPoints[i - 1].x + revPoints[i].x) / 2;
        const cy1 = revPoints[i - 1].y;
        const cx2 = (revPoints[i - 1].x + revPoints[i].x) / 2;
        const cy2 = revPoints[i].y;
        ctx.bezierCurveTo(cx1, cy1, cx2, cy2, revPoints[i].x, revPoints[i].y);
    }
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();

    revPoints.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
    });
}

// ═══════════════════════════════════════
// PAYMENT DONUT CHART
// ═══════════════════════════════════════
function drawPaymentChart() {
    const canvas = document.getElementById('paymentChart');
    if (!canvas || !canvas.offsetParent) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    const data = [
        { label: 'Cash on Delivery', value: 42, color: '#10b981' },
        { label: 'UPI', value: 33, color: '#3b82f6' },
        { label: 'Credit Card', value: 18, color: '#8b5cf6' },
        { label: 'Debit Card', value: 7, color: '#f59e0b' }
    ];

    const total = data.reduce((s, d) => s + d.value, 0);
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const r = Math.min(cx, cy) - 15;
    const inner = r * 0.6;
    const gap = 0.03;

    let startAngle = -Math.PI / 2;
    data.forEach(d => {
        const sliceAngle = (d.value / total) * Math.PI * 2 - gap;
        ctx.beginPath();
        ctx.arc(cx, cy, r, startAngle, startAngle + sliceAngle);
        ctx.arc(cx, cy, inner, startAngle + sliceAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = d.color;
        ctx.fill();
        startAngle += sliceAngle + gap;
    });

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 18px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('100%', cx, cy - 8);
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Inter';
    ctx.fillText('Payments', cx, cy + 10);

    const legendEl = document.getElementById('paymentLegend');
    if (legendEl) {
        legendEl.innerHTML = data.map(d => `
      <div class="legend-item">
        <div class="legend-dot" style="background:${d.color}"></div>${d.label} (${d.value}%)
      </div>
    `).join('');
    }
}

function setChartFilter(el, period) {
    document.querySelectorAll('.chart-filter').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    showToast(`📊 Showing ${period} data`);
}

// ═══════════════════════════════════════
// TOAST
// ═══════════════════════════════════════
let toastTimer;
function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ═══════════════════════════════════════
// RESIZE HANDLER
// ═══════════════════════════════════════
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        drawRevenueChart();
        drawCuisineChart();
        drawAnalyticsBarChart();
        drawPaymentChart();
    }, 200);
});

// ═══════════════════════════════════════
// START
// ═══════════════════════════════════════
init();
