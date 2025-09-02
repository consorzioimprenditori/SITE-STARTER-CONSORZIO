// ============================================
// CALENDAR.JS - Gestione Calendario
// ============================================

const Calendar = {
    // Show calendar section
    show() {
        this.createSection();
        showSection('calendarSection');
        this.generateCalendar();
    },

    createSection() {
        if (document.getElementById('calendarSection')) return;
        
        const sectionsContainer = document.getElementById('sectionsContainer');
        const section = document.createElement('div');
        section.id = 'calendarSection';
        section.className = 'section';
        section.innerHTML = `
            <div class="section-header">
                <button class="back-btn" onclick="goBack()">← Indietro</button>
                <h2>📅 Calendario Eventi</h2>
            </div>
            <div class="calendar-container">
                <div class="calendar-header">
                    <button class="calendar-nav" onclick="Calendar.previousMonth()">←</button>
                    <h3 id="currentMonth">Gennaio 2025</h3>
                    <button class="calendar-nav" onclick="Calendar.nextMonth()">→</button>
                </div>
                <div class="calendar-grid" id="calendarGrid">
                    <!-- Calendar will be generated here -->
                </div>
            </div>
            <div id="eventsList" style="margin-top: 25px;">
                <h3 style="margin-bottom: 15px;">Eventi del mese</h3>
                <div id="eventsContainer">
                    <!-- Events will be loaded here -->
                </div>
            </div>
        `;
        sectionsContainer.appendChild(section);
        this.addCalendarStyles();
    },

    // Add calendar-specific styles
    addCalendarStyles() {
        if (document.getElementById('calendarStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'calendarStyles';
        style.textContent = `
            .calendar-container {
                background: linear-gradient(135deg, rgba(42, 42, 62, 0.8) 0%, rgba(58, 58, 78, 0.6) 100%);
                border-radius: 20px;
                padding: 25px;
                margin-bottom: 25px;
                border: 1px solid rgba(199, 255, 0, 0.05);
            }
            
            .calendar-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 25px;
            }
            
            .calendar-header h3 {
                font-size: 18px;
                font-weight: 600;
            }
            
            .calendar-nav {
                background: linear-gradient(135deg, var(--bg-lighter) 0%, var(--bg-light) 100%);
                border: 1px solid rgba(199, 255, 0, 0.1);
                color: var(--text-primary);
                width: 40px;
                height: 40px;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
            }
            
            .calendar-nav:hover {
                background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                color: var(--bg-dark);
                transform: scale(1.1);
                box-shadow: 0 5px 20px var(--shadow-glow);
            }
            
            .calendar-grid {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 8px;
            }
            
            .calendar-day {
                aspect-ratio: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, var(--bg-medium) 0%, var(--bg-light) 100%);
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s;
                font-size: 14px;
                position: relative;
                border: 1px solid transparent;
            }
            
            .calendar-day:hover {
                background: linear-gradient(135deg, var(--bg-light) 0%, var(--bg-lighter) 100%);
                transform: scale(1.1);
                border-color: var(--primary);
            }
            
            .calendar-day.selected {
                background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                color: var(--bg-dark);
                font-weight: bold;
                box-shadow: 0 5px 20px var(--shadow-glow);
            }
            
            .calendar-day.today {
                border: 2px solid var(--primary);
                font-weight: 600;
            }
            
            .calendar-day.has-event::after {
                content: '';
                position: absolute;
                bottom: 4px;
                width: 5px;
                height: 5px;
                background: var(--primary);
                border-radius: 50%;
                box-shadow: 0 0 10px var(--shadow-glow);
            }
        `;
        document.head.appendChild(style);
    },

    // Generate calendar
    generateCalendar() {
        const grid = document.getElementById('calendarGrid');
        if (!grid) return;
        
        const daysInMonth = new Date(APP_STATE.currentYear, APP_STATE.currentMonth + 1, 0).getDate();
        const firstDayOfMonth = new Date(APP_STATE.currentYear, APP_STATE.currentMonth, 1);
        const firstDay = firstDayOfMonth.getDay();
        const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
        
        const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                          'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
        document.getElementById('currentMonth').textContent = 
            `${monthNames[APP_STATE.currentMonth]} ${APP_STATE.currentYear}`;
        
        let html = '';
        
        // Day headers
        ['L', 'M', 'M', 'G', 'V', 'S', 'D'].forEach(d => {
            html += `<div style="text-align: center; color: var(--text-muted); font-size: 12px; font-weight: 600;">${d}</div>`;
        });
        
        // Empty cells before month starts
        for (let i = 0; i < adjustedFirstDay; i++) {
            html += '<div></div>';
        }
        
        // Days of month
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(APP_STATE.currentYear, APP_STATE.currentMonth, day);
            const date = `${APP_STATE.currentYear}-${String(APP_STATE.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasEvent = APP_STATE.events.some(e => e.date === date);
            const isToday = today.toDateString() === currentDate.toDateString();
            
            html += `<div class="calendar-day ${hasEvent ? 'has-event' : ''} ${isToday ? 'today' : ''}" 
                     onclick="Calendar.selectDay(this, '${date}')">${day}</div>`;
        }
        
        grid.innerHTML = html;
        this.loadEvents();
    },

    // Select day
    selectDay(element, date) {
        document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
        element.classList.add('selected');
        
        const hasEvent = APP_STATE.events.some(e => e.date === date);
        if (hasEvent) {
            const event = APP_STATE.events.find(e => e.date === date);
            Utils.showToast(`📅 ${event.title} - ${event.time}`, 'info');
        }
    },

    // Load events
    loadEvents() {
        const container = document.getElementById('eventsContainer');
        if (!container) return;
        
        // Filter events for current month
        const currentMonthEvents = APP_STATE.events.filter(e => {
            const eventDate = new Date(e.date);
            return eventDate.getMonth() === APP_STATE.currentMonth && 
                   eventDate.getFullYear() === APP_STATE.currentYear;
        });
        
        if (currentMonthEvents.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">Nessun evento questo mese</p>';
            return;
        }
        
        container.innerHTML = currentMonthEvents.map(e => `
            <div class="card">
                <div class="card-title">${e.title}</div>
                <div class="card-meta">
                    <span>📅 ${Utils.formatDate(e.date)}</span>
                    <span>🕐 ${e.time}</span>
                    <span>📍 ${e.location}</span>
                </div>
            </div>
        `).join('');
    },

    // Navigate months
    previousMonth() {
        APP_STATE.currentMonth--;
        if (APP_STATE.currentMonth < 0) {
            APP_STATE.currentMonth = 11;
            APP_STATE.currentYear--;
        }
        this.generateCalendar();
    },

    nextMonth() {
        APP_STATE.currentMonth++;
        if (APP_STATE.currentMonth > 11) {
            APP_STATE.currentMonth = 0;
            APP_STATE.currentYear++;
        }
        this.generateCalendar();
    },

    // Add event (admin only)
    addEvent(title, date, time, location) {
        if (APP_STATE.currentUser.type !== 'admin') {
            Utils.showToast('⛔ Solo gli admin possono aggiungere eventi', 'error');
            return;
        }
        
        const newEvent = {
            id: Utils.generateId(),
            title: title,
            date: date,
            time: time,
            location: location,
            createdAt: new Date().toISOString()
        };
        
        APP_STATE.events.push(newEvent);
        saveState();
        this.generateCalendar();
        Utils.showToast('✅ Evento aggiunto!', 'success');
    }
};

// Make Calendar globally available
window.Calendar = Calendar;