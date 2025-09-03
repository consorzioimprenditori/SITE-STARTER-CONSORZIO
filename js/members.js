// ============================================
// MEMBERS.JS - Gestione Membri
// ============================================

const Members = {
    // Show members management
    showManagement() {
        if (APP_STATE.currentUser.type !== 'admin') {
            Utils.showToast('⛔ Accesso negato', 'error');
            return;
        }
        
        this.createManagementSection();
        showSection('membersSection');
        this.loadMembersList();
    },
    
    // Create management section
    createManagementSection() {
        if (document.getElementById('membersSection')) {
            this.loadMembersList();
            return;
        }
        
        const sectionsContainer = document.getElementById('sectionsContainer');
        const section = document.createElement('div');
        section.id = 'membersSection';
        section.className = 'section';
        section.innerHTML = `
            <div class="section-header">
                <button class="back-btn" onclick="goBack()">← Indietro</button>
                <h2>👥 Gestione Membri</h2>
            </div>
            
            <button class="btn" onclick="Members.showAddMemberForm()" style="margin-bottom: 25px;">
                ➕ AGGIUNGI NUOVO MEMBRO
            </button>
            
            <div class="search-container" style="margin-bottom: 25px;">
                <span class="search-icon">🔍</span>
                <input type="text" class="search-input" placeholder="Cerca membro..." 
                       id="searchMember" onkeyup="Members.searchMembers()">
            </div>
            
            <div id="membersList"></div>
        `;
        sectionsContainer.appendChild(section);
    },
    
    // Load members list
    loadMembersList() {
        const membersList = document.getElementById('membersList');
        
        if (!APP_STATE.members || APP_STATE.members.length === 0) {
            // Create demo members
            APP_STATE.members = [
                {
                    id: '1',
                    name: 'Mario Rossi',
                    email: 'mario.rossi@azienda.it',
                    company: 'Rossi S.r.l.',
                    status: 'active',
                    contractEnd: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
                    area: 'Rimini'
                },
                {
                    id: '2',
                    name: 'Laura Bianchi',
                    email: 'info@impresa.it',
                    company: 'Impresa Bianchi',
                    status: 'active',
                    contractEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                    area: 'Pesaro'
                }
            ];
            saveState();
        }
        
        membersList.innerHTML = APP_STATE.members.map(member => `
            <div class="card" style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <div class="card-title" style="color: var(--primary);">
                            👤 ${member.name}
                        </div>
                        <div class="card-subtitle">
                            ${member.company} • ${member.email}
                        </div>
                        <div class="card-meta">
                            <span>📍 ${member.area}</span>
                            <span>📅 Scade tra ${Utils.calculateDaysRemaining(member.contractEnd)} giorni</span>
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <span class="status-badge ${member.status === 'active' ? 'status-free' : 'status-blocked'}">
                            ${member.status === 'active' ? '✅ ATTIVO' : '🔒 BLOCCATO'}
                        </span>
                        <button class="btn btn-small" onclick="Members.editMember('${member.id}')" 
                                style="background: var(--bg-lighter);">
                            ✏️ Modifica
                        </button>
                        <button class="btn btn-small btn-danger" onclick="Members.deleteMember('${member.id}')">
                            🗑️ Elimina
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },
    
    // Show add member form
    showAddMemberForm() {
        this.createMemberModal();
        Utils.clearForm('memberForm');
        document.getElementById('memberId').value = '';
        document.getElementById('memberModalTitle').textContent = '➕ Aggiungi Nuovo Membro';
        Utils.openModal('memberModal');
    },
    
    // Create member modal
    createMemberModal() {
        if (document.getElementById('memberModal')) return;
        
        const modalsContainer = document.getElementById('modalsContainer');
        const modal = document.createElement('div');
        modal.id = 'memberModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3 class="modal-title" id="memberModalTitle">➕ Aggiungi Nuovo Membro</h3>
                    <button class="close-modal" onclick="Utils.closeModal('memberModal')">×</button>
                </div>
                <form onsubmit="Members.saveMember(event)" id="memberForm">
                    <input type="hidden" id="memberId">
                    
                    <div class="form-group">
                        <label>Nome e Cognome *</label>
                        <input type="text" id="memberName" required placeholder="Mario Rossi">
                    </div>
                    
                    <div class="form-group">
                        <label>Email *</label>
                        <input type="email" id="memberEmail" required placeholder="email@azienda.it">
                    </div>
                    
                    <div class="form-group">
                        <label>Azienda *</label>
                        <input type="text" id="memberCompany" required placeholder="Nome Azienda S.r.l.">
                    </div>
                    
                    <div class="form-group">
                        <label>Area *</label>
                        <select id="memberArea" required>
                            <option value="">Seleziona area</option>
                            <option value="Rimini">Rimini</option>
                            <option value="Pesaro">Pesaro</option>
                            <option value="Ancona">Ancona</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Stato</label>
                        <select id="memberStatus">
                            <option value="active">Attivo</option>
                            <option value="blocked">Bloccato</option>
                        </select>
                    </div>
                    
                    <div style="display: flex; gap: 12px; margin-top: 25px;">
                        <button type="submit" class="btn">💾 SALVA</button>
                        <button type="button" class="btn btn-secondary" onclick="Utils.closeModal('memberModal')">
                            ANNULLA
                        </button>
                    </div>
                </form>
            </div>
        `;
        modalsContainer.appendChild(modal);
    },
    
    // Save member
    saveMember(event) {
        event.preventDefault();
        
        const memberData = {
            id: document.getElementById('memberId').value || Utils.generateId(),
            name: document.getElementById('memberName').value.trim(),
            email: document.getElementById('memberEmail').value.trim(),
            company: document.getElementById('memberCompany').value.trim(),
            area: document.getElementById('memberArea').value,
            status: document.getElementById('memberStatus').value,
            contractEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        };
        
        const existingIndex = APP_STATE.members.findIndex(m => m.id === memberData.id);
        
        if (existingIndex >= 0) {
            APP_STATE.members[existingIndex] = memberData;
            Utils.showToast('✅ Membro aggiornato!', 'success');
        } else {
            APP_STATE.members.push(memberData);
            Utils.showToast('✅ Nuovo membro aggiunto!', 'success');
        }
        
        saveState();
        Utils.closeModal('memberModal');
        this.loadMembersList();
    },
    
    // Edit member
    editMember(memberId) {
        const member = APP_STATE.members.find(m => m.id === memberId);
        if (!member) return;
        
        this.createMemberModal();
        
        document.getElementById('memberId').value = member.id;
        document.getElementById('memberName').value = member.name;
        document.getElementById('memberEmail').value = member.email;
        document.getElementById('memberCompany').value = member.company;
        document.getElementById('memberArea').value = member.area;
        document.getElementById('memberStatus').value = member.status;
        
        document.getElementById('memberModalTitle').textContent = '✏️ Modifica Membro';
        Utils.openModal('memberModal');
    },
    
    // Delete member
    deleteMember(memberId) {
        const member = APP_STATE.members.find(m => m.id === memberId);
        if (!member) return;
        
        if (confirm(`Eliminare ${member.name}?\n\nQuesta azione non può essere annullata.`)) {
            APP_STATE.members = APP_STATE.members.filter(m => m.id !== memberId);
            saveState();
            this.loadMembersList();
            Utils.showToast(`✅ ${member.name} eliminato`, 'success');
        }
    },
    
    // Search members
    searchMembers() {
        const searchTerm = document.getElementById('searchMember').value.toLowerCase();
        const membersList = document.getElementById('membersList');
        
        const filteredMembers = APP_STATE.members.filter(member => 
            member.name.toLowerCase().includes(searchTerm) ||
            member.email.toLowerCase().includes(searchTerm) ||
            member.company.toLowerCase().includes(searchTerm) ||
            member.area.toLowerCase().includes(searchTerm)
        );
        
        if (filteredMembers.length === 0) {
            membersList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <p>Nessun membro trovato per "${searchTerm}"</p>
                </div>
            `;
        } else {
            this.loadMembersList();
        }
    },
    
    // Show impersonation banner
    showImpersonationBanner() {
        const banner = document.createElement('div');
        banner.id = 'impersonationBanner';
        banner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(90deg, var(--warning) 0%, var(--danger) 100%);
            color: white;
            padding: 10px;
            text-align: center;
            z-index: 9999;
            font-weight: 600;
        `;
        banner.innerHTML = `
            ⚠️ Modalità Impersonificazione Attiva
            <button onclick="Members.stopImpersonation()" style="margin-left: 20px; padding: 5px 15px; 
                    background: white; color: var(--bg-dark); border: none; border-radius: 5px; 
                    cursor: pointer; font-weight: 600;">
                Esci da Impersonificazione
            </button>
        `;
        document.body.appendChild(banner);
    },
    
    // Stop impersonation
    stopImpersonation() {
        if (APP_STATE.originalAdmin) {
            APP_STATE.currentUser = APP_STATE.originalAdmin;
            APP_STATE.originalAdmin = null;
            saveState();
            
            const banner = document.getElementById('impersonationBanner');
            if (banner) banner.remove();
            
            Auth.showDashboard();
            Utils.showToast('✅ Tornato alla modalità Admin', 'success');
        }
    }
};

// Make Members globally available
window.Members = Members;