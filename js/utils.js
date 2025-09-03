// ============================================
// UTILS.JS - Funzioni di Utilità COMPLETE
// ============================================

const Utils = {
    // Toast Notifications
    showToast(message, type = 'info') {
        // Rimuovi toast esistenti
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Crea nuovo toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        // Aggiungi stili inline per sicurezza
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            padding: 16px 28px;
            border-radius: 12px;
            font-weight: 600;
            z-index: 9999;
            animation: toastSlide 0.4s ease-out;
            font-size: 14px;
            min-width: 200px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        `;
        
        // Applica colori basati sul tipo
        switch(type) {
            case 'success':
                toast.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
                toast.style.color = 'white';
                break;
            case 'error':
                toast.style.background = 'linear-gradient(135deg, #f44336 0%, #cc0000 100%)';
                toast.style.color = 'white';
                break;
            case 'warning':
                toast.style.background = 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)';
                toast.style.color = 'white';
                break;
            default:
                toast.style.background = 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)';
                toast.style.color = 'white';
        }
        
        document.body.appendChild(toast);
        
        // Rimuovi dopo 3 secondi
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'toastSlideOut 0.4s ease-out';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, 400);
            }
        }, 3000);
        
        // Aggiungi animazioni se non esistono
        if (!document.getElementById('toastAnimations')) {
            const style = document.createElement('style');
            style.id = 'toastAnimations';
            style.textContent = `
                @keyframes toastSlide {
                    from {
                        transform: translateX(-50%) translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(-50%) translateY(0);
                        opacity: 1;
                    }
                }
                @keyframes toastSlideOut {
                    from {
                        transform: translateX(-50%) translateY(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(-50%) translateY(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    },

    // Storage Functions
    saveToStorage(key, data) {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(key, serialized);
            return true;
        } catch (e) {
            console.error('Errore nel salvataggio:', e);
            if (e.name === 'QuotaExceededError') {
                this.showToast('⚠️ Spazio di archiviazione esaurito', 'error');
            } else {
                this.showToast('⚠️ Impossibile salvare i dati', 'error');
            }
            return false;
        }
    },

    loadFromStorage(key) {
        try {
            const stored = localStorage.getItem(key);
            if (!stored) return null;
            
            return JSON.parse(stored);
        } catch (e) {
            console.error('Errore nel caricamento:', e);
            return null;
        }
    },

    removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Errore nella rimozione:', e);
            return false;
        }
    },

    clearStorage() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Errore nella pulizia storage:', e);
            return false;
        }
    },

    // Date Formatting
    formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        return d.toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    },

    formatTime(date) {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        return d.toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    formatDateTime(date) {
        return `${this.formatDate(date)} ${this.formatTime(date)}`;
    },

    formatDateLong(date) {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        return d.toLocaleDateString('it-IT', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    },

    formatRelativeTime(date) {
        const d = new Date(date);
        const now = new Date();
        const diff = Math.floor((now - d) / 1000); // differenza in secondi
        
        if (diff < 60) return 'Adesso';
        if (diff < 3600) return `${Math.floor(diff / 60)} minuti fa`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} ore fa`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} giorni fa`;
        
        return this.formatDate(date);
    },

    // Generate IDs
    generateId(prefix = 'ID') {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
    },

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    // Generate Random Password
    generatePassword(length = 12, includeSymbols = true) {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        let chars = lowercase + uppercase + numbers;
        if (includeSymbols) {
            chars += symbols;
        }
        
        let password = '';
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return password;
    },

    // Validation Functions
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    },

    validatePhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length >= 10 && cleaned.length <= 15;
    },

    validateVAT(vat) {
        // Partita IVA italiana
        return /^\d{11}$/.test(vat.replace(/\s/g, ''));
    },

    validateSDI(sdi) {
        // Codice SDI italiano
        return /^[A-Z0-9]{7}$/.test(sdi.toUpperCase());
    },

    validateIBAN(iban) {
        // IBAN italiano semplificato
        const cleaned = iban.replace(/\s/g, '').toUpperCase();
        return /^IT\d{2}[A-Z]\d{22}$/.test(cleaned);
    },

    validateURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    // DOM Helpers
    hideElement(id) {
        const el = typeof id === 'string' ? document.getElementById(id) : id;
        if (el) {
            el.classList.add('hidden');
            el.style.display = 'none';
        }
    },

    showElement(id) {
        const el = typeof id === 'string' ? document.getElementById(id) : id;
        if (el) {
            el.classList.remove('hidden');
            el.style.display = '';
        }
    },

    toggleElement(id) {
        const el = typeof id === 'string' ? document.getElementById(id) : id;
        if (el) {
            if (el.style.display === 'none' || el.classList.contains('hidden')) {
                this.showElement(el);
            } else {
                this.hideElement(el);
            }
        }
    },

    clearForm(formId) {
        const form = typeof formId === 'string' ? document.getElementById(formId) : formId;
        if (form) {
            form.reset();
            // Clear any custom error messages
            form.querySelectorAll('.error-message').forEach(el => el.remove());
            form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        }
    },

    // Modal Functions
    openModal(modalId) {
        const modal = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
        if (modal) {
            modal.classList.add('active');
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }
    },

    closeModal(modalId) {
        const modal = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
        }
    },

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            this.closeModal(modal);
        });
    },

    // Countdown Calculator
    calculateDaysRemaining(endDate) {
        if (!endDate) return 0;
        
        const now = new Date();
        const end = new Date(endDate);
        const diffTime = end - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return Math.max(0, diffDays); // Non restituire numeri negativi
    },

    calculateTimeRemaining(endDate) {
        const end = new Date(endDate);
        const now = new Date();
        const diff = end - now;
        
        if (diff <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        return { days, hours, minutes, seconds };
    },

    // String Helpers
    truncate(str, length = 50, suffix = '...') {
        if (!str) return '';
        if (str.length <= length) return str;
        return str.substring(0, length - suffix.length) + suffix;
    },

    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    capitalizeWords(str) {
        if (!str) return '';
        return str.replace(/\b\w/g, char => char.toUpperCase());
    },

    slugify(str) {
        if (!str) return '';
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    // Number Helpers
    formatCurrency(amount, currency = 'EUR') {
        return new Intl.NumberFormat('it-IT', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    formatNumber(num, decimals = 0) {
        return new Intl.NumberFormat('it-IT', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num);
    },

    formatPercentage(value, decimals = 0) {
        return new Intl.NumberFormat('it-IT', {
            style: 'percent',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value / 100);
    },

    // Array Helpers
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    },

    removeDuplicates(array) {
        return [...new Set(array)];
    },

    groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = item[key];
            if (!result[group]) result[group] = [];
            result[group].push(item);
            return result;
        }, {});
    },

    // Object Helpers
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (obj instanceof Object) {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    },

    mergeDeep(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();

        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    this.mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }

        return this.mergeDeep(target, ...sources);
    },

    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    },

    // Debounce & Throttle
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Device Detection
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    isTablet() {
        return /(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(navigator.userAgent);
    },

    isDesktop() {
        return !this.isMobile() && !this.isTablet();
    },

    getDeviceType() {
        if (this.isMobile()) return 'mobile';
        if (this.isTablet()) return 'tablet';
        return 'desktop';
    },

    // Browser Detection
    getBrowser() {
        const userAgent = navigator.userAgent;
        if (userAgent.indexOf("Chrome") > -1) return "Chrome";
        if (userAgent.indexOf("Safari") > -1) return "Safari";
        if (userAgent.indexOf("Firefox") > -1) return "Firefox";
        if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident/") > -1) return "IE";
        if (userAgent.indexOf("Edge") > -1) return "Edge";
        return "Unknown";
    },

    // Cookie Management
    setCookie(name, value, days = 7) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    },

    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },

    deleteCookie(name) {
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
    },

    // Clipboard
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                this.showToast('📋 Copiato negli appunti!', 'success');
                return true;
            } else {
                // Fallback for older browsers
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.left = "-999999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                
                if (successful) {
                    this.showToast('📋 Copiato negli appunti!', 'success');
                }
                return successful;
            }
        } catch (err) {
            console.error('Errore nella copia:', err);
            this.showToast('❌ Impossibile copiare', 'error');
            return false;
        }
    },

    // Download File
    downloadFile(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    },

    // Export/Import JSON
    exportJSON(data, filename = 'export.json') {
        const json = JSON.stringify(data, null, 2);
        this.downloadFile(json, filename, 'application/json');
    },

    async importJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    },

    // Loading Indicator
    showLoading(message = 'Caricamento...') {
        const existingLoader = document.getElementById('globalLoader');
        if (existingLoader) return;
        
        const loader = document.createElement('div');
        loader.id = 'globalLoader';
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        loader.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 15px; text-align: center;">
                <div class="spinner" style="border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                <div style="color: #333; font-weight: 500;">${message}</div>
            </div>
        `;
        
        // Add spin animation if not exists
        if (!document.getElementById('spinAnimation')) {
            const style = document.createElement('style');
            style.id = 'spinAnimation';
            style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
            document.head.appendChild(style);
        }
        
        document.body.appendChild(loader);
    },

    hideLoading() {
        const loader = document.getElementById('globalLoader');
        if (loader) {
            loader.remove();
        }
    },

    // Wait/Sleep function
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Make Utils globally available
window.Utils = Utils;

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}