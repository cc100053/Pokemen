import { PROFILE_STORAGE_KEY_BASE, DEFAULT_AVATAR_SRC } from './config.js';

export const state = {
    token: null,
    currentUserId: '',
    currentView: 'login',
    activeTab: 'top-page-view',
    interviewId: null,
    chatHistory: [],
    interviewHistory: [],
    currentMode: 'training',
    controlsDisabled: true,
    isRecording: false,
    dashboardStats: null,
    historyFilter: 'all',
    profile: null,
};

export function getProfileStorageKey(userId = '') {
    const trimmed = typeof userId === 'string' ? userId.trim() : '';
    return trimmed ? `${PROFILE_STORAGE_KEY_BASE}:${trimmed}` : PROFILE_STORAGE_KEY_BASE;
}

export function getDefaultProfile() {
    return {
        name: '',
        email: '',
        status: '書類選考',
        role: '',
        notes: '',
        avatarData: DEFAULT_AVATAR_SRC,
    };
}

export function loadProfileFromStorage(userId = '') {
    try {
        const key = getProfileStorageKey(userId);
        const stored = window.localStorage.getItem(key);
        if (!stored) {
            if (!userId) {
                try {
                    const legacy = window.localStorage.getItem(PROFILE_STORAGE_KEY_BASE);
                    if (legacy) {
                        return { ...getDefaultProfile(), ...JSON.parse(legacy) };
                    }
                } catch (legacyError) {
                    console.warn('Failed to parse legacy profile', legacyError);
                }
            }
            return getDefaultProfile();
        }
        const parsed = JSON.parse(stored);
        const profile = { ...getDefaultProfile(), ...parsed };
        profile.avatarData = profile.avatarData || DEFAULT_AVATAR_SRC;
        return profile;
    } catch (error) {
        console.warn('Failed to load profile from storage', error);
        return getDefaultProfile();
    }
}

export function saveProfileToStorage(profile, userId = '') {
    try {
        const key = getProfileStorageKey(userId);
        window.localStorage.setItem(key, JSON.stringify(profile));
        if (userId) {
            window.localStorage.removeItem(PROFILE_STORAGE_KEY_BASE);
        }
    } catch (error) {
        console.warn('Failed to save profile to storage', error);
    }
}

// Initialize profile
state.profile = loadProfileFromStorage();

// Helper to get/set mode from UI elements (will be passed in or managed via state)
// Note: In the original code, these accessed DOM elements directly. 
// We should try to decouple state from DOM, but for now we might need to pass elements or keep this logic in UI layer.
// However, the plan put them here. Let's keep them here but make them safer or move to UI.
// Actually, `getSelectedModeValue` reads from DOM. It should probably be in a UI helper or we should sync DOM to state.
// For now, I will implement them to read from DOM but we need to import the elements or query them.
// To avoid circular dependency with UI, let's keep them in a UI-specific file or pass the elements.
// Better yet, let's move `getSelectedModeValue` and `setSelectedModeValue` to `ui/core.js` or `ui/interview.js` as they interact with DOM.
// But the plan said `state.js`. I will deviate slightly and put DOM-accessing functions in `ui/core.js` or `ui/interview.js` to keep `state.js` pure.
// Wait, `state.currentMode` tracks this.
// Let's add a helper to update state mode.

export function setMode(mode) {
    state.currentMode = mode;
}
