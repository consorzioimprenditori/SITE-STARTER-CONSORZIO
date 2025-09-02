// ============================================
// APP.JS - Inizializzazione Principale
// ============================================

const APP_STATE = {
    currentUser: null,
    currentSection: 'login',
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    consultations: {},
    notifications: [],
    messages: [],
    announcements: [],
    conventions: [],
    magazines: [],
    profiles: {},
    members: [],
    events: [
        { id: 1, title: 'Riunione mensile Consorzio', date: '2025-01-15', time: '15:00', location: 'Sede Rimini' },
        { id: 2, title: 'Workshop Marketing Digitale', date: '2025-01-22', time: '10:00', location: 'Online' },
        { id: 3, title: 'Assemblea Soci', date: '2025-02-05', time: '18:00', location: 'Sede Pesaro' }
    ]
};

// App Initialization
function initApp() {
    try {
        console.log('🚀 Consorzio Imprenditori App v2.0 - Starting...');
        
        // Load saved state
        loadStoredData();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize notifications
        simulateNotifications();
        
        // Check if user was logged in
        if (APP_STATE.currentUser && APP_STATE.currentUser.email) {
            const sessionAge = Date.now() - (APP_STATE.currentUser.loginTime || 0);
            
            if (sessionAge < CONFIG.storage.sessionTimeout) {
                Auth.showDashboard();
            } else {
                APP_STATE.currentUser = null;
                saveState();
                Utils.showToast('⏰ Sessione scaduta, accedi di nuovo', 'info');
            }
        }
        
        console.log('✅ App ready and running!');
    } catch (error) {
        console.error('Init error:', error);
    }
}

// Load stored data
function loadStoredData() {
    const stored = Utils.loadFromStorage(CONFIG.storage.stateKey);
    if (stored) {
        Object.assign(APP_STATE, stored);
    }
}

// Save application state
function saveState() {
    return Utils.saveToStorage(CONFIG.storage.stateKey, APP_STATE);
}

// Setup global event listeners
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', Auth.handleLogin);
    }
    
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', (e) => Auth.switchTab(e));
    });
    
    // Global search
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
        globalSearch.addEventListener('input', (e) => {
            if (e.target.value.length > 2) {
                Utils.showToast(`Ricerca: ${e.target.value}`, 'success');
            }
        });
    }
    
    // Prevent form resubmission on page refresh
    if (window.history.replaceState) {
        window.history.replaceState(null, null, window.location.href);
    }
    
    // Clean up on page unload
    window.addEventListener('beforeunload', function() {
        if (window.notificationInterval) {
            clearInterval(window.notificationInterval);
        }
        if (APP_STATE.currentUser) {
            saveState();
        }
    });
}

// Simulate notifications (for testing)
function simulateNotifications() {
    if (!window.notificationInterval) {
        window.notificationInterval = setInterval(() => {
            if (APP_STATE.currentUser && Math.random() > 0.98) {
                APP_STATE.notifications.push({
                    id: Date.now(),
                    title: 'Nuova notifica',
                    message: 'Hai un nuovo aggiornamento',
                    read: false,
                    timestamp: new Date().toISOString()
                });
                Dashboard.updateStats();
                Utils.showToast('🔔 Nuova notifica!', 'info');
            }
        }, CONFIG.notifications.checkInterval);
    }
}

// Navigation functions
function showSection(sectionId) {
    document.querySelectorAll('.section, #dashboard').forEach(el => {
        el.classList.remove('active');
    });
    const section = document.getElementById(sectionId);
    if (section) section.classList.add('active');
}

function goBack() {
    showSection('dashboard');
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initApp);