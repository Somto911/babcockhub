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

    // Posts table
    db.run(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        author TEXT NOT NULL,
        dept TEXT DEFAULT '',
        cat TEXT DEFAULT 'general',
        txt TEXT NOT NULL,
        imageUrl TEXT DEFAULT '',
        userId INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating posts table:', err);
    });

    // Post likes
    db.run(`
      CREATE TABLE IF NOT EXISTS post_likes (
        postId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        PRIMARY KEY (postId, userId),
        FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating post_likes table:', err);
    });

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

    // Stories table
    db.run(`
      CREATE TABLE IF NOT EXISTS stories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        icon TEXT DEFAULT '',
        img TEXT NOT NULL,
        userId INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating stories table:', err);
    });

    // Groups table
    db.run(`
      CREATE TABLE IF NOT EXISTS groups_t (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nm TEXT NOT NULL,
        type TEXT DEFAULT '',
        cat TEXT DEFAULT 'general',
        desc TEXT DEFAULT '',
        mem INTEGER DEFAULT 0,
        ico TEXT DEFAULT '',
        grad TEXT DEFAULT '',
        depts TEXT DEFAULT 'null',
        userId INTEGER NOT NULL DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating groups_t table:', err);
    });

    // Group members
    db.run(`
      CREATE TABLE IF NOT EXISTS group_members (
        groupId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        PRIMARY KEY (groupId, userId),
        FOREIGN KEY (groupId) REFERENCES groups_t(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating group_members table:', err);
    });

    // Events table
    db.run(`
      CREATE TABLE IF NOT EXISTS events_t (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        ico TEXT DEFAULT '',
        day TEXT DEFAULT '',
        mon TEXT DEFAULT '',
        time TEXT DEFAULT '',
        loc TEXT DEFAULT '',
        desc TEXT DEFAULT '',
        att INTEGER DEFAULT 0,
        grad TEXT DEFAULT '',
        cat TEXT DEFAULT 'general',
        userId INTEGER NOT NULL DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating events_t table:', err);
    });

    // Event attendees
    db.run(`
      CREATE TABLE IF NOT EXISTS event_attendees (
        eventId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        remindSet BOOLEAN DEFAULT 0,
        PRIMARY KEY (eventId, userId),
        FOREIGN KEY (eventId) REFERENCES events_t(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating event_attendees table:', err);
    });

    // Confessions table
    db.run(`
      CREATE TABLE IF NOT EXISTS confessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        txt TEXT NOT NULL,
        userId INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating confessions table:', err);
    });

    // Confession likes
    db.run(`
      CREATE TABLE IF NOT EXISTS confession_likes (
        confessionId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        PRIMARY KEY (confessionId, userId)
      )
    `, (err) => {
      if (err) console.error('Error creating confession_likes table:', err);
    });

    // Memes table
    db.run(`
      CREATE TABLE IF NOT EXISTS memes_t (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ico TEXT DEFAULT '',
        cap TEXT NOT NULL,
        url TEXT NOT NULL,
        likes INTEGER DEFAULT 0,
        userId INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating memes_t table:', err);
    });

    // Meme likes
    db.run(`
      CREATE TABLE IF NOT EXISTS meme_likes (
        memeId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        PRIMARY KEY (memeId, userId)
      )
    `, (err) => {
      if (err) console.error('Error creating meme_likes table:', err);
    });

    // Polls table
    db.run(`
      CREATE TABLE IF NOT EXISTS polls_t (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        q TEXT NOT NULL,
        userId INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating polls_t table:', err);
    });

    // Poll options
    db.run(`
      CREATE TABLE IF NOT EXISTS poll_options (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pollId INTEGER NOT NULL,
        l TEXT NOT NULL,
        v INTEGER DEFAULT 0,
        FOREIGN KEY (pollId) REFERENCES polls_t(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating poll_options table:', err);
    });

    // Poll votes
    db.run(`
      CREATE TABLE IF NOT EXISTS poll_votes (
        pollId INTEGER NOT NULL,
        optionId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        PRIMARY KEY (pollId, userId),
        FOREIGN KEY (pollId) REFERENCES polls_t(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating poll_votes table:', err);
    });

    // Notifications table
    db.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT 0,
        time TEXT DEFAULT 'Just now',
        userId INTEGER NOT NULL,
        postId INTEGER DEFAULT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating notifications table:', err);
    });

    // Follows table
    db.run(`
      CREATE TABLE IF NOT EXISTS follows (
        followerId INTEGER NOT NULL,
        followingId INTEGER NOT NULL,
        PRIMARY KEY (followerId, followingId),
        FOREIGN KEY (followerId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (followingId) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating follows table:', err);
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
    });

    // Seed database after all tables created
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
      if (row && row.count === 0) {
        seedDatabase().then(resolve);
      } else {
        resolve();
      }
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
                () => {
                  // Seed demo posts
                  const seedPosts = [
                    ['Adeyinka Bello', 'Computer Science · 300L', 'sports', "PSG please \u{1F62D} the world is behind you right now…", '', 1],
                    ['Chidera Okonkwo', 'Law · 400L', 'sports', "If Arsenal win the UCL just kill me \u{1F480} I cannot survive", '', 2],
                    ['Emmanuel Nwachukwu', 'Economics · 200L', 'academics', 'Does anyone have the Linux tutorial notes from last semester? \u{1F630}', '', 3],
                    ['Adeyinka Bello', 'Computer Science · 300L', 'hostel', "Winslow Hall UPDATE: Power is BACK in Block C! \u{26A1}", '', 1],
                    ['Chidera Okonkwo', 'Law · 400L', 'events', "\u{1F3E5} Free medical outreach this sunday in front of Caf! #BabcockMed", '', 2],
                    ['Emmanuel Nwachukwu', 'Economics · 200L', 'gist', 'The BUSA elections are looking wild \u{1F602} UZOMA4SPORTS came with energy!', '', 3],
                    ['Adeyinka Bello', 'Computer Science · 300L', 'academics', "\u{1F393} JUST FINISHED MY FINAL YEAR PROJECT! 4 years of stress. WE MADE IT!", 'https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=600&h=400&fit=crop', 1],
                  ];
                  let postCount = 0;
                  seedPosts.forEach(([author, dept, cat, txt, imageUrl, userId]) => {
                    db.run(
                      'INSERT INTO posts (author, dept, cat, txt, imageUrl, userId, createdAt) VALUES (?, ?, ?, ?, ?, ?, datetime("now", ?))',
                      [author, dept, cat, txt, imageUrl, userId, `-${seedPosts.length - postCount} minutes`],
                      () => {
                        postCount++;
                        if (postCount === seedPosts.length) resolve();
                      }
                    );
                  });
                }
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

function getPosts(page = 1, limit = 10, callback) {
  if (typeof page === 'function') { callback = page; page = 1; limit = 10; }
  if (typeof limit === 'function') { callback = limit; limit = 10; }
  const offset = (page - 1) * limit;
  db.all('SELECT * FROM posts ORDER BY createdAt DESC LIMIT ? OFFSET ?', [limit, offset], (err, posts) => {
    if (err) { callback(err, []); return; }
    const results = [];
    let completed = 0;
    if (posts.length === 0) { callback(null, [], false, 0); return; }
    db.get('SELECT COUNT(*) as total FROM posts', (err, row) => {
      const total = row?.total || 0;
    posts.forEach((post) => {
      db.all('SELECT userId FROM post_likes WHERE postId = ?', [post.id], (err, likes) => {
        db.all('SELECT * FROM comments WHERE postId = ? ORDER BY createdAt ASC', [String(post.id)], (err, comments) => {
          results.push({
            id: post.id,
            author: post.author,
            dept: post.dept,
            cat: post.cat,
            txt: post.txt,
            imageUrl: post.imageUrl || '',
            likes: likes ? likes.map((l) => l.userId) : [],
            liked: false,
            reposts: 0,
            reposted: false,
            repostedBy: [],
            comments: comments || [],
            t: formatTimeAgo(post.createdAt),
          });
          completed++;
          if (completed === posts.length) callback(null, results, offset + posts.length < total, total);
        });
      });
    });
    });
  });
}

function createPost(author, dept, cat, txt, imageUrl, userId, callback) {
  db.run(
    'INSERT INTO posts (author, dept, cat, txt, imageUrl, userId) VALUES (?, ?, ?, ?, ?, ?)',
    [author, dept, cat, txt, imageUrl || '', userId],
    function(err) {
      if (err) { callback(err, null); return; }
      callback(null, {
        id: this.lastID, author, dept, cat, txt, imageUrl: imageUrl || '', userId,
        likes: [], liked: false, reposts: 0, reposted: false, repostedBy: [], comments: [], t: 'Just now',
      });
    }
  );
}

function toggleLike(postId, userId, callback) {
  db.get('SELECT * FROM post_likes WHERE postId = ? AND userId = ?', [postId, userId], (err, row) => {
    if (err) { callback(err, null); return; }
    if (row) {
      db.run('DELETE FROM post_likes WHERE postId = ? AND userId = ?', [postId, userId], function(err) {
        callback(err, { liked: false, userId });
      });
    } else {
      db.run('INSERT INTO post_likes (postId, userId) VALUES (?, ?)', [postId, userId], function(err) {
        callback(err, { liked: true, userId });
      });
    }
  });
}

function getActivePostCount(callback) {
  db.get('SELECT COUNT(*) as count FROM posts', (err, row) => {
    if (err) { callback(err, 0); return; }
    callback(null, row?.count || 0);
  });
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return 'Just now';
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)}d ago`;
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

function toggleFollow(followerId, followingId, callback) {
  db.get('SELECT * FROM follows WHERE followerId = ? AND followingId = ?', [followerId, followingId], (err, row) => {
    if (err) { callback(err, null); return; }
    if (row) {
      db.run('DELETE FROM follows WHERE followerId = ? AND followingId = ?', [followerId, followingId], function(err) {
        callback(err, { following: false });
      });
    } else {
      db.run('INSERT INTO follows (followerId, followingId) VALUES (?, ?)', [followerId, followingId], function(err) {
        callback(err, { following: true });
      });
    }
  });
}

function getFollowCounts(userId, callback) {
  let followers = 0, following = 0;
  db.get('SELECT COUNT(*) as count FROM follows WHERE followingId = ?', [userId], (err, row) => {
    followers = row?.count || 0;
    db.get('SELECT COUNT(*) as count FROM follows WHERE followerId = ?', [userId], (err, row) => {
      following = row?.count || 0;
      callback(null, { followers, following });
    });
  });
}

function isFollowing(followerId, followingId, callback) {
  db.get('SELECT 1 FROM follows WHERE followerId = ? AND followingId = ?', [followerId, followingId], (err, row) => {
    callback(null, !!row);
  });
}

function findUserByName(name, callback) {
  db.get('SELECT id, name, dept, lvl, hostel FROM users WHERE name = ?', [name], callback);
}

function getMutualFollowers(userId, callback) {
  db.all(`
    SELECT DISTINCT u.id, u.name, u.dept, u.lvl, u.hostel
    FROM follows f1
    JOIN follows f2 ON f1.followerId = f2.followingId AND f1.followingId = f2.followerId
    JOIN users u ON u.id = f1.followingId
    WHERE f1.followerId = ? AND f1.followingId != ?
  `, [userId, userId], (err, rows) => {
    if (err) { callback(err, []); return; }
    callback(null, rows || []);
  });
}

function createChat(nm, ico, grad, grp, callback) {
  db.run('INSERT INTO chats (nm, ico, grad, grp) VALUES (?, ?, ?, ?)', [nm, ico, grad, grp ? 1 : 0], function(err) {
    if (err) { callback(err, null); return; }
    callback(null, { id: this.lastID, nm, ico, grad, grp: !!grp });
  });
}

function addChatParticipant(chatId, userId, callback) {
  db.run('INSERT OR IGNORE INTO chat_participants (chatId, userId) VALUES (?, ?)', [chatId, userId], function(err) {
    callback(err);
  });
}

function findDmChat(userId1, userId2, callback) {
  db.get(`
    SELECT cp1.chatId FROM chat_participants cp1
    JOIN chat_participants cp2 ON cp1.chatId = cp2.chatId
    JOIN chats c ON c.id = cp1.chatId
    WHERE cp1.userId = ? AND cp2.userId = ? AND c.grp = 0
  `, [userId1, userId2], (err, row) => {
    if (err) { callback(err, null); return; }
    callback(null, row?.chatId || null);
  });
}

// ── Stories ──
function getStories(callback) {
  db.all('SELECT * FROM stories ORDER BY createdAt DESC', (err, rows) => {
    if (err) { callback(err, []); return; }
    callback(null, (rows || []).map(s => ({
      id: s.id, name: s.name, icon: s.icon || s.name[0],
      img: s.img, seen: false,
    })));
  });
}

function createStory(name, img, icon, userId, callback) {
  db.run('INSERT INTO stories (name, icon, img, userId) VALUES (?, ?, ?, ?)',
    [name, icon || name[0], img, userId],
    function(err) {
      if (err) { callback(err, null); return; }
      callback(null, { id: this.lastID, name, icon: icon || name[0], img, seen: false });
    }
  );
}

// ── Groups ──
function getGroups(userId, callback) {
  db.all('SELECT * FROM groups_t ORDER BY createdAt DESC', (err, rows) => {
    if (err) { callback(err, []); return; }
    const results = [];
    let completed = 0;
    if (!rows || rows.length === 0) { callback(null, []); return; }
    rows.forEach((g) => {
      db.get('SELECT COUNT(*) as cnt FROM group_members WHERE groupId = ?', [g.id], (err, memRow) => {
        db.get('SELECT 1 FROM group_members WHERE groupId = ? AND userId = ?', [g.id, userId], (err, joinedRow) => {
          let depts = null;
          try { depts = JSON.parse(g.depts); } catch(e) {}
          results.push({
            id: g.id, nm: g.nm, type: g.type, cat: g.cat, desc: g.desc,
            mem: memRow?.cnt || 0, ico: g.ico, joined: !!joinedRow,
            depts, grad: g.grad,
          });
          completed++;
          if (completed === rows.length) callback(null, results);
        });
      });
    });
  });
}

function createGroup(nm, type, cat, desc, ico, grad, depts, userId, callback) {
  db.run('INSERT INTO groups_t (nm, type, cat, desc, ico, grad, depts, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [nm, type, cat, desc, ico, grad, JSON.stringify(depts), userId],
    function(err) {
      if (err) { callback(err, null); return; }
      const id = this.lastID;
      db.run('INSERT INTO group_members (groupId, userId) VALUES (?, ?)', [id, userId], function(err2) {
        callback(null, { id, nm, type, cat, desc, mem: 1, ico, joined: true, depts, grad });
      });
    }
  );
}

function toggleGroupJoin(groupId, userId, callback) {
  db.get('SELECT 1 FROM group_members WHERE groupId = ? AND userId = ?', [groupId, userId], (err, row) => {
    if (err) { callback(err, null); return; }
    if (row) {
      db.run('DELETE FROM group_members WHERE groupId = ? AND userId = ?', [groupId, userId], function(err) {
        callback(err, { joined: false });
      });
    } else {
      db.run('INSERT INTO group_members (groupId, userId) VALUES (?, ?)', [groupId, userId], function(err) {
        callback(err, { joined: true });
      });
    }
  });
}

// ── Events ──
function getEvents(userId, callback) {
  db.all('SELECT * FROM events_t ORDER BY createdAt DESC', (err, rows) => {
    if (err) { callback(err, []); return; }
    const results = [];
    let completed = 0;
    if (!rows || rows.length === 0) { callback(null, []); return; }
    rows.forEach((e) => {
      db.get('SELECT COUNT(*) as cnt FROM event_attendees WHERE eventId = ?', [e.id], (err, attRow) => {
        db.get('SELECT remindSet FROM event_attendees WHERE eventId = ? AND userId = ?', [e.id, userId], (err, attendRow) => {
          results.push({
            id: e.id, title: e.title, ico: e.ico, day: e.day, mon: e.mon,
            time: e.time, loc: e.loc, desc: e.desc, att: attRow?.cnt || 0,
            going: !!attendRow, grad: e.grad, cat: e.cat,
            remind24h: false, remindDay: false, remindSet: attendRow ? !!attendRow.remindSet : false,
          });
          completed++;
          if (completed === rows.length) callback(null, results);
        });
      });
    });
  });
}

function createEvent(title, ico, day, mon, time, loc, desc, grad, cat, userId, callback) {
  db.run('INSERT INTO events_t (title, ico, day, mon, time, loc, desc, grad, cat, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [title, ico, day, mon, time, loc, desc, grad, cat || 'general', userId],
    function(err) {
      if (err) { callback(err, null); return; }
      callback(null, {
        id: this.lastID, title, ico, day, mon, time, loc, desc,
        att: 0, going: false, grad, cat: cat || 'general',
        remind24h: false, remindDay: false, remindSet: false,
      });
    }
  );
}

function toggleEventAttend(eventId, userId, remindSet, callback) {
  db.get('SELECT 1 FROM event_attendees WHERE eventId = ? AND userId = ?', [eventId, userId], (err, row) => {
    if (err) { callback(err, null); return; }
    if (row) {
      db.run('DELETE FROM event_attendees WHERE eventId = ? AND userId = ?', [eventId, userId], function(err) {
        callback(err, { going: false });
      });
    } else {
      db.run('INSERT INTO event_attendees (eventId, userId, remindSet) VALUES (?, ?, ?)', [eventId, userId, remindSet ? 1 : 0], function(err) {
        callback(err, { going: true, remindSet: !!remindSet });
      });
    }
  });
}

// ── Confessions ──
function getConfessions(callback) {
  db.all('SELECT * FROM confessions ORDER BY createdAt DESC', (err, rows) => {
    if (err) { callback(err, []); return; }
    const results = [];
    let completed = 0;
    if (!rows || rows.length === 0) { callback(null, []); return; }
    rows.forEach((c) => {
      db.all('SELECT userId FROM confession_likes WHERE confessionId = ?', [c.id], (err, likes) => {
        results.push({
          id: c.id, t: formatTimeAgo(c.createdAt), txt: c.txt,
          likes: likes ? likes.map(l => l.userId) : [], liked: false,
        });
        completed++;
        if (completed === rows.length) callback(null, results);
      });
    });
  });
}

function createConfession(txt, userId, callback) {
  db.run('INSERT INTO confessions (txt, userId) VALUES (?, ?)', [txt, userId], function(err) {
    if (err) { callback(err, null); return; }
    callback(null, { id: this.lastID, t: 'Just now', txt, likes: [], liked: false });
  });
}

function toggleConfessionLike(confessionId, userId, callback) {
  db.get('SELECT 1 FROM confession_likes WHERE confessionId = ? AND userId = ?', [confessionId, userId], (err, row) => {
    if (err) { callback(err, null); return; }
    if (row) {
      db.run('DELETE FROM confession_likes WHERE confessionId = ? AND userId = ?', [confessionId, userId], function(err) {
        callback(err, { liked: false, userId });
      });
    } else {
      db.run('INSERT INTO confession_likes (confessionId, userId) VALUES (?, ?)', [confessionId, userId], function(err) {
        callback(err, { liked: true, userId });
      });
    }
  });
}

// ── Memes ──
function getMemes(callback) {
  db.all('SELECT * FROM memes_t ORDER BY createdAt DESC', (err, rows) => {
    if (err) { callback(err, []); return; }
    callback(null, (rows || []).map(m => ({
      id: m.id, ico: m.ico, cap: m.cap, likes: m.likes, url: m.url,
    })));
  });
}

function createMeme(ico, cap, url, userId, callback) {
  db.run('INSERT INTO memes_t (ico, cap, url, userId) VALUES (?, ?, ?, ?)', [ico, cap, url, userId], function(err) {
    if (err) { callback(err, null); return; }
    callback(null, { id: this.lastID, ico, cap, likes: 0, url });
  });
}

function toggleMemeLike(memeId, userId, callback) {
  db.get('SELECT 1 FROM meme_likes WHERE memeId = ? AND userId = ?', [memeId, userId], (err, row) => {
    if (err) { callback(err, null); return; }
    if (row) {
      db.run('DELETE FROM meme_likes WHERE memeId = ? AND userId = ?', [memeId, userId], function(err) {
        db.run('UPDATE memes_t SET likes = MAX(0, likes - 1) WHERE id = ?', [memeId]);
        callback(err, { liked: false });
      });
    } else {
      db.run('INSERT INTO meme_likes (memeId, userId) VALUES (?, ?)', [memeId, userId], function(err) {
        db.run('UPDATE memes_t SET likes = likes + 1 WHERE id = ?', [memeId]);
        callback(err, { liked: true });
      });
    }
  });
}

// ── Polls ──
function getPolls(userId, callback) {
  db.all('SELECT * FROM polls_t ORDER BY createdAt DESC', (err, rows) => {
    if (err) { callback(err, []); return; }
    const results = [];
    let completed = 0;
    if (!rows || rows.length === 0) { callback(null, []); return; }
    rows.forEach((p) => {
      db.all('SELECT * FROM poll_options WHERE pollId = ? ORDER BY id ASC', [p.id], (err, opts) => {
        db.get('SELECT optionId FROM poll_votes WHERE pollId = ? AND userId = ?', [p.id, userId], (err, voteRow) => {
          results.push({
            id: p.id, q: p.q,
            opts: (opts || []).map(o => ({ id: o.id, l: o.l, v: o.v })),
            voted: voteRow ? voteRow.optionId : null,
          });
          completed++;
          if (completed === rows.length) callback(null, results);
        });
      });
    });
  });
}

function createPoll(q, options, userId, callback) {
  db.run('INSERT INTO polls_t (q, userId) VALUES (?, ?)', [q, userId], function(err) {
    if (err) { callback(err, null); return; }
    const pollId = this.lastID;
    let done = 0;
    const opts = [];
    options.forEach((l) => {
      db.run('INSERT INTO poll_options (pollId, l, v) VALUES (?, ?, 0)', [pollId, l], function(err) {
        opts.push({ id: this.lastID, l, v: 0 });
        done++;
        if (done === options.length) {
          callback(null, { id: pollId, q, opts, voted: null });
        }
      });
    });
    if (options.length === 0) callback(null, { id: pollId, q, opts: [], voted: null });
  });
}

function votePoll(pollId, optionId, userId, callback) {
  db.get('SELECT 1 FROM poll_votes WHERE pollId = ? AND userId = ?', [pollId, userId], (err, row) => {
    if (err) { callback(err, null); return; }
    if (row) {
      callback(null, { voted: null, already: true });
      return;
    }
    db.run('INSERT INTO poll_votes (pollId, optionId, userId) VALUES (?, ?, ?)', [pollId, optionId, userId], function(err) {
      if (err) { callback(err, null); return; }
      db.run('UPDATE poll_options SET v = v + 1 WHERE id = ?', [optionId]);
      callback(null, { voted: optionId });
    });
  });
}

// ── Notifications ──
function getNotifications(userId, callback) {
  db.all('SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT 50', [userId], (err, rows) => {
    if (err) { callback(err, []); return; }
    callback(null, (rows || []).map(n => ({
      id: n.id, type: n.type, message: n.message,
      read: !!n.read, time: formatTimeAgo(n.createdAt),
      userId: n.userId, postId: n.postId,
    })));
  });
}

function createNotification(type, message, userId, postId, callback) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  db.run('INSERT INTO notifications (type, message, read, time, userId, postId) VALUES (?, ?, 0, ?, ?, ?)',
    [type, message, time, userId, postId || null],
    function(err) {
      if (err) { callback(err, null); return; }
      callback(null, { id: this.lastID, type, message, read: false, time, userId, postId });
    }
  );
}

function markNotifRead(notifId, callback) {
  db.run('UPDATE notifications SET read = 1 WHERE id = ?', [notifId], function(err) {
    callback(err);
  });
}

function markAllNotifRead(userId, callback) {
  db.run('UPDATE notifications SET read = 1 WHERE userId = ?', [userId], function(err) {
    callback(err);
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
  getPosts,
  createPost,
  toggleLike,
  getActivePostCount,
  getComments,
  addComment,
  deleteComment,
  sanitizeUser,
  toggleFollow,
  getFollowCounts,
  isFollowing,
  findUserByName,
  getMutualFollowers,
  createChat,
  addChatParticipant,
  findDmChat,
  getStories,
  createStory,
  getGroups,
  createGroup,
  toggleGroupJoin,
  getEvents,
  createEvent,
  toggleEventAttend,
  getConfessions,
  createConfession,
  toggleConfessionLike,
  getMemes,
  createMeme,
  toggleMemeLike,
  getPolls,
  createPoll,
  votePoll,
  getNotifications,
  createNotification,
  markNotifRead,
  markAllNotifRead,
};

