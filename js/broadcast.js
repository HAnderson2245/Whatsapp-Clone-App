/**
 * Broadcast.js - Real-time cross-tab communication using BroadcastChannel API
 */

class BroadcastManager {
    constructor() {
        this.channel = new BroadcastChannel('chat_channel');
        this.listeners = {};
        this.setupListeners();
    }

    setupListeners() {
        this.channel.onmessage = (event) => {
            const { type, data } = event.data;
            if (this.listeners[type]) {
                this.listeners[type].forEach(callback => callback(data));
            }
        };
    }

    on(eventType, callback) {
        if (!this.listeners[eventType]) {
            this.listeners[eventType] = [];
        }
        this.listeners[eventType].push(callback);
    }

    emit(eventType, data) {
        this.channel.postMessage({ type: eventType, data });
    }

    close() {
        this.channel.close();
    }
}

const broadcast = new BroadcastManager();
