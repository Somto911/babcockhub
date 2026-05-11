const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { initDatabase, getUser, findUserByEmail, createUser, getChats, addMessage, sanitizeUser } = require('./database');

const app = express();
const server = http.createServer(app);
const cors = require('cors');
app.use(cors());

const io = new Server(server, {
  cors: { origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true },
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// SPA fallback — serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return;
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

let dbReady = false;

// Initialize database and wait for it to complete
initDatabase().then(() => {
  console.log('✓ Database initialized successfully');
  dbReady = true;
}).catch(err => {
  console.error('✗ Failed to initialize database:', err);
});

function isValidStudentEmail(email) {
  return typeof email === 'string' && email.trim().toLowerCase().endsWith('@student.babcock.edu.ng');
}

app.use((req, res, next) => {
  if (!dbReady && req.path.startsWith('/api')) {
    return res.status(503).json({ message: 'Database not ready yet. Try again in a moment.' });
  }
  next();
});

app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('[LOGIN] Attempt:', email);
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Provide email and password.' });
    }
    
    const normalized = email.trim().toLowerCase();
    getUser(normalized, password, (err, user) => {
      if (err) {
        console.error('[LOGIN] Database error:', err);
        return res.status(500).json({ message: 'Database error: ' + err.message });
      }
      if (!user) {
        console.log('[LOGIN] No user found for:', normalized);
        return res.status(401).json({ message: 'Invalid credentials. Register first or check your password.' });
      }
      console.log('[LOGIN] Success:', user.name);
      return res.json({ user: sanitizeUser(user) });
    });
  } catch (error) {
    console.error('[LOGIN] Unexpected error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

app.post('/api/register', (req, res) => {
  try {
    const { name, email, dept, lvl, hostel, password } = req.body;
    console.log('[REGISTER] Attempt:', email);
    
    if (!name || !email || !dept || !lvl || !password) {
      return res.status(400).json({ message: 'Fill in all required fields.' });
    }
    
    const normalized = email.trim().toLowerCase();
    if (!isValidStudentEmail(normalized)) {
      return res.status(400).json({ message: 'Only @student.babcock.edu.ng emails are allowed.' });
    }
    
    findUserByEmail(normalized, (err, existingUser) => {
      if (err) {
        console.error('[REGISTER] Database error checking existing user:', err);
        return res.status(500).json({ message: 'Database error: ' + err.message });
      }
      if (existingUser) {
        console.log('[REGISTER] Email already exists:', normalized);
        return res.status(400).json({ message: 'Email already registered. Please log in.' });
      }
      
      createUser(name, normalized, dept, lvl, hostel || 'Off Campus', password, (err, newUser) => {
        if (err) {
          console.error('[REGISTER] Failed to create user:', err);
          return res.status(500).json({ message: 'Failed to create user: ' + err.message });
        }
        console.log('[REGISTER] Success:', newUser.name);
        return res.status(201).json({ user: sanitizeUser(newUser) });
      });
    });
  } catch (error) {
    console.error('[REGISTER] Unexpected error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

app.get('/api/chats', (req, res) => {
  try {
    getChats((err, chats) => {
      if (err) {
        console.error('[CHATS] Failed to load:', err);
        return res.status(500).json({ message: 'Failed to load chats: ' + err.message });
      }
      console.log('[CHATS] Loaded', chats.length, 'chats');
      return res.json({ chats });
    });
  } catch (error) {
    console.error('[CHATS] Unexpected error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

io.on('connection', (socket) => {
  console.log('[SOCKET] Connected:', socket.id);
  let connectedUser = null;

  socket.on('join', (payload) => {
    connectedUser = payload;
    socket.join(`user-${payload.id}`);
    console.log('[SOCKET] User joined:', payload.name);
  });

  socket.on('chat:join', ({ chatId }) => {
    getChats((err, chats) => {
      if (err) return;
      const chat = chats.find((item) => item.id === chatId);
      if (!chat) return;
      socket.join(`chat-${chatId}`);
      console.log('[SOCKET] Joined chat:', chatId);
    });
  });

  socket.on('chat:message', ({ chatId, msg }) => {
    getChats((err, chats) => {
      if (err) {
        return socket.emit('chat:error', { message: 'Failed to find chat.' });
      }
      
      const chat = chats.find((item) => item.id === chatId);
      if (!chat) {
        return socket.emit('chat:error', { message: 'Chat not found.' });
      }
      if (!connectedUser) {
        return socket.emit('chat:error', { message: 'You must join before sending messages.' });
      }

      addMessage(chatId, connectedUser.id, connectedUser.name, msg.txt, (err, savedMsg) => {
        if (err) {
          console.error('[SOCKET] Failed to save message:', err);
          return socket.emit('chat:error', { message: 'Failed to save message.' });
        }

        const message = {
          senderId: connectedUser.id,
          senderName: connectedUser.name,
          txt: msg.txt,
          t: savedMsg.t,
        };

        console.log('[SOCKET] Message sent to chat', chatId, 'by', connectedUser.name);
        socket.to(`chat-${chatId}`).emit('chat:message', { chatId, msg: message });
      });
    });
  });

  socket.on('disconnect', () => {
    console.log('[SOCKET] Disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n=== BabcockHub Server ===`);
  console.log(`Running at http://localhost:${PORT}`);
  console.log(`========================\n`);
});


