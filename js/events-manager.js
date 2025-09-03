// ============================================
// EVENTS-MANAGER.JS - Gestione Eventi con PARTECIPAZIONE MEMBRI
// ============================================

const EventsManager = {
    // Initialize
    init() {
        console.log('EventsManager inizializzato');
        
        if (!APP_STATE.events) {
            APP_STATE.events = [];
        }
        
        // Inizializza array per partecipazioni e valutazioni se non esistono
        if (!APP_STATE.eventParticipations) {
            APP_STATE.eventParticipations = [];
        }
        
        if (!APP_STATE.eventRatings) {
            APP_STATE.eventRatings = [];
        }
        
        // Crea eventi di esempio se non esistono
        if (APP_STATE.events.length === 0) {
            this.createSampleEvents();
        }
    },
    
    // Create sample events
    createSampleEvents() {
        APP_STATE.events = [
            {
                id: 'EVT001',
                title: 'Riunione Mensile Consorzio',
                date: '2025-09-05',
                time: '15:00',
                location: 'Sede Rimini',
                notes: 'Portare documenti Q3',
                visibility: {
                    membri: { all: true, circuits: [] },
                    consulenti: { all: true, circuits: [] }
                }
            },
            {
                id: 'EVT002',
                title: 'Assemblea Zona Ancona',
                date: '2025-09-20',
                time: '18:00',
                location: 'Sede Ancona',
                notes: 'Solo per membri zona Ancona',
                visibility: {
                    membri: { all: false, circuits: ['Ancona'] },
                    consulenti: { all: false, circuits: ['Ancona'] }
                }
            },
            {
                id: 'EVT003',
                title: 'Workshop Marketing Digitale',
                date: '2025-01-15',
                time: '10:00',
                location: 'Sede Rimini',
                notes: 'Evento passato per test valutazione',
                visibility: {
                    membri: { all: true, circuits: [] },
                    consulenti: { all: true, circuits: [] }
                }
            }
        ];
        saveState();
    },

    // Show events manager
    showEventsManager() {
        if (!document.getElementById('eventsManagerSection')) {
            this.createEventsSection();
        }
        
        if (typeof showSection === 'function') {
            showSection('eventsManagerSection');
        } else {
            // Fallback
            document.querySelectorAll('.section, #dashboard').forEach(el => {
                el.classList.remove('active');
            });
            const section = document.getElementById('eventsManagerSection');
            if (section) {
                section.classList.add('active');
            }
        }
        
        this.loadEventsList();
    },
    
    // Create events section
    createEventsSection() {
        const sectionsContainer = document.getElementById('sectionsContainer');
        if (!sectionsContainer) return;
        
        const section = document.createElement('div');
        section.id = 'eventsManagerSection';
        section.className = 'section';
        
        // Contenuto diverso per admin e membri
        const currentUser = APP_STATE.currentUser;
        
        if (currentUser && currentUser.type === 'admin') {
            // ADMIN VIEW - INVARIATO
            section.innerHTML = `
                <div class="section-header">
                    <button class="back-btn" onclick="goBack()">← Indietro</button>
                    <h2>📌 Lista Eventi</h2>
                </div>
                
                <div style="text-align: center; margin: 20px 0;">
                    <button class="btn btn-primary" onclick="EventsManager.openCreateModal()">
                        ➕ CREA NUOVO EVENTO
                    </button>
                </div>
                
                <!-- Tab per admin per vedere partecipazioni -->
                <div class="tabs" style="margin: 20px 0;">
                    <button class="tab active" onclick="EventsManager.showAdminTab('events')">
                        <span>Eventi</span>
                    </button>
                    <button class="tab" onclick="EventsManager.showAdminTab('participations')">
                        <span>Partecipazioni (${this.getParticipationsCount()})</span>
                    </button>
                    <button class="tab" onclick="EventsManager.showAdminTab('ratings')">
                        <span>Valutazioni (${this.getRatingsCount()})</span>
                    </button>
                </div>
                
                <div id="eventsList" style="margin-top: 20px;">
                    <div class="loading">Caricamento eventi...</div>
                </div>
            `;
        } else if (currentUser && currentUser.type === 'membro') {
            // MEMBER VIEW - NUOVO
            section.innerHTML = `
                <div class="section-header">
                    <button class="back-btn" onclick="goBack()">← Indietro</button>
                    <h2 style="color: #c7ff00;">📌 Eventi del Consorzio</h2>
                </div>
                
                <!-- Tab per eventi futuri e passati -->
                <div class="tabs" style="margin: 20px 0; background: rgba(30, 30, 46, 0.9);">
                    <button class="tab active" onclick="EventsManager.showMemberTab('future')">
                        <span>Prossimi Eventi</span>
                    </button>
                    <button class="tab" onclick="EventsManager.showMemberTab('past')">
                        <span>Eventi Passati</span>
                    </button>
                </div>
                
                <div id="eventsList" style="margin-top: 20px;">
                    <div class="loading" style="color: #c7ff00;">Caricamento eventi...</div>
                </div>
            `;
        } else {
            // CONSULTANT VIEW
            section.innerHTML = `
                <div class="section-header">
                    <button class="back-btn" onclick="goBack()">← Indietro</button>
                    <h2>📌 Lista Eventi</h2>
                </div>
                
                <div id="eventsList" style="margin-top: 20px;">
                    <div class="loading">Caricamento eventi...</div>
                </div>
            `;
        }
        
        sectionsContainer.appendChild(section);
        this.addEventStyles();
    },
    
    // Add event-specific styles with dark theme and green accents
    addEventStyles() {
        if (document.getElementById('eventManagerStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'eventManagerStyles';
        style.textContent = `
            /* STILI PER AREA MEMBRI - FONDO SCURO E VERDE FLUO */
            .event-card-member {
                background: linear-gradient(135deg, rgba(30, 30, 46, 0.95) 0%, rgba(42, 42, 62, 0.9) 100%);
                border-radius: 16px;
                padding: 25px;
                margin-bottom: 20px;
                border: 1px solid rgba(199, 255, 0, 0.2);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                transition: all 0.3s ease;
            }
            
            .event-card-member:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 25px rgba(199, 255, 0, 0.15);
                border-color: #c7ff00;
            }
            
            .event-card-member h3 {
                color: #c7ff00;
                margin-bottom: 15px;
                font-size: 20px;
                text-shadow: 0 0 10px rgba(199, 255, 0, 0.3);
            }
            
            .event-info-row {
                display: flex;
                gap: 20px;
                margin: 10px 0;
                color: #ffffff;
                font-size: 14px;
            }
            
            .event-info-row span {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            /* PULSANTI PARTECIPAZIONE */
            .participation-section {
                background: rgba(199, 255, 0, 0.05);
                border-radius: 12px;
                padding: 20px;
                margin-top: 20px;
                border: 1px solid rgba(199, 255, 0, 0.1);
            }
            
            .participation-buttons {
                display: flex;
                gap: 15px;
                margin-bottom: 15px;
            }
            
            .btn-participate {
                flex: 1;
                padding: 12px 20px;
                border: 2px solid transparent;
                border-radius: 10px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                text-transform: uppercase;
                font-size: 14px;
            }
            
            .btn-participate.yes {
                background: linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.1) 100%);
                color: #4caf50;
                border-color: rgba(76, 175, 80, 0.3);
            }
            
            .btn-participate.yes:hover,
            .btn-participate.yes.selected {
                background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
                color: white;
                box-shadow: 0 5px 20px rgba(76, 175, 80, 0.4);
                transform: translateY(-2px);
            }
            
            .btn-participate.no {
                background: linear-gradient(135deg, rgba(255, 68, 68, 0.2) 0%, rgba(255, 68, 68, 0.1) 100%);
                color: #ff4444;
                border-color: rgba(255, 68, 68, 0.3);
            }
            
            .btn-participate.no:hover,
            .btn-participate.no.selected {
                background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
                color: white;
                box-shadow: 0 5px 20px rgba(255, 68, 68, 0.4);
                transform: translateY(-2px);
            }
            
            .participation-note {
                margin-top: 15px;
            }
            
            .participation-note textarea {
                width: 100%;
                min-height: 80px;
                background: rgba(42, 42, 62, 0.8);
                border: 1px solid rgba(199, 255, 0, 0.2);
                border-radius: 10px;
                padding: 12px;
                color: #ffffff;
                font-size: 14px;
                resize: vertical;
                transition: all 0.3s;
            }
            
            .participation-note textarea:focus {
                outline: none;
                border-color: #c7ff00;
                box-shadow: 0 0 0 3px rgba(199, 255, 0, 0.1);
            }
            
            .participation-note textarea::placeholder {
                color: #666;
            }
            
            /* SISTEMA VALUTAZIONE STELLINE */
            .rating-section {
                background: rgba(199, 255, 0, 0.05);
                border-radius: 12px;
                padding: 20px;
                margin-top: 20px;
                border: 1px solid rgba(199, 255, 0, 0.1);
            }
            
            .rating-title {
                color: #c7ff00;
                margin-bottom: 15px;
                font-size: 16px;
                font-weight: 600;
            }
            
            .stars-container {
                display: flex;
                gap: 10px;
                margin-bottom: 15px;
                font-size: 32px;
            }
            
            .star {
                cursor: pointer;
                transition: all 0.2s;
                filter: grayscale(100%);
                opacity: 0.3;
            }
            
            .star:hover {
                transform: scale(1.2);
                filter: grayscale(0%);
                opacity: 1;
            }
            
            .star.filled {
                filter: grayscale(0%);
                opacity: 1;
                animation: starPop 0.3s ease;
            }
            
            @keyframes starPop {
                0% { transform: scale(1); }
                50% { transform: scale(1.3); }
                100% { transform: scale(1.1); }
            }
            
            .feedback-textarea {
                width: 100%;
                min-height: 100px;
                background: rgba(42, 42, 62, 0.8);
                border: 1px solid rgba(199, 255, 0, 0.2);
                border-radius: 10px;
                padding: 12px;
                color: #ffffff;
                font-size: 14px;
                resize: vertical;
                margin-bottom: 15px;
            }
            
            .feedback-textarea:focus {
                outline: none;
                border-color: #c7ff00;
                box-shadow: 0 0 0 3px rgba(199, 255, 0, 0.1);
            }
            
            .btn-save-participation {
                background: linear-gradient(135deg, #c7ff00 0%, #a8e000 100%);
                color: #1e1e2e;
                border: none;
                padding: 12px 30px;
                border-radius: 10px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                text-transform: uppercase;
                box-shadow: 0 5px 20px rgba(199, 255, 0, 0.3);
            }
            
            .btn-save-participation:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 30px rgba(199, 255, 0, 0.4);
            }
            
            .btn-save-participation:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            /* BADGE STATO PARTECIPAZIONE */
            .participation-status {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                margin-top: 10px;
            }
            
            .participation-status.confirmed {
                background: rgba(76, 175, 80, 0.2);
                color: #4caf50;
                border: 1px solid rgba(76, 175, 80, 0.3);
            }
            
            .participation-status.declined {
                background: rgba(255, 68, 68, 0.2);
                color: #ff4444;
                border: 1px solid rgba(255, 68, 68, 0.3);
            }
            
            .participation-status.pending {
                background: rgba(255, 152, 0, 0.2);
                color: #ff9800;
                border: 1px solid rgba(255, 152, 0, 0.3);
            }
            
            /* ADMIN PARTICIPATION VIEW */
            .participation-list-card {
                background: rgba(42, 42, 62, 0.9);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 15px;
                border: 1px solid rgba(199, 255, 0, 0.1);
            }
            
            .participation-member-name {
                color: #c7ff00;
                font-weight: 600;
                margin-bottom: 8px;
            }
            
            .participation-response {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 8px;
            }
            
            .participation-note-display {
                background: rgba(30, 30, 46, 0.8);
                padding: 10px;
                border-radius: 8px;
                color: #aaa;
                font-style: italic;
                margin-top: 8px;
            }
            
            /* TAB ATTIVE */
            .tabs .tab.active {
                background: linear-gradient(135deg, #c7ff00 0%, #a8e000 100%);
                color: #1e1e2e;
            }
        `;
        document.head.appendChild(style);
    },
    
    // Load events list - MODIFICATO PER MEMBRI
    loadEventsList() {
        const container = document.getElementById('eventsList');
        if (!container) return;
        
        const currentUser = APP_STATE.currentUser;
        
        if (currentUser && currentUser.type === 'admin') {
            // Admin view - mantieni originale
            this.loadAdminEventsList();
        } else if (currentUser && currentUser.type === 'membro') {
            // Member view - nuova
            this.loadMemberEventsList('future');
        } else {
            // Consultant view
            this.loadConsultantEventsList();
        }
    },
    
    // NUOVA FUNZIONE: Load member events list
    loadMemberEventsList(type = 'future') {
        const container = document.getElementById('eventsList');
        if (!container) return;
        
        let events = APP_STATE.events || [];
        const currentUser = APP_STATE.currentUser;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Filter by visibility
        events = events.filter(event => this.isEventVisibleToUser(event));
        
        // Filter by time (future or past)
        if (type === 'future') {
            events = events.filter(event => new Date(event.date) >= today);
            events.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else {
            events = events.filter(event => new Date(event.date) < today);
            events.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        
        if (events.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; background: rgba(30, 30, 46, 0.95); border-radius: 16px; border: 1px solid rgba(199, 255, 0, 0.1);">
                    <h3 style="color: #c7ff00; margin-bottom: 10px;">
                        ${type === 'future' ? '📅 Nessun evento in programma' : '📅 Nessun evento passato'}
                    </h3>
                    <p style="color: #aaa;">
                        ${type === 'future' ? 'Non ci sono eventi futuri al momento' : 'Non ci sono eventi passati da valutare'}
                    </p>
                </div>
            `;
            return;
        }
        
        let html = '<div style="display: grid; gap: 20px;">';
        
        events.forEach(event => {
            const eventDate = new Date(event.date);
            const isPast = eventDate < today;
            const participation = this.getUserParticipation(event.id, currentUser.email);
            const rating = this.getUserRating(event.id, currentUser.email);
            
            html += `
                <div class="event-card-member">
                    <h3>
                        ${event.title}
                        ${this.isToday(eventDate) ? ' <span style="background: #ff9800; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">OGGI</span>' : ''}
                    </h3>
                    
                    <div class="event-info-row">
                        <span>📅 ${this.formatDate(event.date)}</span>
                        <span>🕐 ${event.time || 'Tutto il giorno'}</span>
                    </div>
                    
                    ${event.location ? `
                        <div class="event-info-row">
                            <span>📍 ${event.location}</span>
                        </div>
                    ` : ''}
                    
                    ${event.notes ? `
                        <div class="event-info-row">
                            <span style="color: #aaa; font-style: italic;">📝 ${event.notes}</span>
                        </div>
                    ` : ''}
                    
                    ${!isPast ? `
                        <!-- SEZIONE PARTECIPAZIONE -->
                        <div class="participation-section">
                            <div class="rating-title">La tua partecipazione:</div>
                            
                            ${participation ? `
                                <div class="participation-status ${participation.status}">
                                    ${participation.status === 'confirmed' ? '✅ Parteciperò' : '❌ Non parteciperò'}
                                </div>
                                ${participation.note ? `
                                    <div class="participation-note-display">
                                        📝 ${participation.note}
                                    </div>
                                ` : ''}
                                <button class="btn-participate" onclick="EventsManager.editParticipation('${event.id}')" style="margin-top: 10px; width: auto;">
                                    ✏️ Modifica risposta
                                </button>
                            ` : `
                                <div class="participation-buttons">
                                    <button class="btn-participate yes" onclick="EventsManager.setParticipation('${event.id}', 'confirmed', this)">
                                        ✅ PARTECIPERÒ
                                    </button>
                                    <button class="btn-participate no" onclick="EventsManager.setParticipation('${event.id}', 'declined', this)">
                                        ❌ NON PARTECIPERÒ
                                    </button>
                                </div>
                                
                                <div class="participation-note" id="note-${event.id}" style="display: none;">
                                    <textarea id="note-text-${event.id}" placeholder="Aggiungi una nota (es: arriverò in ritardo, porto un collega, ecc.)"></textarea>
                                    <button class="btn-save-participation" onclick="EventsManager.saveParticipation('${event.id}')">
                                        💾 SALVA RISPOSTA
                                    </button>
                                </div>
                            `}
                        </div>
                    ` : `
                        <!-- SEZIONE VALUTAZIONE PER EVENTI PASSATI -->
                        <div class="rating-section">
                            ${rating ? `
                                <div class="rating-title">La tua valutazione:</div>
                                <div class="stars-container">
                                    ${'⭐'.repeat(rating.stars)}${'☆'.repeat(5 - rating.stars)}
                                </div>
                                ${rating.feedback ? `
                                    <div class="participation-note-display">
                                        💬 ${rating.feedback}
                                    </div>
                                ` : ''}
                            ` : `
                                <div class="rating-title">Valuta questo evento:</div>
                                <div class="stars-container" id="stars-${event.id}">
                                    ${[1,2,3,4,5].map(i => `
                                        <span class="star" onclick="EventsManager.setRating('${event.id}', ${i})">⭐</span>
                                    `).join('')}
                                </div>
                                
                                <textarea class="feedback-textarea" id="feedback-${event.id}" 
                                    placeholder="Condividi i tuoi suggerimenti per migliorare i prossimi eventi..."></textarea>
                                
                                <button class="btn-save-participation" onclick="EventsManager.saveRating('${event.id}')">
                                    💾 INVIA VALUTAZIONE
                                </button>
                            `}
                        </div>
                    `}
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    },
    
    // NUOVE FUNZIONI PER PARTECIPAZIONE
    setParticipation(eventId, status, button) {
        // Rimuovi selezione precedente
        const buttons = button.parentElement.querySelectorAll('.btn-participate');
        buttons.forEach(btn => btn.classList.remove('selected'));
        
        // Aggiungi selezione
        button.classList.add('selected');
        
        // Mostra campo note
        const noteSection = document.getElementById(`note-${eventId}`);
        if (noteSection) {
            noteSection.style.display = 'block';
            noteSection.dataset.status = status;
        }
    },
    
    saveParticipation(eventId) {
        const noteSection = document.getElementById(`note-${eventId}`);
        const noteText = document.getElementById(`note-text-${eventId}`).value;
        const status = noteSection.dataset.status || 'pending';
        const currentUser = APP_STATE.currentUser;
        
        // Salva partecipazione
        if (!APP_STATE.eventParticipations) {
            APP_STATE.eventParticipations = [];
        }
        
        // Rimuovi partecipazione esistente se presente
        APP_STATE.eventParticipations = APP_STATE.eventParticipations.filter(
            p => !(p.eventId === eventId && p.userEmail === currentUser.email)
        );
        
        // Aggiungi nuova partecipazione
        APP_STATE.eventParticipations.push({
            id: 'PART_' + Date.now(),
            eventId: eventId,
            userEmail: currentUser.email,
            userName: currentUser.name,
            status: status,
            note: noteText,
            timestamp: new Date().toISOString()
        });
        
        saveState();
        Utils.showToast('✅ Risposta salvata!', 'success');
        
        // Ricarica lista
        this.loadMemberEventsList('future');
    },
    
    editParticipation(eventId) {
        // Rimuovi partecipazione esistente per permettere modifica
        const currentUser = APP_STATE.currentUser;
        APP_STATE.eventParticipations = APP_STATE.eventParticipations.filter(
            p => !(p.eventId === eventId && p.userEmail === currentUser.email)
        );
        saveState();
        
        // Ricarica lista
        this.loadMemberEventsList('future');
    },
    
    getUserParticipation(eventId, userEmail) {
        if (!APP_STATE.eventParticipations) return null;
        return APP_STATE.eventParticipations.find(
            p => p.eventId === eventId && p.userEmail === userEmail
        );
    },
    
    // NUOVE FUNZIONI PER VALUTAZIONE
    setRating(eventId, stars) {
        const starsContainer = document.getElementById(`stars-${eventId}`);
        if (!starsContainer) return;
        
        const starElements = starsContainer.querySelectorAll('.star');
        starElements.forEach((star, index) => {
            if (index < stars) {
                star.classList.add('filled');
            } else {
                star.classList.remove('filled');
            }
        });
        
        // Salva temporaneamente il rating
        starsContainer.dataset.rating = stars;
    },
    
    saveRating(eventId) {
        const starsContainer = document.getElementById(`stars-${eventId}`);
        const feedbackTextarea = document.getElementById(`feedback-${eventId}`);
        
        const stars = parseInt(starsContainer.dataset.rating || '0');
        const feedback = feedbackTextarea.value;
        
        if (stars === 0) {
            Utils.showToast('⚠️ Seleziona almeno una stella', 'warning');
            return;
        }
        
        const currentUser = APP_STATE.currentUser;
        
        // Salva valutazione
        if (!APP_STATE.eventRatings) {
            APP_STATE.eventRatings = [];
        }
        
        // Rimuovi valutazione esistente se presente
        APP_STATE.eventRatings = APP_STATE.eventRatings.filter(
            r => !(r.eventId === eventId && r.userEmail === currentUser.email)
        );
        
        // Aggiungi nuova valutazione
        APP_STATE.eventRatings.push({
            id: 'RATE_' + Date.now(),
            eventId: eventId,
            userEmail: currentUser.email,
            userName: currentUser.name,
            stars: stars,
            feedback: feedback,
            timestamp: new Date().toISOString()
        });
        
        saveState();
        Utils.showToast('⭐ Valutazione inviata!', 'success');
        
        // Ricarica lista
        this.loadMemberEventsList('past');
    },
    
    getUserRating(eventId, userEmail) {
        if (!APP_STATE.eventRatings) return null;
        return APP_STATE.eventRatings.find(
            r => r.eventId === eventId && r.userEmail === userEmail
        );
    },
    
    // Show member tab
    showMemberTab(type) {
        // Update tab active state
        document.querySelectorAll('#eventsManagerSection .tabs .tab').forEach(tab => {
            tab.classList.remove('active');
        });
        event.currentTarget.classList.add('active');
        
        // Load appropriate list
        this.loadMemberEventsList(type);
    },
    
    // ADMIN FUNCTIONS - Show participations
    showAdminTab(type) {
        // Update tab active state
        document.querySelectorAll('#eventsManagerSection .tabs .tab').forEach(tab => {
            tab.classList.remove('active');
        });
        event.currentTarget.classList.add('active');
        
        const container = document.getElementById('eventsList');
        
        if (type === 'events') {
            this.loadAdminEventsList();
        } else if (type === 'participations') {
            this.loadAdminParticipations();
        } else if (type === 'ratings') {
            this.loadAdminRatings();
        }
    },
    
    loadAdminParticipations() {
        const container = document.getElementById('eventsList');
        if (!container) return;
        
        const participations = APP_STATE.eventParticipations || [];
        
        if (participations.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; background: rgba(30, 30, 46, 0.95); border-radius: 12px;">
                    <h3 style="color: #c7ff00;">Nessuna partecipazione registrata</h3>
                    <p style="color: #aaa;">I membri non hanno ancora risposto agli eventi</p>
                </div>
            `;
            return;
        }
        
        // Raggruppa per evento
        const byEvent = {};
        participations.forEach(p => {
            const event = APP_STATE.events.find(e => e.id === p.eventId);
            if (!event) return;
            
            if (!byEvent[p.eventId]) {
                byEvent[p.eventId] = {
                    event: event,
                    participations: []
                };
            }
            byEvent[p.eventId].participations.push(p);
        });
        
        let html = '<div style="display: grid; gap: 20px;">';
        
        Object.values(byEvent).forEach(group => {
            const confirmed = group.participations.filter(p => p.status === 'confirmed').length;
            const declined = group.participations.filter(p => p.status === 'declined').length;
            
            html += `
                <div style="background: rgba(30, 30, 46, 0.95); border-radius: 16px; padding: 20px; border: 1px solid rgba(199, 255, 0, 0.1);">
                    <h3 style="color: #c7ff00; margin-bottom: 15px;">
                        ${group.event.title}
                        <span style="font-size: 14px; color: #aaa; margin-left: 10px;">
                            ${this.formatDate(group.event.date)}
                        </span>
                    </h3>
                    
                    <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                        <span style="color: #4caf50;">✅ Parteciperanno: ${confirmed}</span>
                        <span style="color: #ff4444;">❌ Non parteciperanno: ${declined}</span>
                    </div>
                    
                    <div style="display: grid; gap: 10px;">
                        ${group.participations.map(p => `
                            <div class="participation-list-card">
                                <div class="participation-member-name">
                                    👤 ${p.userName} (${p.userEmail})
                                </div>
                                <div class="participation-response">
                                    <span class="participation-status ${p.status}">
                                        ${p.status === 'confirmed' ? '✅ Parteciperà' : '❌ Non parteciperà'}
                                    </span>
                                    <span style="color: #666; font-size: 12px;">
                                        ${this.formatDateTime(p.timestamp)}
                                    </span>
                                </div>
                                ${p.note ? `
                                    <div class="participation-note-display">
                                        📝 Nota: ${p.note}
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    },
    
    loadAdminRatings() {
        const container = document.getElementById('eventsList');
        if (!container) return;
        
        const ratings = APP_STATE.eventRatings || [];
        
        if (ratings.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; background: rgba(30, 30, 46, 0.95); border-radius: 12px;">
                    <h3 style="color: #c7ff00;">Nessuna valutazione ricevuta</h3>
                    <p style="color: #aaa;">I membri non hanno ancora valutato eventi passati</p>
                </div>
            `;
            return;
        }
        
        // Raggruppa per evento
        const byEvent = {};
        ratings.forEach(r => {
            const event = APP_STATE.events.find(e => e.id === r.eventId);
            if (!event) return;
            
            if (!byEvent[r.eventId]) {
                byEvent[r.eventId] = {
                    event: event,
                    ratings: []
                };
            }
            byEvent[r.eventId].ratings.push(r);
        });
        
        let html = '<div style="display: grid; gap: 20px;">';
        
        Object.values(byEvent).forEach(group => {
            const avgStars = group.ratings.reduce((sum, r) => sum + r.stars, 0) / group.ratings.length;
            
            html += `
                <div style="background: rgba(30, 30, 46, 0.95); border-radius: 16px; padding: 20px; border: 1px solid rgba(199, 255, 0, 0.1);">
                    <h3 style="color: #c7ff00; margin-bottom: 15px;">
                        ${group.event.title}
                        <span style="font-size: 14px; color: #aaa; margin-left: 10px;">
                            ${this.formatDate(group.event.date)}
                        </span>
                    </h3>
                    
                    <div style="margin-bottom: 20px;">
                        <span style="color: #ffd700; font-size: 18px;">
                            ${'⭐'.repeat(Math.round(avgStars))}${'☆'.repeat(5 - Math.round(avgStars))}
                        </span>
                        <span style="color: #aaa; margin-left: 10px;">
                            Media: ${avgStars.toFixed(1)}/5 (${group.ratings.length} valutazioni)
                        </span>
                    </div>
                    
                    <div style="display: grid; gap: 10px;">
                        ${group.ratings.map(r => `
                            <div class="participation-list-card">
                                <div class="participation-member-name">
                                    👤 ${r.userName} (${r.userEmail})
                                </div>
                                <div style="color: #ffd700; margin: 8px 0;">
                                    ${'⭐'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}
                                </div>
                                ${r.feedback ? `
                                    <div class="participation-note-display">
                                        💬 Feedback: ${r.feedback}
                                    </div>
                                ` : ''}
                                <div style="color: #666; font-size: 12px; margin-top: 8px;">
                                    ${this.formatDateTime(r.timestamp)}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    },
    
    getParticipationsCount() {
        return APP_STATE.eventParticipations ? APP_STATE.eventParticipations.length : 0;
    },
    
    getRatingsCount() {
        return APP_STATE.eventRatings ? APP_STATE.eventRatings.length : 0;
    },
    
    formatDateTime(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleString('it-IT', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Load admin events list - ORIGINAL
    loadAdminEventsList() {
        const container = document.getElementById('eventsList');
        if (!container) return;
        
        let events = APP_STATE.events || [];
        
        // Sort by date
        events.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (events.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; background: white; border-radius: 12px;">
                    <h3>📅 Nessun evento trovato</h3>
                    <p style="color: #999;">Non ci sono eventi programmati</p>
                </div>
            `;
            return;
        }
        
        let html = '<div style="display: grid; gap: 15px;">';
        
        events.forEach(event => {
            const isPast = new Date(event.date) < new Date();
            const isToday = this.isToday(new Date(event.date));
            
            // Get participation stats
            const participations = APP_STATE.eventParticipations ? 
                APP_STATE.eventParticipations.filter(p => p.eventId === event.id) : [];
            const confirmed = participations.filter(p => p.status === 'confirmed').length;
            const declined = participations.filter(p => p.status === 'declined').length;
            
            html += `
                <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <div style="display: flex; justify-content: space-between;">
                        <div style="flex: 1;">
                            <h3 style="margin: 0 0 10px 0;">
                                ${event.title}
                                ${isToday ? ' <span style="background: #ff9800; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">OGGI</span>' : ''}
                                ${isPast ? ' <span style="background: #888; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">PASSATO</span>' : ''}
                            </h3>
                            
                            <div style="color: #666; font-size: 14px;">
                                <div>📅 ${this.formatDate(event.date)}</div>
                                <div>🕐 ${event.time || 'Tutto il giorno'}</div>
                                ${event.location ? `<div>📍 ${event.location}</div>` : ''}
                                ${event.notes ? `<div>📝 ${event.notes}</div>` : ''}
                                <div style="margin-top: 10px;">
                                    <strong>Visibilità:</strong><br>
                                    👤 Membri: ${this.formatVisibility(event.visibility?.membri)}<br>
                                    💼 Consulenti: ${this.formatVisibility(event.visibility?.consulenti)}
                                </div>
                                ${participations.length > 0 ? `
                                    <div style="margin-top: 10px; padding: 10px; background: #f0f0f0; border-radius: 8px;">
                                        <strong>Partecipazioni:</strong><br>
                                        ✅ Confermati: ${confirmed} | ❌ Non parteciperanno: ${declined}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <button type="button" class="btn btn-small btn-primary" 
                                    onclick="EventsManager.editEvent('${event.id}')"
                                    style="cursor: pointer;">
                                ✏️ Modifica
                            </button>
                            <button type="button" class="btn btn-small btn-danger" 
                                    onclick="EventsManager.deleteEvent('${event.id}')"
                                    style="cursor: pointer;">
                                🗑️ Elimina
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    },
    
    // Load consultant events list
    loadConsultantEventsList() {
        const container = document.getElementById('eventsList');
        if (!container) return;
        
        let events = APP_STATE.events || [];
        
        // Filter by visibility
        events = events.filter(event => this.isEventVisibleToUser(event));
        
        // Sort by date
        events.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (events.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; background: white; border-radius: 12px;">
                    <h3>📅 Nessun evento trovato</h3>
                    <p style="color: #999;">Non ci sono eventi programmati per te</p>
                </div>
            `;
            return;
        }
        
        let html = '<div style="display: grid; gap: 15px;">';
        
        events.forEach(event => {
            const isPast = new Date(event.date) < new Date();
            const isToday = this.isToday(new Date(event.date));
            
            html += `
                <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h3 style="margin: 0 0 10px 0;">
                        ${event.title}
                        ${isToday ? ' <span style="background: #ff9800; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">OGGI</span>' : ''}
                        ${isPast ? ' <span style="background: #888; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">PASSATO</span>' : ''}
                    </h3>
                    
                    <div style="color: #666; font-size: 14px;">
                        <div>📅 ${this.formatDate(event.date)}</div>
                        <div>🕐 ${event.time || 'Tutto il giorno'}</div>
                        ${event.location ? `<div>📍 ${event.location}</div>` : ''}
                        ${event.notes ? `<div>📝 ${event.notes}</div>` : ''}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    },
    
    // RESTO DELLE FUNZIONI ORIGINALI (mantieni tutte le altre funzioni esistenti)
    
    // Format visibility for display
    formatVisibility(visibility) {
        if (!visibility) return 'Nessuno';
        if (visibility.all) return 'Tutti';
        if (visibility.circuits && visibility.circuits.length > 0) {
            return `Zone: ${visibility.circuits.join(', ')}`;
        }
        return 'Nessuno';
    },
    
    // Check if event is visible to user
    isEventVisibleToUser(event) {
        const currentUser = APP_STATE.currentUser;
        if (!currentUser) return false;
        
        if (currentUser.type === 'admin') return true;
        
        const visibility = event.visibility || { membri: { all: true }, consulenti: { all: true } };
        const userCircuit = currentUser.circuit || 'Rimini';
        
        if (currentUser.type === 'membro') {
            if (visibility.membri?.all) return true;
            if (visibility.membri?.circuits) {
                return visibility.membri.circuits.includes(userCircuit);
            }
        }
        
        if (currentUser.type === 'consulente') {
            if (visibility.consulenti?.all) return true;
            if (visibility.consulenti?.circuits) {
                return visibility.consulenti.circuits.includes(userCircuit);
            }
        }
        
        return false;
    },
    
    // Open create modal - SOLO PER ADMIN
    openCreateModal() {
        if (!APP_STATE.currentUser || APP_STATE.currentUser.type !== 'admin') {
            Utils.showToast('⛔ Solo gli amministratori possono creare eventi', 'error');
            return;
        }
        
        const modalHTML = `
            <div id="createEventModal" class="modal active">
                <div class="modal-content" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header">
                        <h3>➕ Crea Nuovo Evento</h3>
                        <span class="close-modal" onclick="EventsManager.closeModal('createEventModal')">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="eventForm">
                            <div class="form-group">
                                <label>Titolo *</label>
                                <input type="text" id="eventTitle" required>
                            </div>
                            
                            <div class="form-group">
                                <label>Data *</label>
                                <input type="date" id="eventDate" required value="${new Date().toISOString().split('T')[0]}">
                            </div>
                            
                            <div class="form-group">
                                <label>Ora</label>
                                <input type="time" id="eventTime">
                            </div>
                            
                            <div class="form-group">
                                <label>Luogo</label>
                                <input type="text" id="eventLocation">
                            </div>
                            
                            <div class="form-group">
                                <label>Note</label>
                                <textarea id="eventNotes" rows="3"></textarea>
                            </div>
                            
                            ${this.getVisibilityFieldsHTML()}
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="EventsManager.closeModal('createEventModal')">Annulla</button>
                        <button class="btn btn-primary" onclick="EventsManager.createEvent()">Crea Evento</button>
                    </div>
                </div>
            </div>
        `;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHTML;
        document.body.appendChild(tempDiv.firstElementChild);
    },
    
    // Edit event - SOLO PER ADMIN
    editEvent(eventId) {
        if (!APP_STATE.currentUser || APP_STATE.currentUser.type !== 'admin') {
            Utils.showToast('⛔ Solo gli amministratori possono modificare eventi', 'error');
            return;
        }
        
        console.log('📝 Modifica evento:', eventId);
        const event = APP_STATE.events.find(e => e.id === eventId);
        if (!event) {
            Utils.showToast('❌ Evento non trovato', 'error');
            return;
        }
        
        const modalHTML = `
            <div id="editEventModal" class="modal active">
                <div class="modal-content" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header">
                        <h3>✏️ Modifica Evento</h3>
                        <span class="close-modal" onclick="EventsManager.closeModal('editEventModal')">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="editEventForm">
                            <div class="form-group">
                                <label>Titolo *</label>
                                <input type="text" id="editEventTitle" value="${event.title}" required>
                            </div>
                            
                            <div class="form-group">
                                <label>Data *</label>
                                <input type="date" id="editEventDate" value="${event.date}" required>
                            </div>
                            
                            <div class="form-group">
                                <label>Ora</label>
                                <input type="time" id="editEventTime" value="${event.time || ''}">
                            </div>
                            
                            <div class="form-group">
                                <label>Luogo</label>
                                <input type="text" id="editEventLocation" value="${event.location || ''}">
                            </div>
                            
                            <div class="form-group">
                                <label>Note</label>
                                <textarea id="editEventNotes" rows="3">${event.notes || ''}</textarea>
                            </div>
                            
                            ${this.getVisibilityFieldsHTML('edit', event.visibility)}
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="EventsManager.closeModal('editEventModal')">Annulla</button>
                        <button class="btn btn-primary" onclick="EventsManager.updateEvent('${eventId}')">Salva Modifiche</button>
                    </div>
                </div>
            </div>
        `;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHTML;
        document.body.appendChild(tempDiv.firstElementChild);
        
        // Set visibility checkboxes
        if (event.visibility) {
            if (event.visibility.membri) {
                document.querySelector(`input[name="editMembriVisibility"][value="${event.visibility.membri.all ? 'all' : 'selected'}"]`).checked = true;
                EventsManager.toggleCircuits('editMembri');
                if (event.visibility.membri.circuits) {
                    event.visibility.membri.circuits.forEach(circuit => {
                        const cb = document.querySelector(`#editMembriCircuits input[value="${circuit}"]`);
                        if (cb) cb.checked = true;
                    });
                }
            }
            if (event.visibility.consulenti) {
                document.querySelector(`input[name="editConsulentiVisibility"][value="${event.visibility.consulenti.all ? 'all' : 'selected'}"]`).checked = true;
                EventsManager.toggleCircuits('editConsulenti');
                if (event.visibility.consulenti.circuits) {
                    event.visibility.consulenti.circuits.forEach(circuit => {
                        const cb = document.querySelector(`#editConsulentiCircuits input[value="${circuit}"]`);
                        if (cb) cb.checked = true;
                    });
                }
            }
        }
    },
    
    // Get visibility fields HTML
    getVisibilityFieldsHTML(prefix = '', existing = null) {
        const p = prefix ? prefix : '';
        return `
            <fieldset style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 15px 0;">
                <legend style="padding: 0 10px; font-weight: bold;">👤 Visibilità Membri</legend>
                <label>
                    <input type="radio" name="${p}MembriVisibility" value="all" ${!existing || existing.membri?.all ? 'checked' : ''} 
                           onchange="EventsManager.toggleCircuits('${p}Membri')">
                    Tutti i membri
                </label><br>
                <label>
                    <input type="radio" name="${p}MembriVisibility" value="selected" ${existing && !existing.membri?.all ? 'checked' : ''}
                           onchange="EventsManager.toggleCircuits('${p}Membri')">
                    Solo circuiti selezionati
                </label>
                <div id="${p}MembriCircuits" style="display: none; margin: 10px 0 0 20px;">
                    <label><input type="checkbox" value="Rimini"> Rimini</label><br>
                    <label><input type="checkbox" value="Ancona"> Ancona</label><br>
                    <label><input type="checkbox" value="Jesi"> Jesi</label><br>
                    <label><input type="checkbox" value="Pesaro"> Pesaro</label>
                </div>
            </fieldset>
            
            <fieldset style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 15px 0;">
                <legend style="padding: 0 10px; font-weight: bold;">💼 Visibilità Consulenti</legend>
                <label>
                    <input type="radio" name="${p}ConsulentiVisibility" value="all" ${!existing || existing.consulenti?.all ? 'checked' : ''}
                           onchange="EventsManager.toggleCircuits('${p}Consulenti')">
                    Tutti i consulenti
                </label><br>
                <label>
                    <input type="radio" name="${p}ConsulentiVisibility" value="selected" ${existing && !existing.consulenti?.all ? 'checked' : ''}
                           onchange="EventsManager.toggleCircuits('${p}Consulenti')">
                    Solo circuiti selezionati
                </label>
                <div id="${p}ConsulentiCircuits" style="display: none; margin: 10px 0 0 20px;">
                    <label><input type="checkbox" value="Rimini"> Rimini</label><br>
                    <label><input type="checkbox" value="Ancona"> Ancona</label><br>
                    <label><input type="checkbox" value="Jesi"> Jesi</label><br>
                    <label><input type="checkbox" value="Pesaro"> Pesaro</label>
                </div>
            </fieldset>
        `;
    },
    
    // Toggle circuits visibility
    toggleCircuits(type) {
        const container = document.getElementById(type + 'Circuits');
        const radio = document.querySelector(`input[name="${type}Visibility"]:checked`);
        if (container && radio) {
            container.style.display = radio.value === 'selected' ? 'block' : 'none';
        }
    },
    
    // Create event
    createEvent() {
        const title = document.getElementById('eventTitle').value;
        const date = document.getElementById('eventDate').value;
        
        if (!title || !date) {
            Utils.showToast('❌ Compila i campi obbligatori', 'error');
            return;
        }
        
        const visibility = this.getVisibilityFromForm('');
        
        const newEvent = {
            id: 'EVT_' + Date.now(),
            title,
            date,
            time: document.getElementById('eventTime').value,
            location: document.getElementById('eventLocation').value,
            notes: document.getElementById('eventNotes').value,
            visibility,
            createdAt: new Date().toISOString()
        };
        
        APP_STATE.events.push(newEvent);
        saveState();
        
        this.closeModal('createEventModal');
        this.loadEventsList();
        
        if (typeof Calendar !== 'undefined' && Calendar.generateCalendar) {
            Calendar.generateCalendar();
        }
        
        Utils.showToast('✅ Evento creato con successo!', 'success');
    },
    
    // Update event
    updateEvent(eventId) {
        console.log('💾 Salvataggio modifiche evento:', eventId);
        const event = APP_STATE.events.find(e => e.id === eventId);
        if (!event) {
            Utils.showToast('❌ Evento non trovato', 'error');
            return;
        }
        
        event.title = document.getElementById('editEventTitle').value;
        event.date = document.getElementById('editEventDate').value;
        event.time = document.getElementById('editEventTime').value;
        event.location = document.getElementById('editEventLocation').value;
        event.notes = document.getElementById('editEventNotes').value;
        event.visibility = this.getVisibilityFromForm('edit');
        event.updatedAt = new Date().toISOString();
        
        saveState();
        
        this.closeModal('editEventModal');
        this.loadEventsList();
        
        if (typeof Calendar !== 'undefined' && Calendar.generateCalendar) {
            Calendar.generateCalendar();
        }
        
        Utils.showToast('✅ Evento aggiornato con successo!', 'success');
    },
    
    // Get visibility from form
    getVisibilityFromForm(prefix) {
        const visibility = {
            membri: { all: true, circuits: [] },
            consulenti: { all: true, circuits: [] }
        };
        
        const membriRadio = document.querySelector(`input[name="${prefix}MembriVisibility"]:checked`);
        if (membriRadio) {
            visibility.membri.all = membriRadio.value === 'all';
            if (!visibility.membri.all) {
                document.querySelectorAll(`#${prefix}MembriCircuits input:checked`).forEach(cb => {
                    visibility.membri.circuits.push(cb.value);
                });
            }
        }
        
        const consulentiRadio = document.querySelector(`input[name="${prefix}ConsulentiVisibility"]:checked`);
        if (consulentiRadio) {
            visibility.consulenti.all = consulentiRadio.value === 'all';
            if (!visibility.consulenti.all) {
                document.querySelectorAll(`#${prefix}ConsulentiCircuits input:checked`).forEach(cb => {
                    visibility.consulenti.circuits.push(cb.value);
                });
            }
        }
        
        return visibility;
    },
    
    // Delete event - SOLO PER ADMIN
    deleteEvent(eventId) {
        if (!APP_STATE.currentUser || APP_STATE.currentUser.type !== 'admin') {
            Utils.showToast('⛔ Solo gli amministratori possono eliminare eventi', 'error');
            return;
        }
        
        console.log('🗑️ Richiesta eliminazione evento:', eventId);
        const event = APP_STATE.events.find(e => e.id === eventId);
        
        if (!event) {
            Utils.showToast('❌ Evento non trovato', 'error');
            return;
        }
        
        if (!confirm(`Sei sicuro di voler eliminare l'evento "${event.title}"?\n\nQuesta azione non può essere annullata.`)) {
            return;
        }
        
        APP_STATE.events = APP_STATE.events.filter(e => e.id !== eventId);
        saveState();
        
        this.loadEventsList();
        
        if (typeof Calendar !== 'undefined' && Calendar.generateCalendar) {
            Calendar.generateCalendar();
        }
        
        Utils.showToast('✅ Evento eliminato con successo', 'success');
    },
    
    // Close modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.remove();
    },
    
    // View event details
    viewEventDetails(eventId) {
        const event = APP_STATE.events.find(e => e.id === eventId);
        if (!event) return;
        
        const isPast = new Date(event.date) < new Date();
        
        const modalHTML = `
            <div id="viewEventModal" class="modal active">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3>📋 Dettagli Evento ${isPast ? '(PASSATO)' : ''}</h3>
                        <span class="close-modal" onclick="EventsManager.closeModal('viewEventModal')">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div style="padding: 20px; background: #f9f9f9; border-radius: 10px;">
                            <h4 style="color: #333; margin-bottom: 15px;">
                                ${event.title}
                            </h4>
                            
                            <div style="display: grid; gap: 12px;">
                                <div>
                                    <strong>Data:</strong> ${this.formatDate(event.date)}
                                </div>
                                <div>
                                    <strong>Orario:</strong> ${event.time || 'Tutto il giorno'}
                                </div>
                                ${event.location ? `
                                    <div>
                                        <strong>Luogo:</strong> ${event.location}
                                    </div>
                                ` : ''}
                                ${event.notes ? `
                                    <div>
                                        <strong>Note:</strong>
                                        <div style="margin-top: 5px; padding: 10px; background: white; border-radius: 5px;">
                                            ${event.notes}
                                        </div>
                                    </div>
                                ` : ''}
                                <div>
                                    <strong>Visibilità Membri:</strong> ${this.formatVisibility(event.visibility?.membri)}
                                </div>
                                <div>
                                    <strong>Visibilità Consulenti:</strong> ${this.formatVisibility(event.visibility?.consulenti)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="EventsManager.closeModal('viewEventModal')">
                            Chiudi
                        </button>
                        ${APP_STATE.currentUser && APP_STATE.currentUser.type === 'admin' ? `
                            <button class="btn btn-primary" onclick="EventsManager.closeModal('viewEventModal'); EventsManager.editEvent('${eventId}')">
                                ✏️ Modifica
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHTML;
        document.body.appendChild(tempDiv.firstElementChild);
    },
    
    // Open create event modal (alias per il calendario)
    openCreateEventModal() {
        this.openCreateModal();
    },
    
    // Helpers
    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    },
    
    formatDate(dateStr) {
        const date = new Date(dateStr);
        const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('it-IT', options);
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    EventsManager.init();
    console.log('✅ EventsManager caricato e pronto con sistema partecipazioni!');
});

// Make globally available
window.EventsManager = EventsManager;