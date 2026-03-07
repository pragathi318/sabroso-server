const API_BASE_URL = 'https://sabroso-server.onrender.com/api';

/**
 * Common fetch wrapper with Auth header support
 */
async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('sabroso_token');

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...(options.headers || {})
        }
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, mergedOptions);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * Auth Helpers
 */
const auth = {
    async login(email, password) {
        const data = await apiFetch('/users/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        // Save to local storage
        localStorage.setItem('sabroso_token', data.token);
        localStorage.setItem('sabroso_user', JSON.stringify({
            _id: data._id,
            name: data.name,
            email: data.email,
            role: data.role
        }));

        return data;
    },

    async register(userData) {
        const data = await apiFetch('/users/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        localStorage.setItem('sabroso_token', data.token);
        localStorage.setItem('sabroso_user', JSON.stringify({
            _id: data._id,
            name: data.name,
            email: data.email,
            role: data.role
        }));

        return data;
    },

    logout() {
        localStorage.removeItem('sabroso_token');
        localStorage.removeItem('sabroso_user');
        window.location.href = 'login.html';
    },

    getUser() {
        const user = localStorage.getItem('sabroso_user');
        return user ? JSON.parse(user) : null;
    },

    isAdmin() {
        const user = this.getUser();
        return user && user.role === 'admin';
    }
};
