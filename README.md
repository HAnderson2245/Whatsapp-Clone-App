# ChatApp - Real-Time Messaging Application

A fully functional, real-time messaging application built with vanilla JavaScript, IndexedDB, and the BroadcastChannel API. No backend server required!

![ChatApp](https://img.shields.io/badge/version-1.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Features

### Core Functionality
- ✅ **User Authentication** - Register, login, and logout
- ✅ **Real-Time Messaging** - Instant message sync across browser tabs
- ✅ **One-on-One Chat** - Private conversations
- ✅ **Group Chat** - Create and manage group conversations
- ✅ **Message Status** - Sent (✓), Delivered (✓✓), Read (blue ✓✓)
- ✅ **Typing Indicators** - See when someone is typing
- ✅ **Online/Offline Status** - Real-time presence tracking

### Rich Media Support
- 📷 **Image Sharing** - Upload and view images
- 📎 **File Attachments** - Send any file type
- 🎤 **Voice Messages** - Record and play audio messages
- 🎵 **Audio Playback** - Built-in audio player

### Advanced Features
- ✏️ **Edit Messages** - Modify sent messages
- 🗑️ **Delete Messages** - Delete for yourself or everyone
- ↩️ **Reply to Messages** - Quote and reply
- ⭐ **Star Messages** - Bookmark important messages
- 🔍 **Search** - Find messages and conversations
- 😊 **Emoji Picker** - 150+ emojis
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📱 **Responsive Design** - Works on mobile and desktop

## 🚀 Quick Start

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/chatapp.git
   cd chatapp
   ```

2. **Open in browser**
   - Simply open `index.html` in your web browser
   - Or use a local server:
   ```bash
   # Python
   python -m http.server 8000
   
   # Node.js
   npx serve .
   
   # PHP
   php -S localhost:8000
   ```

3. **Access the app**
   - Navigate to `http://localhost:8000`

### Testing the App

1. **Open first tab**
   - Create user: `Alice / alice@test.com / test123`

2. **Open second tab** (Ctrl+T / Cmd+T)
   - Create user: `Bob / bob@test.com / test123`

3. **Start messaging**
   - In Alice's tab: Click "+" → Select "Bob" → Send a message
   - Watch Bob's tab receive the message instantly!

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Vanilla JavaScript (ES6+)
- **Storage**: IndexedDB for persistent data
- **Real-Time Sync**: BroadcastChannel API
- **Styling**: Pure CSS3 with CSS Variables
- **Icons**: Font Awesome 6.4.0

### Project Structure
```
chatapp/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # All styles
├── js/
│   ├── database.js         # IndexedDB operations
│   ├── broadcast.js        # BroadcastChannel sync
│   ├── auth.js             # Authentication logic
│   ├── chat.js             # Chat functionality
│   ├── ui.js               # UI controller
│   └── app.js              # Application initialization
├── README.md               # This file
├── LICENSE                 # MIT License
└── .gitignore              # Git ignore rules
```

### Database Schema

**Users Table**
```javascript
{
  id: string,
  username: string,
  email: string,
  passwordHash: string,
  avatar: string (base64),
  status: string,
  lastSeen: timestamp,
  createdAt: timestamp
}
```

**Messages Table**
```javascript
{
  id: string,
  conversationId: string,
  senderId: string,
  content: string,
  type: 'text'|'image'|'file'|'audio',
  mediaUrl: string,
  status: 'sent'|'delivered'|'read',
  replyTo: string,
  starred: boolean,
  edited: boolean,
  deleted: boolean,
  deletedForEveryone: boolean,
  timestamp: timestamp
}
```

**Conversations Table**
```javascript
{
  id: string,
  participants: string[],
  lastMessage: string,
  lastMessageTime: timestamp,
  unreadCount: number,
  type: 'direct'|'group',
  groupName: string,
  groupAvatar: string
}
```

**Groups Table**
```javascript
{
  id: string,
  name: string,
  avatar: string,
  members: string[],
  admin: string,
  createdAt: timestamp
}
```

## 🔧 Key Features Explained

### Real-Time Synchronization
Uses the **BroadcastChannel API** to sync messages across browser tabs without a backend:
```javascript
const channel = new BroadcastChannel('chat_channel');
channel.postMessage({ type: 'NEW_MESSAGE', data: message });
```

### Message Status Tracking
- **Sent** (✓): Message saved to database
- **Delivered** (✓✓): Recipient's tab received the message
- **Read** (blue ✓✓): Recipient viewed the message

### Voice Recording
Uses the **MediaRecorder API** to record audio directly in the browser:
```javascript
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const mediaRecorder = new MediaRecorder(stream);
    // Record audio...
  });
```

### File Handling
Images and files are converted to Base64 and stored in IndexedDB:
```javascript
const reader = new FileReader();
reader.onload = (e) => {
  const base64 = e.target.result;
  // Store in database
};
reader.readAsDataURL(file);
```

## 🎨 Customization

### Change Colors
Edit `css/styles.css`:
```css
:root {
    --primary-color: #25d366;  /* Main green color */
    --primary-dark: #128c7e;   /* Dark green */
    --secondary-color: #34b7f1; /* Blue accent */
    /* ... more variables */
}
```

### Add New Features
1. **Database**: Add new methods in `js/database.js`
2. **Logic**: Implement in `js/chat.js`
3. **UI**: Update `js/ui.js`
4. **Sync**: Broadcast events in `js/broadcast.js`

## 📱 Responsive Design

The app is fully responsive and works on:
- 📱 **Mobile** (< 768px): Single-column layout with slide transitions
- 💻 **Tablet** (768px - 1199px): Two-column layout
- 🖥️ **Desktop** (> 1200px): Full two-column layout

## 🔐 Security Notes

⚠️ **Important**: This is a demonstration application running entirely in the browser.

- Passwords are hashed with Base64 (for demo only - use bcrypt in production)
- Data is stored locally in IndexedDB
- No server-side validation
- Messages are not end-to-end encrypted

**For production use**, implement:
- Real backend server (Node.js, Python, etc.)
- Proper password hashing (bcrypt, Argon2)
- JWT authentication
- Database (PostgreSQL, MongoDB)
- End-to-end encryption
- Input sanitization
- Rate limiting

## 🌐 Browser Support

- ✅ Chrome 87+
- ✅ Firefox 83+
- ✅ Safari 15.4+
- ✅ Edge 87+

**Required APIs:**
- IndexedDB
- BroadcastChannel
- MediaRecorder (for voice messages)
- FileReader

## 🚀 Deployment

### GitHub Pages
```bash
git push origin main
# Enable GitHub Pages in repository settings
```

### Netlify
```bash
netlify deploy --prod
```

### Vercel
```bash
vercel --prod
```

### Any Static Host
Simply upload all files to your hosting provider.

## 🐛 Known Limitations

1. **Browser-Only**: Data stored locally, not synced across devices
2. **Single Machine**: Real-time sync only works across tabs on the same computer
3. **No Persistence**: Data may be cleared if browser storage is reset
4. **File Size**: Large files may hit IndexedDB limits (~50MB per domain)
5. **No Backup**: Data is not backed up to a server

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- Inspired by modern messaging applications
- Icons by [Font Awesome](https://fontawesome.com)
- Built with modern web APIs

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: your.email@example.com

## 🎯 Roadmap

- [ ] Video call support
- [ ] Screen sharing
- [ ] Message reactions with multiple emojis
- [ ] Voice call functionality
- [ ] End-to-end encryption
- [ ] Cloud backup
- [ ] Desktop app (Electron)
- [ ] Mobile app (React Native)

---

**Made with ❤️ using Vanilla JavaScript**

**No backend • No frameworks • Just modern browser APIs**
