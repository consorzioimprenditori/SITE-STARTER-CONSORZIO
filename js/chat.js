// ============================================
// CHAT.JS - Gestione Chat Interna
// ============================================

const Chat = {
    // Show chat section
    show() {
        this.createSection();
        showSection('chatSection');
        this.loadMessages();
    },

    createSection() {
        if (document.getElementById('chatSection')) return;
        
        const sectionsContainer = document.getElementById('sectionsContainer');
        const section = document.createElement('div');
        section.id = 'chatSection';
        section.className = 'section';
        section.innerHTML = `
            <div class="section-header">
                <button class="back-btn" onclick="goBack()">← Indietro</button>
                <h2>💬 Chat Interna</h2>
            </div>
            <div class="chat-container">
                <div class="chat-messages" id="chatMessages">
                    <!-- Messages will be loaded here -->
                </div>
                <div class="chat-input-container">
                    <input type="text" class="chat-input" placeholder="Scrivi un messaggio..." id="chatInput" onkeypress="Chat.checkEnter(event)">
                    <button class="btn send-btn" onclick="Chat.sendMessage()">INVIA</button>
                </div>
            </div>
        `;
        sectionsContainer.appendChild(section);
        this.addChatStyles();
    },

    // Add chat-specific styles
    addChatStyles() {
        if (document.getElementById('chatStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'chatStyles';
        style.textContent = `
            .chat-container {
                background: linear-gradient(135deg, rgba(42, 42, 62, 0.8) 0%, rgba(58, 58, 78, 0.6) 100%);
                border-radius: 20px;
                padding: 25px;
                height: 450px;
                display: flex;
                flex-direction: column;
                border: 1px solid rgba(199, 255, 0, 0.05);
            }
            
            .chat-messages {
                flex: 1;
                overflow-y: auto;
                margin-bottom: 20px;
                padding-right: 10px;
            }
            
            .message {
                margin-bottom: 18px;
                animation: messageSlide 0.3s ease-out;
            }
            
            @keyframes messageSlide {
                from { 
                    opacity: 0;
                    transform: translateY(10px);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .message-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 8px;
            }
            
            .message-avatar {
                width: 28px;
                height: 28px;
                background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                color: var(--bg-dark);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                box-shadow: 0 3px 10px var(--shadow-glow);
            }
            
            .message-sender {
                font-size: 13px;
                color: var(--primary);
                font-weight: 600;
            }
            
            .message-time {
                font-size: 11px;
                color: var(--text-muted);
                margin-left: auto;
            }
            
            .message-content {
                background: linear-gradient(135deg, var(--bg-medium) 0%, var(--bg-light) 100%);
                padding: 12px 16px;
                border-radius: 12px;
                font-size: 14px;
                margin-left: 38px;
                line-height: 1.5;
            }
            
            .message.own .message-content {
                background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                color: var(--bg-dark);
                margin-left: auto;
                margin-right: 0;
                max-width: 80%;
                box-shadow: 0 5px 20px var(--shadow-glow);
            }
            
            .chat-input-container {
                display: flex;
                gap: 12px;
            }
            
            .chat-input {
                flex: 1;
            }
            
            .send-btn {
                width: auto;
                padding: 16px 35px;
                border-radius: 12px;
            }
        `;
        document.head.appendChild(style);
    },

    // Load messages
    loadMessages() {
        const container = document.getElementById('chatMessages');
        if (!container) return;
        
        if (!APP_STATE.messages || APP_STATE.messages.length === 0) {
            APP_STATE.messages = [
                { 
                    sender: 'Sistema', 
                    content: 'Benvenuto nella chat del Consorzio Imprenditori!', 
                    time: new Date().toISOString(),
                    own: false
                }
            ];
        }
        
        container.innerHTML = APP_STATE.messages.map(m => `
            <div class="message ${m.own ? 'own' : ''}">
                ${!m.own ? `
                <div class="message-header">
                    <div class="message-avatar">${(m.sender || 'S')[0].toUpperCase()}</div>
                    <div class="message-sender">${m.sender || 'Sistema'}</div>
                    <div class="message-time">${Utils.formatTime(m.time)}</div>
                </div>
                ` : ''}
                <div class="message-content">${m.content}</div>
            </div>
        `).join('');
        
        container.scrollTop = container.scrollHeight;
    },

    // Send message
    sendMessage() {
        const input = document.getElementById('chatInput');
        if (!input || !input.value.trim()) return;
        
        const message = {
            sender: APP_STATE.currentUser.name,
            content: input.value.trim(),
            time: new Date().toISOString(),
            own: true
        };
        
        APP_STATE.messages.push(message);
        saveState();
        this.loadMessages();
        input.value = '';
        
        // Simulate response after 1 second
        setTimeout(() => {
            const responses = [
                'Messaggio ricevuto!',
                'Grazie per il tuo messaggio.',
                'Ti risponderemo al più presto.',
                'Interessante punto di vista!',
                'Prenderemo in considerazione la tua richiesta.'
            ];
            
            APP_STATE.messages.push({
                sender: 'Sistema',
                content: responses[Math.floor(Math.random() * responses.length)],
                time: new Date().toISOString(),
                own: false
            });
            saveState();
            this.loadMessages();
        }, 1000 + Math.random() * 2000);
    },

    // Check enter key
    checkEnter(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    },

    // Clear chat (admin only)
    clearChat() {
        if (APP_STATE.currentUser.type !== 'admin') {
            Utils.showToast('⛔ Solo gli admin possono cancellare la chat', 'error');
            return;
        }
        
        if (confirm('Cancellare tutti i messaggi?')) {
            APP_STATE.messages = [];
            saveState();
            this.loadMessages();
            Utils.showToast('✅ Chat cancellata', 'success');
        }
    },

    // Export chat (for backup)
    exportChat() {
        const dataStr = JSON.stringify(APP_STATE.messages, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `chat_backup_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        Utils.showToast('💾 Chat esportata!', 'success');
    }
};

// Make Chat globally available
window.Chat = Chat;