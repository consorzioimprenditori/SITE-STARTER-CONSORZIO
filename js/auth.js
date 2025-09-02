// ============================================
// AUTH.JS - Autenticazione e Login
// ============================================

const Auth = {
    // Switch between tabs
    switchTab(event) {
        const tab = event.currentTarget;
        const type = tab.dataset.type;
        
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
                    
                    APP_STATE.currentUser = {
                        email: email,
                        type: userType,
                        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
                        contractEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        loginTime: Date.now()
                    };
                    
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

    // Show dashboard after login
    showDashboard() {
        document.getElementById('loginScreen').style.display = 'none';
        
        // Create dashboard if it doesn't exist
        if (!document.getElementById('dashboard')) {
            Dashboard.createDashboard();
        }
        
        document.getElementById('dashboard').classList.add('active');
        Dashboard.updateUserInfo();
        Dashboard.updateStats();
        Dashboard.loadMenu();
        
        if (APP_STATE.currentUser.type === 'membro') {
            Dashboard.showCountdown();
        }
    },

    // Logout
    logout() {
        if (confirm('Sei sicuro di voler uscire?')) {
            if (window.notificationInterval) {
                clearInterval(window.notificationInterval);
                window.notificationInterval = null;
            }
            
            APP_STATE.currentUser = null;
            saveState();
            
            document.getElementById('dashboard').classList.remove('active');
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.getElementById('loginScreen').style.display = 'block';
            
            document.getElementById('email').value = '';
            document.getElementById('password').value = '';
            
            document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
            
            Utils.showToast('👋 Arrivederci!', 'success');
        }
    }
};

// Make Auth globally available
window.Auth = Auth;