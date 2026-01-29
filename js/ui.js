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
    
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (seconds < 60) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    formatMessageTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const isYesterday = date.toDateString() === new Date(now - 86400000).toDateString();
        
        if (isToday) {
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        } else if (isYesterday) {
            return `Yesterday ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + 
                   date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        }
    }
    
    formatDateSeparator(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const isYesterday = date.toDateString() === new Date(now - 86400000).toDateString();
        
        if (isToday) return 'Today';
        if (isYesterday) return 'Yesterday';
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
    }
    
    async renderConversations(conversations) {
        const list = document.getElementById('conversations-list');
        const currentUserId = auth.getCurrentUser().id;
        
        if (!conversations || conversations.length === 0) {
            list.innerHTML = '<div class="empty-conversations"><p>No conversations yet. Start a new chat!</p></div>';
            return;
        }
        
        const conversationsHTML = await Promise.all(conversations.map(async (conv) => {
            // Get other participant info for direct chats
            let conversationName = conv.groupName || 'Chat';
            let conversationAvatar = conv.groupAvatar || 'https://ui-avatars.com/api/?name=User';
            let isOnline = false;
            
            if (conv.type === 'direct') {
                const otherParticipantId = conv.participants.find(id => id !== currentUserId);
                if (otherParticipantId) {
                    const otherUser = await db.getUserById(otherParticipantId);
                    if (otherUser) {
                        conversationName = otherUser.username;
                        conversationAvatar = otherUser.avatar || conversationAvatar;
                        isOnline = chat.onlineUsers.has(otherParticipantId);
                    }
                }
            }
            
            const unreadBadge = conv.unreadCount > 0 ? 
                `<span class="unread-badge">${conv.unreadCount > 9 ? '9+' : conv.unreadCount}</span>` : '';
            
            const onlineIndicator = isOnline ? '<span class="online-dot"></span>' : '';
            
            return `
                <div class="conversation-item" data-id="${conv.id}">
                    <div class="conversation-avatar">
                        <img src="${conversationAvatar}" alt="${conversationName}">
                        ${onlineIndicator}
                    </div>
                    <div class="conversation-info">
                        <div class="conversation-header">
                            <span class="conversation-name">${conversationName}</span>
                            <span class="conversation-time">${this.formatTime(conv.lastMessageTime || Date.now())}</span>
                        </div>
                        <div class="conversation-footer">
                            <p class="conversation-preview">${conv.lastMessage || 'Start chatting'}</p>
                            ${unreadBadge}
                        </div>
                    </div>
                </div>
            `;
        }));
        
        list.innerHTML = conversationsHTML.join('');
    }
    
    async renderMessages(messages, conversationId) {
        const container = document.getElementById('messages-container');
        const currentUserId = auth.getCurrentUser().id;
        
        if (!messages || messages.length === 0) {
            container.innerHTML = '<div class="empty-messages"><p>No messages yet. Start the conversation!</p></div>';
            return;
        }
        
        let html = '';
        let lastDate = null;
        
        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            const msgDate = new Date(msg.timestamp);
            const currentDate = msgDate.toDateString();
            
            // Add date separator if needed
            if (lastDate !== currentDate) {
                html += `<div class="date-separator">
                    <span>${this.formatDateSeparator(msg.timestamp)}</span>
                </div>`;
                lastDate = currentDate;
            }
            
            const isSent = msg.senderId === currentUserId;
            const senderName = isSent ? 'You' : (await db.getUserById(msg.senderId))?.username || 'Unknown';
            
            // Get status icon
            let statusIcon = '';
            if (isSent) {
                if (msg.status === 'read') {
                    statusIcon = '<i class="fas fa-check-double read"></i>';
                } else if (msg.status === 'delivered') {
                    statusIcon = '<i class="fas fa-check-double"></i>';
                } else {
                    statusIcon = '<i class="fas fa-check"></i>';
                }
            }
            
            // Check if next message is from same sender (for grouping)
            const nextMsg = messages[i + 1];
            const isGrouped = nextMsg && 
                            nextMsg.senderId === msg.senderId && 
                            (new Date(nextMsg.timestamp) - msgDate) < 300000; // 5 minutes
            
            html += `
                <div class="message-wrapper ${isSent ? 'sent' : 'received'} ${isGrouped ? 'grouped' : ''}">
                    ${!isSent && !isGrouped ? `
                        <div class="message-sender-info">
                            <span class="sender-name">${senderName}</span>
                        </div>
                    ` : ''}
                    <div class="message ${isSent ? 'sent' : 'received'}">
                        <div class="message-bubble">
                            ${msg.replyTo ? `
                                <div class="message-reply">
                                    <div class="reply-line"></div>
                                    <div class="reply-content">
                                        <span class="reply-sender">${msg.replyToSender || 'User'}</span>
                                        <span class="reply-text">${msg.replyToContent || ''}</span>
                                    </div>
                                </div>
                            ` : ''}
                            ${msg.type === 'image' && msg.mediaUrl ? `
                                <div class="message-image">
                                    <img src="${msg.mediaUrl}" alt="Shared image">
                                </div>
                            ` : ''}
                            ${msg.type === 'audio' && msg.mediaUrl ? `
                                <div class="message-audio">
                                    <audio controls src="${msg.mediaUrl}"></audio>
                                </div>
                            ` : ''}
                            ${msg.type === 'file' && msg.mediaUrl ? `
                                <div class="message-file">
                                    <i class="fas fa-file"></i>
                                    <span>File attachment</span>
                                </div>
                            ` : ''}
                            <div class="message-content">${this.escapeHtml(msg.content)}</div>
                            ${msg.edited ? '<span class="edited-label">edited</span>' : ''}
                            <div class="message-footer">
                                <span class="message-time">${this.formatMessageTime(msg.timestamp)}</span>
                                ${statusIcon ? `<span class="message-status">${statusIcon}</span>` : ''}
                                ${msg.starred ? '<i class="fas fa-star starred"></i>' : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html;
        container.scrollTop = container.scrollHeight;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    async updateChatHeader(conversation) {
        const currentUserId = auth.getCurrentUser().id;
        let chatName = conversation.groupName || 'Chat';
        let chatAvatar = conversation.groupAvatar || 'https://ui-avatars.com/api/?name=User';
        let chatStatus = '';
        
        if (conversation.type === 'direct') {
            const otherParticipantId = conversation.participants.find(id => id !== currentUserId);
            if (otherParticipantId) {
                const otherUser = await db.getUserById(otherParticipantId);
                if (otherUser) {
                    chatName = otherUser.username;
                    chatAvatar = otherUser.avatar || chatAvatar;
                    const isOnline = chat.onlineUsers.has(otherParticipantId);
                    chatStatus = isOnline ? 'online' : this.formatTime(otherUser.lastSeen || Date.now());
                }
            }
        } else {
            chatStatus = `${conversation.participants.length} participants`;
        }
        
        document.getElementById('chat-name').textContent = chatName;
        document.getElementById('chat-avatar').src = chatAvatar;
        document.getElementById('chat-status').textContent = chatStatus;
    }
    
    showNotification(message, type = 'info') {
        // Create a better notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}
const ui = new UIManager();
