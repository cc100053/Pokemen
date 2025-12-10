import { state, loadProfileFromStorage, getDefaultProfile, saveProfileToStorage } from '../state.js';
import { login, signup, fetchProfile } from '../api.js';
import { renderProfile } from './profile.js';
import { showToast, scrollToTop } from './core.js';
// import { refreshHistory } from './dashboard.js'; // Injected
// import { resetInterviewState } from './interview.js'; // Injected
import { PROFILE_STORAGE_KEY_BASE } from '../config.js';

let refreshHistory = async () => { };
let resetInterviewState = () => { };

export function setAuthDependencies(deps) {
    if (deps.refreshHistory) refreshHistory = deps.refreshHistory;
    if (deps.resetInterviewState) resetInterviewState = deps.resetInterviewState;
}

export async function handleAuth(event) {
    event.preventDefault();
    const loginErrorAlert = document.getElementById('login-error-alert');
    const loginErrorText = document.getElementById('login-error-text');
    const signupErrorAlert = document.getElementById('signup-error-alert');
    const signupErrorText = document.getElementById('signup-error-text');

    if (loginErrorAlert) {
        loginErrorAlert.classList.add('hidden');
    }
    if (signupErrorAlert) {
        signupErrorAlert.classList.add('hidden');
    }
    const form = event.target;
    const formData = new FormData(form);
    const userId = formData.get('userId');
    const password = formData.get('password');

    try {
        let data;
        if (form.id === 'signup-form') {
            data = await signup(userId, password);
        } else {
            data = await login(userId, password);
        }

        state.token = data.access_token;
        const normalizedUserId = String(userId || '').trim();
        state.currentUserId = normalizedUserId;
        state.profile = loadProfileFromStorage(state.currentUserId);
        if (state.currentUserId) {
            try {
                window.localStorage.removeItem(PROFILE_STORAGE_KEY_BASE);
            } catch (removeError) {
                console.warn('Failed to clear legacy profile cache', removeError);
            }
        }
        renderProfile();
        showToast('ログインしました。', 'info');

        try {
            const remoteProfile = await fetchProfile();
            state.profile = remoteProfile;
            saveProfileToStorage(remoteProfile, state.currentUserId);
            renderProfile();
        } catch (profileError) {
            console.warn('Failed to fetch profile from API, using local cache', profileError);
        }

        // Switch view
        document.dispatchEvent(new CustomEvent('request-switch-view', { detail: { viewName: 'app' } }));
        document.dispatchEvent(new CustomEvent('request-switch-tab', { detail: { tabId: 'top-page-view' } }));

        if (window?.history?.replaceState) {
            window.history.replaceState(null, '', window.location.pathname);
        }
        try {
            await refreshHistory();
        } catch (historyError) {
            console.warn('Failed to load interview history', historyError);
        }
    } catch (error) {
        if (form.id === 'login-form' && loginErrorAlert && loginErrorText) {
            const fallbackMessage = 'ユーザーIDまたはパスワードが正しくありません。';
            const normalizedMessage = error?.message?.includes('Invalid user ID or password')
                ? fallbackMessage
                : (error?.message || fallbackMessage);
            loginErrorText.textContent = normalizedMessage;
            loginErrorAlert.classList.remove('hidden');
        } else if (form.id === 'signup-form' && signupErrorAlert && signupErrorText) {
            const fallbackMessage = 'このユーザーIDは既に使用されています。';
            const normalizedMessage = /already/i.test(error?.message || '')
                ? fallbackMessage
                : (error?.message || fallbackMessage);
            signupErrorText.textContent = normalizedMessage;
            signupErrorAlert.classList.remove('hidden');
        } else {
            showToast(error.message || '登録に失敗しました。', 'error');
        }
    }
}

export function logout() {
    state.token = null;
    state.currentUserId = '';
    state.profile = getDefaultProfile();
    renderProfile();
    state.interviewHistory = [];
    state.dashboardStats = null;
    state.historyFilter = 'all';
    const menuOverlay = document.getElementById('menu-overlay');
    const menuPanel = document.getElementById('menu-panel');
    if (menuOverlay) menuOverlay.classList.add('hidden');
    if (menuPanel) menuPanel.classList.add('translate-x-full');

    resetInterviewState();
    document.dispatchEvent(new CustomEvent('request-switch-view', { detail: { viewName: 'login' } }));
    showToast('ログアウトしました。', 'info');
}

export function initialiseAuthTabs() {
    const loginBtn = document.getElementById('switch-to-login');
    const signupBtn = document.getElementById('switch-to-signup');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            loginBtn.classList.add('active-tab');
            signupBtn.classList.remove('active-tab');
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
        });
    }

    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            signupBtn.classList.add('active-tab');
            loginBtn.classList.remove('active-tab');
            signupForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        });
    }
}
