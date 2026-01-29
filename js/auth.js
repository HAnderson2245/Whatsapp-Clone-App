/**
 * Auth.js - Authentication logic
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.loadSession();
    }

    async register(username, email, password) {
        try {
            const existing = await db.getUserByEmail(email);
            if (existing) {
                throw new Error('Email already registered');
            }

            const user = await db.createUser({
                username,
                email,
                passwordHash: db.hashPassword(password),
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=25d366&color=fff`,
                status: 'Hey there! I am using ChatApp'
            });

            this.currentUser = user;
            this.saveSession(user);
            return user;
        } catch (error) {
            throw error;
        }
    }

    async login(email, password) {
        try {
            const user = await db.getUserByEmail(email);
            if (!user) {
                throw new Error('User not found');
            }

            if (!db.verifyPassword(password, user.passwordHash)) {
                throw new Error('Invalid password');
            }

            this.currentUser = user;
            this.saveSession(user);
            await db.updateUser(user.id, { lastSeen: Date.now() });
            return user;
        } catch (error) {
            throw error;
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('chatapp_session');
        broadcast.emit('USER_OFFLINE', { userId: this.currentUser?.id });
    }

    saveSession(user) {
        localStorage.setItem('chatapp_session', JSON.stringify({
            userId: user.id,
            timestamp: Date.now()
        }));
    }

    loadSession() {
        const session = localStorage.getItem('chatapp_session');
        if (session) {
            const { userId } = JSON.parse(session);
            db.getUserById(userId).then(user => {
                if (user) {
                    this.currentUser = user;
                }
            });
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }
}

const auth = new AuthManager();
