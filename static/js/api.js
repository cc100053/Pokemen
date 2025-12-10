import { API_BASE } from './config.js';
import { state } from './state.js';
import { setStatus } from './ui/core.js'; // We will create this.

export async function apiRequest(path, options = {}) {
    const { skipStatus = false, statusMessage, ...rest } = options;
    const headers = rest.headers ? { ...rest.headers } : {};
    if (!headers['Content-Type'] && !(rest.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    if (state.token) {
        headers['Authorization'] = `Bearer ${state.token}`;
    }
    const fetchOptions = { ...rest, headers };
    if (!skipStatus) {
        setStatus(statusMessage || '処理中です…', true);
    }
    try {
        const response = await fetch(`${API_BASE}${path}`, fetchOptions);
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.detail || response.statusText);
        }
        if (response.status === 204) {
            return null;
        }
        return await response.json();
    } finally {
        if (!skipStatus) {
            setStatus('', false);
        }
    }
}

export async function login(userId, password) {
    return apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ userId, password }),
        statusMessage: 'ログインしています…',
    });
}

export async function signup(userId, password) {
    return apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ userId, password }),
        statusMessage: 'アカウントを作成しています…',
    });
}

export async function fetchProfile() {
    return apiRequest('/profile', {
        method: 'GET',
        statusMessage: 'プロフィールを取得しています…',
    });
}

export async function updateProfile(profile) {
    return apiRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
        statusMessage: 'プロフィールを保存しています…',
    });
}
