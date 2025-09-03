// ============================================
// EVENTS-MANAGER.JS - Gestione Eventi CORRETTA con GRAFICA MIGLIORATA
// ============================================

const EventsManager = {
    // Available circuits
    circuits: ['Rimini', 'Ancona', 'Jesi', 'Pesaro'],
    
    // Initialize events manager
    init() {
        console.log('EventsManager inizializzato');
        
        // Assicurati che APP_STATE.events esista
        if (!APP_STATE.events) {
            APP_STATE.events = [];
        }
        
        // Crea alcuni eventi di esempio se non ce ne sono
        if (APP_STATE.events.length === 0) {
            this.createSampleEvents();
        }
        
        this.createModals();
        this.setupEventListeners();
        this.addEventStyles();
    },
    
    // Add custom styles for events manager
    addEventStyles() {
        if (document.getElementById('eventsManagerStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'eventsManagerStyles';
        style.innerHTML = `
            /* Stili per la griglia degli eventi */
            .events-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }
            
            .event-card {
                background: white;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                transition: all 0.3s;
                border-top: 4px solid;
                border-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1;
            }
            
            .event-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 5px 20px rgba(0,0,0,0.15);
            }
            
            .event-card.past-event {
                opacity: 0.6;
                background: #f5f5f5;
            }
            
            .event-card.today-event {
                border-color: #4CAF50;
                background: linear-gradient(135deg, #f1f8e9 0%, #dcedc8 100%);
            }
            
            .event-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .event-category {
                padding: 5px 10px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            
            .event-title {
                font-size: 18px;
                font-weight: bold;
                color: #333;
                margin-bottom: 10px;
            }
            
            .event-description {
                color: #666;
                margin-bottom: 15px;
                font-size: 14px;
            }
            
            .event-details {
                border-top: 1px solid #eee;
                padding-top: 15px;
                margin-bottom: 15px;
            }
            
            .event-detail {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
                font-size: 13px;
                color: #555;
            }
            
            .event-notes {
                background: #f8f8f8;
                padding: 10px;
                border-radius: 8px;
                margin: 15px 0;
                border-left: 3px solid #667eea;
            }
            
            .event-notes p {
                margin: 5px 0;
                font-size: 13px;
                color: #555;
            }
            
            .event-footer {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                padding-top: 15px;
                border-top: 1px solid #eee;
            }
            
            .badge {
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
            }
            
            .badge-warning {
                background: #FFC107;
                color: white;
            }
            
            .badge-secondary {
                background: #6c757d;
                color: white;
            }
            
            /* Stili per checkbox allineate */
            .visibility-section {
                margin-top: 30px;
                padding: 20px;
                background: #f9f9f9;
                border-radius: 12px;
                border: 1px solid #e0e0e0;
            }
            
            .visibility-section h4 {
                margin-bottom: 20px;
                font-size: 16px;
                font-weight: 600;
                color: #333;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .visibility-group {
                background: white;
                border-radius: 10px;
                padding: 20px;
                margin-bottom: 15px;
                box-shadow: 0 1px 4px rgba(0,0,0,0.05);
                transition: all 0.3s;
            }
            
            .visibility-group:hover {
                box-shadow: 0 3px 8px rgba(0,0,0,0.1);
            }
            
            .visibility-main-checkbox {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 15px;
                padding: 12px;
                background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%);
                border-radius: 8px;
                transition: all 0.3s;
            }
            
            .visibility-main-checkbox:hover {
                background: linear-gradient(135deg, #eeeeee 0%, #e0e0e0 100%);
            }
            
            .visibility-main-checkbox input[type="checkbox"] {
                width: 20px;
                height: 20px;
                cursor: pointer;
            }
            
            .visibility-main-checkbox label {
                font-weight: 600;
                font-size: 15px;
                cursor: pointer;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .visibility-sub-options {
                margin-left: 35px;
                padding: 15px;
                background: #fafafa;
                border-radius: 8px;
                border: 1px solid #e8e8e8;
            }
            
            .visibility-all-circuits {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 12px;
                padding: 10px;
                background: white;
                border-radius: 6px;
            }
            
            .visibility-all-circuits input[type="checkbox"] {
                width: 18px;
                height: 18px;
                cursor: pointer;
            }
            
            .visibility-all-circuits label {
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                margin: 0;
            }
            
            .circuits-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
                padding: 12px;
                background: white;
                border-radius: 6px;
                border: 1px dashed #ddd;
            }
            
            .circuit-checkbox {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: linear-gradient(135deg, #f8f8f8 0%, #f0f0f0 100%);
                border-radius: 6px;
                transition: all 0.3s;
            }
            
            .circuit-checkbox:hover {
                background: linear-gradient(135deg, #e8e8e8 0%, #e0e0e0 100%);
                transform: translateX(3px);
            }
            
            .circuit-checkbox input[type="checkbox"] {
                width: 16px;
                height: 16px;
                cursor: pointer;
            }
            
            .circuit-checkbox label {
                font-size: 14px;
                cursor: pointer;
                margin: 0;
                font-weight: 500;
                color: #444;
            }
            
            /* Animazione per mostrare/nascondere */
            .circuits-container-hidden {
                display: none !important;
            }
            
            .circuits-container-visible {
                display: block !important;
                animation: slideDown 0.3s ease-out;
            }
            
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* Filtri migliorati */
            .filters-container {
                background: white;
                padding: 20px;
                border-radius: 12px;
                margin: 20px 0;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                display: flex;
                gap: 20px;
                flex-wrap: wrap;
            }
            
            .filter-group {
                flex: 1;
                min-width: 200px;
            }
            
            .filter-group label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: #333;
                font-size: 14px;
            }
            
            .filter-group select {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 8px;
                background: white;
                font-size: 14px;
                transition: all 0.3s;
            }
            
            .filter-group select:focus {
                border-color: #667eea;
                box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
                outline: none;
            }
        `;
        document.head.appendChild(style);
    },
    
    // Create sample events for testing
    createSampleEvents() {
        const sampleEvents = [
            {
                id: 'EVT001',
                title: 'Meeting Generale Consorzio',
                description: 'Riunione mensile di tutti i membri',
                category: 'meeting',
                date: '2025-09-05',
                time: '15:00',
                location: 'Sala Conferenze Rimini',
                notes: 'Portare documenti Q3 e presentazione risultati trimestrali',
                visibility: {
                    membri: { all: true, circuits: [] },
                    consulenti: { all: true, circuits: [] }
                },
                participants: 0,
                createdAt: new Date().toISOString()
            },
            {
                id: 'EVT002',
                title: 'Workshop Marketing Digitale',
                description: 'Formazione sulle strategie digitali 2025',
                category: 'workshop',
                date: '2025-09-10',
                time: '10:00',
                location: 'Online - Zoom',
                notes: 'Link zoom da inviare 24h prima. Preparare materiale didattico.',
                visibility: {
                    membri: { all: false, circuits: ['Rimini', 'Ancona'] },
                    consulenti: { all: false, circuits: ['Rimini'] }
                },
                participants: 0,
                createdAt: new Date().toISOString()
            },
            {
                id: 'EVT003', 
                title: 'Aperitivo Networking',
                description: 'Evento sociale per membri del consorzio',
                category: 'social',
                date: '2025-09-15',
                time: '18:30',
                location: 'Bar Centrale Jesi',
                notes: 'Dress code casual. Prenotazione confermata per 50 persone.',
                visibility: {
                    membri: { all: false, circuits: ['Jesi', 'Pesaro'] },
                    consulenti: { all: false, circuits: [] }
                },
                participants: 0,
                createdAt: new Date().toISOString()
            }
        ];
        
        APP_STATE.events = sampleEvents;
        saveState();
    },

    // Show events manager section
    showEventsManager() {
        this.createEventsSection();
        
        // Usa la funzione globale showSection se esiste
        if (typeof showSection === 'function') {
            showSection('eventsManagerSection');
        } else {
            // Fallback: gestisci manualmente la visibilità  
            document.querySelectorAll('.section').forEach(s => {
                s.style.display = 'none';
            });
            const section = document.getElementById('eventsManagerSection');
            if (section) {
                section.style.display = 'block';
            }
        }
        
        this.loadEventsList();
    },
    
    // Create events section
    createEventsSection() {
        let section = document.getElementById('eventsManagerSection');
        
        if (section) {
            this.loadEventsList();
            return;
        }
        
        const sectionsContainer = document.getElementById('sectionsContainer');
        if (!sectionsContainer) {
            console.error('sectionsContainer non trovato!');
            return;
        }
        
        section = document.createElement('div');
        section.id = 'eventsManagerSection';
        section.className = 'section';
        section.style.display = 'none';
        section.innerHTML = `
            <div class="section-header">
                <button class="back-btn" onclick="goBack()">← Indietro</button>
                <h2>📌 Gestione Eventi</h2>
            </div>
            
            <!-- Pulsante crea evento solo per admin -->
            ${APP_STATE.currentUser && APP_STATE.currentUser.type === 'admin' ? 
                `<div class="action-bar" style="margin: 20px 0;">
                    <button class="btn btn-primary" onclick="EventsManager.openCreateEventModal()">
                        ➕ CREA NUOVO EVENTO
                    </button>
                </div>` : ''
            }
            
            <!-- Filtri eventi -->
            <div class="filters-container">
                <div class="filter-group">
                    <label>Categoria:</label>
                    <select id="eventCategoryFilter" onchange="EventsManager.filterEvents()">
                        <option value="all">Tutte le categorie</option>
                        <option value="meeting">🤝 Meeting</option>
                        <option value="workshop">🛠️ Workshop</option>
                        <option value="conference">🎤 Conferenza</option>
                        <option value="social">🎉 Social</option>
                        <option value="training">📚 Formazione</option>
                        <option value="other">📌 Altro</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Stato:</label>
                    <select id="eventStatusFilter" onchange="EventsManager.filterEvents()">
                        <option value="all">Tutti gli stati</option>
                        <option value="upcoming">🔜 In Arrivo</option>
                        <option value="past">⏮️ Passati</option>
                        <option value="today">📍 Oggi</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Circuito:</label>
                    <select id="eventCircuitFilter" onchange="EventsManager.filterEvents()">
                        <option value="all">Tutti i Circuiti</option>
                        <option value="Rimini">📍 Rimini</option>
                        <option value="Ancona">📍 Ancona</option>
                        <option value="Jesi">📍 Jesi</option>
                        <option value="Pesaro">📍 Pesaro</option>
                    </select>
                </div>
            </div>
            
            <!-- Lista eventi -->
            <div id="eventsList" class="events-list-container">
                <div class="loading">Caricamento eventi...</div>
            </div>
        `;
        
        sectionsContainer.appendChild(section);
    },
    
    // Check if event is visible to current user
    isEventVisibleToUser(event) {
        const currentUser = APP_STATE.currentUser;
        if (!currentUser) return false;
        
        // Admin sees everything
        if (currentUser.type === 'admin') return true;
        
        // Check visibility settings
        const visibility = event.visibility || { membri: { all: true }, consulenti: { all: true } };
        
        // Get user circuit (if not set, default to Rimini)
        const userCircuit = currentUser.circuit || 'Rimini';
        
        // Check user type visibility
        if (currentUser.type === 'membro' && visibility.membri) {
            if (visibility.membri.all) return true;
            if (visibility.membri.circuits && visibility.membri.circuits.length > 0) {
                return visibility.membri.circuits.includes(userCircuit);
            }
        }
        
        if (currentUser.type === 'consulente' && visibility.consulenti) {
            if (visibility.consulenti.all) return true;
            if (visibility.consulenti.circuits && visibility.consulenti.circuits.length > 0) {
                return visibility.consulenti.circuits.includes(userCircuit);
            }
        }
        
        return false;
    },
    
    // Load events list
    loadEventsList(filter = null) {
        const eventsListContainer = document.getElementById('eventsList');
        if (!eventsListContainer) return;
        
        // Get events from APP_STATE
        let events = APP_STATE.events || [];
        
        console.log('Eventi totali:', events.length);
        
        // Filter by visibility for current user
        events = events.filter(event => this.isEventVisibleToUser(event));
        
        console.log('Eventi visibili:', events.length);
        
        // Apply filters if any
        if (filter) {
            events = this.applyFilters(events, filter);
        } else {
            events = this.applyCurrentFilters(events);
        }
        
        // Sort events by date (upcoming first)
        events.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (events.length === 0) {
            eventsListContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📅</div>
                    <h3>Nessun evento trovato</h3>
                    <p>Non ci sono eventi che corrispondono ai criteri selezionati</p>
                    ${APP_STATE.currentUser && APP_STATE.currentUser.type === 'admin' ? 
                        `<button class="btn btn-primary" onclick="EventsManager.openCreateEventModal()">
                            Crea il primo evento
                        </button>` : ''
                    }
                </div>
            `;
            return;
        }
        
        // Create events HTML
        let eventsHTML = '<div class="events-grid">';
        
        events.forEach(event => {
            const eventDate = new Date(event.date);
            const isPast = eventDate < new Date();
            const isToday = this.isToday(eventDate);
            
            eventsHTML += `
                <div class="event-card ${isPast ? 'past-event' : ''} ${isToday ? 'today-event' : ''}" 
                     data-event-id="${event.id}">
                    
                    <div class="event-header">
                        <span class="event-category ${event.category}">
                            ${this.getCategoryIcon(event.category)} ${this.getCategoryName(event.category)}
                        </span>
                        <div>
                            ${isToday ? '<span class="badge badge-warning">OGGI</span>' : ''}
                            ${isPast ? '<span class="badge badge-secondary">PASSATO</span>' : ''}
                        </div>
                    </div>
                    
                    <div class="event-body">
                        <h3 class="event-title">${event.title}</h3>
                        <p class="event-description">${event.description || 'Nessuna descrizione'}</p>
                        
                        <div class="event-details">
                            <div class="event-detail">
                                📅 ${this.formatDate(event.date)}
                            </div>
                            <div class="event-detail">
                                🕐 ${event.time || 'Tutto il giorno'}
                            </div>
                            ${event.location ? 
                                `<div class="event-detail">
                                    📍 ${event.location}
                                </div>` : ''
                            }
                            ${this.getVisibilityBadges(event)}
                            ${event.participants !== undefined ? 
                                `<div class="event-detail">
                                    👥 ${event.participants} partecipanti
                                </div>` : ''
                            }
                        </div>
                        
                        ${event.notes ? 
                            `<div class="event-notes">
                                <strong>📝 Appunti:</strong>
                                <p>${event.notes}</p>
                            </div>` : ''
                        }
                    </div>
                    
                    <div class="event-footer">
                        <button class="btn btn-sm btn-secondary" onclick="EventsManager.viewEventDetails('${event.id}')">
                            👁️ Dettagli
                        </button>
                        ${APP_STATE.currentUser && APP_STATE.currentUser.type === 'admin' ? `
                            <button class="btn btn-sm btn-primary" onclick="EventsManager.editEvent('${event.id}')">
                                ✏️ Modifica
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="EventsManager.deleteEvent('${event.id}')">
                                🗑️ Elimina
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        eventsHTML += '</div>';
        eventsListContainer.innerHTML = eventsHTML;
    },
    
    // Get visibility badges HTML
    getVisibilityBadges(event) {
        if (!event.visibility) return '';
        
        let badges = '<div class="event-detail"><strong>Visibile a:</strong> ';
        let visibilityList = [];
        
        if (event.visibility.membri) {
            if (event.visibility.membri.all) {
                visibilityList.push('👤 Tutti i Membri');
            } else if (event.visibility.membri.circuits && event.visibility.membri.circuits.length > 0) {
                visibilityList.push(`👤 Membri (${event.visibility.membri.circuits.join(', ')})`);
            }
        }
        
        if (event.visibility.consulenti) {
            if (event.visibility.consulenti.all) {
                visibilityList.push('💼 Tutti i Consulenti');
            } else if (event.visibility.consulenti.circuits && event.visibility.consulenti.circuits.length > 0) {
                visibilityList.push(`💼 Consulenti (${event.visibility.consulenti.circuits.join(', ')})`);
            }
        }
        
        if (visibilityList.length === 0) {
            visibilityList.push('Solo Admin');
        }
        
        badges += visibilityList.join(' | ');
        badges += '</div>';
        
        return badges;
    },
    
    // Apply current filters
    applyCurrentFilters(events) {
        const categoryFilter = document.getElementById('eventCategoryFilter')?.value || 'all';
        const statusFilter = document.getElementById('eventStatusFilter')?.value || 'all';
        const circuitFilter = document.getElementById('eventCircuitFilter')?.value || 'all';
        
        let filtered = [...events];
        
        // Filter by category
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(e => e.category === categoryFilter);
        }
        
        // Filter by circuit
        if (circuitFilter !== 'all') {
            filtered = filtered.filter(e => {
                if (!e.visibility) return false;
                
                // Check if event is visible in this circuit
                let isInCircuit = false;
                
                if (e.visibility.membri) {
                    if (e.visibility.membri.all) {
                        isInCircuit = true;
                    } else if (e.visibility.membri.circuits) {
                        isInCircuit = e.visibility.membri.circuits.includes(circuitFilter);
                    }
                }
                
                if (!isInCircuit && e.visibility.consulenti) {
                    if (e.visibility.consulenti.all) {
                        isInCircuit = true;
                    } else if (e.visibility.consulenti.circuits) {
                        isInCircuit = e.visibility.consulenti.circuits.includes(circuitFilter);
                    }
                }
                
                return isInCircuit;
            });
        }
        
        // Filter by status
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (statusFilter === 'upcoming') {
            filtered = filtered.filter(e => new Date(e.date) >= today);
        } else if (statusFilter === 'past') {
            filtered = filtered.filter(e => new Date(e.date) < today);
        } else if (statusFilter === 'today') {
            filtered = filtered.filter(e => this.isToday(new Date(e.date)));
        }
        
        return filtered;
    },
    
    // Filter events
    filterEvents() {
        this.loadEventsList();
    },
    
    // Toggle circuit selection
    toggleCircuitSelection(prefix, checkbox) {
        const container = document.getElementById(`${prefix}CircuitsContainer`);
        if (!container) return;
        
        if (checkbox.checked) {
            container.classList.remove('circuits-container-visible');
            container.classList.add('circuits-container-hidden');
            // Deseleziona tutti i circuiti specifici
            container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
            });
        } else {
            container.classList.remove('circuits-container-hidden');
            container.classList.add('circuits-container-visible');
        }
    },
    
    // Open create event modal
    openCreateEventModal() {
        // Crea i modal se non esistono
        if (!document.getElementById('createEventModal')) {
            this.createModals();
        }
        
        const modal = document.getElementById('createEventModal');
        if (!modal) {
            console.error('Modal createEventModal non trovato');
            return;
        }
        
        // Reset form
        const form = document.getElementById('createEventForm');
        if (form) form.reset();
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('eventDate');
        if (dateInput) dateInput.value = today;
        
        // Reset visibility checkboxes
        document.getElementById('membriVisible').checked = true;
        document.getElementById('membriAllCircuits').checked = true;
        document.getElementById('consulentiVisible').checked = true;
        document.getElementById('consulentiAllCircuits').checked = true;
        
        const membriContainer = document.getElementById('membriCircuitsContainer');
        const consulentiContainer = document.getElementById('consulentiCircuitsContainer');
        
        if (membriContainer) {
            membriContainer.classList.add('circuits-container-hidden');
            membriContainer.classList.remove('circuits-container-visible');
        }
        if (consulentiContainer) {
            consulentiContainer.classList.add('circuits-container-hidden');
            consulentiContainer.classList.remove('circuits-container-visible');
        }
        
        if (typeof Utils !== 'undefined' && Utils.openModal) {
            Utils.openModal('createEventModal');
        } else {
            modal.style.display = 'block';
        }
    },
    
    // Create new event
    createEvent() {
        const form = document.getElementById('createEventForm');
        if (!form) return;
        
        const formData = new FormData(form);
        
        // Validation
        if (!formData.get('title')) {
            Utils.showToast('❌ Il titolo è obbligatorio', 'error');
            return;
        }
        
        // Build visibility object
        const visibility = {};
        
        // Check membri visibility
        if (document.getElementById('membriVisible').checked) {
            visibility.membri = {
                all: document.getElementById('membriAllCircuits').checked,
                circuits: []
            };
            
            if (!visibility.membri.all) {
                this.circuits.forEach(circuit => {
                    if (document.getElementById(`membriCircuit${circuit}`)?.checked) {
                        visibility.membri.circuits.push(circuit);
                    }
                });
            }
        }
        
        // Check consulenti visibility
        if (document.getElementById('consulentiVisible').checked) {
            visibility.consulenti = {
                all: document.getElementById('consulentiAllCircuits').checked,
                circuits: []
            };
            
            if (!visibility.consulenti.all) {
                this.circuits.forEach(circuit => {
                    if (document.getElementById(`consulentiCircuit${circuit}`)?.checked) {
                        visibility.consulenti.circuits.push(circuit);
                    }
                });
            }
        }
        
        const newEvent = {
            id: Utils.generateId('EVT'),
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            date: formData.get('date'),
            time: formData.get('time'),
            location: formData.get('location'),
            notes: formData.get('notes'),
            visibility: visibility,
            participants: 0,
            createdAt: new Date().toISOString(),
            createdBy: APP_STATE.currentUser.id,
            status: 'active'
        };
        
        // Add event to APP_STATE
        if (!APP_STATE.events) {
            APP_STATE.events = [];
        }
        APP_STATE.events.push(newEvent);
        
        // Save to localStorage
        if (typeof saveState === 'function') {
            saveState();
        }
        
        // Close modal
        if (typeof Utils !== 'undefined' && Utils.closeModal) {
            Utils.closeModal('createEventModal');
        } else {
            document.getElementById('createEventModal').style.display = 'none';
        }
        
        // Reload events list
        this.loadEventsList();
        
        // Update calendar if it exists
        if (window.Calendar && typeof Calendar.generateCalendar === 'function') {
            Calendar.generateCalendar();
        }
        
        if (typeof Utils !== 'undefined' && Utils.showToast) {
            Utils.showToast('✅ Evento creato con successo!', 'success');
        }
    },
    
    // View event details
    viewEventDetails(eventId) {
        const event = APP_STATE.events.find(e => e.id === eventId);
        if (!event) {
            Utils.showToast('❌ Evento non trovato', 'error');
            return;
        }
        
        // Crea i modal se non esistono
        if (!document.getElementById('eventDetailsModal')) {
            this.createModals();
        }
        
        const modal = document.getElementById('eventDetailsModal');
        if (!modal) {
            console.error('Modal eventDetailsModal non trovato');
            return;
        }
        
        // Populate modal with event details
        modal.querySelector('.modal-body').innerHTML = `
            <div class="event-details-view">
                <div class="event-detail-header" style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                    <span class="event-category ${event.category}" style="padding: 8px 15px;">
                        ${this.getCategoryIcon(event.category)} ${this.getCategoryName(event.category)}
                    </span>
                    <span class="event-date" style="color: #666; font-weight: 600;">
                        ${this.formatDate(event.date)}
                    </span>
                </div>
                
                <h2 class="event-detail-title" style="color: #333; margin-bottom: 20px;">
                    ${event.title}
                </h2>
                
                <div class="event-detail-info">
                    ${event.description ? 
                        `<div class="info-section" style="margin-bottom: 20px;">
                            <h4 style="color: #555; margin-bottom: 10px;">📝 Descrizione</h4>
                            <p style="color: #666;">${event.description}</p>
                        </div>` : ''
                    }
                    
                    <div class="info-section" style="margin-bottom: 20px;">
                        <h4 style="color: #555; margin-bottom: 10px;">📅 Data e Ora</h4>
                        <p style="color: #666;">${this.formatDate(event.date)} ${event.time ? `alle ${event.time}` : 'Tutto il giorno'}</p>
                    </div>
                    
                    ${event.location ? 
                        `<div class="info-section" style="margin-bottom: 20px;">
                            <h4 style="color: #555; margin-bottom: 10px;">📍 Luogo</h4>
                            <p style="color: #666;">${event.location}</p>
                        </div>` : ''
                    }
                    
                    <div class="info-section" style="margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-radius: 8px;">
                        <h4 style="color: #555; margin-bottom: 10px;">👁️ Visibilità</h4>
                        ${this.formatVisibilityDetails(event.visibility)}
                    </div>
                    
                    ${event.notes ? 
                        `<div class="info-section" style="margin-bottom: 20px; padding: 15px; background: #f0f8ff; border-radius: 8px; border-left: 3px solid #2196F3;">
                            <h4 style="color: #555; margin-bottom: 10px;">📝 Appunti</h4>
                            <div class="notes-content" style="color: #666; white-space: pre-wrap;">
                                ${event.notes}
                            </div>
                        </div>` : ''
                    }
                    
                    <div class="info-section" style="margin-bottom: 20px;">
                        <h4 style="color: #555; margin-bottom: 10px;">👥 Partecipanti</h4>
                        <p style="color: #666;">${event.participants || 0} persone</p>
                    </div>
                    
                    <div class="info-section" style="padding: 10px; background: #f5f5f5; border-radius: 5px;">
                        <p style="color: #999; font-size: 12px; margin: 0;">
                            Creato il ${this.formatDate(event.createdAt)}<br>
                            ID: ${event.id}
                        </p>
                    </div>
                </div>
                
                ${APP_STATE.currentUser && APP_STATE.currentUser.type === 'admin' ? `
                    <div class="event-detail-actions" style="display: flex; gap: 10px; margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee;">
                        <button class="btn btn-primary" onclick="EventsManager.editEvent('${event.id}')">
                            ✏️ Modifica
                        </button>
                        <button class="btn btn-danger" onclick="EventsManager.deleteEvent('${event.id}')">
                            🗑️ Elimina
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        
        if (typeof Utils !== 'undefined' && Utils.openModal) {
            Utils.openModal('eventDetailsModal');
        } else {
            modal.style.display = 'block';
        }
    },
    
    // Format visibility details for display
    formatVisibilityDetails(visibility) {
        if (!visibility) return '<p style="color: #999;">Solo Admin</p>';
        
        let html = '<ul style="list-style: none; padding-left: 0; margin: 0;">';
        
        if (visibility.membri) {
            html += '<li style="margin-bottom: 8px;">👤 <strong>Membri:</strong> ';
            if (visibility.membri.all) {
                html += '<span style="color: #4CAF50;">Tutti i circuiti</span>';
            } else if (visibility.membri.circuits && visibility.membri.circuits.length > 0) {
                html += `<span style="color: #2196F3;">Solo: ${visibility.membri.circuits.join(', ')}</span>`;
            } else {
                html += '<span style="color: #999;">Nessuno</span>';
            }
            html += '</li>';
        }
        
        if (visibility.consulenti) {
            html += '<li>💼 <strong>Consulenti:</strong> ';
            if (visibility.consulenti.all) {
                html += '<span style="color: #4CAF50;">Tutti i circuiti</span>';
            } else if (visibility.consulenti.circuits && visibility.consulenti.circuits.length > 0) {
                html += `<span style="color: #2196F3;">Solo: ${visibility.consulenti.circuits.join(', ')}</span>`;
            } else {
                html += '<span style="color: #999;">Nessuno</span>';
            }
            html += '</li>';
        }
        
        if (!visibility.membri && !visibility.consulenti) {
            html += '<li style="color: #999;">Solo Admin</li>';
        }
        
        html += '</ul>';
        return html;
    },
    
    // Edit event
    editEvent(eventId) {
        const event = APP_STATE.events.find(e => e.id === eventId);
        if (!event) {
            Utils.showToast('❌ Evento non trovato', 'error');
            return;
        }
        
        // Close details modal if open
        if (typeof Utils !== 'undefined' && Utils.closeModal) {
            Utils.closeModal('eventDetailsModal');
        }
        
        // Crea i modal se non esistono
        if (!document.getElementById('editEventModal')) {
            this.createModals();
        }
        
        const modal = document.getElementById('editEventModal');
        if (!modal) {
            console.error('Modal editEventModal non trovato');
            return;
        }
        
        // Populate form with event data
        const form = document.getElementById('editEventForm');
        if (!form) return;
        
        form.querySelector('[name="title"]').value = event.title;
        form.querySelector('[name="description"]').value = event.description || '';
        form.querySelector('[name="category"]').value = event.category;
        form.querySelector('[name="date"]').value = event.date;
        form.querySelector('[name="time"]').value = event.time || '';
        form.querySelector('[name="location"]').value = event.location || '';
        form.querySelector('[name="notes"]').value = event.notes || '';
        
        // Set visibility settings
        const visibility = event.visibility || {};
        
        // Membri visibility
        const membriVisible = document.getElementById('editMembriVisible');
        membriVisible.checked = !!visibility.membri;
        
        const membriAllCircuits = document.getElementById('editMembriAllCircuits');
        const membriContainer = document.getElementById('editMembriCircuitsContainer');
        
        if (visibility.membri) {
            membriAllCircuits.checked = visibility.membri.all;
            if (!visibility.membri.all) {
                membriContainer.classList.remove('circuits-container-hidden');
                membriContainer.classList.add('circuits-container-visible');
                this.circuits.forEach(circuit => {
                    const checkbox = document.getElementById(`editMembriCircuit${circuit}`);
                    if (checkbox) {
                        checkbox.checked = visibility.membri.circuits?.includes(circuit) || false;
                    }
                });
            } else {
                membriContainer.classList.add('circuits-container-hidden');
                membriContainer.classList.remove('circuits-container-visible');
            }
        } else {
            membriAllCircuits.checked = true;
            membriContainer.classList.add('circuits-container-hidden');
            membriContainer.classList.remove('circuits-container-visible');
        }
        
        // Consulenti visibility
        const consulentiVisible = document.getElementById('editConsulentiVisible');
        consulentiVisible.checked = !!visibility.consulenti;
        
        const consulentiAllCircuits = document.getElementById('editConsulentiAllCircuits');
        const consulentiContainer = document.getElementById('editConsulentiCircuitsContainer');
        
        if (visibility.consulenti) {
            consulentiAllCircuits.checked = visibility.consulenti.all;
            if (!visibility.consulenti.all) {
                consulentiContainer.classList.remove('circuits-container-hidden');
                consulentiContainer.classList.add('circuits-container-visible');
                this.circuits.forEach(circuit => {
                    const checkbox = document.getElementById(`editConsulentiCircuit${circuit}`);
                    if (checkbox) {
                        checkbox.checked = visibility.consulenti.circuits?.includes(circuit) || false;
                    }
                });
            } else {
                consulentiContainer.classList.add('circuits-container-hidden');
                consulentiContainer.classList.remove('circuits-container-visible');
            }
        } else {
            consulentiAllCircuits.checked = true;
            consulentiContainer.classList.add('circuits-container-hidden');
            consulentiContainer.classList.remove('circuits-container-visible');
        }
        
        // Store event ID for update
        form.dataset.eventId = eventId;
        
        if (typeof Utils !== 'undefined' && Utils.openModal) {
            Utils.openModal('editEventModal');
        } else {
            modal.style.display = 'block';
        }
    },
    
    // Update event
    updateEvent() {
        const form = document.getElementById('editEventForm');
        if (!form) return;
        
        const eventId = form.dataset.eventId;
        const eventIndex = APP_STATE.events.findIndex(e => e.id === eventId);
        
        if (eventIndex === -1) {
            Utils.showToast('❌ Evento non trovato', 'error');
            return;
        }
        
        const formData = new FormData(form);
        
        // Build visibility object
        const visibility = {};
        
        // Check membri visibility
        if (document.getElementById('editMembriVisible').checked) {
            visibility.membri = {
                all: document.getElementById('editMembriAllCircuits').checked,
                circuits: []
            };
            
            if (!visibility.membri.all) {
                this.circuits.forEach(circuit => {
                    if (document.getElementById(`editMembriCircuit${circuit}`)?.checked) {
                        visibility.membri.circuits.push(circuit);
                    }
                });
            }
        }
        
        // Check consulenti visibility
        if (document.getElementById('editConsulentiVisible').checked) {
            visibility.consulenti = {
                all: document.getElementById('editConsulentiAllCircuits').checked,
                circuits: []
            };
            
            if (!visibility.consulenti.all) {
                this.circuits.forEach(circuit => {
                    if (document.getElementById(`editConsulentiCircuit${circuit}`)?.checked) {
                        visibility.consulenti.circuits.push(circuit);
                    }
                });
            }
        }
        
        // Update event
        APP_STATE.events[eventIndex] = {
            ...APP_STATE.events[eventIndex],
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            date: formData.get('date'),
            time: formData.get('time'),
            location: formData.get('location'),
            notes: formData.get('notes'),
            visibility: visibility,
            updatedAt: new Date().toISOString(),
            updatedBy: APP_STATE.currentUser.id
        };
        
        // Save to localStorage
        if (typeof saveState === 'function') {
            saveState();
        }
        
        // Close modal
        if (typeof Utils !== 'undefined' && Utils.closeModal) {
            Utils.closeModal('editEventModal');
        } else {
            document.getElementById('editEventModal').style.display = 'none';
        }
        
        // Reload events list
        this.loadEventsList();
        
        // Update calendar if it exists
        if (window.Calendar && typeof Calendar.generateCalendar === 'function') {
            Calendar.generateCalendar();
        }
        
        if (typeof Utils !== 'undefined' && Utils.showToast) {
            Utils.showToast('✅ Evento aggiornato con successo!', 'success');
        }
    },
    
    // Delete event  
    deleteEvent(eventId) {
        if (!confirm('⚠️ Sei sicuro di voler eliminare questo evento?\n\nQuesta azione non può essere annullata.')) {
            return;
        }
        
        // Remove event from APP_STATE
        APP_STATE.events = APP_STATE.events.filter(e => e.id !== eventId);
        
        // Save to localStorage
        if (typeof saveState === 'function') {
            saveState();
        }
        
        // Close modals if open
        if (typeof Utils !== 'undefined' && Utils.closeModal) {
            Utils.closeModal('eventDetailsModal');
            Utils.closeModal('editEventModal');
        }
        
        // Reload events list if we're in events manager
        const eventsListContainer = document.getElementById('eventsList');
        if (eventsListContainer) {
            this.loadEventsList();
        }
        
        // Update calendar if it exists
        if (window.Calendar && typeof Calendar.generateCalendar === 'function') {
            Calendar.generateCalendar();
        }
        
        if (typeof Utils !== 'undefined' && Utils.showToast) {
            Utils.showToast('✅ Evento eliminato con successo!', 'success');
        }
    },
    
    // Helper: Check if date is today
    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    },
    
    // Helper: Format date
    formatDate(dateStr) {
        const date = new Date(dateStr);
        const options = { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('it-IT', options);
    },
    
    // Helper: Get category icon
    getCategoryIcon(category) {
        const icons = {
            meeting: '🤝',
            workshop: '🛠️',
            conference: '🎤',
            social: '🎉',
            training: '📚',
            other: '📌'
        };
        return icons[category] || '📌';
    },
    
    // Helper: Get category name
    getCategoryName(category) {
        const names = {
            meeting: 'Meeting',
            workshop: 'Workshop', 
            conference: 'Conferenza',
            social: 'Social',
            training: 'Formazione',
            other: 'Altro'
        };
        return names[category] || 'Altro';
    },
    
    // Create modals
    createModals() {
        const modalsContainer = document.getElementById('modalsContainer');
        if (!modalsContainer) {
            console.error('modalsContainer non trovato!');
            return;
        }
        
        // Create Event Modal with improved layout
        if (!document.getElementById('createEventModal')) {
            const createModal = document.createElement('div');
            createModal.id = 'createEventModal';
            createModal.className = 'modal';
            createModal.innerHTML = `
                <div class="modal-content" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header">
                        <h3>➕ Crea Nuovo Evento</h3>
                        <span class="close-modal" onclick="Utils.closeModal('createEventModal')">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="createEventForm">
                            <div class="form-group">
                                <label for="eventTitle">Titolo *</label>
                                <input type="text" id="eventTitle" name="title" required 
                                       placeholder="Inserisci il titolo dell'evento">
                            </div>
                            
                            <div class="form-group">
                                <label for="eventDescription">Descrizione</label>
                                <textarea id="eventDescription" name="description" rows="3"
                                          placeholder="Descrizione dell'evento"></textarea>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="eventCategory">Categoria *</label>
                                    <select id="eventCategory" name="category" required>
                                        <option value="meeting">🤝 Meeting</option>
                                        <option value="workshop">🛠️ Workshop</option>
                                        <option value="conference">🎤 Conferenza</option>
                                        <option value="social">🎉 Social</option>
                                        <option value="training">📚 Formazione</option>
                                        <option value="other">📌 Altro</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="eventDate">Data *</label>
                                    <input type="date" id="eventDate" name="date" required>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="eventTime">Ora</label>
                                    <input type="time" id="eventTime" name="time">
                                </div>
                                
                                <div class="form-group">
                                    <label for="eventLocation">Luogo</label>
                                    <input type="text" id="eventLocation" name="location" 
                                           placeholder="Dove si svolge l'evento">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="eventNotes">Appunti</label>
                                <textarea id="eventNotes" name="notes" rows="4"
                                          placeholder="Aggiungi appunti o note importanti per questo evento"></textarea>
                            </div>
                            
                            <!-- SEZIONE VISIBILITÀ MIGLIORATA -->
                            <div class="visibility-section">
                                <h4>
                                    👁️ Impostazioni Visibilità
                                </h4>
                                
                                <!-- Membri -->
                                <div class="visibility-group">
                                    <div class="visibility-main-checkbox">
                                        <input type="checkbox" id="membriVisible" checked>
                                        <label for="membriVisible">
                                            👤 Visibile ai Membri
                                        </label>
                                    </div>
                                    
                                    <div class="visibility-sub-options">
                                        <div class="visibility-all-circuits">
                                            <input type="checkbox" id="membriAllCircuits" checked 
                                                   onchange="EventsManager.toggleCircuitSelection('membri', this)">
                                            <label for="membriAllCircuits">
                                                Tutti i circuiti
                                            </label>
                                        </div>
                                        
                                        <div id="membriCircuitsContainer" class="circuits-container-hidden">
                                            <div class="circuits-grid">
                                                ${this.circuits.map(circuit => `
                                                    <div class="circuit-checkbox">
                                                        <input type="checkbox" id="membriCircuit${circuit}">
                                                        <label for="membriCircuit${circuit}">
                                                            📍 ${circuit}
                                                        </label>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Consulenti -->
                                <div class="visibility-group">
                                    <div class="visibility-main-checkbox">
                                        <input type="checkbox" id="consulentiVisible" checked>
                                        <label for="consulentiVisible">
                                            💼 Visibile ai Consulenti
                                        </label>
                                    </div>
                                    
                                    <div class="visibility-sub-options">
                                        <div class="visibility-all-circuits">
                                            <input type="checkbox" id="consulentiAllCircuits" checked
                                                   onchange="EventsManager.toggleCircuitSelection('consulenti', this)">
                                            <label for="consulentiAllCircuits">
                                                Tutti i circuiti
                                            </label>
                                        </div>
                                        
                                        <div id="consulentiCircuitsContainer" class="circuits-container-hidden">
                                            <div class="circuits-grid">
                                                ${this.circuits.map(circuit => `
                                                    <div class="circuit-checkbox">
                                                        <input type="checkbox" id="consulentiCircuit${circuit}">
                                                        <label for="consulentiCircuit${circuit}">
                                                            📍 ${circuit}
                                                        </label>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="Utils.closeModal('createEventModal')">
                            Annulla
                        </button>
                        <button class="btn btn-primary" onclick="EventsManager.createEvent()">
                            Crea Evento
                        </button>
                    </div>
                </div>
            `;
            modalsContainer.appendChild(createModal);
        }
        
        // Edit Event Modal with improved layout
        if (!document.getElementById('editEventModal')) {
            const editModal = document.createElement('div');
            editModal.id = 'editEventModal';
            editModal.className = 'modal';
            editModal.innerHTML = `
                <div class="modal-content" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header">
                        <h3>✏️ Modifica Evento</h3>
                        <span class="close-modal" onclick="Utils.closeModal('editEventModal')">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="editEventForm">
                            <div class="form-group">
                                <label for="editEventTitle">Titolo *</label>
                                <input type="text" id="editEventTitle" name="title" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="editEventDescription">Descrizione</label>
                                <textarea id="editEventDescription" name="description" rows="3"></textarea>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editEventCategory">Categoria *</label>
                                    <select id="editEventCategory" name="category" required>
                                        <option value="meeting">🤝 Meeting</option>
                                        <option value="workshop">🛠️ Workshop</option>
                                        <option value="conference">🎤 Conferenza</option>
                                        <option value="social">🎉 Social</option>
                                        <option value="training">📚 Formazione</option>
                                        <option value="other">📌 Altro</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="editEventDate">Data *</label>
                                    <input type="date" id="editEventDate" name="date" required>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editEventTime">Ora</label>
                                    <input type="time" id="editEventTime" name="time">
                                </div>
                                
                                <div class="form-group">
                                    <label for="editEventLocation">Luogo</label>
                                    <input type="text" id="editEventLocation" name="location">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="editEventNotes">Appunti</label>
                                <textarea id="editEventNotes" name="notes" rows="4"></textarea>
                            </div>
                            
                            <!-- SEZIONE VISIBILITÀ MIGLIORATA -->
                            <div class="visibility-section">
                                <h4>
                                    👁️ Impostazioni Visibilità
                                </h4>
                                
                                <!-- Membri -->
                                <div class="visibility-group">
                                    <div class="visibility-main-checkbox">
                                        <input type="checkbox" id="editMembriVisible" checked>
                                        <label for="editMembriVisible">
                                            👤 Visibile ai Membri
                                        </label>
                                    </div>
                                    
                                    <div class="visibility-sub-options">
                                        <div class="visibility-all-circuits">
                                            <input type="checkbox" id="editMembriAllCircuits" checked 
                                                   onchange="EventsManager.toggleCircuitSelection('editMembri', this)">
                                            <label for="editMembriAllCircuits">
                                                Tutti i circuiti
                                            </label>
                                        </div>
                                        
                                        <div id="editMembriCircuitsContainer" class="circuits-container-hidden">
                                            <div class="circuits-grid">
                                                ${this.circuits.map(circuit => `
                                                    <div class="circuit-checkbox">
                                                        <input type="checkbox" id="editMembriCircuit${circuit}">
                                                        <label for="editMembriCircuit${circuit}">
                                                            📍 ${circuit}
                                                        </label>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Consulenti -->
                                <div class="visibility-group">
                                    <div class="visibility-main-checkbox">
                                        <input type="checkbox" id="editConsulentiVisible" checked>
                                        <label for="editConsulentiVisible">
                                            💼 Visibile ai Consulenti
                                        </label>
                                    </div>
                                    
                                    <div class="visibility-sub-options">
                                        <div class="visibility-all-circuits">
                                            <input type="checkbox" id="editConsulentiAllCircuits" checked
                                                   onchange="EventsManager.toggleCircuitSelection('editConsulenti', this)">
                                            <label for="editConsulentiAllCircuits">
                                                Tutti i circuiti
                                            </label>
                                        </div>
                                        
                                        <div id="editConsulentiCircuitsContainer" class="circuits-container-hidden">
                                            <div class="circuits-grid">
                                                ${this.circuits.map(circuit => `
                                                    <div class="circuit-checkbox">
                                                        <input type="checkbox" id="editConsulentiCircuit${circuit}">
                                                        <label for="editConsulentiCircuit${circuit}">
                                                            📍 ${circuit}
                                                        </label>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="Utils.closeModal('editEventModal')">
                            Annulla
                        </button>
                        <button class="btn btn-primary" onclick="EventsManager.updateEvent()">
                            Salva Modifiche
                        </button>
                    </div>
                </div>
            `;
            modalsContainer.appendChild(editModal);
        }
        
        // Event Details Modal
        if (!document.getElementById('eventDetailsModal')) {
            const detailsModal = document.createElement('div');
            detailsModal.id = 'eventDetailsModal';
            detailsModal.className = 'modal';
            detailsModal.innerHTML = `
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3>📅 Dettagli Evento</h3>
                        <span class="close-modal" onclick="Utils.closeModal('eventDetailsModal')">&times;</span>
                    </div>
                    <div class="modal-body">
                        <!-- Content will be populated dynamically -->
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="Utils.closeModal('eventDetailsModal')">
                            Chiudi
                        </button>
                    </div>
                </div>
            `;
            modalsContainer.appendChild(detailsModal);
        }
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Form submit prevention
        const forms = ['createEventForm', 'editEventForm'];
        forms.forEach(formId => {
            const form = document.getElementById(formId);
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                });
            }
        });
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    EventsManager.init();
});

// Make EventsManager globally available
window.EventsManager = EventsManager;