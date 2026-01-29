// App.js - Application initialization
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 ChatApp Starting...');
    
    // Initialize database
    await db.init();
    
    // Check authentication
    if (auth.isAuthenticated()) {
        ui.showChatApp();
        // Load seed data if needed
        await seed.seedDatabase(auth.getCurrentUser().id);
        const conversations = await db.getConversationsByUser(auth.getCurrentUser().id);
        await ui.renderConversations(conversations);
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
            // Load seed data for new users
            await seed.seedDatabase(auth.getCurrentUser().id);
            const conversations = await db.getConversationsByUser(auth.getCurrentUser().id);
            await ui.renderConversations(conversations);
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
            // Load seed data if needed
            await seed.seedDatabase(auth.getCurrentUser().id);
            const conversations = await db.getConversationsByUser(auth.getCurrentUser().id);
            await ui.renderConversations(conversations);
        } catch (error) {
            ui.showNotification(error.message, 'error');
        }
    });
    
    document.getElementById('logout-btn').addEventListener('click', () => {
        auth.logout();
        ui.showAuthScreen();
    });
    
    // Conversation click handlers
    document.addEventListener('click', async (e) => {
        const conversationItem = e.target.closest('.conversation-item');
        if (conversationItem) {
            const conversationId = conversationItem.dataset.id;
            const conversation = (await db.getConversationsByUser(auth.getCurrentUser().id))
                .find(c => c.id === conversationId);
            
            if (conversation) {
                chat.setActiveConversation(conversation);
                await ui.updateChatHeader(conversation);
                document.getElementById('empty-state').style.display = 'none';
                document.getElementById('chat-container').style.display = 'flex';
                
                const messages = await chat.loadMessages(conversationId);
                await ui.renderMessages(messages, conversationId);
                
                // Mark as read
                await db.updateConversation(conversationId, { unreadCount: 0 });
                const conversations = await db.getConversationsByUser(auth.getCurrentUser().id);
                await ui.renderConversations(conversations);
            }
        }
    });
    
    // Chat event listeners
    document.getElementById('send-btn').addEventListener('click', async () => {
        const input = document.getElementById('message-input');
        const content = input.value.trim();
        if (content && chat.activeConversation) {
            await chat.sendMessage(content);
            input.value = '';
            const messages = await chat.loadMessages(chat.activeConversation.id);
            await ui.renderMessages(messages, chat.activeConversation.id);
            const conversations = await db.getConversationsByUser(auth.getCurrentUser().id);
            await ui.renderConversations(conversations);
        }
    });
    
    // Enter key to send
    document.getElementById('message-input').addEventListener('keypress', async (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            document.getElementById('send-btn').click();
        }
    });
    
    // Show/hide send button based on input
    document.getElementById('message-input').addEventListener('input', (e) => {
        const sendBtn = document.getElementById('send-btn');
        const voiceBtn = document.getElementById('voice-btn');
        if (e.target.value.trim()) {
            sendBtn.style.display = 'block';
            voiceBtn.style.display = 'none';
        } else {
            sendBtn.style.display = 'none';
            voiceBtn.style.display = 'block';
        }
    });
    
    // Broadcast listeners
    broadcast.on('NEW_MESSAGE', async (message) => {
        if (chat.activeConversation && message.conversationId === chat.activeConversation.id) {
            const messages = await chat.loadMessages(chat.activeConversation.id);
            await ui.renderMessages(messages, chat.activeConversation.id);
        }
        // Update conversations list
        const conversations = await db.getConversationsByUser(auth.getCurrentUser().id);
        await ui.renderConversations(conversations);
    });
    
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
        document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    });
    
    console.log('✅ ChatApp Ready!');
});
