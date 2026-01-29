/**
 * Database.js - IndexedDB Operations
 * Handles all database operations for the chat application
 */

class Database {
    constructor() {
        this.dbName = 'ChatAppDB';
        this.version = 1;
        this.db = null;
    }

    /**
     * Initialize the database
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ Database initialized');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Users store
                if (!db.objectStoreNames.contains('users')) {
                    const userStore = db.createObjectStore('users', { keyPath: 'id' });
                    userStore.createIndex('email', 'email', { unique: true });
                    userStore.createIndex('username', 'username', { unique: false });
                }

                // Messages store
                if (!db.objectStoreNames.contains('messages')) {
                    const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
                    messageStore.createIndex('conversationId', 'conversationId', { unique: false });
                    messageStore.createIndex('senderId', 'senderId', { unique: false });
                    messageStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                // Conversations store
                if (!db.objectStoreNames.contains('conversations')) {
                    const convStore = db.createObjectStore('conversations', { keyPath: 'id' });
                    convStore.createIndex('participants', 'participants', { unique: false, multiEntry: true });
                    convStore.createIndex('lastMessageTime', 'lastMessageTime', { unique: false });
                }

                // Groups store
                if (!db.objectStoreNames.contains('groups')) {
                    const groupStore = db.createObjectStore('groups', { keyPath: 'id' });
                    groupStore.createIndex('members', 'members', { unique: false, multiEntry: true });
                }

                console.log('✅ Database schema created');
            };
        });
    }

    // User operations
    async createUser(userData) {
        const transaction = this.db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        
        const user = {
            id: this.generateId(),
            ...userData,
            createdAt: Date.now(),
            lastSeen: Date.now()
        };
        
        return new Promise((resolve, reject) => {
            const request = store.add(user);
            request.onsuccess = () => resolve(user);
            request.onerror = () => reject(request.error);
        });
    }

    async getUserByEmail(email) {
        const transaction = this.db.transaction(['users'], 'readonly');
        const store = transaction.objectStore('users');
        const index = store.index('email');
        
        return new Promise((resolve, reject) => {
            const request = index.get(email);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getUserById(id) {
        const transaction = this.db.transaction(['users'], 'readonly');
        const store = transaction.objectStore('users');
        
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllUsers() {
        const transaction = this.db.transaction(['users'], 'readonly');
        const store = transaction.objectStore('users');
        
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateUser(id, updates) {
        const user = await this.getUserById(id);
        if (!user) throw new Error('User not found');
        
        const updatedUser = { ...user, ...updates };
        const transaction = this.db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        
        return new Promise((resolve, reject) => {
            const request = store.put(updatedUser);
            request.onsuccess = () => resolve(updatedUser);
            request.onerror = () => reject(request.error);
        });
    }

    // Message operations
    async createMessage(messageData) {
        const transaction = this.db.transaction(['messages'], 'readwrite');
        const store = transaction.objectStore('messages');
        
        const message = {
            id: this.generateId(),
            ...messageData,
            timestamp: Date.now(),
            status: 'sent',
            edited: false,
            deleted: false,
            deletedForEveryone: false,
            starred: false
        };
        
        return new Promise((resolve, reject) => {
            const request = store.add(message);
            request.onsuccess = () => resolve(message);
            request.onerror = () => reject(request.error);
        });
    }

    async getMessagesByConversation(conversationId, limit = 50) {
        const transaction = this.db.transaction(['messages'], 'readonly');
        const store = transaction.objectStore('messages');
        const index = store.index('conversationId');
        
        return new Promise((resolve, reject) => {
            const request = index.getAll(conversationId);
            request.onsuccess = () => {
                const messages = request.result
                    .filter(m => !m.deleted)
                    .sort((a, b) => a.timestamp - b.timestamp)
                    .slice(-limit);
                resolve(messages);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async updateMessage(id, updates) {
        const transaction = this.db.transaction(['messages'], 'readwrite');
        const store = transaction.objectStore('messages');
        
        return new Promise((resolve, reject) => {
            const getRequest = store.get(id);
            getRequest.onsuccess = () => {
                const message = { ...getRequest.result, ...updates };
                const putRequest = store.put(message);
                putRequest.onsuccess = () => resolve(message);
                putRequest.onerror = () => reject(putRequest.error);
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    async deleteMessage(id, forEveryone = false) {
        if (forEveryone) {
            return this.updateMessage(id, { deletedForEveryone: true });
        } else {
            return this.updateMessage(id, { deleted: true });
        }
    }

    // Conversation operations
    async createConversation(conversationData) {
        const transaction = this.db.transaction(['conversations'], 'readwrite');
        const store = transaction.objectStore('conversations');
        
        const conversation = {
            id: this.generateId(),
            ...conversationData,
            lastMessageTime: Date.now(),
            unreadCount: 0
        };
        
        return new Promise((resolve, reject) => {
            const request = store.add(conversation);
            request.onsuccess = () => resolve(conversation);
            request.onerror = () => reject(request.error);
        });
    }

    async getConversationsByUser(userId) {
        const transaction = this.db.transaction(['conversations'], 'readonly');
        const store = transaction.objectStore('conversations');
        const index = store.index('participants');
        
        return new Promise((resolve, reject) => {
            const request = index.getAll(userId);
            request.onsuccess = () => {
                const conversations = request.result.sort((a, b) => 
                    b.lastMessageTime - a.lastMessageTime
                );
                resolve(conversations);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async updateConversation(id, updates) {
        const transaction = this.db.transaction(['conversations'], 'readwrite');
        const store = transaction.objectStore('conversations');
        
        return new Promise((resolve, reject) => {
            const getRequest = store.get(id);
            getRequest.onsuccess = () => {
                const conversation = { ...getRequest.result, ...updates };
                const putRequest = store.put(conversation);
                putRequest.onsuccess = () => resolve(conversation);
                putRequest.onerror = () => reject(putRequest.error);
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    // Group operations
    async createGroup(groupData) {
        const transaction = this.db.transaction(['groups'], 'readwrite');
        const store = transaction.objectStore('groups');
        
        const group = {
            id: this.generateId(),
            ...groupData,
            createdAt: Date.now()
        };
        
        return new Promise((resolve, reject) => {
            const request = store.add(group);
            request.onsuccess = () => resolve(group);
            request.onerror = () => reject(request.error);
        });
    }

    async getGroupsByUser(userId) {
        const transaction = this.db.transaction(['groups'], 'readonly');
        const store = transaction.objectStore('groups');
        const index = store.index('members');
        
        return new Promise((resolve, reject) => {
            const request = index.getAll(userId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Utility functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    hashPassword(password) {
        // Simple hash for demo - use bcrypt in production
        return btoa(password + 'salt');
    }

    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    }
}

// Create global instance
const db = new Database();
