/**
 * Seed.js - Dummy Data Generator
 * Creates sample users, conversations, and messages for demo purposes
 */

class SeedData {
    constructor() {
        this.dummyUsers = [
            {
                username: 'Sarah Johnson',
                email: 'sarah@example.com',
                password: 'password123',
                status: 'Available',
                avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=25d366&color=fff&size=128'
            },
            {
                username: 'Mike Chen',
                email: 'mike@example.com',
                password: 'password123',
                status: 'At work',
                avatar: 'https://ui-avatars.com/api/?name=Mike+Chen&background=34b7f1&color=fff&size=128'
            },
            {
                username: 'Emma Wilson',
                email: 'emma@example.com',
                password: 'password123',
                status: 'Hey there! I\'m using ChatApp',
                avatar: 'https://ui-avatars.com/api/?name=Emma+Wilson&background=e91e63&color=fff&size=128'
            },
            {
                username: 'David Brown',
                email: 'david@example.com',
                password: 'password123',
                status: 'Busy',
                avatar: 'https://ui-avatars.com/api/?name=David+Brown&background=9c27b0&color=fff&size=128'
            },
            {
                username: 'Lisa Anderson',
                email: 'lisa@example.com',
                password: 'password123',
                status: 'Online',
                avatar: 'https://ui-avatars.com/api/?name=Lisa+Anderson&background=f44336&color=fff&size=128'
            },
            {
                username: 'Tech Team',
                email: 'techteam@example.com',
                password: 'password123',
                status: 'Group chat',
                avatar: 'https://ui-avatars.com/api/?name=Tech+Team&background=ff9800&color=fff&size=128'
            }
        ];

        this.sampleMessages = [
            // Sarah messages
            [
                { content: 'Hey! How are you doing?', timeOffset: -3600000 },
                { content: 'I wanted to discuss the project we talked about yesterday', timeOffset: -3500000 },
                { content: 'Are you free for a quick call?', timeOffset: -3400000 }
            ],
            // Mike messages
            [
                { content: 'Good morning! ☀️', timeOffset: -7200000 },
                { content: 'Did you see the latest updates?', timeOffset: -7000000 },
                { content: 'Let me know when you\'re ready to review', timeOffset: -6800000 },
                { content: 'Thanks for your help! 🙏', timeOffset: -6600000 }
            ],
            // Emma messages
            [
                { content: 'Hi there! 👋', timeOffset: -86400000 },
                { content: 'I have some exciting news to share!', timeOffset: -86000000 },
                { content: 'Can we meet tomorrow?', timeOffset: -85000000 },
                { content: 'Looking forward to it! 😊', timeOffset: -84000000 }
            ],
            // David messages
            [
                { content: 'Hello!', timeOffset: -172800000 },
                { content: 'I need your opinion on something', timeOffset: -170000000 },
                { content: 'It\'s about the design mockups', timeOffset: -168000000 },
                { content: 'Let me send you the files', timeOffset: -165000000 }
            ],
            // Lisa messages
            [
                { content: 'Hey! 👋', timeOffset: -259200000 },
                { content: 'How was your weekend?', timeOffset: -255000000 },
                { content: 'Mine was great! Went hiking 🏔️', timeOffset: -250000000 },
                { content: 'You should join us next time!', timeOffset: -245000000 }
            ],
            // Group messages
            [
                { content: 'Welcome to the Tech Team group! 🎉', sender: 'Sarah', timeOffset: -604800000 },
                { content: 'Thanks for adding me!', sender: 'Mike', timeOffset: -600000000 },
                { content: 'Let\'s discuss the new features', sender: 'Emma', timeOffset: -590000000 },
                { content: 'I\'ve prepared a presentation', sender: 'David', timeOffset: -580000000 },
                { content: 'Great! When can we schedule a meeting?', sender: 'Lisa', timeOffset: -570000000 },
                { content: 'How about Friday at 2 PM?', sender: 'Sarah', timeOffset: -560000000 },
                { content: 'Works for me! ✅', sender: 'Mike', timeOffset: -555000000 },
                { content: 'Perfect! See you all then 👋', sender: 'Emma', timeOffset: -550000000 }
            ]
        ];
    }

    async seedDatabase(currentUserId) {
        try {
            // Check if already seeded
            const existingUsers = await db.getAllUsers();
            if (existingUsers.length > 1) { // More than just the current user
                console.log('Database already seeded');
                return;
            }

        console.log('🌱 Seeding database with dummy data...');

        // Create dummy users
        const createdUsers = [];
        for (const userData of this.dummyUsers) {
            try {
                const existingUser = await db.getUserByEmail(userData.email);
                if (!existingUser) {
                    const user = await db.createUser({
                        username: userData.username,
                        email: userData.email,
                        passwordHash: db.hashPassword(userData.password),
                        avatar: userData.avatar,
                        status: userData.status
                    });
                    createdUsers.push(user);
                } else {
                    createdUsers.push(existingUser);
                }
            } catch (error) {
                console.error('Error creating user:', error);
            }
        }

        // Create conversations and messages
        const conversations = [];
        
        for (let i = 0; i < createdUsers.length; i++) {
            const otherUser = createdUsers[i];
            const messages = this.sampleMessages[i] || [];
            
            // Create conversation
            const isGroup = i === 5;
            const participants = isGroup ? 
                [currentUserId, ...createdUsers.slice(0, 4).map(u => u.id)] : 
                [currentUserId, otherUser.id];
            
            const conversation = await db.createConversation({
                participants: participants,
                type: isGroup ? 'group' : 'direct',
                groupName: isGroup ? 'Tech Team' : null,
                groupAvatar: isGroup ? 'https://ui-avatars.com/api/?name=Tech+Team&background=ff9800&color=fff' : null,
                lastMessage: messages.length > 0 ? messages[messages.length - 1].content : 'Start chatting',
                lastMessageTime: Date.now() + (messages.length > 0 ? messages[messages.length - 1].timeOffset : 0)
            });

            conversations.push(conversation);

            // Create messages
            let lastMessageSender = null;
            for (let j = 0; j < messages.length; j++) {
                const msg = messages[j];
                const timestamp = Date.now() + msg.timeOffset;
                let senderId;
                
                if (msg.sender) {
                    // For group messages with specified sender
                    const senderUser = createdUsers.find(u => u.username === msg.sender);
                    senderId = senderUser ? senderUser.id : (j % 2 === 0 ? otherUser.id : currentUserId);
                } else {
                    // For direct messages, alternate senders
                    senderId = j % 2 === 0 ? otherUser.id : currentUserId;
                }
                
                lastMessageSender = senderId;
                
                await db.createMessage({
                    conversationId: conversation.id,
                    senderId: senderId,
                    content: msg.content,
                    type: 'text',
                    status: j % 2 === 0 ? 'read' : 'delivered',
                    timestamp: timestamp
                });
            }

            // Update conversation with last message
            if (messages.length > 0) {
                const unreadCount = lastMessageSender === currentUserId ? 0 : 1;
                await db.updateConversation(conversation.id, {
                    lastMessage: messages[messages.length - 1].content,
                    lastMessageTime: Date.now() + messages[messages.length - 1].timeOffset,
                    unreadCount: unreadCount
                });
            }
        }

        // Create group if it's a group conversation
        if (createdUsers.length >= 5) {
            await db.createGroup({
                name: 'Tech Team',
                avatar: 'https://ui-avatars.com/api/?name=Tech+Team&background=ff9800&color=fff',
                members: [currentUserId, ...createdUsers.slice(0, 4).map(u => u.id)],
                admin: currentUserId
            });
        }

        console.log('✅ Database seeded successfully!');
        return conversations;
        } catch (error) {
            console.error('Error seeding database:', error);
        }
    }
}

const seed = new SeedData();
