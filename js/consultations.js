// ============================================
// CONSULTATIONS.JS - Gestione Consulenze
// ============================================

const Consultations = {
    // Show consultations section
    show() {
        this.createSection();
        showSection('consultantsSection');
        this.loadConsultants();
    },

    createSection() {
        if (document.getElementById('consultantsSection')) return;
        
        const sectionsContainer = document.getElementById('sectionsContainer');
        const section = document.createElement('div');
        section.id = 'consultantsSection';
        section.className = 'section';
        section.innerHTML = `
            <div class="section-header">
                <button class="back-btn" onclick="goBack()">← Indietro</button>
                <h2>💼 Area Consulenze</h2>
            </div>
            
            <div class="stats-row" style="margin-bottom: 25px;">
                <div class="stat-card">
                    <div class="stat-value" id="freeConsultations">10</div>
                    <div class="stat-label">Gratuite rimaste</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="usedConsultations">0</div>
                    <div class="stat-label">Utilizzate</div>
                </div>
            </div>

            <div class="search-container">
                <span class="search-icon">🔍</span>
                <input type="text" class="search-input" placeholder="Cerca specializzazione..." id="consultantSearch" onkeyup="Consultations.filter()">
            </div>

            <div id="consultantsList"></div>
        `;
        sectionsContainer.appendChild(section);
    },

    // Load consultants list
    loadConsultants() {
        const list = document.getElementById('consultantsList');
        const used = Object.keys(APP_STATE.consultations).length;
        
        document.getElementById('usedConsultations').textContent = used;
        document.getElementById('freeConsultations').textContent = Math.max(0, CONFIG.consultations.maxFree - used);
        
        list.innerHTML = CONFIG.consultantSpecialties.map((spec, i) => {
            const isBooked = APP_STATE.consultations[i];
            const isFree = used < CONFIG.consultations.maxFree && !isBooked;
            
            return `
                <div class="card" onclick="Consultations.book(${i}, '${spec}')">
                    <div class="card-title">${spec}</div>
                    <div class="card-meta">
                        <span class="status-badge ${isFree ? 'status-free' : 'status-paid'}">
                            ${isFree ? '✅ Gratuita' : '💰 A pagamento'}
                        </span>
                        ${isBooked ? '<span style="color: var(--primary);">📅 Prenotata</span>' : ''}
                    </div>
                </div>
            `;
        }).join('');
    },

    // Book consultation
    book(index, specialty) {
        const isBooked = APP_STATE.consultations[index] !== undefined;
        const totalUsed = Object.keys(APP_STATE.consultations).length;
        
        // Check 24h rule for modifications
        if (isBooked && APP_STATE.consultations[index].date) {
            const bookingDate = new Date(APP_STATE.consultations[index].date + ' ' + APP_STATE.consultations[index].time);
            const now = new Date();
            const hoursDiff = (bookingDate - now) / (1000 * 60 * 60);
            
            if (hoursDiff > 0 && hoursDiff < CONFIG.consultations.modificationDeadline) {
                Utils.showToast(`⚠️ Non puoi modificare una consulenza a meno di ${CONFIG.consultations.modificationDeadline} ore dall'appuntamento. Contatta: ${CONFIG.contacts.phone}`, 'error');
                return;
            }
        }
        
        this.createBookingModal();
        
        // Set consultant name
        document.getElementById('consultantName').value = 'Consulente ' + specialty;
        
        // Show/hide payment warning
        const needsPayment = isBooked || totalUsed >= CONFIG.consultations.maxFree;
        const paymentWarning = document.getElementById('paymentWarning');
        if (paymentWarning) {
            paymentWarning.classList.toggle('hidden', !needsPayment);
        }
        
        // Store current booking info
        APP_STATE.currentBooking = { index, specialty, isSecond: isBooked, needsPayment };
        
        Utils.openModal('bookingModal');
    },

    // Create booking modal
    createBookingModal() {
        if (document.getElementById('bookingModal')) return;
        
        const modalsContainer = document.getElementById('modalsContainer');
        const modal = document.createElement('div');
        modal.id = 'bookingModal';
        modal.className = 'modal';
        
        // Set tomorrow as default date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const minDate = tomorrow.toISOString().split('T')[0];
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">📅 Prenota Consulenza</h3>
                    <button class="close-modal" onclick="Utils.closeModal('bookingModal')">×</button>
                </div>
                <form onsubmit="Consultations.submitBooking(event)">
                    <div class="form-group">
                        <label>Consulente</label>
                        <input type="text" id="consultantName" readonly style="background: rgba(199, 255, 0, 0.05); border-color: var(--primary);">
                    </div>
                    <div class="form-group">
                        <label>Tipo di consulenza</label>
                        <select id="consultationType">
                            <option value="presence">In presenza (durante riunione mensile)</option>
                            <option value="online">Online</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Data proposta</label>
                        <input type="date" id="bookingDate" required min="${minDate}" value="${minDate}">
                    </div>
                    <div class="form-group">
                        <label>Ora</label>
                        <select id="bookingTime" required>
                            <option value="">Seleziona orario</option>
                            <option value="09:00">09:00</option>
                            <option value="10:00">10:00</option>
                            <option value="11:00">11:00</option>
                            <option value="14:00">14:00</option>
                            <option value="15:00">15:00</option>
                            <option value="16:00">16:00</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Note</label>
                        <textarea rows="3" id="bookingNotes" placeholder="Descrivi brevemente l'argomento..."></textarea>
                    </div>
                    <div id="paymentWarning" class="hidden card" style="background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%); margin-bottom: 20px;">
                        <p style="color: var(--warning); font-size: 14px;">
                            ⚠️ Questa è la tua seconda consulenza con questo specialista. 
                            Sarà a pagamento secondo le tariffe concordate.
                        </p>
                    </div>
                    <button type="submit" class="btn">INVIA RICHIESTA</button>
                </form>
            </div>
        `;
        modalsContainer.appendChild(modal);
    },

    // Submit booking
    submitBooking(event) {
        event.preventDefault();
        
        if (!APP_STATE.currentBooking) {
            Utils.showToast('❌ Errore: riprova a selezionare la consulenza', 'error');
            Utils.closeModal('bookingModal');
            return;
        }
        
        const bookingData = {
            date: document.getElementById('bookingDate').value,
            time: document.getElementById('bookingTime').value,
            type: document.getElementById('consultationType').value,
            notes: document.getElementById('bookingNotes').value,
            specialty: APP_STATE.currentBooking.specialty,
            isPaid: APP_STATE.currentBooking.needsPayment || false,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        if (!bookingData.date || !bookingData.time) {
            Utils.showToast('⚠️ Compila tutti i campi obbligatori', 'error');
            return;
        }
        
        const bookingDateTime = new Date(bookingData.date + ' ' + bookingData.time);
        if (bookingDateTime <= new Date()) {
            Utils.showToast('⚠️ La data deve essere futura', 'error');
            return;
        }
        
        APP_STATE.consultations[APP_STATE.currentBooking.index] = bookingData;
        saveState();
        Utils.closeModal('bookingModal');
        
        if (APP_STATE.currentBooking.needsPayment) {
            Utils.showToast('✅ Consulenza a pagamento prenotata! Ti contatteremo per i dettagli.', 'success');
        } else {
            Utils.showToast('✅ Consulenza gratuita prenotata con successo!', 'success');
        }
        
        Dashboard.updateStats();
        if (document.getElementById('consultantsSection').classList.contains('active')) {
            this.loadConsultants();
        }
        
        console.log('📧 Email to:', CONFIG.contacts.email);
        console.log('📱 WhatsApp to:', CONFIG.contacts.whatsapp);
        console.log('Booking details:', bookingData);
        
        APP_STATE.currentBooking = null;
    },

    // Filter consultants
    filter() {
        const search = document.getElementById('consultantSearch').value.toLowerCase();
        document.querySelectorAll('#consultantsList .card').forEach(card => {
            card.style.display = card.textContent.toLowerCase().includes(search) ? 'block' : 'none';
        });
    },

    // Show my consultations (for consultants)
    showMy() {
        this.createMyConsultationsSection();
        showSection('myConsultationsSection');
        this.loadMyConsultationsList();
    },

    createMyConsultationsSection() {
        if (document.getElementById('myConsultationsSection')) return;
        
        const sectionsContainer = document.getElementById('sectionsContainer');
        const section = document.createElement('div');
        section.id = 'myConsultationsSection';
        section.className = 'section';
        section.innerHTML = `
            <div class="section-header">
                <button class="back-btn" onclick="goBack()">← Indietro</button>
                <h2>📋 Le Mie Consulenze</h2>
            </div>
            <div id="myConsultationsList"></div>
        `;
        sectionsContainer.appendChild(section);
    },

    loadMyConsultationsList() {
        const list = document.getElementById('myConsultationsList');
        const consultations = [];
        
        Object.keys(APP_STATE.consultations).forEach(key => {
            const cons = APP_STATE.consultations[key];
            if (cons) {
                consultations.push({
                    ...cons,
                    specialty: CONFIG.consultantSpecialties[key] || 'Consulenza'
                });
            }
        });
        
        if (consultations.length === 0) {
            list.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">Nessuna consulenza prenotata</p>';
            return;
        }
        
        list.innerHTML = consultations.map(c => `
            <div class="card">
                <div class="card-title">${c.specialty}</div>
                <div class="card-subtitle">${c.date} alle ${c.time}</div>
                <div class="card-meta">
                    <span class="status-badge status-free">Confermata</span>
                </div>
            </div>
        `).join('');
    }
};

// Make Consultations globally available
window.Consultations = Consultations;