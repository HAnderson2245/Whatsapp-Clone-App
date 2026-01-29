// App.js - Application initialization
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 ChatApp Starting...');
    
    // Initialize database
    await db.init();
    
    // Check authentication
    if (auth.isAuthenticated()) {
        ui.showChatApp();
        const conversations = await db.getConversationsByUser(auth.getCurrentUser().id);
        ui.renderConversations(conversations);
    } else {
        ui.showAuthScreen();
    }
    
    // Auth event listeners
    document.getElementById('show-signup').addEventListener('click', () => {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
    });
    
    document.getElementById('show-login').addEventListener('click', () => {
        document.getElementById('signup-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    });
    
    document.getElementById('signup-btn').addEventListener('click', async () => {
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        
        try {
            await auth.register(username, email, password);
            ui.showChatApp();
            ui.showNotification('Welcome to ChatApp!');
        } catch (error) {
            ui.showNotification(error.message, 'error');
        }
    });
    
    document.getElementById('login-btn').addEventListener('click', async () => {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            await auth.login(email, password);
            ui.showChatApp();
            const conversations = await db.getConversationsByUser(auth.getCurrentUser().id);
            ui.renderConversations(conversations);
        } catch (error) {
            ui.showNotification(error.message, 'error');
        }
    });
    
    document.getElementById('logout-btn').addEventListener('click', () => {
        auth.logout();
        ui.showAuthScreen();
    });
    
    // Chat event listeners
    document.getElementById('send-btn').addEventListener('click', async () => {
        const input = document.getElementById('message-input');
        const content = input.value.trim();
        if (content && chat.activeConversation) {
            await chat.sendMessage(content);
            input.value = '';
            const messages = await chat.loadMessages(chat.activeConversation.id);
            ui.renderMessages(messages);
        }
    });
    
    // Broadcast listeners
    broadcast.on('NEW_MESSAGE', async (message) => {
        if (chat.activeConversation && message.conversationId === chat.activeConversation.id) {
            const messages = await chat.loadMessages(chat.activeConversation.id);
            ui.renderMessages(messages);
        }
    });
    
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
        document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    });
    
    console.log('✅ ChatApp Ready!');
});
