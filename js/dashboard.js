// ============================================
// DASHBOARD.JS - Gestione Dashboard
// ============================================

const Dashboard = {
    // Create dashboard HTML
    createDashboard() {
        const container = document.getElementById('dashboardContainer');
        container.innerHTML = `
            <div id="dashboard" class="dashboard">
                <div class="user-header">
                    <div class="user-info">
                        <div class="user-avatar" id="userAvatar">A</div>
                        <div class="user-details">
                            <h2 id="userName">Utente</h2>
                            <span class="user-role" id="userRole">Admin</span>
                        </div>
                    </div>
                    
                    <div class="stats-row">
                        <div class="stat-card">
                            <div class="stat-value" id="statConsulenze">0</div>
                            <div class="stat-label">Consulenze</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="statEventi">0</div>
                            <div class="stat-label">Eventi</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="statNotifiche">0</div>
                            <div class="stat-label">Notifiche</div>
                        </div>
                    </div>

                    <div id="countdownContainer" class="countdown-container hidden" style="margin-top: 20px; background: linear-gradient(135deg, rgba(255, 68, 68, 0.1) 0%, rgba(255, 68, 68, 0.05) 100%); border: 1px solid rgba(255, 68, 68, 0.3); padding: 12px; border-radius: 12px;">
                        <div style="font-size: 12px; color: var(--text-secondary);">⚠️ Scadenza contratto</div>
                        <div id="countdownTime" style="font-size: 18px; font-weight: bold; color: var(--danger);">30 giorni</div>
                    </div>
                </div>

                <div class="search-container">
                    <span class="search-icon">🔍</span>
                    <input type="text" class="search-input" placeholder="Cerca nel consorzio..." id="globalSearch">
                </div>

                <div id="menuContainer" class="menu-grid">
                    <!-- Menu items will be dynamically inserted here -->
                </div>

                <div style="display: flex; gap: 12px; margin-top: 25px;">
                    <button class="btn btn-secondary" onclick="Dashboard.showProfile()">👤 Profilo</button>
                    <button class="btn btn-danger" onclick="Auth.logout()">🚪 Esci</button>
                </div>
            </div>
        `;
    },

    // Update user info
    updateUserInfo() {
        document.getElementById('userName').textContent = APP_STATE.currentUser.name;
        document.getElementById('userRole').textContent = 
            APP_STATE.currentUser.type.charAt(0).toUpperCase() + APP_STATE.currentUser.type.slice(1);
        document.getElementById('userAvatar').textContent = 
            APP_STATE.currentUser.name.charAt(0).toUpperCase();
    },

    // Update statistics
    updateStats() {
        document.getElementById('statConsulenze').textContent = Object.keys(APP_STATE.consultations).length;
        document.getElementById('statEventi').textContent = APP_STATE.events.length;
        document.getElementById('statNotifiche').textContent = APP_STATE.notifications.length;
    },

    // Show countdown for members
    showCountdown() {
        const container = document.getElementById('countdownContainer');
        if (container) {
            container.classList.remove('hidden');
            this.updateCountdown();
        }
    },

    updateCountdown() {
        const days = Utils.calculateDaysRemaining(APP_STATE.currentUser.contractEnd);
        document.getElementById('countdownTime').textContent = `${days} giorni`;
    },

    // Load menu based on user type
    loadMenu() {
        const menuContainer = document.getElementById('menuContainer');
        const menus = {
            admin: [
                { icon: '⚙️', title: 'Amministrazione', action: 'Dashboard.showAdmin', badge: 2 },
                { icon: '📅', title: 'Calendario', action: 'Calendar.show', badge: APP_STATE.events.length },
                { icon: '💬', title: 'Chat', action: 'Chat.show', badge: 0 },
                { icon: '📊', title: 'Statistiche', action: 'Dashboard.showStats', badge: 0 }
            ],
            membro: [
                { icon: '📅', title: 'Calendario', action: 'Calendar.show', badge: APP_STATE.events.length },
                { icon: '💼', title: 'Consulenze', action: 'Consultations.show', badge: 0 },
                { icon: '💬', title: 'Chat', action: 'Chat.show', badge: 0 },
                { icon: '🎬', title: 'Video', action: 'Dashboard.showVideo', badge: 0 },
                { icon: '📋', title: 'Bacheca', action: 'Dashboard.showBulletin', badge: 2 },
                { icon: '🤝', title: 'Convenzioni', action: 'Dashboard.showConventions', badge: 1 },
                { icon: '🚀', title: 'Progetti', action: 'Dashboard.showProjects', badge: 0 },
                { icon: '🆔', title: 'Pass.Digitale', action: 'Dashboard.showPassport', badge: 0 },
                { icon: '📰', title: 'Rivista', action: 'Dashboard.showMagazine', badge: 0 }
            ],
            consulente: [
                { icon: '📅', title: 'Calendario', action: 'Calendar.show', badge: APP_STATE.events.length },
                { icon: '📋', title: 'Consulenze', action: 'Consultations.showMy', badge: Object.keys(APP_STATE.consultations).length },
                { icon: '💬', title: 'Chat', action: 'Chat.show', badge: 0 },
                { icon: '🤝', title: 'Convenzioni', action: 'Dashboard.showConventions', badge: 1 }
            ]
        };

        const items = menus[APP_STATE.currentUser.type] || [];
        menuContainer.innerHTML = items.map((item) => `
            <div class="menu-item" onclick="${item.action}()">
                <div class="menu-icon">${item.icon}</div>
                <div class="menu-title">${item.title}</div>
                ${item.badge > 0 ? `<div class="notification-badge">${item.badge}</div>` : ''}
            </div>
        `).join('');
    },

    // Show sections
    showAdmin() {
        if (APP_STATE.currentUser.type !== 'admin') {
            Utils.showToast('⛔ Accesso negato', 'error');
            return;
        }
        this.createAdminSection();
        showSection('adminSection');
    },

    createAdminSection() {
        if (document.getElementById('adminSection')) return;
        
        const sectionsContainer = document.getElementById('sectionsContainer');
        const section = document.createElement('div');
        section.id = 'adminSection';
        section.className = 'section';
        section.innerHTML = `
            <div class="section-header">
                <button class="back-btn" onclick="goBack()">← Indietro</button>
                <h2>⚙️ Pannello Amministrazione</h2>
            </div>
            <div class="menu-grid">
                <div class="menu-item" onclick="Members.showManagement()">
                    <div class="menu-icon">👥</div>
                    <div class="menu-title">Gestisci Membri</div>
                </div>
                <div class="menu-item" onclick="Dashboard.manageConsultants()">
                    <div class="menu-icon">💼</div>
                    <div class="menu-title">Gestisci Consulenti</div>
                </div>
                <div class="menu-item" onclick="Dashboard.manageEvents()">
                    <div class="menu-icon">📅</div>
                    <div class="menu-title">Gestisci Eventi</div>
                </div>
                <div class="menu-item" onclick="Dashboard.manageAreas()">
                    <div class="menu-icon">🗺️</div>
                    <div class="menu-title">Gestisci Aree</div>
                </div>
            </div>
        `;
        sectionsContainer.appendChild(section);
    },

    showStats() {
        this.createStatsSection();
        showSection('statsSection');
    },

    createStatsSection() {
        if (document.getElementById('statsSection')) return;
        
        const sectionsContainer = document.getElementById('sectionsContainer');
        const section = document.createElement('div');
        section.id = 'statsSection';
        section.className = 'section';
        section.innerHTML = `
            <div class="section-header">
                <button class="back-btn" onclick="goBack()">← Indietro</button>
                <h2>📊 Statistiche</h2>
            </div>
            <div class="stats-row" style="margin-bottom: 25px;">
                <div class="stat-card">
                    <div class="stat-value">142</div>
                    <div class="stat-label">Membri Attivi</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">19</div>
                    <div class="stat-label">Consulenti</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">87%</div>
                    <div class="stat-label">Soddisfazione</div>
                </div>
            </div>
            <div class="card">
                <div class="card-title">Andamento Mensile</div>
                <div class="card-subtitle">📈 Crescita del 15% rispetto al mese precedente</div>
            </div>
        `;
        sectionsContainer.appendChild(section);
    },

    showProfile() {
        this.createProfileSection();
        this.loadProfile();
        showSection('profileSection');
    },

    createProfileSection() {
        if (document.getElementById('profileSection')) return;
        
        const sectionsContainer = document.getElementById('sectionsContainer');
        const section = document.createElement('div');
        section.id = 'profileSection';
        section.className = 'section';
        section.innerHTML = `
            <div class="section-header">
                <button class="back-btn" onclick="goBack()">← Indietro</button>
                <h2>👤 Il Mio Profilo</h2>
            </div>
            
            <form id="profileForm" onsubmit="Dashboard.saveProfile(event)">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="profileEmail" readonly style="background: rgba(199, 255, 0, 0.05);">
                </div>
                <div class="form-group">
                    <label>Nome Azienda</label>
                    <input type="text" id="companyName" placeholder="Nome della tua azienda" required>
                </div>
                <div class="form-group">
                    <label>Partita IVA</label>
                    <input type="text" id="vatNumber" placeholder="12345678901" maxlength="11" pattern="[0-9]{11}">
                </div>
                <div class="form-group">
                    <label>Codice SDI</label>
                    <input type="text" id="sdiCode" placeholder="XXXXXXX" maxlength="7" pattern="[A-Z0-9]{7}">
                </div>
                <div class="form-group">
                    <label>Telefono</label>
                    <input type="tel" id="phone" placeholder="+39 xxx xxx xxxx">
                </div>
                <button type="submit" class="btn">💾 SALVA MODIFICHE</button>
            </form>
        `;
        sectionsContainer.appendChild(section);
    },

    loadProfile() {
        if (APP_STATE.currentUser) {
            document.getElementById('profileEmail').value = APP_STATE.currentUser.email;
        }
        
        if (APP_STATE.profiles && APP_STATE.profiles[APP_STATE.currentUser.email]) {
            const profile = APP_STATE.profiles[APP_STATE.currentUser.email];
            document.getElementById('companyName').value = profile.companyName || '';
            document.getElementById('vatNumber').value = profile.vatNumber || '';
            document.getElementById('sdiCode').value = profile.sdiCode || '';
            document.getElementById('phone').value = profile.phone || '';
        }
    },

    saveProfile(event) {
        event.preventDefault();
        
        const profile = {
            companyName: document.getElementById('companyName').value.trim(),
            vatNumber: document.getElementById('vatNumber').value.trim(),
            sdiCode: document.getElementById('sdiCode').value.trim().toUpperCase(),
            phone: document.getElementById('phone').value.trim(),
            updatedAt: new Date().toISOString()
        };
        
        if (!APP_STATE.profiles) APP_STATE.profiles = {};
        APP_STATE.profiles[APP_STATE.currentUser.email] = profile;
        
        if (saveState()) {
            Utils.showToast('✅ Profilo salvato con successo!', 'success');
        }
    },

    // Placeholder functions
    showVideo() { Utils.showToast('🎬 Area Video in costruzione', 'info'); },
    showBulletin() { Utils.showToast('📋 Bacheca in costruzione', 'info'); },
    showConventions() { Utils.showToast('🤝 Convenzioni in costruzione', 'info'); },
    showProjects() { Utils.showToast('🚀 Progetti in costruzione', 'info'); },
    showPassport() { Utils.showToast('🆔 Passaporto Digitale in costruzione', 'info'); },
    showMagazine() { Utils.showToast('📰 Rivista in costruzione', 'info'); },
    manageConsultants() {
    if (APP_STATE.currentUser.type !== 'admin') {
        Utils.showToast('⛔ Accesso negato - Solo amministratori', 'error');
        return;
    }
    this.createConsultantsManagementSection();
    showSection('consultantsManagementSection');
    this.loadConsultantsList();
},

createConsultantsManagementSection() {
    if (document.getElementById('consultantsManagementSection')) {
        this.loadConsultantsList();
        return;
    }
    
    const sectionsContainer = document.getElementById('sectionsContainer');
    const section = document.createElement('div');
    section.id = 'consultantsManagementSection';
    section.className = 'section';
    section.innerHTML = `
        <div class="section-header">
            <button class="back-btn" onclick="Dashboard.showAdmin()">← Indietro</button>
            <h2>💼 Gestione Consulenti</h2>
        </div>
        
        <button class="btn" onclick="Dashboard.showAddConsultantForm()" style="margin-bottom: 25px;">
            ➕ AGGIUNGI NUOVO CONSULENTE
        </button>
        
        <div class="search-container" style="margin-bottom: 25px;">
            <span class="search-icon">🔍</span>
            <input type="text" class="search-input" placeholder="Cerca consulente..." id="searchConsultant" onkeyup="Dashboard.searchConsultants()">
        </div>
        
        <div id="consultantsListAdmin"></div>
    `;
    sectionsContainer.appendChild(section);
},

loadConsultantsList() {
    const consultantsList = document.getElementById('consultantsListAdmin');
    
    if (!APP_STATE.consultantsData) {
        APP_STATE.consultantsData = [];
    }
    
    if (APP_STATE.consultantsData.length === 0) {
        consultantsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <div style="font-size: 48px; margin-bottom: 15px;">💼</div>
                <p>Nessun consulente registrato</p>
                <p style="font-size: 14px; margin-top: 10px;">Clicca "Aggiungi Nuovo Consulente" per iniziare</p>
            </div>
        `;
        return;
    }
    
    consultantsList.innerHTML = APP_STATE.consultantsData.map(consultant => `
        <div class="card" style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <div class="card-title" style="color: var(--primary);">
                        👨‍💼 ${consultant.name}
                    </div>
                    <div class="card-subtitle" style="margin-bottom: 10px;">
                        <strong>Specializzazione:</strong> ${consultant.specialty} | <strong>Email:</strong> ${consultant.email}
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; color: var(--text-secondary);">
                        <div>📞 ${consultant.phone}</div>
                        <div>🗺️ Zone: ${consultant.zones ? consultant.zones.join(', ') : 'N/D'}</div>
                        <div>📅 Disponibile: ${consultant.available ? 'Sì' : 'No'}</div>
                        <div>⭐ Valutazione: ${consultant.rating || 'N/D'}</div>
                    </div>
                    ${consultant.notes ? `<div style="margin-top: 10px; padding: 8px; background: rgba(199, 255, 0, 0.05); border-radius: 8px; font-size: 12px;">📝 ${consultant.notes}</div>` : ''}
                </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${consultant.blocked ? '<span class="status-badge status-blocked">🔒 BLOCCATO</span>' : '<span class="status-badge status-free">✅ ATTIVO</span>'}
                    <button class="btn btn-small" onclick="Dashboard.impersonateConsultant('${consultant.id}')" style="background: var(--primary); color: var(--bg-dark);">
                        👤 Impersona
                    </button>
                    <button class="btn btn-small" onclick="Dashboard.editConsultant('${consultant.id}')" style="background: var(--bg-lighter);">
                        ✏️ Modifica
                    </button>
                    <button class="btn btn-small btn-danger" onclick="Dashboard.deleteConsultant('${consultant.id}')">
                        🗑️ Elimina
                    </button>
                </div>
            </div>
        </div>
    `).join('');
},

showAddConsultantForm() {
    this.createConsultantModal();
    Utils.clearForm('consultantForm');
    document.getElementById('consultantId').value = '';
    document.getElementById('consultantModalTitle').textContent = '➕ Aggiungi Nuovo Consulente';
    document.getElementById('consultantPassword').value = Utils.generatePassword();
    Utils.openModal('consultantModal');
},

createConsultantModal() {
    if (document.getElementById('consultantModal')) return;
    
    const modalsContainer = document.getElementById('modalsContainer');
    const modal = document.createElement('div');
    modal.id = 'consultantModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3 class="modal-title" id="consultantModalTitle">➕ Aggiungi Nuovo Consulente</h3>
                <button class="close-modal" onclick="Utils.closeModal('consultantModal')">×</button>
            </div>
            <form onsubmit="Dashboard.saveConsultant(event)" id="consultantForm">
                <input type="hidden" id="consultantId">
                
                <h4 style="color: var(--primary); margin-bottom: 15px; font-size: 14px;">👤 DATI PERSONALI</h4>
                
                <div class="form-group">
                    <label>Nome e Cognome *</label>
                    <input type="text" id="consultantName" required placeholder="Mario Rossi">
                </div>
                
                <div class="form-group">
                    <label>Email *</label>
                    <input type="email" id="consultantEmail" required placeholder="consulente@studio.it">
                </div>
                
                <div class="form-group">
                    <label>Password *</label>
                    <input type="text" id="consultantPassword" required placeholder="Password sicura">
                </div>
                
                <h4 style="color: var(--primary); margin-top: 25px; margin-bottom: 15px; font-size: 14px;">💼 DATI PROFESSIONALI</h4>
                
                <div class="form-group">
                    <label>Specializzazione *</label>
                    <select id="consultantSpecialty" required>
                        <option value="">Seleziona specializzazione</option>
                        ${CONFIG.consultantSpecialties.map(spec => 
                            `<option value="${spec}">${spec}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Telefono *</label>
                    <input type="tel" id="consultantPhone" required placeholder="+39 333 1234567">
                </div>
                
                <h4 style="color: var(--primary); margin-top: 25px; margin-bottom: 15px; font-size: 14px;">🗺️ ZONE DI COMPETENZA *</h4>
                
                <div class="form-group" style="background: rgba(199, 255, 0, 0.05); padding: 15px; border-radius: 12px;">
                    <div style="margin-bottom: 10px; color: var(--text-secondary); font-size: 13px;">
                        Seleziona una o più zone dove il consulente opera:
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; text-transform: none;">
                            <input type="checkbox" id="zoneRimini" value="rimini" style="width: 20px; height: 20px; cursor: pointer;">
                            <span>📍 Rimini</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; text-transform: none;">
                            <input type="checkbox" id="zonePesaro" value="pesaro" style="width: 20px; height: 20px; cursor: pointer;">
                            <span>📍 Pesaro</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; text-transform: none;">
                            <input type="checkbox" id="zoneAncona" value="ancona" style="width: 20px; height: 20px; cursor: pointer;">
                            <span>📍 Ancona</span>
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Disponibilità</label>
                    <select id="consultantAvailable">
                        <option value="true">Disponibile</option>
                        <option value="false">Non disponibile</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Note</label>
                    <textarea id="consultantNotes" rows="3" placeholder="Note aggiuntive..."></textarea>
                </div>
                
                <div class="form-group" style="background: rgba(255, 68, 68, 0.05); padding: 15px; border-radius: 12px;">
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; text-transform: none;">
                        <input type="checkbox" id="consultantBlocked" style="width: 20px; height: 20px; cursor: pointer;">
                        <span style="color: var(--danger);">🔒 Blocca questo consulente (non potrà più accedere)</span>
                    </label>
                </div>
                
                <div style="display: flex; gap: 12px; margin-top: 25px;">
                    <button type="submit" class="btn">💾 SALVA CONSULENTE</button>
                    <button type="button" class="btn btn-secondary" onclick="Utils.closeModal('consultantModal')">ANNULLA</button>
                </div>
            </form>
        </div>
    `;
    modalsContainer.appendChild(modal);
},

saveConsultant(event) {
    event.preventDefault();
    
    // Raccogli le zone selezionate
    const zones = [];
    if (document.getElementById('zoneRimini').checked) zones.push('Rimini');
    if (document.getElementById('zonePesaro').checked) zones.push('Pesaro');
    if (document.getElementById('zoneAncona').checked) zones.push('Ancona');
    
    if (zones.length === 0) {
        Utils.showToast('⚠️ Seleziona almeno una zona di competenza', 'error');
        return;
    }
    
    const consultantData = {
        id: document.getElementById('consultantId').value || Utils.generateId(),
        name: document.getElementById('consultantName').value.trim(),
        email: document.getElementById('consultantEmail').value.trim().toLowerCase(),
        password: document.getElementById('consultantPassword').value.trim(),
        specialty: document.getElementById('consultantSpecialty').value,
        phone: document.getElementById('consultantPhone').value.trim(),
        zones: zones, // Array delle zone selezionate
        available: document.getElementById('consultantAvailable').value === 'true',
      notes: document.getElementById('consultantNotes').value.trim(),
        blocked: document.getElementById('consultantBlocked').checked,
        rating: Math.floor(Math.random() * 2) + 4,
        createdAt: new Date().toISOString()
    };
    
    if (!APP_STATE.consultantsData) {
        APP_STATE.consultantsData = [];
    }
    
    const existingIndex = APP_STATE.consultantsData.findIndex(c => c.id === consultantData.id);
    
    if (existingIndex >= 0) {
        APP_STATE.consultantsData[existingIndex] = consultantData;
        Utils.showToast('✅ Consulente aggiornato con successo!', 'success');
    } else {
        if (APP_STATE.consultantsData.some(c => c.email === consultantData.email)) {
            Utils.showToast('⚠️ Email già utilizzata', 'error');
            return;
        }
        APP_STATE.consultantsData.push(consultantData);
        Utils.showToast('✅ Nuovo consulente aggiunto!', 'success');
    }
    
    saveState();
    Utils.closeModal('consultantModal');
    this.loadConsultantsList();
},

editConsultant(consultantId) {
    const consultant = APP_STATE.consultantsData.find(c => c.id === consultantId);
    if (!consultant) {
        Utils.showToast('❌ Consulente non trovato', 'error');
        return;
    }
    
    this.createConsultantModal();
    
    document.getElementById('consultantId').value = consultant.id;
    document.getElementById('consultantName').value = consultant.name;
    document.getElementById('consultantEmail').value = consultant.email;
    document.getElementById('consultantPassword').value = consultant.password;
    document.getElementById('consultantSpecialty').value = consultant.specialty;
    document.getElementById('consultantPhone').value = consultant.phone;
    
    // Imposta le checkbox delle zone
    document.getElementById('zoneRimini').checked = consultant.zones && consultant.zones.includes('Rimini');
    document.getElementById('zonePesaro').checked = consultant.zones && consultant.zones.includes('Pesaro');
    document.getElementById('zoneAncona').checked = consultant.zones && consultant.zones.includes('Ancona');
    
    document.getElementById('consultantAvailable').value = consultant.available.toString();
    document.getElementById('consultantNotes').value = consultant.notes || '';
    document.getElementById('consultantBlocked').checked = consultant.blocked || false;
    
    document.getElementById('consultantModalTitle').textContent = '✏️ Modifica Consulente';
    Utils.openModal('consultantModal');
},

deleteConsultant(consultantId) {
    const consultant = APP_STATE.consultantsData.find(c => c.id === consultantId);
    if (!consultant) return;
    
    if (confirm(`Eliminare ${consultant.name}?\n\nQuesta azione non può essere annullata.`)) {
        APP_STATE.consultantsData = APP_STATE.consultantsData.filter(c => c.id !== consultantId);
        saveState();
        this.loadConsultantsList();
        Utils.showToast(`✅ ${consultant.name} eliminato`, 'success');
    }
},

searchConsultants() {
    const searchTerm = document.getElementById('searchConsultant').value.toLowerCase();
    const consultantsList = document.getElementById('consultantsListAdmin');
    
    if (!APP_STATE.consultantsData || APP_STATE.consultantsData.length === 0) return;
    
    const filteredConsultants = APP_STATE.consultantsData.filter(consultant => 
        consultant.name.toLowerCase().includes(searchTerm) ||
        consultant.email.toLowerCase().includes(searchTerm) ||
        consultant.specialty.toLowerCase().includes(searchTerm) ||
        consultant.city.toLowerCase().includes(searchTerm)
    );
    
    if (filteredConsultants.length === 0) {
        consultantsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <div style="font-size: 48px; margin-bottom: 15px;">🔍</div>
                <p>Nessun consulente trovato per "${searchTerm}"</p>
            </div>
        `;
    } else {
        this.loadConsultantsList();
    }
},
    manageEvents() { Utils.showToast('📅 Gestione eventi in costruzione', 'info'); },
    manageAreas() { Utils.showToast('🗺️ Gestione aree in costruzione', 'info'); }
};
// Impersonate consultant
    impersonateConsultant(consultantId) {
        const consultant = APP_STATE.consultantsData.find(c => c.id === consultantId);
        if (!consultant) {
            Utils.showToast('❌ Consulente non trovato', 'error');
            return;
        }
        
        if (consultant.blocked) {
            Utils.showToast('⚠️ Non puoi impersonare un utente bloccato', 'error');
            return;
        }
        
        // Salva l'utente admin originale
        APP_STATE.originalAdmin = APP_STATE.currentUser;
        
        // Imposta il nuovo utente
        APP_STATE.currentUser = {
            email: consultant.email,
            type: 'consulente',
            name: consultant.name,
            contractEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            loginTime: Date.now(),
            isImpersonating: true
        };
        
        saveState();
        
        // Ricarica il dashboard come consulente
        showSection('dashboard');
        this.updateUserInfo();
        this.updateStats();
        this.loadMenu();
        
        Utils.showToast(`👤 Stai vedendo il sistema come: ${consultant.name}`, 'success');
        
        // Usa la funzione di Members per mostrare il banner
        if (window.Members && window.Members.showImpersonationBanner) {
            window.Members.showImpersonationBanner();
        }
    },
// Make Dashboard globally available
window.Dashboard = Dashboard;