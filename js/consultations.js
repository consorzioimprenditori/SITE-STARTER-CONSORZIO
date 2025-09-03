// ============================================
// CONSULTATIONS.JS - Gestione Consulenze COMPLETA
// ============================================

const Consultations = {
    // Initialize consultations
    init() {
        if (!APP_STATE.consultations) {
            APP_STATE.consultations = [];
        }
        
        // Add some demo consultants if none exist
        if (!APP_STATE.consultants) {
            APP_STATE.consultants = [
                {
                    id: 'CONS001',
                    name: 'Dott. Marco Verdi',
                    email: 'marco.verdi@studio.it',
                    specialty: 'Finanza agevolata',
                    available: true
                },
                {
                    id: 'CONS002',
                    name: 'Avv. Sara Neri',
                    email: 'sara.neri@legale.it',
                    specialty: 'Consulenza legale d\'impresa',
                    available: true
                },
                {
                    id: 'CONS003',
                    name: 'Ing. Paolo Bianchi',
                    email: 'paolo.bianchi@tech.it',
                    specialty: 'Cyber sicurezza',
                    available: true
                },
                {
                    id: 'CONS004',
                    name: 'Dott.ssa Laura Rossi',
                    email: 'laura.rossi@lavoro.it',
                    specialty: 'Consulenza del lavoro',
                    available: true
                }
            ];
        }
    },
    
    // Show consultations
    show() {
        this.createConsultationsSection();
        showSection('consultationsSection');
        this.loadConsultations();
    },
    
    // Show my consultations (for consultants)
    showMy() {
        this.createConsultationsSection();
        showSection('consultationsSection');
        this.loadConsultations(true);
    },
    
    // Create consultations section
    createConsultationsSection() {
        if (document.getElementById('consultationsSection')) return;
        
        const sectionsContainer = document.getElementById('sectionsContainer');
        const section = document.createElement('div');
        section.id = 'consultationsSection';
        section.className = 'section';
        section.innerHTML = `
            <div class="section-header">
                <button class="back-btn" onclick="goBack()">← Indietro</button>
                <h2>💼 Consulenze</h2>
            </div>
            
            <div id="consultationsList"></div>
            
            ${APP_STATE.currentUser && APP_STATE.currentUser.type === 'membro' ? 
                `<button class="btn" onclick="Consultations.requestConsultation()" style="margin-top: 25px;">
                    ➕ RICHIEDI NUOVA CONSULENZA
                </button>` : ''
            }
        `;
        sectionsContainer.appendChild(section);
        this.addConsultationStyles();
    },
    
    // Add consultation styles
    addConsultationStyles() {
        if (document.getElementById('consultationStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'consultationStyles';
        style.innerHTML = `
            .consultation-card {
                background: linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 100%);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 15px;
                border-left: 4px solid #4CAF50;
                transition: all 0.3s;
                cursor: pointer;
            }
            
            .consultation-card:hover {
                transform: translateX(5px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            
            .consultation-header {
                display: flex;
                justify-content: space-between;
                align-items: start;
                margin-bottom: 10px;
            }
            
            .consultation-title {
                font-size: 18px;
                font-weight: bold;
                color: #333;
            }
            
            .consultation-consultant {
                font-size: 14px;
                color: #666;
                margin: 5px 0;
            }
            
            .consultation-details {
                display: flex;
                gap: 20px;
                margin-top: 10px;
                flex-wrap: wrap;
            }
            
            .consultation-detail {
                font-size: 13px;
                color: #555;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .consultation-actions {
                margin-top: 15px;
                display: flex;
                gap: 10px;
            }
            
            .consultant-select-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 15px;
                margin: 20px 0;
            }
            
            .consultant-option {
                background: white;
                border: 2px solid #e0e0e0;
                border-radius: 10px;
                padding: 15px;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .consultant-option:hover {
                border-color: #4CAF50;
                background: #f1f8e9;
            }
            
            .consultant-option.selected {
                border-color: #4CAF50;
                background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
                box-shadow: 0 3px 10px rgba(76, 175, 80, 0.2);
            }
            
            .consultant-name {
                font-weight: bold;
                color: #333;
                margin-bottom: 5px;
            }
            
            .consultant-specialty {
                font-size: 12px;
                color: #666;
                padding: 3px 8px;
                background: #f5f5f5;
                border-radius: 15px;
                display: inline-block;
                margin-top: 5px;
            }
        `;
        document.head.appendChild(style);
    },
    
    // Load consultations
    loadConsultations(onlyMine = false) {
        const consultationsList = document.getElementById('consultationsList');
        const currentUser = APP_STATE.currentUser;
        
        this.init(); // Ensure consultations are initialized
        
        let consultations = APP_STATE.consultations || [];
        
        // Filter based on user type
        if (currentUser.type === 'membro') {
            consultations = consultations.filter(c => 
                c.memberId === currentUser.id || c.memberEmail === currentUser.email
            );
        } else if (currentUser.type === 'consulente' && onlyMine) {
            consultations = consultations.filter(c => 
                c.consultantId === currentUser.id || c.consultantEmail === currentUser.email
            );
        }
        
        if (consultations.length === 0) {
            consultationsList.innerHTML = `
                <div style="text-align: center; padding: 40px; background: white; border-radius: 12px;">
                    <p style="color: #999; margin-bottom: 20px;">
                        ${currentUser.type === 'membro' ? 
                            'Non hai ancora richiesto consulenze.' : 
                            'Non hai consulenze programmate.'}
                    </p>
                    ${currentUser.type === 'membro' ? 
                        `<button class="btn btn-primary" onclick="Consultations.requestConsultation()">
                            ➕ Richiedi la tua prima consulenza
                        </button>` : ''
                    }
                </div>
            `;
            return;
        }
        
        // Sort by date (upcoming first)
        consultations.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        consultationsList.innerHTML = consultations.map(consultation => `
            <div class="consultation-card" onclick="Consultations.viewDetails('${consultation.id}')">
                <div class="consultation-header">
                    <div>
                        <div class="consultation-title">
                            💼 ${consultation.specialty || 'Consulenza generale'}
                        </div>
                        <div class="consultation-consultant">
                            ${currentUser.type === 'membro' ? 
                                `Con: ${consultation.consultantName || 'Consulente'}` :
                                `Cliente: ${consultation.memberName || 'Membro'}`
                            }
                        </div>
                    </div>
                    <span class="status-badge ${consultation.status === 'confirmed' ? 'status-free' : 'status-paid'}">
                        ${consultation.status === 'confirmed' ? '✅ Confermata' : '⏳ In attesa'}
                    </span>
                </div>
                <div class="consultation-details">
                    <span class="consultation-detail">
                        📅 ${Utils.formatDate(consultation.date)}
                    </span>
                    <span class="consultation-detail">
                        ⏰ ${consultation.time || 'Da definire'}
                    </span>
                    ${consultation.location ? 
                        `<span class="consultation-detail">
                            📍 ${consultation.location}
                        </span>` : ''
                    }
                </div>
                ${currentUser.type === 'membro' ? 
                    `<div class="consultation-actions" onclick="event.stopPropagation()">
                        <button class="btn btn-small" onclick="Consultations.editConsultation('${consultation.id}')">
                            📝 Modifica Data
                        </button>
                        <button class="btn btn-small btn-danger" onclick="Consultations.cancelConsultation('${consultation.id}')">
                            ❌ Cancella
                        </button>
                    </div>` : ''
                }
            </div>
        `).join('');
    },
    
    // Request new consultation
    requestConsultation() {
        this.init();
        
        // Create modal for consultation request
        const modalHTML = `
            <div id="requestConsultationModal" class="modal active">
                <div class="modal-content" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header">
                        <h3>➕ Richiedi Nuova Consulenza</h3>
                        <span class="close-modal" onclick="Consultations.closeRequestModal()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="requestConsultationForm">
                            <div class="form-group">
                                <label>Seleziona il Consulente *</label>
                                <div class="consultant-select-grid">
                                    ${APP_STATE.consultants.map(consultant => `
                                        <div class="consultant-option" onclick="Consultations.selectConsultant('${consultant.id}', this)">
                                            <div class="consultant-name">
                                                ${consultant.name}
                                            </div>
                                            <div class="consultant-specialty">
                                                ${consultant.specialty}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                                <input type="hidden" id="selectedConsultant" required>
                            </div>
                            
                            <div class="form-group">
                                <label>Data Preferita *</label>
                                <input type="date" id="consultationDate" required 
                                       min="${new Date().toISOString().split('T')[0]}">
                            </div>
                            
                            <div class="form-group">
                                <label>Orario Preferito *</label>
                                <select id="consultationTime" required>
                                    <option value="">Seleziona orario</option>
                                    <option value="09:00">09:00</option>
                                    <option value="10:00">10:00</option>
                                    <option value="11:00">11:00</option>
                                    <option value="12:00">12:00</option>
                                    <option value="14:00">14:00</option>
                                    <option value="15:00">15:00</option>
                                    <option value="16:00">16:00</option>
                                    <option value="17:00">17:00</option>
                                    <option value="18:00">18:00</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>Modalità</label>
                                <select id="consultationMode">
                                    <option value="office">In presenza - Ufficio</option>
                                    <option value="online">Online - VideoCall</option>
                                    <option value="phone">Telefonica</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>Descrizione del problema/richiesta</label>
                                <textarea id="consultationDescription" rows="4" 
                                          placeholder="Descrivi brevemente il motivo della consulenza..."></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="Consultations.closeRequestModal()">
                            Annulla
                        </button>
                        <button class="btn btn-primary" onclick="Consultations.submitConsultationRequest()">
                            Invia Richiesta
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to DOM
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHTML;
        document.body.appendChild(tempDiv.firstElementChild);
    },
    
    // Select consultant
    selectConsultant(consultantId, element) {
        // Remove previous selection
        document.querySelectorAll('.consultant-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Add selection to clicked element
        element.classList.add('selected');
        
        // Store selected consultant
        document.getElementById('selectedConsultant').value = consultantId;
    },
    
    // Submit consultation request
    submitConsultationRequest() {
        const consultantId = document.getElementById('selectedConsultant').value;
        const date = document.getElementById('consultationDate').value;
        const time = document.getElementById('consultationTime').value;
        const mode = document.getElementById('consultationMode').value;
        const description = document.getElementById('consultationDescription').value;
        
        if (!consultantId || !date || !time) {
            Utils.showToast('❌ Compila tutti i campi obbligatori', 'error');
            return;
        }
        
        const consultant = APP_STATE.consultants.find(c => c.id === consultantId);
        const currentUser = APP_STATE.currentUser;
        
        // Determine location based on mode
        let location = '';
        if (mode === 'office') {
            location = 'Ufficio - Via Roma 123, Rimini';
        } else if (mode === 'online') {
            location = 'Online - Link verrà inviato via email';
        } else if (mode === 'phone') {
            location = 'Telefonica - Verrete contattati';
        }
        
        const newConsultation = {
            id: 'CONS_' + Date.now(),
            memberId: currentUser.id || currentUser.email,
            memberEmail: currentUser.email,
            memberName: currentUser.name,
            consultantId: consultant.id,
            consultantEmail: consultant.email,
            consultantName: consultant.name,
            specialty: consultant.specialty,
            date: date,
            time: time,
            mode: mode,
            location: location,
            description: description,
            status: 'pending',
            createdAt: new Date().toISOString(),
            createdBy: currentUser.email
        };
        
        // Add consultation to state
        if (!APP_STATE.consultations) {
            APP_STATE.consultations = [];
        }
        APP_STATE.consultations.push(newConsultation);
        
        // Save state
        saveState();
        
        // Close modal
        this.closeRequestModal();
        
        // Reload consultations list
        this.loadConsultations();
        
        // Refresh calendar if it's open
        if (document.getElementById('calendarContainer')) {
            Calendar.generateCalendar();
        }
        
        Utils.showToast('✅ Richiesta di consulenza inviata con successo!', 'success');
    },
    
    // Close request modal
    closeRequestModal() {
        const modal = document.getElementById('requestConsultationModal');
        if (modal) modal.remove();
    },
    
    // View consultation details
    viewDetails(consultationId) {
        const consultation = APP_STATE.consultations.find(c => c.id === consultationId);
        if (!consultation) return;
        
        // Create details modal
        const modalHTML = `
            <div id="consultationDetailsModal" class="modal active">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3>📋 Dettagli Consulenza</h3>
                        <span class="close-modal" onclick="Consultations.closeDetailsModal()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div style="padding: 20px; background: #f9f9f9; border-radius: 10px;">
                            <h4 style="color: #333; margin-bottom: 15px;">
                                ${consultation.specialty}
                            </h4>
                            
                            <div style="display: grid; gap: 12px;">
                                <div>
                                    <strong>Consulente:</strong> ${consultation.consultantName}
                                </div>
                                ${APP_STATE.currentUser.type === 'admin' || APP_STATE.currentUser.type === 'consulente' ? 
                                    `<div>
                                        <strong>Cliente:</strong> ${consultation.memberName}
                                    </div>` : ''
                                }
                                <div>
                                    <strong>Data:</strong> ${Utils.formatDate(consultation.date)}
                                </div>
                                <div>
                                    <strong>Orario:</strong> ${consultation.time}
                                </div>
                                <div>
                                    <strong>Modalità:</strong> ${
                                        consultation.mode === 'office' ? 'In presenza' :
                                        consultation.mode === 'online' ? 'Online' : 'Telefonica'
                                    }
                                </div>
                                <div>
                                    <strong>Luogo:</strong> ${consultation.location || 'Da definire'}
                                </div>
                                <div>
                                    <strong>Stato:</strong> 
                                    <span class="status-badge ${consultation.status === 'confirmed' ? 'status-free' : 'status-paid'}">
                                        ${consultation.status === 'confirmed' ? '✅ Confermata' : '⏳ In attesa'}
                                    </span>
                                </div>
                                ${consultation.description ? 
                                    `<div>
                                        <strong>Descrizione:</strong>
                                        <div style="margin-top: 5px; padding: 10px; background: white; border-radius: 5px;">
                                            ${consultation.description}
                                        </div>
                                    </div>` : ''
                                }
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="Consultations.closeDetailsModal()">
                            Chiudi
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to DOM
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHTML;
        document.body.appendChild(tempDiv.firstElementChild);
    },
    
    // Close details modal
    closeDetailsModal() {
        const modal = document.getElementById('consultationDetailsModal');
        if (modal) modal.remove();
    },
    
    // Edit consultation
    editConsultation(consultationId) {
        event.stopPropagation();
        const consultation = APP_STATE.consultations.find(c => c.id === consultationId);
        if (!consultation) return;
        
        // Use Calendar's edit function
        Calendar.editConsultation(consultationId);
    },
    
    // Cancel consultation
    cancelConsultation(consultationId) {
        event.stopPropagation();
        if (!confirm('Sei sicuro di voler cancellare questa consulenza?')) return;
        
        const consultationIndex = APP_STATE.consultations.findIndex(c => c.id === consultationId);
        if (consultationIndex === -1) return;
        
        // Update status to cancelled instead of deleting
        APP_STATE.consultations[consultationIndex].status = 'cancelled';
        APP_STATE.consultations[consultationIndex].cancelledAt = new Date().toISOString();
        APP_STATE.consultations[consultationIndex].cancelledBy = APP_STATE.currentUser.email;
        
        // Save state
        saveState();
        
        // Reload consultations
        this.loadConsultations();
        
        // Refresh calendar if it's open
        if (document.getElementById('calendarContainer')) {
            Calendar.generateCalendar();
        }
        
        Utils.showToast('✅ Consulenza cancellata', 'success');
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    Consultations.init();
});

// Make Consultations globally available
window.Consultations = Consultations;