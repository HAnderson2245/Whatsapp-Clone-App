// UI.js - UI Controller
class UIManager {
    showAuthScreen() {
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('chat-app').style.display = 'none';
    }
    
    showChatApp() {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('chat-app').style.display = 'flex';
    }
    
    renderConversations(conversations) {
        const list = document.getElementById('conversations-list');
        list.innerHTML = conversations.map(conv => `
            <div class="conversation-item" data-id="${conv.id}">
                <div class="conversation-avatar">
                    <img src="${conv.groupAvatar || 'https://ui-avatars.com/api/?name=User'}" alt="Avatar">
                </div>
                <div class="conversation-info">
                    <div class="conversation-header">
                        <span class="conversation-name">${conv.groupName || 'Chat'}</span>
                        <span class="conversation-time">Now</span>
                    </div>
                    <p class="conversation-preview">${conv.lastMessage || 'Start chatting'}</p>
                </div>
            </div>
        `).join('');
    }
    
    renderMessages(messages) {
        const container = document.getElementById('messages-container');
        const currentUserId = auth.getCurrentUser().id;
        
        container.innerHTML = messages.map(msg => `
            <div class="message ${msg.senderId === currentUserId ? 'sent' : 'received'}">
                <div class="message-bubble">
                    <div class="message-content">${msg.content}</div>
                    <div class="message-footer">
                        <span class="message-time">${new Date(msg.timestamp).toLocaleTimeString()}</span>
                        ${msg.senderId === currentUserId ? '<span class="message-status"><i class="fas fa-check"></i></span>' : ''}
                    </div>
                </div>
            </div>
        `).join('');
        
        container.scrollTop = container.scrollHeight;
    }
    
    showNotification(message, type = 'info') {
        alert(message); // Simple notification for demo
    }
}
const ui = new UIManager();
