// ============================================
// APP.JS - Inizializzazione Principale COMPLETA
// ============================================

const APP_STATE = {
    currentUser: null,
    currentSection: 'login',
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    notifications: [],
    messages: [],
    announcements: [],
    conventions: [],
    magazines: [],
    profiles: {},
    members: [],
    events: [
        { 
            id: 1, 
            title: 'Riunione Mensile Consorzio', 
            date: '2025-09-10', 
            time: '15:00', 
            location: 'Sede Rimini',
            category: 'meeting',
            visibility: { membri: { all: true }, consulenti: { all: true } }
        },
        { 
            id: 2, 
            title: 'Riunione Mensile - Area Pesaro', 
            date: '2025-09-15', 
            time: '10:00', 
            location: 'Sede Pesaro',
            category: 'meeting',
            visibility: { membri: { all: false, circuits: ['Pesaro'] }, consulenti: { all: false, circuits: ['Pesaro'] } }
        },
        { 
            id: 3, 
            title: 'Assemblea Generale Soci', 
            date: '2025-09-25', 
            time: '18:00', 
            location: 'Sede Ancona',
            category: 'meeting',
            visibility: { membri: { all: true }, consulenti: { all: false } }
        }
    ],
    consultations: [
        {
            id: 'CONS_DEMO_001',
            memberId: 'mario.rossi@azienda.it',
            memberEmail: 'mario.rossi@azienda.it',
            memberName: 'Mario Rossi',
            consultantId: 'CONS001',
            consultantEmail: 'marco.verdi@studio.it',
            consultantName: 'Dott. Marco Verdi',
            specialty: 'Finanza agevolata',
            date: '2025-09-08',
            time: '10:00',
            mode: 'office',
            location: 'Ufficio - Via Roma 123, Rimini',
            description: 'Consulenza su bandi e finanziamenti regionali',
            status: 'confirmed',
            createdAt: '2025-01-01T10:00:00Z'
        },
        {
            id: 'CONS_DEMO_002',
            memberId: 'info@impresa.it',
            memberEmail: 'info@impresa.it',
            memberName: 'Laura Bianchi',
            consultantId: 'CONS002',
            consultantEmail: 'sara.neri@legale.it',
            consultantName: 'Avv. Sara Neri',
            specialty: 'Consulenza legale d\'impresa',
            date: '2025-09-12',
            time: '14:00',
            mode: 'online',
            location: 'Online - Link verrà inviato via email',
            description: 'Revisione contratti commerciali',
            status: 'pending',
            createdAt: '2025-01-02T10:00:00Z'
        },
        {
            id: 'CONS_DEMO_003',
            memberId: 'giuseppe.verdi@tech.it',
            memberEmail: 'giuseppe.verdi@tech.it',
            memberName: 'Giuseppe Verdi',
            consultantId: 'CONS003',
            consultantEmail: 'paolo.bianchi@tech.it',
            consultantName: 'Ing. Paolo Bianchi',
            specialty: 'Cyber sicurezza',
            date: '2025-09-18',
            time: '16:00',
            mode: 'office',
            location: 'Ufficio - Via Dante 45, Ancona',
            description: 'Audit sicurezza informatica aziendale',
            status: 'confirmed',
            createdAt: '2025-01-03T10:00:00Z'
        }
    ],
    consultants: null // Will be initialized by Consultations.init()
};

// App Initialization
function initApp() {
    try {
        console.log('🚀 Consorzio Imprenditori App v2.0 - Starting...');
        
        // Load saved state
        loadStoredData();
        
        // Initialize modules
        initializeModules();
        
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
        
        // Add demo consultations for testing
        addDemoDataIfNeeded();
        
        console.log('✅ App ready and running!');
    } catch (error) {
        console.error('Init error:', error);
        Utils.showToast('⚠️ Errore durante l\'inizializzazione', 'error');
    }
}

// Initialize modules
function initializeModules() {
    // Initialize Calendar if exists
    if (typeof Calendar !== 'undefined' && Calendar.init) {
        Calendar.init();
    }
    
    // Initialize Consultations if exists
    if (typeof Consultations !== 'undefined' && Consultations.init) {
        Consultations.init();
    }
    
    // Initialize EventsManager if exists
    if (typeof EventsManager !== 'undefined' && EventsManager.init) {
        EventsManager.init();
    }
}

// Load stored data
function loadStoredData() {
    const stored = Utils.loadFromStorage(CONFIG.storage.stateKey);
    if (stored) {
        // Merge stored data with default state
        Object.keys(stored).forEach(key => {
            if (stored[key] !== null && stored[key] !== undefined) {
                APP_STATE[key] = stored[key];
            }
        });
    }
}

// Save application state
function saveState() {
    try {
        return Utils.saveToStorage(CONFIG.storage.stateKey, APP_STATE);
    } catch (error) {
        console.error('Error saving state:', error);
        return false;
    }
}

// Add demo data if needed (for testing)
function addDemoDataIfNeeded() {
    // Add demo members if none exist
    if (!APP_STATE.members || APP_STATE.members.length === 0) {
        APP_STATE.members = [
            {
                id: 'MEM001',
                name: 'Mario Rossi',
                email: 'mario.rossi@azienda.it',
                company: 'Rossi S.r.l.',
                status: 'active',
                contractEnd: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
                area: 'Rimini',
                circuit: 'Rimini'
            },
            {
                id: 'MEM002',
                name: 'Laura Bianchi',
                email: 'info@impresa.it',
                company: 'Impresa Bianchi',
                status: 'active',
                contractEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                area: 'Pesaro',
                circuit: 'Pesaro'
            },
            {
                id: 'MEM003',
                name: 'Giuseppe Verdi',
                email: 'giuseppe.verdi@tech.it',
                company: 'Tech Solutions',
                status: 'active',
                contractEnd: new Date(Date.now() + 270 * 24 * 60 * 60 * 1000),
                area: 'Ancona',
                circuit: 'Ancona'
            }
        ];
    }
    
    // Set consultant data if not exists
    if (!APP_STATE.consultants) {
        APP_STATE.consultants = [
            {
                id: 'CONS001',
                name: 'Dott. Marco Verdi',
                email: 'marco.verdi@studio.it',
                specialty: 'Finanza agevolata',
                available: true,
                circuit: 'Rimini'
            },
            {
                id: 'CONS002',
                name: 'Avv. Sara Neri',
                email: 'sara.neri@legale.it',
                specialty: 'Consulenza legale d\'impresa',
                available: true,
                circuit: 'Rimini'
            },
            {
                id: 'CONS003',
                name: 'Ing. Paolo Bianchi',
                email: 'paolo.bianchi@tech.it',
                specialty: 'Cyber sicurezza',
                available: true,
                circuit: 'Ancona'
            },
            {
                id: 'CONS004',
                name: 'Dott.ssa Laura Rossi',
                email: 'laura.rossi@lavoro.it',
                specialty: 'Consulenza del lavoro',
                available: true,
                circuit: 'Pesaro'
            }
        ];
    }
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
    
    // Global search (if exists)
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
        globalSearch.addEventListener('input', (e) => {
            if (e.target.value.length > 2) {
                handleGlobalSearch(e.target.value);
            }
        });
    }
    
    // Prevent form resubmission on page refresh
    if (window.history.replaceState) {
        window.history.replaceState(null, null, window.location.href);
    }
    
    // Handle keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Clean up on page unload
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Handle window resize
    window.addEventListener('resize', handleWindowResize);
}

// Handle global search
function handleGlobalSearch(searchTerm) {
    console.log('Searching for:', searchTerm);
    Utils.showToast(`🔍 Ricerca: ${searchTerm}`, 'info');
    
    // Here you could implement actual search logic
    // searching through members, events, consultations, etc.
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(event) {
    // ESC to close modals
    if (event.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            activeModal.classList.remove('active');
        }
    }
    
    // Ctrl/Cmd + K for quick search (if implemented)
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.focus();
        }
    }
}

// Handle before unload
function handleBeforeUnload() {
    // Clear notification interval
    if (window.notificationInterval) {
        clearInterval(window.notificationInterval);
        window.notificationInterval = null;
    }
    
    // Save current state
    if (APP_STATE.currentUser) {
        saveState();
    }
}

// Handle window resize
function handleWindowResize() {
    // Could be used to adjust layout for mobile/tablet
    const width = window.innerWidth;
    if (width < 768) {
        document.body.classList.add('mobile-view');
    } else {
        document.body.classList.remove('mobile-view');
    }
}

// Simulate notifications (for testing/demo)
function simulateNotifications() {
    if (!window.notificationInterval) {
        window.notificationInterval = setInterval(() => {
            if (APP_STATE.currentUser && Math.random() > 0.98) {
                const notifications = [
                    { title: 'Nuova consulenza disponibile', message: 'Un nuovo consulente è disponibile per appuntamenti' },
                    { title: 'Evento in programma', message: 'Hai un evento domani alle 15:00' },
                    { title: 'Messaggio ricevuto', message: 'Hai ricevuto un nuovo messaggio nella chat' },
                    { title: 'Promemoria', message: 'Ricorda di confermare la tua partecipazione all\'evento' },
                    { title: 'Aggiornamento sistema', message: 'Nuove funzionalità disponibili nel sistema' }
                ];
                
                const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
                
                APP_STATE.notifications.push({
                    id: Date.now(),
                    ...randomNotification,
                    read: false,
                    timestamp: new Date().toISOString()
                });
                
                // Update stats if dashboard is active
                if (typeof Dashboard !== 'undefined' && Dashboard.updateStats) {
                    Dashboard.updateStats();
                }
                
                Utils.showToast(`🔔 ${randomNotification.title}`, 'info');
            }
        }, CONFIG.notifications.checkInterval);
    }
}

// Navigation function - CORRETTA
function showSection(sectionId) {
    // Prima rimuovi tutti gli active e gli stili inline
    document.querySelectorAll('.section, #dashboard').forEach(el => {
        el.classList.remove('active');
        // IMPORTANTE: rimuovi eventuali stili inline che interferiscono
        el.style.removeProperty('display');
    });
    
    // Poi aggiungi active alla sezione desiderata
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.removeProperty('display'); // Assicurati che non ci siano stili inline
        section.classList.add('active');
        
        // Emit custom event for section change
        const event = new CustomEvent('sectionChanged', { 
            detail: { sectionId: sectionId } 
        });
        document.dispatchEvent(event);
    }
}

// Go back to dashboard
function goBack() {
    showSection('dashboard');
    
    // Refresh dashboard if needed
    if (typeof Dashboard !== 'undefined' && Dashboard.refresh) {
        Dashboard.refresh();
    }
}

// Utility function to get current user type
function getCurrentUserType() {
    return APP_STATE.currentUser ? APP_STATE.currentUser.type : null;
}

// Utility function to check if user is admin
function isAdmin() {
    return getCurrentUserType() === 'admin';
}

// Utility function to check if user is member
function isMember() {
    return getCurrentUserType() === 'membro';
}

// Utility function to check if user is consultant
function isConsultant() {
    return getCurrentUserType() === 'consulente';
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('it-IT', { 
        style: 'currency', 
        currency: 'EUR' 
    }).format(amount);
}

// Format percentage
function formatPercentage(value) {
    return new Intl.NumberFormat('it-IT', { 
        style: 'percent', 
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(value / 100);
}

// Get greeting based on time of day
function getGreeting() {
    const hour = new Date().getHours();
    
    if (hour < 12) {
        return 'Buongiorno';
    } else if (hour < 18) {
        return 'Buon pomeriggio';
    } else {
        return 'Buonasera';
    }
}

// Generate unique ID with prefix
function generateUniqueId(prefix = 'ID') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Deep clone object
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for performance
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Check if device is mobile
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Get device type
function getDeviceType() {
    const width = window.innerWidth;
    if (width < 576) return 'mobile';
    if (width < 768) return 'tablet';
    if (width < 1200) return 'desktop';
    return 'desktop-xl';
}

// Export functions for global use
window.APP_STATE = APP_STATE;
window.saveState = saveState;
window.showSection = showSection;
window.goBack = goBack;
window.getCurrentUserType = getCurrentUserType;
window.isAdmin = isAdmin;
window.isMember = isMember;
window.isConsultant = isConsultant;
window.formatCurrency = formatCurrency;
window.formatPercentage = formatPercentage;
window.getGreeting = getGreeting;
window.generateUniqueId = generateUniqueId;
window.deepClone = deepClone;
window.debounce = debounce;
window.throttle = throttle;
window.isMobile = isMobile;
window.getDeviceType = getDeviceType;

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM is already loaded
    initApp();
}