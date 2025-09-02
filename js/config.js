// ============================================
// CONFIG.JS - Configurazione Globale
// ============================================

const CONFIG = {
    appName: 'Consorzio Imprenditori',
    version: '2.0.0',
    
    // API Endpoints (quando aggiungerai backend)
    api: {
        baseUrl: '', // es: 'https://api.consorzio.it'
        timeout: 10000
    },
    
    // Storage Keys
    storage: {
        stateKey: 'consorzioAppState',
        userKey: 'consorzioUser',
        sessionTimeout: 7 * 24 * 60 * 60 * 1000 // 7 giorni
    },
    
    // Notification Settings
    notifications: {
        checkInterval: 30000, // 30 secondi
        maxNotifications: 50
    },
    
    // Consultations Settings
    consultations: {
        maxFree: 10,
        modificationDeadline: 24 // ore prima dell'appuntamento
    },
    
    // Contact Info
    contacts: {
        email: 'consorzioimprenditori@gmail.com',
        phone: '329-200-5433',
        whatsapp: '3292005433'
    },
    
    // Specializzazioni Consulenti
    consultantSpecialties: [
        'Finanza agevolata',
        'Gestione contabile e Tributaria',
        'Internazionalizzazione d\'impresa',
        'Consulenza del lavoro',
        'Formazione finanziata',
        'Medicina del lavoro',
        'Igiene e sicurezza sui luoghi di lavoro',
        'Antincendio segnaletica aziendale',
        'Sicurezza nei cantieri edili',
        'Soluzioni software gestionali di alta gamma',
        'Laboratorio test per prodotti elettrici ed elettronici',
        'Consulenza tecnica per sicurezza macchinari',
        'Cyber sicurezza',
        'Noleggio stampanti',
        'Consulenza legale d\'impresa',
        'Reti telefoniche e telecomunicazioni',
        'Gruppo d\'acquisto energetico',
        'Efficientamento energetico',
        'Noleggio veicoli a breve e lungo termine'
    ]
};

// Freeze config per sicurezza
Object.freeze(CONFIG);