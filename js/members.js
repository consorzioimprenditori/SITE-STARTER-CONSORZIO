// ============================================
// MEMBERS.JS - Gestione Membri
// ============================================

const Members = {
    // Show members management section
    showManagement() {
        if (APP_STATE.currentUser.type !== 'admin') {
            Utils.showToast('⛔ Accesso negato - Solo amministratori', 'error');
            return;
        }
        this.createManagementSection();
        showSection('membersManagementSection');
        this.loadMembersList();
    },

    createManagementSection() {
        if (document.getElementById('membersManagementSection')) return;
        
        const sectionsContainer = document.getElementById('sectionsContainer');
        const section = document.createElement('div');
        section.id = 'membersManagementSection';
        section.className = 'section';
        section.innerHTML = `
            <div class="section-header">
                <button class="back-btn" onclick="Dashboard.showAdmin()">← Indietro</button>
                <h2>👥 Gestione Membri</h2>
            </div>
            
            <button class="btn" onclick="Members.showAddForm()" style="margin-bottom: 25px;">
                ➕ AGGIUNGI NUOVO MEMBRO
            </button>
            
            <div class="search-container" style="margin-bottom: 25px;">
                <span class="search-icon">🔍</span>
                <input type="text" class="search-input" placeholder="Cerca membro..." id="searchMember" onkeyup="Members.search()">
            </div>
            
            <div id="membersList"></div>
        `;
        sectionsContainer.appendChild(section);
    },

    // Load members list
    loadMembersList() {
        const membersList = document.getElementById('membersList');
        
        if (!APP_STATE.members || APP_STATE.members.length === 0) {
            membersList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <div style="font-size: 48px; margin-bottom: 15px;">📭</div>
                    <p>Nessun membro registrato</p>
                    <p style="font-size: 14px; margin-top: 10px;">Clicca "Aggiungi Nuovo Membro" per iniziare</p>
                </div>
            `;
            return;
        }
        
        membersList.innerHTML = APP_STATE.members.map(member => `
            <div class="card" style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <div class="card-title" style="color: var(--primary);">
                            🏢 ${member.companyName}
                        </div>
                        <div class="card-subtitle" style="margin-bottom: 10px;">
                            <strong>P.IVA:</strong> ${member.vat} | <strong>Email:</strong> ${member.email}
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; color: var(--text-secondary);">
                            <div>📞 ${member.phone}</div>
                            <div>📍 ${member.city} (${member.province})</div>
                            <div>🏭 ${member.sector}</div>
                            <div>🗺️ Area: ${member.area}</div>
                            <div>👥 Dipendenti: ${member.employees || 'N/D'}</div>
                            <div>📅 Scadenza: ${Utils.formatDate(member.contractEnd)}</div>
                        </div>
                        ${member.notes ? `<div style="margin-top: 10px; padding: 8px; background: rgba(199, 255, 0, 0.05); border-radius: 8px; font-size: 12px;">📝 ${member.notes}</div>` : ''}
                    </div>
                   <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${member.blocked ? '<span class="status-badge status-blocked">🔒 BLOCCATO</span>' : '<span class="status-badge status-free">✅ ATTIVO</span>'}
                        <button class="btn btn-small" onclick="Members.impersonate('${member.id}')" style="background: var(--primary); color: var(--bg-dark);">
                            👤 Impersona
                        </button>
                        <button class="btn btn-small" onclick="Members.edit('${member.id}')" style="background: var(--bg-lighter);">
                            ✏️ Modifica
                        </button>
                        <button class="btn btn-small btn-danger" onclick="Members.delete('${member.id}')">
                            🗑️ Elimina
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    // Show add member form
    showAddForm() {
        this.createModal();
        
        // Reset form
        Utils.clearForm('memberForm');
        document.getElementById('memberId').value = '';
        document.getElementById('memberModalTitle').textContent = '➕ Aggiungi Nuovo Membro';
        
        // Generate random password
        document.getElementById('memberPassword').value = Utils.generatePassword();
        
        // Set default contract end date (1 year from now)
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        document.getElementById('memberContractEnd').value = oneYearFromNow.toISOString().split('T')[0];
        
        Utils.openModal('memberModal');
    },

    // Create member modal
    createModal() {
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
                <form onsubmit="Members.save(event)" id="memberForm">
                    <input type="hidden" id="memberId">
                    
                    <h4 style="color: var(--primary); margin-bottom: 15px; font-size: 14px;">🔐 DATI ACCOUNT</h4>
                    
                    <div class="form-group">
                        <label>Email di accesso *</label>
                        <input type="email" id="memberEmail" required placeholder="email@azienda.it">
                    </div>
                    
                    <div class="form-group">
                        <label>Password *</label>
                        <input type="text" id="memberPassword" required placeholder="Password sicura">
                        <small style="color: var(--text-muted); font-size: 11px;">La password verrà comunicata al membro</small>
                    </div>
                    
                    <h4 style="color: var(--primary); margin-top: 25px; margin-bottom: 15px; font-size: 14px;">🏢 DATI AZIENDA</h4>
                    
                    <div class="form-group">
                        <label>Ragione Sociale *</label>
                        <input type="text" id="memberCompanyName" required placeholder="Nome Azienda SRL">
                    </div>
                    
                    <div class="form-group">
                        <label>Partita IVA *</label>
                        <input type="text" id="memberVAT" required placeholder="12345678901" maxlength="11" pattern="[0-9]{11}">
                    </div>
                    
                    <div class="form-group">
                        <label>Codice SDI</label>
                        <input type="text" id="memberSDI" placeholder="XXXXXXX" maxlength="7" style="text-transform: uppercase;">
                    </div>
                    
                    <h4 style="color: var(--primary); margin-top: 25px; margin-bottom: 15px; font-size: 14px;">📞 CONTATTI</h4>
                    
                    <div class="form-group">
                        <label>Telefono *</label>
                        <input type="tel" id="memberPhone" required placeholder="+39 0541 123456">
                    </div>
                    
                    <div class="form-group">
                        <label>PEC</label>
                        <input type="email" id="memberPEC" placeholder="azienda@pec.it">
                    </div>
                    
                    <h4 style="color: var(--primary); margin-top: 25px; margin-bottom: 15px; font-size: 14px;">📍 SEDE LEGALE</h4>
                    
                    <div class="form-group">
                        <label>Indirizzo *</label>
                        <input type="text" id="memberAddress" required placeholder="Via Roma, 1">
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px;">
                        <div class="form-group">
                            <label>Città *</label>
                            <input type="text" id="memberCity" required placeholder="Rimini">
                        </div>
                        <div class="form-group">
                            <label>CAP *</label>
                            <input type="text" id="memberZIP" required placeholder="47921" maxlength="5" pattern="[0-9]{5}">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Provincia *</label>
                        <input type="text" id="memberProvince" required placeholder="RN" maxlength="2" style="text-transform: uppercase;">
                    </div>
                    
                    <h4 style="color: var(--primary); margin-top: 25px; margin-bottom: 15px; font-size: 14px;">📊 ALTRI DATI</h4>
                    
                    <div class="form-group">
                        <label>Settore/Specializzazione *</label>
                        <select id="memberSector" required>
                            <option value="">Seleziona settore</option>
                            <option value="manifatturiero">Manifatturiero</option>
                            <option value="commercio">Commercio</option>
                            <option value="servizi">Servizi</option>
                            <option value="tecnologia">Tecnologia</option>
                            <option value="edilizia">Edilizia</option>
                            <option value="ristorazione">Ristorazione</option>
                            <option value="consulenza">Consulenza</option>
                            <option value="trasporti">Trasporti</option>
                            <option value="immobiliare">Immobiliare</option>
                            <option value="altro">Altro</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Area di appartenenza *</label>
                        <select id="memberArea" required>
                            <option value="">Seleziona area</option>
                            <option value="rimini">Rimini</option>
                            <option value="pesaro">Pesaro</option>
                            <option value="ancona">Ancona</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Numero dipendenti</label>
                        <select id="memberEmployees">
                            <option value="">Seleziona</option>
                            <option value="1-5">1-5</option>
                            <option value="6-10">6-10</option>
                            <option value="11-20">11-20</option>
                            <option value="21-50">21-50</option>
                            <option value="50+">Oltre 50</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Data scadenza contratto *</label>
                        <input type="date" id="memberContractEnd" required>
                    </div>
                    
                   <div class="form-group">
                        <label>Note</label>
                        <textarea id="memberNotes" rows="3" placeholder="Note aggiuntive..."></textarea>
                    </div>
                    
                    <div class="form-group" style="background: rgba(255, 68, 68, 0.05); padding: 15px; border-radius: 12px;">
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; text-transform: none;">
                            <input type="checkbox" id="memberBlocked" style="width: 20px; height: 20px; cursor: pointer;">
                            <span style="color: var(--danger);">🔒 Blocca questo membro (non potrà più accedere)</span>
                        </label>
                    </div>
                    
                    <div style="display: flex; gap: 12px; margin-top: 25px;">
                        <button type="submit" class="btn">💾 SALVA MEMBRO</button>
                        <button type="button" class="btn btn-secondary" onclick="Utils.closeModal('memberModal')">ANNULLA</button>
                    </div>
                </form>
            </div>
        `;
        modalsContainer.appendChild(modal);
    },

    // Save member
    save(event) {
        event.preventDefault();
        
        const memberData = {
            id: document.getElementById('memberId').value || Utils.generateId(),
            email: document.getElementById('memberEmail').value.trim().toLowerCase(),
            password: document.getElementById('memberPassword').value.trim(),
            companyName: document.getElementById('memberCompanyName').value.trim(),
            vat: document.getElementById('memberVAT').value.trim(),
            sdi: document.getElementById('memberSDI').value.trim().toUpperCase(),
            phone: document.getElementById('memberPhone').value.trim(),
            pec: document.getElementById('memberPEC').value.trim().toLowerCase(),
            address: document.getElementById('memberAddress').value.trim(),
            city: document.getElementById('memberCity').value.trim(),
            zip: document.getElementById('memberZIP').value.trim(),
            province: document.getElementById('memberProvince').value.trim().toUpperCase(),
            sector: document.getElementById('memberSector').value,
            area: document.getElementById('memberArea').value,
            employees: document.getElementById('memberEmployees').value,
            contractEnd: document.getElementById('memberContractEnd').value,
            notes: document.getElementById('memberNotes').value.trim(),
            blocked: document.getElementById('memberBlocked').checked,
            createdAt: new Date().toISOString(),
            status: document.getElementById('memberBlocked').checked ? 'blocked' : 'active'
        };
        
        const existingIndex = APP_STATE.members.findIndex(m => m.id === memberData.id);
        
        if (existingIndex >= 0) {
            APP_STATE.members[existingIndex] = memberData;
            Utils.showToast('✅ Membro aggiornato con successo!', 'success');
        } else {
            if (APP_STATE.members.some(m => m.email === memberData.email)) {
                Utils.showToast('⚠️ Email già utilizzata', 'error');
                return;
            }
            APP_STATE.members.push(memberData);
            Utils.showToast('✅ Nuovo membro aggiunto!', 'success');
        }
        
        saveState();
        Utils.closeModal('memberModal');
        this.loadMembersList();
    },

    // Edit member
    edit(memberId) {
        const member = APP_STATE.members.find(m => m.id === memberId);
        if (!member) {
            Utils.showToast('❌ Membro non trovato', 'error');
            return;
        }
        
        this.createModal();
        
        // Populate form
        document.getElementById('memberId').value = member.id;
        document.getElementById('memberEmail').value = member.email;
        document.getElementById('memberPassword').value = member.password;
        document.getElementById('memberCompanyName').value = member.companyName;
        document.getElementById('memberVAT').value = member.vat;
        document.getElementById('memberSDI').value = member.sdi || '';
        document.getElementById('memberPhone').value = member.phone;
        document.getElementById('memberPEC').value = member.pec || '';
        document.getElementById('memberAddress').value = member.address;
        document.getElementById('memberCity').value = member.city;
        document.getElementById('memberZIP').value = member.zip;
        document.getElementById('memberProvince').value = member.province;
        document.getElementById('memberSector').value = member.sector;
        document.getElementById('memberArea').value = member.area;
        document.getElementById('memberEmployees').value = member.employees || '';
        document.getElementById('memberContractEnd').value = member.contractEnd;
        document.getElementById('memberNotes').value = member.notes || '';
        document.getElementById('memberBlocked').checked = member.blocked || false;
        
        document.getElementById('memberModalTitle').textContent = '✏️ Modifica Membro';
        Utils.openModal('memberModal');
    },

    // Delete member
    delete(memberId) {
        const member = APP_STATE.members.find(m => m.id === memberId);
        if (!member) return;
        
        if (confirm(`Eliminare ${member.companyName}?\n\nQuesta azione non può essere annullata.`)) {
            APP_STATE.members = APP_STATE.members.filter(m => m.id !== memberId);
            saveState();
            this.loadMembersList();
            Utils.showToast(`✅ ${member.companyName} eliminato`, 'success');
        }
    },

    // Search members
    search() {
        const searchTerm = document.getElementById('searchMember').value.toLowerCase();
        const membersList = document.getElementById('membersList');
        
        if (!APP_STATE.members || APP_STATE.members.length === 0) return;
        
        const filteredMembers = APP_STATE.members.filter(member => 
            member.companyName.toLowerCase().includes(searchTerm) ||
            member.email.toLowerCase().includes(searchTerm) ||
            member.vat.includes(searchTerm) ||
            member.city.toLowerCase().includes(searchTerm)
        );
        
        if (filteredMembers.length === 0) {
            membersList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <div style="font-size: 48px; margin-bottom: 15px;">🔍</div>
                    <p>Nessun membro trovato per "${searchTerm}"</p>
                </div>
            `;
        } else {
            membersList.innerHTML = filteredMembers.map(member => `
                <div class="card" style="margin-bottom: 15px;">
                    <!-- Card content (same as loadMembersList) -->
                </div>
            `).join('');
        }
    }
};

// Make Members globally available
// Impersonate member
    impersonate(memberId) {
        const member = APP_STATE.members.find(m => m.id === memberId);
        if (!member) {
            Utils.showToast('❌ Membro non trovato', 'error');
            return;
        }
        
        if (member.blocked) {
            Utils.showToast('⚠️ Non puoi impersonare un utente bloccato', 'error');
            return;
        }
        
        // Salva l'utente admin originale
        APP_STATE.originalAdmin = APP_STATE.currentUser;
        
        // Imposta il nuovo utente
        APP_STATE.currentUser = {
            email: member.email,
            type: 'membro',
            name: member.companyName,
            contractEnd: member.contractEnd,
            loginTime: Date.now(),
            isImpersonating: true
        };
        
        saveState();
        
        // Ricarica il dashboard come membro
        showSection('dashboard');
        Dashboard.updateUserInfo();
        Dashboard.updateStats();
        Dashboard.loadMenu();
        Dashboard.showCountdown();
        
        Utils.showToast(`👤 Stai vedendo il sistema come: ${member.companyName}`, 'success');
        
        // Aggiungi banner di impersonazione
        this.showImpersonationBanner();
    },
    
    // Show impersonation banner
    showImpersonationBanner() {
        if (document.getElementById('impersonationBanner')) return;
        
        const banner = document.createElement('div');
        banner.id = 'impersonationBanner';
        banner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, var(--warning) 0%, var(--danger) 100%);
            color: white;
            padding: 10px;
            text-align: center;
            z-index: 9999;
            font-weight: bold;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 15px;
        `;
        banner.innerHTML = `
            <span>⚠️ MODALITÀ IMPERSONAZIONE ATTIVA</span>
            <button onclick="Members.stopImpersonation()" style="
                background: white;
                color: var(--danger);
                border: none;
                padding: 5px 15px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
            ">Torna come Admin</button>
        `;
        document.body.appendChild(banner);
        
        // Sposta il contenuto verso il basso
        document.querySelector('.app-container').style.marginTop = '50px';
    },
    
    // Stop impersonation
    stopImpersonation() {
        if (!APP_STATE.originalAdmin) return;
        
        // Ripristina l'utente admin
        APP_STATE.currentUser = APP_STATE.originalAdmin;
        APP_STATE.originalAdmin = null;
        saveState();
        
        // Rimuovi il banner
        const banner = document.getElementById('impersonationBanner');
        if (banner) banner.remove();
        
        // Ripristina margine
        document.querySelector('.app-container').style.marginTop = '0';
        
        // Ricarica il dashboard come admin
        Dashboard.showDashboard();
        Utils.showToast('✅ Tornato come Amministratore', 'success');
    }
window.Members = Members;