// ============================================
// CALENDAR.JS - Calendario Eventi CORRETTO CON FONDO SCURO
// ============================================

const Calendar = {
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    
    // Initialize calendar
    init() {
        console.log('Calendar inizializzato');
        // Assicurati che APP_STATE.events esista
        if (!APP_STATE.events) {
            APP_STATE.events = [];
        }
    },
    
    // Show calendar view - FUNZIONE PRINCIPALE
    showCalendar() {
        console.log('ShowCalendar chiamato');
        this.createCalendarSection();
        
        // Usa la funzione globale showSection se esiste
        if (typeof showSection === 'function') {
            showSection('calendarSection');
        } else {
            // Fallback: gestisci manualmente la visibilità
            document.querySelectorAll('.section').forEach(s => {
                s.style.display = 'none';
            });
            const calendarSection = document.getElementById('calendarSection');
            if (calendarSection) {
                calendarSection.style.display = 'block';
            }
        }
        
        this.generateCalendar();
    },
    
    // Create calendar section
    createCalendarSection() {
        let section = document.getElementById('calendarSection');
        
        if (section) {
            this.generateCalendar();
            return;
        }
        
        const sectionsContainer = document.getElementById('sectionsContainer');
        if (!sectionsContainer) {
            console.error('sectionsContainer non trovato!');
            return;
        }
        
        section = document.createElement('div');
        section.id = 'calendarSection';
        section.className = 'section';
        section.style.display = 'none'; // Inizialmente nascosto
        section.innerHTML = `
            <div class="section-header">
                <button class="back-btn" onclick="goBack()">← Indietro</button>
                <h2>📅 Calendario Eventi</h2>
            </div>
            
            <div class="calendar-controls">
                <button class="btn btn-sm" onclick="Calendar.previousMonth()">◀</button>
                <span id="currentMonthYear" style="min-width: 200px; text-align: center;"></span>
                <button class="btn btn-sm" onclick="Calendar.nextMonth()">▶</button>
            </div>
            
            <div id="calendarContainer"></div>
            
            <div id="calendarEventsList" class="calendar-events-list"></div>
        `;
        
        sectionsContainer.appendChild(section);
        this.addCalendarStyles();
    },
    
    // Open create event modal
    openCreateEvent() {
        if (window.EventsManager && typeof EventsManager.openCreateEventModal === 'function') {
            EventsManager.openCreateEventModal();
        } else {
            Utils.showToast('❌ EventsManager non disponibile', 'error');
        }
    },
    
    // Generate calendar
    generateCalendar() {
        const container = document.getElementById('calendarContainer');
        if (!container) {
            console.error('calendarContainer non trovato!');
            return;
        }
        
        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        
        // Update month/year display
        const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                           'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
        const monthYearElement = document.getElementById('currentMonthYear');
        if (monthYearElement) {
            monthYearElement.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
        }
        
        // Get events for this month - FILTRATI PER VISIBILITÀ
        const monthEvents = this.getMonthEvents();
        console.log('🎯 Eventi del mese da visualizzare:', monthEvents.length);
        
        // Create calendar HTML
        let calendarHTML = '<div class="calendar-grid">';
        
      // Days of week headers - INIZIA DA LUNEDÌ
const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
daysOfWeek.forEach(day => {
    calendarHTML += `<div class="calendar-header">${day}</div>`;
});

// Empty cells for first week - ADATTATO PER LUNEDÌ
// Se firstDay è 0 (domenica), deve diventare 6 (ultima posizione)
// Se firstDay è 1 (lunedì), deve diventare 0 (prima posizione)
let adjustedFirstDay = firstDay - 1;
if (adjustedFirstDay === -1) {
    adjustedFirstDay = 6; // Domenica diventa ultima
}

for (let i = 0; i < adjustedFirstDay; i++) {
    calendarHTML += '<div class="calendar-day empty"></div>';
}
        
        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentYear, this.currentMonth, day);
            const dateStr = this.formatDateForComparison(date);
            const dayEvents = monthEvents.filter(e => e.date === dateStr);
            const isToday = this.isToday(date);
            
            // Log eventi per ogni giorno con eventi
            if (dayEvents.length > 0) {
                console.log(`📌 Giorno ${day}: ${dayEvents.length} eventi`);
            }
            
            // Determina se ci sono consulenze nel giorno
            const hasConsultation = dayEvents.some(e => e.isConsultation);
            const hasRegularEvent = dayEvents.some(e => !e.isConsultation);
            
            calendarHTML += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}"
                     onclick="Calendar.showDayEvents('${dateStr}')"
                     style="cursor: pointer;">
                    <div class="day-number">${day}</div>
                    ${dayEvents.length > 0 ? 
                        `<div class="event-indicators">
                            ${hasRegularEvent ? '<div class="event-dot event-type" title="Eventi"></div>' : ''}
                            ${hasConsultation ? '<div class="event-dot consultation-type" title="Consulenze"></div>' : ''}
                            ${dayEvents.length > 2 ? 
                                `<span class="more-events">+${dayEvents.length - 2}</span>` : ''
                            }
                        </div>` : ''
                    }
                </div>
            `;
        }
        
        calendarHTML += '</div>';
        
        // Add simplified legend - SOLO EVENTI E CONSULENZE
        calendarHTML += `
            <div class="calendar-legend">
                <h4>Legenda:</h4>
                <div class="legend-items">
                    <span><span class="event-dot event-type"></span> Eventi</span>
                    <span><span class="event-dot consultation-type"></span> Consulenze</span>
                </div>
            </div>
        `;
        
        container.innerHTML = calendarHTML;
    },
    
    // Get events for current month FILTERED BY VISIBILITY
    getMonthEvents() {
        const startDate = new Date(this.currentYear, this.currentMonth, 1);
        const endDate = new Date(this.currentYear, this.currentMonth + 1, 0);
        
        // Get ALL events from APP_STATE
        let events = APP_STATE.events || [];
        
        // LOG PER DEBUG - VEDIAMO TUTTI GLI EVENTI
        console.log('📅 Eventi totali in APP_STATE:', events.length);
        console.log('📅 Lista eventi completa:', events);
        
        // Filter by visibility for current user
        events = events.filter(event => this.isEventVisibleToUser(event));
        
        console.log('👁️ Eventi visibili per utente corrente:', events.length);
        
        // Filter by date range
        const filteredEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= startDate && eventDate <= endDate;
        });
        
        console.log('📆 Eventi nel mese corrente:', filteredEvents.length);
        console.log('📆 Dettaglio eventi del mese:', filteredEvents);
        
        return filteredEvents;
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
    
    // Show events for a specific day
    showDayEvents(dateStr) {
        console.log('🔍 Mostra eventi per data:', dateStr);
        
        // Get all events for this day
        let dayEvents = (APP_STATE.events || []).filter(e => e.date === dateStr);
        
        console.log('📋 Eventi trovati per questa data (prima del filtro visibilità):', dayEvents.length);
        
        // Filter by visibility
        dayEvents = dayEvents.filter(event => this.isEventVisibleToUser(event));
        
        console.log('📋 Eventi visibili per questa data:', dayEvents.length);
        
        const eventsListElement = document.getElementById('calendarEventsList');
        if (!eventsListElement) return;
        
        if (dayEvents.length === 0) {
            eventsListElement.innerHTML = `
                <div class="no-events">
                    <h3>📅 ${this.formatDateForDisplay(dateStr)}</h3>
                    <p>Nessun evento o consulenza in questa data</p>
                    ${APP_STATE.currentUser && APP_STATE.currentUser.type === 'admin' ? 
                        `<button class="btn btn-primary" onclick="Calendar.createEventForDate('${dateStr}')">
                            ➕ Crea Evento
                        </button>` : ''
                    }
                </div>
            `;
            return;
        }
        
        // Separa eventi e consulenze
        const regularEvents = dayEvents.filter(e => !e.isConsultation);
        const consultations = dayEvents.filter(e => e.isConsultation);
        
        let eventsHTML = `
            <div class="day-events">
                <h3>📅 ${this.formatDateForDisplay(dateStr)}</h3>
                <div class="events-list">
        `;
        
        // Mostra prima gli eventi regolari
        if (regularEvents.length > 0) {
            eventsHTML += '<h4 style="color: #c7ff00; margin-top: 15px;">📌 Eventi</h4>';
            regularEvents.forEach(event => {
                eventsHTML += `
                    <div class="event-card-mini event-type-card" onclick="Calendar.showEventDetails('${event.id}')">
                        <div class="event-time">${event.time || 'Tutto il giorno'}</div>
                        <div class="event-info">
                            <div class="event-title">
                                <span class="event-category-icon">${this.getCategoryIcon(event.category)}</span>
                                ${event.title}
                            </div>
                            ${event.location ? `<div class="event-location">📍 ${event.location}</div>` : ''}
                            ${event.notes ? `<div class="event-notes-preview">📝 ${event.notes.substring(0, 50)}...</div>` : ''}
                        </div>
                        ${APP_STATE.currentUser && APP_STATE.currentUser.type === 'admin' ? `
                            <div class="event-actions" onclick="event.stopPropagation()">
                                <button class="btn btn-sm btn-primary" onclick="Calendar.editEventFromCalendar('${event.id}')">✏️</button>
                                <button class="btn btn-sm btn-danger" onclick="Calendar.deleteEventFromCalendar('${event.id}')">🗑️</button>
                            </div>
                        ` : ''}
                    </div>
                `;
            });
        }
        
        // Mostra le consulenze
        if (consultations.length > 0) {
            eventsHTML += '<h4 style="color: #00bcd4; margin-top: 20px;">💼 Consulenze</h4>';
            consultations.forEach(consultation => {
                eventsHTML += `
                    <div class="event-card-mini consultation-type-card" onclick="Calendar.showConsultationDetails('${consultation.id}')">
                        <div class="event-time">${consultation.time || 'Da definire'}</div>
                        <div class="event-info">
                            <div class="event-title">
                                💼 ${consultation.title || 'Consulenza'}
                            </div>
                            ${consultation.consultant ? `<div class="event-location">👤 ${consultation.consultant}</div>` : ''}
                            ${consultation.specialty ? `<div class="event-notes-preview">📋 ${consultation.specialty}</div>` : ''}
                        </div>
                        ${APP_STATE.currentUser && APP_STATE.currentUser.type === 'admin' ? `
                            <div class="event-actions" onclick="event.stopPropagation()">
                                <button class="btn btn-sm btn-primary" onclick="Calendar.editConsultation('${consultation.id}')">✏️</button>
                                <button class="btn btn-sm btn-danger" onclick="Calendar.deleteConsultation('${consultation.id}')">🗑️</button>
                            </div>
                        ` : ''}
                    </div>
                `;
            });
        }
        
        eventsHTML += `
                </div>
                ${APP_STATE.currentUser && APP_STATE.currentUser.type === 'admin' ? 
                    `<button class="btn btn-primary btn-sm" onclick="Calendar.createEventForDate('${dateStr}')">
                        ➕ Aggiungi evento o consulenza
                    </button>` : ''
                }
            </div>
        `;
        
        eventsListElement.innerHTML = eventsHTML;
    },
    
    // Show event details
    showEventDetails(eventId) {
        console.log('👁️ Mostra dettagli evento:', eventId);
        if (window.EventsManager && typeof EventsManager.viewEventDetails === 'function') {
            EventsManager.viewEventDetails(eventId);
        } else {
            Utils.showToast('❌ Errore nel caricamento dettagli', 'error');
        }
    },
    
    // Show consultation details
    showConsultationDetails(consultationId) {
        console.log('👁️ Mostra dettagli consulenza:', consultationId);
        // Implementazione per mostrare i dettagli della consulenza
        const consultation = APP_STATE.events.find(e => e.id === consultationId);
        if (consultation) {
            Utils.showToast(`💼 Consulenza: ${consultation.title}`, 'info');
        }
    },
    
    // Edit event from calendar
    editEventFromCalendar(eventId) {
        event.stopPropagation();
        console.log('✏️ Modifica evento:', eventId);
        if (window.EventsManager && typeof EventsManager.editEvent === 'function') {
            EventsManager.editEvent(eventId);
        }
    },
    
    // Delete event from calendar
    deleteEventFromCalendar(eventId) {
        event.stopPropagation();
        console.log('🗑️ Elimina evento:', eventId);
        if (window.EventsManager && typeof EventsManager.deleteEvent === 'function') {
            EventsManager.deleteEvent(eventId);
        }
    },
    
    // Edit consultation
    editConsultation(consultationId) {
        event.stopPropagation();
        console.log('✏️ Modifica consulenza:', consultationId);
        Utils.showToast('✏️ Modifica consulenza in arrivo', 'info');
    },
    
    // Delete consultation
    deleteConsultation(consultationId) {
        event.stopPropagation();
        console.log('🗑️ Elimina consulenza:', consultationId);
        if (confirm('Eliminare questa consulenza?')) {
            APP_STATE.events = APP_STATE.events.filter(e => e.id !== consultationId);
            saveState();
            this.generateCalendar();
            Utils.showToast('✅ Consulenza eliminata', 'success');
        }
    },
    
    // Create event for specific date
    createEventForDate(dateStr) {
        console.log('➕ Crea evento per data:', dateStr);
        if (window.EventsManager && typeof EventsManager.openCreateEventModal === 'function') {
            EventsManager.openCreateEventModal();
            // Imposta la data nel form
            setTimeout(() => {
                const dateInput = document.getElementById('eventDate');
                if (dateInput) {
                    dateInput.value = dateStr;
                    console.log('📅 Data impostata nel form:', dateStr);
                }
            }, 100);
        }
    },
    
    // Navigate to previous month
    previousMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        console.log('⬅️ Mese precedente:', this.currentMonth + 1, '/', this.currentYear);
        this.generateCalendar();
    },
    
    // Navigate to next month
    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        console.log('➡️ Mese successivo:', this.currentMonth + 1, '/', this.currentYear);
        this.generateCalendar();
    },
    
    // Check if date is today
    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    },
    
    // Format date for comparison (YYYY-MM-DD)
    formatDateForComparison(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    
    // Format date for display
    formatDateForDisplay(dateStr) {
        const date = new Date(dateStr);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('it-IT', options);
    },
    
    // Get category icon
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
    
    // Add calendar styles
    addCalendarStyles() {
        if (document.getElementById('calendarStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'calendarStyles';
        style.innerHTML = `
            /* CALENDARIO CON FONDO SCURO */
            .calendar-grid {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 8px;
                margin: 20px 0;
                background: rgba(30, 30, 40, 0.95);
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                border: 1px solid rgba(199, 255, 0, 0.1);
                min-height: 500px;
            }
            
            .calendar-header {
                font-weight: bold;
                text-align: center;
                padding: 10px;
                background: linear-gradient(135deg, rgba(199, 255, 0, 0.2) 0%, rgba(199, 255, 0, 0.1) 100%);
                color: #c7ff00;
                border-radius: 8px;
                border: 1px solid rgba(199, 255, 0, 0.2);
            }
            
            .calendar-day {
                min-height: 80px;
                padding: 8px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
                position: relative;
                background: rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(5px);
            }
            
            .calendar-day:hover {
                background: rgba(199, 255, 0, 0.1);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(199, 255, 0, 0.2);
                border-color: rgba(199, 255, 0, 0.3);
            }
            
            .calendar-day.empty {
                background: rgba(0, 0, 0, 0.2);
                cursor: default;
                opacity: 0.3;
            }
            
            .calendar-day.empty:hover {
                transform: none;
                box-shadow: none;
                background: rgba(0, 0, 0, 0.2);
            }
            
            .calendar-day.today {
                background: linear-gradient(135deg, rgba(199, 255, 0, 0.2) 0%, rgba(199, 255, 0, 0.1) 100%);
                border: 2px solid #c7ff00;
                box-shadow: 0 0 15px rgba(199, 255, 0, 0.3);
            }
            
            .calendar-day.has-events {
                background: rgba(199, 255, 0, 0.08);
                border-color: rgba(199, 255, 0, 0.2);
            }
            
            .day-number {
                font-weight: bold;
                margin-bottom: 5px;
                font-size: 16px;
                color: #ffffff;
            }
            
            .calendar-day.today .day-number {
                color: #c7ff00;
            }
            
            .event-indicators {
                display: flex;
                gap: 5px;
                flex-wrap: wrap;
                margin-top: 8px;
            }
            
            .event-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                display: inline-block;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            
            /* COLORI PER EVENTI E CONSULENZE */
            .event-dot.event-type { 
                background: linear-gradient(135deg, #c7ff00, #a8e000);
                box-shadow: 0 0 8px rgba(199, 255, 0, 0.5);
            }
            
            .event-dot.consultation-type { 
                background: linear-gradient(135deg, #00bcd4, #0097a7);
                box-shadow: 0 0 8px rgba(0, 188, 212, 0.5);
            }
            
            .more-events {
                font-size: 10px;
                color: #c7ff00;
                margin-left: 4px;
                font-weight: bold;
            }
            
            .calendar-controls {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin: 20px 0;
                padding: 15px;
                background: rgba(42, 42, 62, 0.8);
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                gap: 15px;
                border: 1px solid rgba(199, 255, 0, 0.1);
            }
            
            .calendar-controls .btn {
                min-width: 45px;
            }
            
            #currentMonthYear {
                font-size: 20px;
                font-weight: bold;
                color: #c7ff00;
                text-shadow: 0 0 10px rgba(199, 255, 0, 0.3);
                text-align: center;
                flex: 1;
            }
            
            /* LEGGENDA CON SFONDO SCURO - SOLO EVENTI E CONSULENZE */
            .calendar-legend {
                background: rgba(30, 30, 40, 0.95);
                padding: 20px;
                border-radius: 12px;
                margin-top: 20px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                border: 1px solid rgba(199, 255, 0, 0.1);
            }
            
            .calendar-legend h4 {
                color: #c7ff00;
                margin-bottom: 15px;
                font-size: 18px;
                text-shadow: 0 0 10px rgba(199, 255, 0, 0.3);
            }
            
            .legend-items {
                display: flex;
                gap: 30px;
                margin-top: 10px;
            }
            
            .legend-items span {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 16px;
                color: #ffffff;
                padding: 8px 15px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                transition: all 0.3s;
            }
            
            .legend-items span:hover {
                background: rgba(255, 255, 255, 0.1);
                transform: translateY(-2px);
            }
            
            .calendar-events-list {
                margin-top: 20px;
            }
            
            .day-events {
                background: rgba(30, 30, 40, 0.95);
                padding: 25px;
                border-radius: 12px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                border: 1px solid rgba(199, 255, 0, 0.1);
            }
            
            .day-events h3 {
                margin-bottom: 20px;
                color: #c7ff00;
                text-shadow: 0 0 10px rgba(199, 255, 0, 0.3);
            }
            
            .event-card-mini {
                background: rgba(255, 255, 255, 0.05);
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 10px;
                cursor: pointer;
                transition: all 0.3s;
                border-left: 4px solid;
                position: relative;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .event-card-mini.event-type-card {
                border-left: 4px solid #c7ff00;
                background: rgba(199, 255, 0, 0.05);
            }
            
            .event-card-mini.consultation-type-card {
                border-left: 4px solid #00bcd4;
                background: rgba(0, 188, 212, 0.05);
            }
            
            .event-card-mini:hover {
                background: rgba(255, 255, 255, 0.1);
                transform: translateX(5px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            }
            
            .event-time {
                font-size: 12px;
                color: #aaa;
                margin-bottom: 5px;
                font-weight: 600;
            }
            
            .event-title {
                font-weight: bold;
                margin-bottom: 5px;
                color: #ffffff;
            }
            
            .event-location {
                font-size: 12px;
                color: #aaa;
            }
            
            .event-notes-preview {
                font-size: 11px;
                color: #888;
                font-style: italic;
                margin-top: 5px;
            }
            
            .event-actions {
                position: absolute;
                top: 10px;
                right: 10px;
                display: flex;
                gap: 5px;
            }
            
            .event-actions .btn {
                padding: 4px 8px;
                font-size: 12px;
            }
            
            .no-events {
                text-align: center;
                padding: 40px;
                background: rgba(30, 30, 40, 0.95);
                border-radius: 12px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                border: 1px solid rgba(199, 255, 0, 0.1);
            }
            
            .no-events h3 {
                color: #c7ff00;
                margin-bottom: 10px;
            }
            
            .no-events p {
                color: #aaa;
                margin-bottom: 20px;
            }
        `;
        document.head.appendChild(style);
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    Calendar.init();
    console.log('🚀 Calendar.js caricato e inizializzato');
});

// Make Calendar globally available
window.Calendar = Calendar;