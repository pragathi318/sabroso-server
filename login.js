// ── TOGGLE LOGIN / REGISTER ──
function showRegister(e) {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('registerForm').classList.remove('auth-form');
    void document.getElementById('registerForm').offsetWidth; // reflow
    document.getElementById('registerForm').classList.add('auth-form');
}

function showLogin(e) {
    e.preventDefault();
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('loginForm').classList.remove('auth-form');
    void document.getElementById('loginForm').offsetWidth;
    document.getElementById('loginForm').classList.add('auth-form');
}

// ── PASSWORD VISIBILITY TOGGLE ──
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// ── PASSWORD STRENGTH METER ──
const regPw = document.getElementById('regPassword');
if (regPw) {
    regPw.addEventListener('input', () => {
        const val = regPw.value;
        const fill = document.getElementById('pwFill');
        const label = document.getElementById('pwLabel');
        let score = 0;
        if (val.length >= 6) score++;
        if (val.length >= 10) score++;
        if (/[A-Z]/.test(val)) score++;
        if (/[0-9]/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;

        const levels = [
            { w: '0%', c: '#d1d5db', t: '' },
            { w: '20%', c: '#ef4444', t: 'Weak' },
            { w: '40%', c: '#f59e0b', t: 'Fair' },
            { w: '60%', c: '#eab308', t: 'Good' },
            { w: '80%', c: '#22c55e', t: 'Strong' },
            { w: '100%', c: '#10b981', t: 'Excellent' }
        ];
        const lv = levels[score];
        fill.style.width = lv.w;
        fill.style.background = lv.c;
        label.textContent = lv.t;
        label.style.color = lv.c;
    });
}

// ── HANDLE LOGIN ──
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const pw = document.getElementById('loginPassword').value;

    if (!email || !pw) {
        showToast('⚠️ Please fill in all fields');
        return;
    }

    const btn = document.getElementById('loginBtn');
    btn.classList.add('loading');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';

    try {
        const data = await auth.login(email, pw);

        btn.classList.remove('loading');
        btn.classList.add('success');
        btn.innerHTML = '<i class="fas fa-check"></i> Welcome back!';
        showToast(`✅ Welcome back, ${data.name}!`);

        setTimeout(() => {
            // If admin, go to admin dashboard, else go home
            window.location.href = data.role === 'admin' ? 'admin.html' : 'index.html';
        }, 1500);
    } catch (error) {
        btn.classList.remove('loading');
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
        showToast(`❌ ${error.message}`);
    }
}

// ── HANDLE REGISTER ──
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const pw = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;

    if (!name || !email || !phone || !pw || !confirm) {
        showToast('⚠️ Please fill in all fields');
        return;
    }
    if (pw.length < 6) {
        showToast('⚠️ Password must be at least 6 characters');
        document.getElementById('regPassword').classList.add('error');
        return;
    }
    if (pw !== confirm) {
        showToast('⚠️ Passwords do not match');
        document.getElementById('regConfirm').classList.add('error');
        return;
    }
    if (!document.getElementById('termsCheck').checked) {
        showToast('⚠️ Please agree to the Terms & Privacy Policy');
        return;
    }

    const btn = document.getElementById('registerBtn');
    btn.classList.add('loading');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';

    try {
        await auth.register({ name, email, phone, password: pw });

        btn.classList.remove('loading');
        btn.classList.add('success');
        btn.innerHTML = '<i class="fas fa-check"></i> Account created!';
        showToast(`🎉 Welcome to Sabroso, ${name}!`);

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } catch (error) {
        btn.classList.remove('loading');
        btn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
        showToast(`❌ ${error.message}`);
    }
}

// ── SOCIAL LOGIN ──
function socialLogin(provider) {
    showToast(`🔗 ${provider} login coming soon!`);
}

// ── CLEAR ERROR ON FOCUS ──
document.querySelectorAll('.input-group input').forEach(inp => {
    inp.addEventListener('focus', () => inp.classList.remove('error'));
});

// ── TOAST ──
let toastTimer;
function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}
