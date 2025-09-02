// ============================================
// UTILS.JS - Funzioni di Utilità
// ============================================

const Utils = {
    // Toast Notifications
    showToast(message, type = 'info') {
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 3000);
    },

    // Storage Functions
    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Save failed:', e);
            this.showToast('⚠️ Impossibile salvare i dati', 'error');
            return false;
        }
    },

    loadFromStorage(key) {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.error('Load failed:', e);
            return null;
        }
    },

    // Date Formatting
    formatDate(date) {
        return new Date(date).toLocaleDateString('it-IT');
    },

    formatTime(date) {
        return new Date(date).toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    formatDateTime(date) {
        return `${this.formatDate(date)} ${this.formatTime(date)}`;
    },

    // Generate Random ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Generate Random Password
    generatePassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#';
        let password = '';
        for (let i = 0; i < 10; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    },

    // Validation Functions
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    validateVAT(vat) {
        return /^\d{11}$/.test(vat);
    },

    validateSDI(sdi) {
        return /^[A-Z0-9]{7}$/.test(sdi);
    },

    validatePhone(phone) {
        return /^[+]?[\d\s]{10,}$/.test(phone.replace(/\s/g, ''));
    },

    // DOM Helpers
    hideElement(id) {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    },

    showElement(id) {
        const el = document.getElementById(id);
        if (el) el.classList.remove('hidden');
    },

    clearForm(formId) {
        const form = document.getElementById(formId);
        if (form) form.reset();
    },

    // Modal Functions
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('active');
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('active');
    },

    // Countdown Calculator
    calculateDaysRemaining(endDate) {
        const now = new Date();
        const end = new Date(endDate);
        const diffTime = end - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
};

// Make Utils globally available
window.Utils = Utils;