// Chat.js - Core chat functionality
class ChatManager {
    constructor() {
        this.activeConversation = null;
        this.conversations = [];
        this.onlineUsers = new Set();
    }
    
    async sendMessage(content, type = 'text', mediaUrl = null) {
        if (!this.activeConversation) return;
        
        const message = await db.createMessage({
            conversationId: this.activeConversation.id,
            senderId: auth.getCurrentUser().id,
            content,
            type,
            mediaUrl
        });
        
        broadcast.emit('NEW_MESSAGE', message);
        await db.updateConversation(this.activeConversation.id, {
            lastMessage: content,
            lastMessageTime: Date.now()
        });
        
        return message;
    }
    
    async loadMessages(conversationId) {
        return await db.getMessagesByConversation(conversationId);
    }
    
    async createConversation(participantIds, type = 'direct', groupName = null) {
        return await db.createConversation({
            participants: participantIds,
            type,
            groupName,
            groupAvatar: groupName ? `https://ui-avatars.com/api/?name=${encodeURIComponent(groupName)}&background=random` : null
        });
    }
    
    setActiveConversation(conversation) {
        this.activeConversation = conversation;
    }
}
const chat = new ChatManager();
