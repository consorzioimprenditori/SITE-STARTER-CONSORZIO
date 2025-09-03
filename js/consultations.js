// ============================================
// CONSULTATIONS.JS - Gestione Consulenze
// ============================================

const Consultations = {
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
            
            <button class="btn" onclick="Consultations.requestConsultation()" style="margin-top: 25px;">
                ➕ RICHIEDI CONSULENZA
            </button>
        `;
        sectionsContainer.appendChild(section);
    },
    
    // Load consultations
    loadConsultations(onlyMine = false) {
        const consultationsList = document.getElementById('consultationsList');
        
        // Demo consultations
        const demoConsultations = [
            {
                id: '1',
                consultant: 'Dott. Marco Verdi',
                specialty: 'Finanza agevolata',
                date: '2025-01-20',
                time: '15:00',
                status: 'confirmed'
            },
            {
                id: '2',
                consultant: 'Avv. Sara Neri',
                specialty: 'Consulenza legale d\'impresa',
                date: '2025-01-25',
                time: '10:00',
                status: 'pending'
            }
        ];
        
        consultationsList.innerHTML = demoConsultations.map(consultation => `
            <div class="card" style="margin-bottom: 15px;">
                <div class="card-title">
                    💼 ${consultation.consultant}
                </div>
                <div class="card-subtitle">
                    ${consultation.specialty}
                </div>
                <div class="card-meta">
                    <span>📅 ${Utils.formatDate(consultation.date)}</span>
                    <span>⏰ ${consultation.time}</span>
                    <span class="status-badge ${consultation.status === 'confirmed' ? 'status-free' : 'status-paid'}">
                        ${consultation.status === 'confirmed' ? '✅ Confermata' : '⏳ In attesa'}
                    </span>
                </div>
            </div>
        `).join('');
    },
    
    // Request consultation
    requestConsultation() {
        Utils.showToast('📅 Funzione di richiesta consulenza in arrivo!', 'info');
    }
};

// Make Consultations globally available
window.Consultations = Consultations;