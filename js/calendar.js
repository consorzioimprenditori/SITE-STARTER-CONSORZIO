// ============================================
// CALENDAR.JS - Calendario Eventi CORRETTO
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
                ${APP_STATE.currentUser && APP_STATE.currentUser.type === 'admin' ? 
                    `<button class="btn btn-primary btn-sm" onclick="Calendar.openCreateEvent()">
                        ➕ Nuovo Evento
                    </button>` : ''
                }
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
        console.log('Eventi del mese:', monthEvents.length);
        
        // Create calendar HTML
        let calendarHTML = '<div class="calendar-grid">';
        
        // Days of week headers
        const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
        daysOfWeek.forEach(day => {
            calendarHTML += `<div class="calendar-header">${day}</div>`;
        });
        
        // Empty cells for first week
        const adjustedFirstDay = firstDay === 0 ? 7 : firstDay;
        for (let i = 1; i < adjustedFirstDay; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }
        
        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentYear, this.currentMonth, day);
            const dateStr = this.formatDateForComparison(date);
            const dayEvents = monthEvents.filter(e => e.date === dateStr);
            const isToday = this.isToday(date);
            
            calendarHTML += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}"
                     onclick="Calendar.showDayEvents('${dateStr}')"
                     style="cursor: pointer;">
                    <div class="day-number">${day}</div>
                    ${dayEvents.length > 0 ? 
                        `<div class="event-indicators">
                            ${dayEvents.slice(0, 3).map(e => 
                                `<div class="event-dot ${e.category}" 
                                      title="${e.title}"></div>`
                            ).join('')}
                            ${dayEvents.length > 3 ? 
                                `<span class="more-events">+${dayEvents.length - 3}</span>` : ''
                            }
                        </div>` : ''
                    }
                </div>
            `;
        }
        
        calendarHTML += '</div>';
        
        // Add legend
        calendarHTML += `
            <div class="calendar-legend">
                <h4>Legenda:</h4>
                <div class="legend-items">
                    <span><span class="event-dot meeting"></span> Meeting</span>
                    <span><span class="event-dot workshop"></span> Workshop</span>
                    <span><span class="event-dot conference"></span> Conferenza</span>
                    <span><span class="event-dot social"></span> Social</span>
                    <span><span class="event-dot training"></span> Formazione</span>
                    <span><span class="event-dot other"></span> Altro</span>
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
        
        // Filter by visibility for current user
        events = events.filter(event => this.isEventVisibleToUser(event));
        
        // Filter by date range
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= startDate && eventDate <= endDate;
        });
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
        // Get all events for this day
        let dayEvents = (APP_STATE.events || []).filter(e => e.date === dateStr);
        
        // Filter by visibility
        dayEvents = dayEvents.filter(event => this.isEventVisibleToUser(event));
        
        const eventsListElement = document.getElementById('calendarEventsList');
        if (!eventsListElement) return;
        
        if (dayEvents.length === 0) {
            eventsListElement.innerHTML = `
                <div class="no-events">
                    <h3>📅 ${this.formatDateForDisplay(dateStr)}</h3>
                    <p>Nessun evento in questa data</p>
                    ${APP_STATE.currentUser && APP_STATE.currentUser.type === 'admin' ? 
                        `<button class="btn btn-primary" onclick="Calendar.createEventForDate('${dateStr}')">
                            ➕ Crea Evento
                        </button>` : ''
                    }
                </div>
            `;
            return;
        }
        
        let eventsHTML = `
            <div class="day-events">
                <h3>📅 Eventi del ${this.formatDateForDisplay(dateStr)}</h3>
                <div class="events-list">
        `;
        
        dayEvents.forEach(event => {
            eventsHTML += `
                <div class="event-card-mini" onclick="Calendar.showEventDetails('${event.id}')">
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
        
        eventsHTML += `
                </div>
                ${APP_STATE.currentUser && APP_STATE.currentUser.type === 'admin' ? 
                    `<button class="btn btn-primary btn-sm" onclick="Calendar.createEventForDate('${dateStr}')">
                        ➕ Aggiungi altro evento
                    </button>` : ''
                }
            </div>
        `;
        
        eventsListElement.innerHTML = eventsHTML;
    },
    
    // Show event details
    showEventDetails(eventId) {
        if (window.EventsManager && typeof EventsManager.viewEventDetails === 'function') {
            EventsManager.viewEventDetails(eventId);
        } else {
            Utils.showToast('❌ Errore nel caricamento dettagli', 'error');
        }
    },
    
    // Edit event from calendar
    editEventFromCalendar(eventId) {
        event.stopPropagation();
        if (window.EventsManager && typeof EventsManager.editEvent === 'function') {
            EventsManager.editEvent(eventId);
        }
    },
    
    // Delete event from calendar
    deleteEventFromCalendar(eventId) {
        event.stopPropagation();
        if (window.EventsManager && typeof EventsManager.deleteEvent === 'function') {
            EventsManager.deleteEvent(eventId);
        }
    },
    
    // Create event for specific date
    createEventForDate(dateStr) {
        if (window.EventsManager && typeof EventsManager.openCreateEventModal === 'function') {
            EventsManager.openCreateEventModal();
            // Imposta la data nel form
            setTimeout(() => {
                const dateInput = document.getElementById('eventDate');
                if (dateInput) {
                    dateInput.value = dateStr;
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
        this.generateCalendar();
    },
    
    // Navigate to next month
    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
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
            .calendar-grid {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 10px;
                margin: 20px 0;
                background: white;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .calendar-header {
                font-weight: bold;
                text-align: center;
                padding: 10px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 8px;
            }
            
            .calendar-day {
                min-height: 80px;
                padding: 8px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
                position: relative;
                background: white;
            }
            
            .calendar-day:hover {
                background: #f5f5f5;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            
            .calendar-day.empty {
                background: #fafafa;
                cursor: default;
            }
            
            .calendar-day.empty:hover {
                transform: none;
                box-shadow: none;
            }
            
            .calendar-day.today {
                background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                border: 2px solid #2196F3;
            }
            
            .calendar-day.has-events {
                background: linear-gradient(135deg, #f1f8e9 0%, #dcedc8 100%);
            }
            
            .day-number {
                font-weight: bold;
                margin-bottom: 5px;
                font-size: 16px;
            }
            
            .event-indicators {
                display: flex;
                gap: 3px;
                flex-wrap: wrap;
                margin-top: 5px;
            }
            
            .event-dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                display: inline-block;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            }
            
            .event-dot.meeting { background: #2196F3; }
            .event-dot.workshop { background: #FF9800; }
            .event-dot.conference { background: #9C27B0; }
            .event-dot.social { background: #F44336; }
            .event-dot.training { background: #4CAF50; }
            .event-dot.other { background: #607D8B; }
            
            .more-events {
                font-size: 10px;
                color: #666;
                margin-left: 4px;
                font-weight: bold;
            }
            
            .calendar-controls {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin: 20px 0;
                padding: 15px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                gap: 15px;
            }
            
            #currentMonthYear {
                font-size: 20px;
                font-weight: bold;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            
            .calendar-legend {
                background: white;
                padding: 15px;
                border-radius: 12px;
                margin-top: 20px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }
            
            .legend-items {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
                margin-top: 10px;
            }
            
            .legend-items span {
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 14px;
            }
            
            .calendar-events-list {
                margin-top: 20px;
            }
            
            .day-events {
                background: white;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }
            
            .day-events h3 {
                margin-bottom: 15px;
                color: #333;
            }
            
            .event-card-mini {
                background: linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 100%);
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 10px;
                cursor: pointer;
                transition: all 0.3s;
                border-left: 4px solid;
                border-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1;
                position: relative;
            }
            
            .event-card-mini:hover {
                background: linear-gradient(135deg, #e8e8e8 0%, #d8d8d8 100%);
                transform: translateX(5px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            
            .event-time {
                font-size: 12px;
                color: #666;
                margin-bottom: 5px;
                font-weight: 600;
            }
            
            .event-title {
                font-weight: bold;
                margin-bottom: 5px;
                color: #333;
            }
            
            .event-location {
                font-size: 12px;
                color: #666;
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
                background: white;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }
            
            .no-events h3 {
                color: #666;
                margin-bottom: 10px;
            }
            
            .no-events p {
                color: #999;
                margin-bottom: 20px;
            }
        `;
        document.head.appendChild(style);
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    Calendar.init();
});

// Make Calendar globally available
window.Calendar = Calendar;