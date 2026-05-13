const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'babcockhub.db'));

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

function initDatabase() {
  return new Promise((resolve) => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        dept TEXT NOT NULL,
        lvl TEXT NOT NULL,
        hostel TEXT DEFAULT 'Off Campus',
        password TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating users table:', err);
    });

    // Chats table
    db.run(`
      CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nm TEXT NOT NULL,
        ico TEXT DEFAULT '💬',
        grp BOOLEAN DEFAULT 0,
        grad TEXT,
        online TEXT DEFAULT '1 online',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating chats table:', err);
    });

    // Chat participants
    db.run(`
      CREATE TABLE IF NOT EXISTS chat_participants (
        chatId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        PRIMARY KEY (chatId, userId),
        FOREIGN KEY (chatId) REFERENCES chats(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating chat_participants table:', err);
    });

    // Add verification columns to existing users table (safe to run if already added)
    db.run('ALTER TABLE users ADD COLUMN verified INTEGER DEFAULT 0', () => {});
    db.run('ALTER TABLE users ADD COLUMN verificationToken TEXT', () => {});

    // Comments table
    db.run(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        postId TEXT NOT NULL,
        author TEXT NOT NULL,
        text TEXT NOT NULL,
        time TEXT DEFAULT 'Just now',
        userId INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating comments table:', err);
    });

    // Messages table
    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chatId INTEGER NOT NULL,
        senderId INTEGER NOT NULL,
        senderName TEXT NOT NULL,
        txt TEXT NOT NULL,
        t TEXT DEFAULT '',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chatId) REFERENCES chats(id) ON DELETE CASCADE,
        FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating messages table:', err);
      
      // Seed database after tables are created
      db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (row && row.count === 0) {
          seedDatabase().then(resolve);
        } else {
          resolve();
        }
      });
    });
  });
}

function seedDatabase() {
  return new Promise((resolve) => {
    db.serialize(() => {
      // Insert demo users
      db.run(
        'INSERT INTO users (name, email, dept, lvl, hostel, password, verified) VALUES (?, ?, ?, ?, ?, ?, 1)',
        ['Adeyinka Bello', 'adeyinka@student.babcock.edu.ng', 'Computer Science', '300', 'Goodluck Hall', 'babcock123']
      );
      db.run(
        'INSERT INTO users (name, email, dept, lvl, hostel, password, verified) VALUES (?, ?, ?, ?, ?, ?, 1)',
        ['Chidera Okonkwo', 'chidera@student.babcock.edu.ng', 'Law', '400', 'Samuel Akande', 'law2026']
      );
      db.run(
        'INSERT INTO users (name, email, dept, lvl, hostel, password, verified) VALUES (?, ?, ?, ?, ?, ?, 1)',
        ['Emmanuel Nwachukwu', 'emmanuel@student.babcock.edu.ng', 'Economics', '200', 'Winslow', 'econ2026'],
        function(err) {
          if (err) {
            console.error('Error inserting users:', err);
            resolve();
            return;
          }
          
          // Create demo chats
          db.run(
            'INSERT INTO chats (nm, ico, grp, grad, online) VALUES (?, ?, ?, ?, ?)',
            ['CSC 300 Group 🖥️', '🖥️', 1, 'linear-gradient(135deg,#1a56ff,#00c27a)', '12 online'],
            function(err) {
              if (err) { console.error('Error creating chat:', err); return; }
              const chatId1 = this.lastID;
              db.run('INSERT INTO chat_participants (chatId, userId) VALUES (?, ?)', [chatId1, 1]);
              db.run('INSERT INTO chat_participants (chatId, userId) VALUES (?, ?)', [chatId1, 2]);
              db.run('INSERT INTO chat_participants (chatId, userId) VALUES (?, ?)', [chatId1, 3]);
              db.run('INSERT INTO messages (chatId, senderId, senderName, txt, t) VALUES (?, ?, ?, ?, ?)',
                [chatId1, 2, 'Chidera', 'Good morning! Anyone have the ML lecture slides?', '8:02 AM']);
              db.run('INSERT INTO messages (chatId, senderId, senderName, txt, t) VALUES (?, ?, ?, ?, ?)',
                [chatId1, 3, 'Emmanuel', 'I think Adeyinka has them', '8:10 AM']);
              db.run('INSERT INTO messages (chatId, senderId, senderName, txt, t) VALUES (?, ?, ?, ?, ?)',
                [chatId1, 1, 'Adeyinka', 'Yeah I have them, uploading now 📎', '8:12 AM']);
              db.run('INSERT INTO messages (chatId, senderId, senderName, txt, t) VALUES (?, ?, ?, ?, ?)',
                [chatId1, 2, 'Chidera', 'You are an absolute legend ❤️', '8:13 AM']);
            }
          );

          db.run(
            'INSERT INTO chats (nm, ico, grp, grad, online) VALUES (?, ?, ?, ?, ?)',
            ['Chidera Okonkwo', '⚖️', 0, 'linear-gradient(135deg,#f04040,#f59500)', '● Online'],
            function(err) {
              if (err) { console.error('Error creating chat:', err); return; }
              const chatId2 = this.lastID;
              db.run('INSERT INTO chat_participants (chatId, userId) VALUES (?, ?)', [chatId2, 1]);
              db.run('INSERT INTO chat_participants (chatId, userId) VALUES (?, ?)', [chatId2, 2]);
              db.run('INSERT INTO messages (chatId, senderId, senderName, txt, t) VALUES (?, ?, ?, ?, ?)',
                [chatId2, 2, 'Chidera', 'Are you coming to the moot court prep session today?', '11:00 AM']);
              db.run('INSERT INTO messages (chatId, senderId, senderName, txt, t) VALUES (?, ?, ?, ?, ?)',
                [chatId2, 1, 'Adeyinka', "Can't make it — I have a lab session clash 😬", '11:05 AM']);
              db.run('INSERT INTO messages (chatId, senderId, senderName, txt, t) VALUES (?, ?, ?, ?, ?)',
                [chatId2, 2, 'Chidera', "No worries! I'll share the notes after", '11:07 AM']);
            }
          );

          db.run(
            'INSERT INTO chats (nm, ico, grp, grad, online) VALUES (?, ?, ?, ?, ?)',
            ['Goodluck Hall 🏠', '🏠', 1, 'linear-gradient(135deg,#8b5cf6,#06b6d4)', '38 online'],
            function(err) {
              if (err) { console.error('Error creating chat:', err); return; }
              const chatId3 = this.lastID;
              db.run('INSERT INTO chat_participants (chatId, userId) VALUES (?, ?)', [chatId3, 1]);
              db.run('INSERT INTO chat_participants (chatId, userId) VALUES (?, ?)', [chatId3, 3]);
              db.run('INSERT INTO messages (chatId, senderId, senderName, txt, t) VALUES (?, ?, ?, ?, ?)',
                [chatId3, 3, 'Goodluck Rep', 'POWER OUT in Block C 😭 Contacting facilities now', '7:30 AM']);
              db.run('INSERT INTO messages (chatId, senderId, senderName, txt, t) VALUES (?, ?, ?, ?, ?)',
                [chatId3, 1, 'Adeyinka', "It's been 2 days now — this needs escalation", '9:00 AM']);
              db.run('INSERT INTO messages (chatId, senderId, senderName, txt, t) VALUES (?, ?, ?, ?, ?)',
                [chatId3, 3, 'Goodluck Rep', '⚡ UPDATE: Power restored as of 2PM. Report any issues.', '2:05 PM'],
                () => resolve()
              );
            }
          );
        }
      );
    });
  });
}

function getUser(email, password, callback) {
  db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email.toLowerCase(), password], callback);
}

function findUserByEmail(email, callback) {
  db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()], callback);
}

function createUser(name, email, dept, lvl, hostel, password, callback) {
  const token = require('crypto').randomBytes(32).toString('hex');
  db.run(
    'INSERT INTO users (name, email, dept, lvl, hostel, password, verified, verificationToken) VALUES (?, ?, ?, ?, ?, ?, 0, ?)',
    [name, email.toLowerCase(), dept, lvl, hostel, password, token],
    function(err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { id: this.lastID, name, email: email.toLowerCase(), dept, lvl, hostel, verificationToken: token });
      }
    }
  );
}

function findUserByToken(token, callback) {
  db.get('SELECT * FROM users WHERE verificationToken = ?', [token], callback);
}

function verifyUser(email, callback) {
  db.run('UPDATE users SET verified = 1, verificationToken = NULL WHERE email = ?', [email.toLowerCase()], function(err) {
    callback(err, this.changes > 0);
  });
}

function getChats(callback) {
  db.all(`
    SELECT DISTINCT c.* FROM chats c
    ORDER BY c.createdAt DESC
  `, (err, chats) => {
    if (err) {
      callback(err, []);
      return;
    }

    const results = [];
    let completed = 0;

    chats.forEach(chat => {
      db.all(
        'SELECT senderId, senderName, txt, t FROM messages WHERE chatId = ? ORDER BY createdAt ASC',
        [chat.id],
        (err, msgs) => {
          const chatObj = {
            id: chat.id,
            nm: chat.nm,
            ico: chat.ico,
            preview: msgs && msgs.length > 0 
              ? `${msgs[msgs.length - 1].senderName}: ${msgs[msgs.length - 1].txt.slice(0, 28)}${msgs[msgs.length - 1].txt.length > 28 ? '…' : ''}`
              : 'No messages yet',
            t: msgs && msgs.length > 0 ? msgs[msgs.length - 1].t : 'Just now',
            badge: 0,
            grp: Boolean(chat.grp),
            grad: chat.grad,
            online: chat.online,
            msgs: msgs ? msgs.map(m => ({ ...m, own: false })) : [],
          };
          results.push(chatObj);
          completed++;

          if (completed === chats.length) {
            callback(null, results);
          }
        }
      );
    });

    if (chats.length === 0) {
      callback(null, []);
    }
  });
}

function addMessage(chatId, senderId, senderName, txt, callback) {
  const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  db.run(
    'INSERT INTO messages (chatId, senderId, senderName, txt, t) VALUES (?, ?, ?, ?, ?)',
    [chatId, senderId, senderName, txt, t],
    function(err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { senderId, senderName, txt, t });
      }
    }
  );
}

function getComments(callback) {
  db.all('SELECT * FROM comments ORDER BY createdAt ASC', (err, rows) => {
    if (err) { callback(err, []); return; }
    callback(null, rows || []);
  });
}

function addComment(postId, author, text, userId, callback) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  db.run(
    'INSERT INTO comments (postId, author, text, time, userId) VALUES (?, ?, ?, ?, ?)',
    [postId, author, text, time, userId],
    function(err) {
      if (err) { callback(err, null); return; }
      callback(null, { id: this.lastID, postId, author, text, time, userId });
    }
  );
}

function deleteComment(commentId, userId, callback) {
  db.run('DELETE FROM comments WHERE id = ? AND userId = ?', [commentId, userId], function(err) {
    if (err) { callback(err, false); return; }
    callback(null, this.changes > 0);
  });
}

function sanitizeUser(user) {
  const copy = { ...user };
  delete copy.password;
  return copy;
}

module.exports = {
  db,
  initDatabase,
  getUser,
  findUserByEmail,
  findUserByToken,
  verifyUser,
  createUser,
  getChats,
  addMessage,
  getComments,
  addComment,
  deleteComment,
  sanitizeUser,
};

