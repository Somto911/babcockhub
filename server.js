const express = require('express');
const http = require('http');
const path = require('path');
const crypto = require('crypto');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const { Server } = require('socket.io');
const sgMail = require('@sendgrid/mail');
const { initDatabase, getUser, findUserByEmail, findUserByToken, findUserByName, verifyUser, createUser, getChats, addMessage, getPosts, createPost, toggleLike, getActivePostCount, getComments, addComment, deleteComment, sanitizeUser, toggleFollow, getFollowCounts, isFollowing } = require('./database');
const BASE_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`;

// Email transporter (SendGrid API via HTTPS - always works on Render)
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('[EMAIL] SendGrid configured');
}

const app = express();
const server = http.createServer(app);
const cors = require('cors');
app.use(cors());

const io = new Server(server, {
  cors: { origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true },
});

function sendVerificationEmail(email, name, token) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('[EMAIL] SENDGRID_API_KEY not set. Verification link:', `${BASE_URL}/api/verify?token=${token}`);
    return Promise.reject(new Error('SendGrid not configured'));
  }
  const link = `${BASE_URL}/api/verify?token=${token}`;
  const fromEmail = process.env.FROM_EMAIL || 'noreply@babcockhub.com';
  const msg = {
    from: `"BuSocial" <${fromEmail}>`,
    to: email,
    subject: 'Verify your BuSocial account',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0f1629;color:#d4dae8;border-radius:12px;padding:32px">
        <div style="text-align:center;margin-bottom:24px">
          <div style="width:48px;height:48px;background:linear-gradient(135deg,#4f7fff,#818cf8);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:#fff">Bu</div>
          <h1 style="color:#eef0f8;font-size:20px;margin:12px 0 0">Welcome to BuSocial, ${name}!</h1>
        </div>
        <p style="color:#d4dae8;font-size:14px;line-height:1.6">You're one step away from joining the Babcock campus community. Click below to verify your email:</p>
        <div style="text-align:center;margin:24px 0">
          <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#4f7fff,#818cf8);color:#fff;text-decoration:none;padding:12px 32px;border-radius:10px;font-weight:700;font-size:15px">Verify Email →</a>
        </div>
        <p style="color:#7d88a8;font-size:12px">Or copy this link into your browser:<br><span style="color:#4f7fff">${link}</span></p>
        <p style="color:#7d88a8;font-size:12px;margin-top:20px;border-top:1px solid rgba(100,130,200,.1);padding-top:12px">This link expires in 24 hours. If you didn't create this account, ignore this email.</p>
      </div>
    `,
  };
  return sgMail.send(msg);
}

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
      if (!user.verified && normalized !== 'somto@student.babcock.edu.ng') {
        console.log('[LOGIN] Unverified user:', normalized);
        return res.status(403).json({ message: 'Please verify your email before logging in. Check your inbox.', needsVerification: true });
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
        console.log('[REGISTER] Success:', newUser.name, '- sending verification email');
        // Send verification email (don't block on failure)
        sendVerificationEmail(normalized, newUser.name, newUser.verificationToken).then(() => {
          console.log('[REGISTER] ✓ Verification email sent to:', normalized);
        }).catch((emailErr) => {
          if (emailErr.response && emailErr.response.body) {
            console.log('[REGISTER] ✗ SendGrid error:', JSON.stringify(emailErr.response.body.errors));
          } else {
            console.log('[REGISTER] ✗ Email send failed:', emailErr.message);
          }
          console.log('[REGISTER]   To fix: add SENDGRID_API_KEY env var on Render');
        });
        const vLink = `${BASE_URL}/api/verify?token=${newUser.verificationToken}`;
        console.log('[VERIFY] Link for', normalized, ':', vLink);
        return res.status(201).json({ message: 'Account created! Check your email to verify.', needsVerification: true });
      });
    });
  } catch (error) {
    console.error('[REGISTER] Unexpected error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

app.get('/api/verify', (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send(verificationPage('Missing verification token.', false));
  findUserByToken(token, (err, user) => {
    if (err || !user) return res.status(400).send(verificationPage('Invalid or expired verification link.', false));
    verifyUser(user.email, (err, success) => {
      if (err || !success) return res.status(500).send(verificationPage('Verification failed. Try again.', false));
      console.log('[VERIFY] User verified:', user.email);
      res.send(verificationPage('Email verified successfully! You can now log in.', true));
    });
  });
});

app.post('/api/resend-verification', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });
  const normalized = email.trim().toLowerCase();
  findUserByEmail(normalized, (err, user) => {
    if (err || !user) return res.status(404).json({ message: 'No account found with that email.' });
    if (user.verified) return res.status(400).json({ message: 'This email is already verified.' });
    const token = user.verificationToken;
    if (!token) return res.status(500).json({ message: 'No verification token found. Re-register.' });
    const vLink = `${BASE_URL}/api/verify?token=${token}`;
    sendVerificationEmail(normalized, user.name, token).then(() => {
      console.log('[RESEND] ✓ Verification email sent to:', normalized);
      res.json({ message: 'Verification email resent!', verifyLink: vLink });
    }).catch((emailErr) => {
      console.log('[RESEND] ✗ Email send failed:', emailErr.message);
      console.log('[RESEND]   Link for', normalized, ':', vLink);
      res.json({ message: 'Click the link below to verify.', verifyLink: vLink });
    });
  });
});

function verificationPage(message, success) {
  const redirect = success ? '<meta http-equiv="refresh" content="2;url=/"><script>setTimeout(()=>window.location.href="/",2000)</script>' : '';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>BuSocial - Email Verification</title>${redirect}<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet"><style>body{margin:0;background:#0a0e1a;color:#d4dae8;font-family:'Plus Jakarta Sans',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh}.card{background:rgba(25,32,64,.92);backdrop-filter:blur(20px);border:1px solid rgba(100,130,200,.12);border-radius:20px;padding:40px;max-width:420px;text-align:center;box-shadow:0 32px 80px rgba(0,0,0,.7)}.icon{width:56px;height:56px;border-radius:14px;background:${success ? 'linear-gradient(135deg,#34d399,#4f7fff)' : 'linear-gradient(135deg,#f87171,#fbbf24)'};display:inline-flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:16px}h1{font-size:20px;color:#eef0f8;margin:0 0 8px}p{font-size:14px;color:#7d88a8;line-height:1.6;margin:0}</style></head><body><div class="card"><div class="icon">${success ? '✅' : '❌'}</div><h1>${success ? 'Verified!' : 'Verification Failed'}</h1><p>${message}</p>${success ? '<p style="margin-top:16px;font-size:13px;color:#7d88a8">Redirecting to login...</p>' : ''}</div></body></html>`;
}

const activeUsers = new Map();

app.get('/api/posts', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    getPosts(page, limit, (err, posts, hasMore, total) => {
      if (err) return res.status(500).json({ message: 'Failed to load posts: ' + err.message });
      return res.json({ posts, hasMore: !!hasMore, total: total || 0, page, limit });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

app.post('/api/posts', (req, res) => {
  try {
    const { author, dept, cat, txt, imageUrl, userId } = req.body;
    if (!txt || !userId) return res.status(400).json({ message: 'Missing required fields.' });
    createPost(author || 'Anonymous', dept || '', cat || 'general', txt, imageUrl, userId, (err, post) => {
      if (err) return res.status(500).json({ message: 'Failed to create post: ' + err.message });
      io.emit('post:new', post);
      return res.status(201).json({ post });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

app.post('/api/posts/:id/like', (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required.' });
    toggleLike(parseInt(req.params.id), userId, (err, result) => {
      if (err) return res.status(500).json({ message: 'Failed to toggle like: ' + err.message });
      io.emit('post:like', { postId: parseInt(req.params.id), ...result });
      return res.json(result);
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

app.get('/api/active-count', (req, res) => {
  res.json({ activeUsers: activeUsers.size, totalPosts: 0 });
  getActivePostCount((err, count) => {
    if (!err) res.json({ activeUsers: activeUsers.size, totalPosts: count });
  });
});

app.get('/api/users/by-name', (req, res) => {
  try {
    const name = req.query.name;
    if (!name) return res.status(400).json({ message: 'Missing name' });
    findUserByName(name, (err, user) => {
      if (err) return res.status(500).json({ message: err.message });
      if (!user) return res.json({ user: null });
      res.json({ user });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

app.post('/api/follow/:userId', (req, res) => {
  try {
    const { userId: followerId } = req.body;
    const followingId = parseInt(req.params.userId);
    if (!followerId) return res.status(400).json({ message: 'Missing followerId' });
    toggleFollow(followerId, followingId, (err, result) => {
      if (err) return res.status(500).json({ message: 'Failed to toggle follow: ' + err.message });
      res.json(result);
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

app.get('/api/follow/:userId/counts', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    getFollowCounts(userId, (err, counts) => {
      if (err) return res.status(500).json({ message: 'Failed to get counts: ' + err.message });
      const followingId = parseInt(req.query.viewerId);
      if (followingId) {
        isFollowing(followingId, userId, (err, following) => {
          res.json({ ...counts, isFollowing: !!following });
        });
      } else {
        res.json({ ...counts, isFollowing: false });
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

app.get('/api/comments', (req, res) => {
  try {
    const postId = req.query.postId;
    getComments((err, comments) => {
      if (err) return res.status(500).json({ message: 'Failed to load comments: ' + err.message });
      const filtered = postId ? comments.filter((c) => c.postId === postId) : comments;
      return res.json({ comments: filtered });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

app.post('/api/comments', (req, res) => {
  try {
    const { postId, author, text, userId } = req.body;
    if (!postId || !text || !userId) return res.status(400).json({ message: 'Missing required fields.' });
    addComment(postId, author, text, userId, (err, comment) => {
      if (err) return res.status(500).json({ message: 'Failed to add comment: ' + err.message });
      return res.status(201).json({ comment });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

app.delete('/api/comments/:id', (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required.' });
    deleteComment(parseInt(req.params.id), userId, (err, deleted) => {
      if (err) return res.status(500).json({ message: 'Failed to delete comment: ' + err.message });
      if (!deleted) return res.status(404).json({ message: 'Comment not found or not yours.' });
      return res.json({ success: true });
    });
  } catch (error) {
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

function broadcastActiveUsers() {
  io.emit('users:online', { count: activeUsers.size, users: Array.from(activeUsers.values()) });
}

io.on('connection', (socket) => {
  console.log('[SOCKET] Connected:', socket.id);
  let connectedUser = null;

  socket.on('join', (payload) => {
    connectedUser = payload;
    activeUsers.set(socket.id, { id: payload.id, name: payload.name });
    socket.join(`user-${payload.id}`);
    broadcastActiveUsers();
    console.log('[SOCKET] User joined:', payload.name, `(${activeUsers.size} online)`);
  });

  socket.on('disconnect', () => {
    if (connectedUser) {
      activeUsers.delete(socket.id);
      broadcastActiveUsers();
      console.log('[SOCKET] Disconnected:', connectedUser.name, `(${activeUsers.size} online)`);
    } else {
      console.log('[SOCKET] Disconnected:', socket.id);
    }
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

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n=== BabcockHub Server ===`);
  console.log(`Running at http://localhost:${PORT}`);
  console.log(`========================\n`);
});


