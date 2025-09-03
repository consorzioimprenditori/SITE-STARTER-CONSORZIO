// ============================================
// DASHBOARD.JS - Dashboard Management COMPLETO E CORRETTO
// ============================================

const Dashboard = {
    // Create dashboard structure
    createDashboard() {
        const dashboardContainer = document.getElementById('dashboardContainer');
        
        const dashboard = document.createElement('div');
        dashboard.id = 'dashboard';
        dashboard.className = 'dashboard';
        
        dashboardContainer.appendChild(dashboard);
        
        // Load appropriate dashboard based on user type
        if (APP_STATE.currentUser.type === 'admin') {
            this.showAdmin();
        } else if (APP_STATE.currentUser.type === 'membro') {
            this.showMember();
        } else if (APP_STATE.currentUser.type === 'consulente') {
            this.showConsultant();
        }
    },
    
    // Update user info
    updateUserInfo() {
        // Questo verrà aggiornato in showAdmin/showMember
    },
    
    // Update stats
    updateStats() {
        // Le statistiche sono gestite nei rispettivi dashboard
    },
    
    // Load menu
    loadMenu() {
        // Il menu è già caricato in showAdmin/showMember
    },
    
    // Show countdown (per membri)
    showCountdown() {
        if (APP_STATE.currentUser && APP_STATE.currentUser.contractEnd) {
            const daysRemaining = Utils.calculateDaysRemaining(APP_STATE.currentUser.contractEnd);
            const countdownElement = document.getElementById('contractCountdown');
            if (countdownElement) {
                countdownElement.textContent = `${daysRemaining} giorni`;
            }
        }
    },

    // Show admin dashboard - CORRETTO con showCalendar()
    showAdmin() {
        const dashboard = document.getElementById('dashboard');
        dashboard.innerHTML = `
            <div class="dashboard-header">
                <h1>⚙️ Pannello Amministrazione</h1>
                <button class="btn btn-danger" onclick="Auth.logout()">🚪 ESCI</button>
            </div>
            
            <div class="admin-grid">
                <!-- GESTIONE UTENTI -->
                <div class="dashboard-card" onclick="Members.showManagement()">
                    <div class="card-icon">👥</div>
                    <div class="card-title">Gestisci Membri</div>
                    <div class="card-subtitle">Aggiungi e modifica membri</div>
                </div>
                
                <div class="dashboard-card" onclick="Dashboard.showConsultantsManagement()">
                    <div class="card-icon">💼</div>
                    <div class="card-title">Gestisci Consulenti</div>
                    <div class="card-subtitle">Gestione esperti e consulenti</div>
                </div>
                
                <!-- GESTIONE EVENTI E CALENDARIO -->
                <div class="dashboard-card" onclick="Calendar.showCalendar()">
                    <div class="card-icon">📅</div>
                    <div class="card-title">Calendario Eventi</div>
                    <div class="card-subtitle">Visualizza calendario e crea eventi</div>
                </div>
                
                <div class="dashboard-card" onclick="EventsManager.showEventsManager()">
                    <div class="card-icon">📌</div>
                    <div class="card-title">Lista Eventi</div>
                    <div class="card-subtitle">Gestione completa eventi</div>
                </div>
                
                <!-- GESTIONE AREE E COMUNICAZIONI -->
                <div class="dashboard-card" onclick="Dashboard.showAreasManagement()">
                    <div class="card-icon">🗺️</div>
                    <div class="card-title">Gestisci Aree</div>
                    <div class="card-subtitle">Rimini, Pesaro, Ancona</div>
                </div>
                
                <div class="dashboard-card" onclick="Chat.show()">
                    <div class="card-icon">💬</div>
                    <div class="card-title">Chat Globale</div>
                    <div class="card-subtitle">Comunicazioni con tutti</div>
                </div>
                
                <!-- GESTIONE DOCUMENTI E REPORT -->
                <div class="dashboard-card" onclick="Dashboard.showDocuments()">
                    <div class="card-icon">📄</div>
                    <div class="card-title">Documenti</div>
                    <div class="card-subtitle">Carica e gestisci file</div>
                </div>
                
                <div class="dashboard-card" onclick="Dashboard.showReports()">
                    <div class="card-icon">📊</div>
                    <div class="card-title">Report e Statistiche</div>
                    <div class="card-subtitle">Analisi e dati</div>
                </div>
                
                <!-- ALTRE FUNZIONI -->
                <div class="dashboard-card" onclick="Dashboard.showNotifications()">
                    <div class="card-icon">🔔</div>
                    <div class="card-title">Notifiche</div>
                    <div class="card-subtitle">Avvisi e promemoria</div>
                </div>
                
                <div class="dashboard-card" onclick="Dashboard.showSettings()">
                    <div class="card-icon">⚙️</div>
                    <div class="card-title">Impostazioni</div>
                    <div class="card-subtitle">Configurazione sistema</div>
                </div>
            </div>
        `;
        
        this.addDashboardStyles();
    },

    // Show member dashboard - CORRETTO con showCalendar()
    showMember() {
        const dashboard = document.getElementById('dashboard');
        dashboard.innerHTML = `
            <div class="dashboard-header">
                <h1>🏢 Area Membri - ${APP_STATE.currentUser.name}</h1>
                <button class="btn btn-danger" onclick="Auth.logout()">🚪 ESCI</button>
            </div>
            
            <div class="user-info" style="background: var(--bg-medium); padding: 20px; border-radius: 15px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between;">
                    <div>
                        <p style="color: var(--text-secondary);">Contratto attivo</p>
                        <p style="color: var(--primary); font-size: 20px; font-weight: 600;">
                            <span id="contractCountdown">-</span> rimanenti
                        </p>
                    </div>
                </div>
            </div>
            
            <div class="admin-grid">
                <div class="dashboard-card" onclick="Calendar.showCalendar()">
                    <div class="card-icon">📅</div>
                    <div class="card-title">Calendario Eventi</div>
                    <div class="card-subtitle">Visualizza eventi</div>
                </div>
                
                <div class="dashboard-card" onclick="EventsManager.showEventsManager()">
                    <div class="card-icon">📌</div>
                    <div class="card-title">Lista Eventi</div>
                    <div class="card-subtitle">Tutti gli eventi</div>
                </div>
                
                <div class="dashboard-card" onclick="Consultations.show()">
                    <div class="card-icon">💼</div>
                    <div class="card-title">Consulenze</div>
                    <div class="card-subtitle">Richiedi consulenza</div>
                </div>
                
                <div class="dashboard-card" onclick="Chat.show()">
                    <div class="card-icon">💬</div>
                    <div class="card-title">Chat</div>
                    <div class="card-subtitle">Messaggi</div>
                </div>
            </div>
        `;
        
        this.addDashboardStyles();
        this.showCountdown();
    },

    // Show consultant dashboard - CORRETTO con showCalendar()
    showConsultant() {
        const dashboard = document.getElementById('dashboard');
        dashboard.innerHTML = `
            <div class="dashboard-header">
                <h1>💼 Area Consulenti - ${APP_STATE.currentUser.name}</h1>
                <button class="btn btn-danger" onclick="Auth.logout()">🚪 ESCI</button>
            </div>
            
            <div class="admin-grid">
                <div class="dashboard-card" onclick="Consultations.showMy()">
                    <div class="card-icon">💼</div>
                    <div class="card-title">Le Mie Consulenze</div>
                    <div class="card-subtitle">Gestisci appuntamenti</div>
                </div>
                
                <div class="dashboard-card" onclick="Calendar.showCalendar()">
                    <div class="card-icon">📅</div>
                    <div class="card-title">Calendario</div>
                    <div class="card-subtitle">Visualizza eventi</div>
                </div>
                
                <div class="dashboard-card" onclick="Chat.show()">
                    <div class="card-icon">💬</div>
                    <div class="card-title">Chat</div>
                    <div class="card-subtitle">Comunicazioni</div>
                </div>
            </div>
        `;
        
        this.addDashboardStyles();
    },

    // Add dashboard styles
    addDashboardStyles() {
        if (document.getElementById('dashboardStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'dashboardStyles';
        style.textContent = `
            .admin-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
                padding: 20px 0;
            }
            
            .dashboard-card {
                background: linear-gradient(135deg, rgba(42, 42, 62, 0.9) 0%, rgba(58, 58, 78, 0.7) 100%);
                border-radius: 20px;
                padding: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
                border: 1px solid rgba(199, 255, 0, 0.1);
                text-align: center;
            }
            
            .dashboard-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 30px rgba(199, 255, 0, 0.2);
                border-color: var(--primary);
                background: linear-gradient(135deg, rgba(58, 58, 78, 0.9) 0%, rgba(74, 74, 94, 0.7) 100%);
            }
            
            .card-icon {
                font-size: 40px;
                margin-bottom: 12px;
            }
            
            .card-title {
                font-size: 16px;
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 6px;
            }
            
            .card-subtitle {
                font-size: 12px;
                color: var(--text-secondary);
            }
            
            @media (max-width: 480px) {
                .admin-grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }
            }
        `;
        document.head.appendChild(style);
    },

    // Other management functions
    showConsultantsManagement() {
        Utils.showToast('📋 Gestione Consulenti in arrivo!', 'info');
    },
    
    showAreasManagement() {
        Utils.showToast('🗺️ Gestione Aree in arrivo!', 'info');
    },
    
    showDocuments() {
        Utils.showToast('📄 Gestione Documenti in arrivo!', 'info');
    },
    
    showReports() {
        Utils.showToast('📊 Report in arrivo!', 'info');
    },
    
    showNotifications() {
        Utils.showToast('🔔 Notifiche in arrivo!', 'info');
    },
    
    showSettings() {
        Utils.showToast('⚙️ Impostazioni in arrivo!', 'info');
    }
};

// Make Dashboard globally available
window.Dashboard = Dashboard;