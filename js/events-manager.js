// ============================================
// EVENTS-MANAGER.JS - Gestione Eventi COMPLETA E CORRETTA
// ============================================

const EventsManager = {
    // Initialize
    init() {
        console.log('EventsManager inizializzato');
        
        if (!APP_STATE.events) {
            APP_STATE.events = [];
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
        
        section.innerHTML = `
            <div class="section-header">
                <button class="back-btn" onclick="goBack()">← Indietro</button>
                <h2>📌 Lista Eventi</h2>
            </div>
            
            ${APP_STATE.currentUser && APP_STATE.currentUser.type === 'admin' ? 
                `<div style="text-align: center; margin: 20px 0;">
                    <button class="btn btn-primary" onclick="EventsManager.openCreateModal()">
                        ➕ CREA NUOVO EVENTO
                    </button>
                </div>` : ''
            }
            
            <div id="eventsList" style="margin-top: 20px;">
                <div class="loading">Caricamento eventi...</div>
            </div>
        `;
        
        sectionsContainer.appendChild(section);
    },
    
    // Load events list
    loadEventsList() {
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
                    <p style="color: #999;">Non ci sono eventi programmati</p>
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
                            </div>
                        </div>
                        
                        ${APP_STATE.currentUser && APP_STATE.currentUser.type === 'admin' ? `
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
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    },
    
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
    
    // Open create modal
    openCreateModal() {
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
    
    // Edit event - SENZA CONTROLLI SULLA DATA
    editEvent(eventId) {
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
    
    // Update event - SENZA CONTROLLI SULLA DATA
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
    
    // Delete event - SENZA CONTROLLI SULLA DATA
    deleteEvent(eventId) {
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
    console.log('✅ EventsManager caricato e pronto!');
});

// Make globally available
window.EventsManager = EventsManager;