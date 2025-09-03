// ============================================
// AUTH.JS - Autenticazione e Login CORRETTA
// ============================================

const Auth = {
    // Switch between tabs
    switchTab(event) {
        const tab = event.currentTarget;
        const type = tab.dataset.type;
        
        console.log('🔄 Switching to tab:', type); // Debug log
        
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('userType').value = type;
        
        const emailInput = document.getElementById('email');
        emailInput.placeholder = type === 'admin' ? 'admin@consorzio.it' : 
                                type === 'membro' ? 'membro@azienda.it' : 
                                'consulente@studio.it';
    },

    // Handle login
    handleLogin(event) {
        event.preventDefault();
        
        const btn = document.getElementById('loginBtn');
        const originalText = btn.textContent;
        
        try {
            btn.disabled = true;
            btn.textContent = 'ACCESSO IN CORSO...';
            
            setTimeout(() => {
                try {
                    const email = document.getElementById('email').value.trim();
                    const password = document.getElementById('password').value;
                    const userType = document.getElementById('userType').value;
                    
                    // LOG PER DEBUG
                    console.log('🔑 Login attempt:', { email, userType });
                    
                    if (!email || !password) {
                        throw new Error('Credenziali mancanti');
                    }
                    
                    if (!Utils.validateEmail(email)) {
                        throw new Error('Email non valida');
                    }
                    
                    // Controlla se l'utente è bloccato
                    let isBlocked = false;
                    
                    if (userType === 'membro') {
                        const member = APP_STATE.members?.find(m => m.email === email);
                        if (member && member.blocked) {
                            isBlocked = true;
                        }
                    } else if (userType === 'consulente') {
                        const consultant = APP_STATE.consultantsData?.find(c => c.email === email);
                        if (consultant && consultant.blocked) {
                            isBlocked = true;
                        }
                    }
                    
                    if (isBlocked) {
                        throw new Error('Account bloccato. Contatta l\'amministratore.');
                    }
                    
                    // IMPORTANTE: Assicuriamoci che il tipo sia corretto
                    APP_STATE.currentUser = {
                        email: email,
                        type: userType, // QUESTO DEVE ESSERE 'admin', 'membro', o 'consulente'
                        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
                        contractEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        loginTime: Date.now(),
                        circuit: 'Rimini' // Default circuit
                    };
                    
                    // LOG PER CONFERMA
                    console.log('✅ User logged in as:', APP_STATE.currentUser.type);
                    
                    saveState();
                    Auth.showDashboard();
                    Utils.showToast('✅ Benvenuto ' + APP_STATE.currentUser.name + '!', 'success');
                    
                    document.getElementById('password').value = '';
                    
                } catch (error) {
                    Utils.showToast('❌ ' + error.message, 'error');
                } finally {
                    btn.disabled = false;
                    btn.textContent = originalText;
                }
            }, 1000);
            
        } catch (error) {
            btn.disabled = false;
            btn.textContent = originalText;
            Utils.showToast('❌ Errore durante il login', 'error');
        }
    },

    // Show dashboard after login - MIGLIORATA
    showDashboard() {
        console.log('📊 Showing dashboard for:', APP_STATE.currentUser?.type);
        
        // Nascondi login screen
        document.getElementById('loginScreen').style.display = 'none';
        
        // Pulisci eventuali dashboard esistenti
        const existingDashboard = document.getElementById('dashboard');
        if (existingDashboard) {
            existingDashboard.remove();
        }
        
        // Crea nuovo dashboard
        Dashboard.createDashboard();
        
        // Mostra dashboard
        const dashboard = document.getElementById('dashboard');
        if (dashboard) {
            dashboard.classList.add('active');
            dashboard.style.display = 'block'; // Forza display
        }
        
        // Aggiorna le informazioni utente
        Dashboard.updateUserInfo();
        Dashboard.updateStats();
        Dashboard.loadMenu();
        
        // Se è un membro, mostra il countdown
        if (APP_STATE.currentUser.type === 'membro') {
            Dashboard.showCountdown();
        }
    },

    // Logout - MIGLIORATO
    logout() {
        if (confirm('Sei sicuro di voler uscire?')) {
            // Pulisci timer
            if (window.notificationInterval) {
                clearInterval(window.notificationInterval);
                window.notificationInterval = null;
            }
            
            // IMPORTANTE: Pulisci completamente l'utente
            APP_STATE.currentUser = null;
            delete APP_STATE.currentUser; // Assicurati che sia completamente rimosso
            
            // Salva stato pulito
            saveState();
            
            // Pulisci il DOM
            const dashboard = document.getElementById('dashboard');
            if (dashboard) {
                dashboard.classList.remove('active');
                dashboard.style.display = 'none';
                dashboard.innerHTML = ''; // Pulisci contenuto
            }
            
            // Nascondi tutte le sezioni
            document.querySelectorAll('.section').forEach(s => {
                s.classList.remove('active');
                s.style.display = 'none';
            });
            
            // Mostra login screen
            document.getElementById('loginScreen').style.display = 'block';
            
            // Reset form
            document.getElementById('email').value = '';
            document.getElementById('password').value = '';
            
            // Reset al tab Admin di default
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            const adminTab = document.querySelector('.tab[data-type="admin"]');
            if (adminTab) {
                adminTab.classList.add('active');
                document.getElementById('userType').value = 'admin';
            }
            
            // Chiudi eventuali modali
            document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
            
            Utils.showToast('👋 Arrivederci!', 'success');
            
            console.log('🚪 User logged out successfully');
        }
    }
};

// Make Auth globally available
window.Auth = Auth;