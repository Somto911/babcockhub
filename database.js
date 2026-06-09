const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'babcockhub.db'));

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

function initDatabase() {
  return new Promise((resolve) => {
    db.serialize(() => {
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
        verified INTEGER DEFAULT 0,
        verificationToken TEXT,
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
        ico TEXT DEFAULT '≡ƒÆ¼',
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
  });
}

function seedDatabase() {
  console.log('[SEED] Starting database seed...');
  return new Promise((resolve) => {
    const users = [
      { name: 'Olawuyi Oluwaseun', email: 'seun@student.babcock.edu.ng', dept: 'IT', lvl: '300', hostel: 'Off Campus', password: 'seed123', verified: 1 },
      { name: 'Fagboy', email: 'fagboy@student.babcock.edu.ng', dept: 'Mass Comm', lvl: '200', hostel: 'Queen Esther', password: 'seed123', verified: 1 },
      { name: 'Ogunsola Dapo', email: 'dapo@student.babcock.edu.ng', dept: 'Engineering', lvl: '200', hostel: 'Winslow', password: 'seed123', verified: 1 },
      { name: 'Osakioduwa Elisha', email: 'elisha@student.babcock.edu.ng', dept: 'Software Engineering', lvl: '400', hostel: 'Winslow', password: 'seed123', verified: 1 },
      { name: 'Ememanka Chiemela', email: 'chiemela@student.babcock.edu.ng', dept: 'Unknown', lvl: '300', hostel: 'Off Campus', password: 'seed123', verified: 1 },
      { name: 'Emmanuel Ewedu', email: 'ewedu@student.babcock.edu.ng', dept: 'Economics', lvl: '200', hostel: 'Off Campus', password: 'seed123', verified: 1 },
      { name: 'Precious Ugo', email: 'ugo@student.babcock.edu.ng', dept: 'Business Admin', lvl: '400', hostel: 'Platinum Hall', password: 'seed123', verified: 1 },
    ];
    let done = 0;
    const userIds = [];
    users.forEach((u, i) => {
      db.run('INSERT OR IGNORE INTO users (name, email, dept, lvl, hostel, password, verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [u.name, u.email, u.dept, u.lvl, u.hostel, u.password, u.verified],
        function (err) {
          if (!err) userIds[i] = this.lastID;
          done++;
          if (done === users.length) {
            seedPosts(userIds).then(resolve);
          }
        }
      );
    });
  });
}

function seedPosts(userIds) {
  return new Promise((resolve) => {
    const posts = [
      { author: 'Olawuyi Oluwaseun', dept: 'IT · 300L', cat: 'sports', txt: "PSG please \u{1F62D} the world is behind you right now\u2026 if you lose this UCL final I'm going to be sad fr fr \u{1F3C6}\u26BD", userId: userIds[0] },
      { author: 'Fagboy', dept: 'Mass Comm · 200L', cat: 'sports', txt: "If Arsenal win the UCL just kill me \u{1F480} I cannot survive seeing it happen. I've suffered since 2020 and I'm not ready for this \u{1F62D}\u2764\uFE0F", userId: userIds[1] },
      { author: 'Ogunsola Dapo', dept: 'Engineering · 200L', cat: 'gist', txt: "The BUSA elections are looking wild \u{1F602} UZOMA4SPORTS really came with the energy this year. What y'all think?", userId: userIds[2] },
      { author: 'Osakioduwa Elisha', dept: 'Software Engineering · 400L', cat: 'hostel', txt: "\u26A1 Winslow HALL UPDATE: Power is BACK in Block C! It's been 3 days, the gen is finally fixed. Update your assignments fam \u2014 we move!", userId: userIds[3] },
      { author: 'Ememanka Chiemela', dept: 'Unknown · 300L', cat: 'events', txt: "\u{1F3E5} Free medical outreach this sunday in front of Caf ! Blood pressure check, and health counselling. Bring your people! #BabcockMed", userId: userIds[4] },
      { author: 'Emmanuel Ewedu', dept: 'Economics · 200L', cat: 'academics', txt: "Does anyone have the Linux tutorial notes from last semester? Lecturer just announced a test for next week \u{1F630} Please help a guy out \u{1F64F}", userId: userIds[5] },
      { author: 'Precious Ugo', dept: 'Business Admin · 400L', cat: 'academics', txt: "\u{1F393} JUST FINISHED MY FINAL YEAR PROJECT! 4 years of stress, tears, and late nights. WE MADE IT! To every 400L student still grinding \u2014 you're almost there \u{1F4AA}", userId: userIds[6] },
    ];
    let done = 0;
    const postIds = [];
    posts.forEach((p, i) => {
      db.run('INSERT INTO posts (author, dept, cat, txt, userId) VALUES (?, ?, ?, ?, ?)',
        [p.author, p.dept, p.cat, p.txt, p.userId],
        function (err) {
          if (!err) postIds[i] = this.lastID;
          done++;
          if (done === posts.length) {
            seedComments(postIds, userIds, resolve);
          }
        }
      );
    });
  });
}

function seedComments(postIds, userIds, resolve) {
  const comments = [
    { postId: postIds[0], author: 'Fagboy', text: "PSG no get chance bro \u{1F602}", userId: userIds[1] },
    { postId: postIds[0], author: 'Ogunsola Dapo', text: 'Mbappe on his way to Madrid already \u{1F480}', userId: userIds[2] },
    { postId: postIds[1], author: 'Olawuyi Oluwaseun', text: 'Arsenal fans been suffering since 2004 \u{1F62D}', userId: userIds[0] },
    { postId: postIds[3], author: 'Ememanka Chiemela', text: 'Finally! Block C residents can charge their phones again \u26A1', userId: userIds[4] },
    { postId: postIds[3], author: 'Precious Ugo', text: 'What about Block A? Still in darkness? \u{1F624}', userId: userIds[6] },
    { postId: postIds[5], author: 'Fagboy', text: 'I have them! DM me your WhatsApp number', userId: userIds[1] },
    { postId: postIds[6], author: 'Ogunsola Dapo', text: 'Congratulations!! \u{1F389} Well done', userId: userIds[2] },
    { postId: postIds[6], author: 'Olawuyi Oluwaseun', text: 'Proud of you! \u{1F393}', userId: userIds[0] },
    { postId: postIds[6], author: 'Ememanka Chiemela', text: 'Almost there myself, this is motivation \u{1F64F}', userId: userIds[4] },
  ];
  let done = 0;
  comments.forEach((c) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    db.run('INSERT INTO comments (postId, author, text, time, userId) VALUES (?, ?, ?, ?, ?)',
      [c.postId, c.author, c.text, time, c.userId],
      () => { done++; if (done === comments.length) seedGroups(userIds, resolve); }
    );
  });
  if (comments.length === 0) seedGroups(userIds, resolve);
}

function seedGroups(userIds, resolve) {
  const groups = [
    { nm: 'Computer Science Dept', type: 'Department', cat: 'academics', desc: 'Official dept group for all CS students.', ico: 'C', grad: 'linear-gradient(135deg,rgba(26,86,255,.5),rgba(0,194,122,.35))', userId: userIds[0] },
    { nm: 'winslow Hall', type: 'Hostel', cat: 'hostel', desc: 'Residents of winslow Hall. Power updates, lost & found.', ico: 'W', grad: 'linear-gradient(135deg,rgba(240,64,64,.5),rgba(245,149,0,.35))', userId: userIds[3] },
    { nm: 'BUCC', type: 'Club', cat: 'general', desc: 'Building, shipping, learning together.', ico: 'B', grad: 'linear-gradient(135deg,rgba(139,92,246,.5),rgba(6,182,212,.35))', userId: userIds[2] },
    { nm: 'Law Students Forum', type: 'Department', cat: 'academics', desc: 'For all Law students. Moot court updates.', ico: 'L', grad: 'linear-gradient(135deg,rgba(0,194,122,.5),rgba(26,86,255,.35))', userId: userIds[1] },
    { nm: 'CS 300 Study Group', type: 'Course', cat: 'academics', desc: 'Notes, study sessions, and exam prep.', ico: 'S', grad: 'linear-gradient(135deg,rgba(245,149,0,.5),rgba(240,64,64,.35))', userId: userIds[0] },
    { nm: 'Babcock Chess Club', type: 'Club', cat: 'general', desc: 'Weekly chess sessions at the student centre.', ico: 'C', grad: 'linear-gradient(135deg,rgba(6,182,212,.5),rgba(139,92,246,.35))', userId: userIds[2] },
  ];
  let done = 0;
  groups.forEach((g) => {
    db.run('INSERT OR IGNORE INTO groups_t (nm, type, cat, desc, ico, grad, userId) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [g.nm, g.type, g.cat, g.desc, g.ico, g.grad, g.userId],
      () => { done++; if (done === groups.length) seedEvents(userIds, resolve); }
    );
  });
  if (groups.length === 0) seedEvents(userIds, resolve);
}

function seedEvents(userIds, resolve) {
  const events = [
    { title: 'BU Hackathon', ico: 'H', day: '15', mon: 'JUN', time: '9:00 AM', loc: 'Tech Hub Building', desc: '24-hour coding marathon.', grad: 'linear-gradient(135deg,rgba(26,86,255,.5),rgba(0,194,122,.35))', userId: userIds[0] },
    { title: 'Freshers Fair', ico: 'F', day: '20', mon: 'SEP', time: '4:00 PM', loc: 'University Stadium', desc: 'Welcome to Babcock!', grad: 'linear-gradient(135deg,rgba(245,149,0,.5),rgba(240,64,64,.3))', userId: userIds[1] },
    { title: 'Graduation Day', ico: 'G', day: '12', mon: 'OCT', time: '10:00 AM', loc: 'The Amphitheatre', desc: 'Celebrating our graduating class.', grad: 'linear-gradient(135deg,rgba(139,92,246,.5),rgba(6,182,212,.35))', userId: userIds[2] },
    { title: 'Best of 200L Final', ico: 'B', day: '28', mon: 'MAY', time: '3:00 PM', loc: 'University Stadium', desc: 'The ultimate intramural showdown!', grad: 'linear-gradient(135deg,rgba(0,194,122,.5),rgba(26,86,255,.3))', cat: 'sports', userId: userIds[3] },
  ];
  let done = 0;
  events.forEach((e) => {
    db.run('INSERT OR IGNORE INTO events_t (title, ico, day, mon, time, loc, desc, grad, cat, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [e.title, e.ico, e.day, e.mon, e.time, e.loc, e.desc, e.grad, e.cat || 'general', e.userId],
      () => { done++; if (done === events.length) seedConfs(userIds, resolve); }
    );
  });
  if (events.length === 0) seedConfs(userIds, resolve);
}

function seedConfs(userIds, resolve) {
  const confs = [
    { txt: 'I have been attending the wrong tutorial class for 3 weeks. I thought I was getting smarter \u2014 turns out I was studying a completely different course \u{1F480}', userId: userIds[0] },
    { txt: "There is someone in my department whose voice I have been in love with for 2 entire years and we have never once spoken.", userId: userIds[1] },
    { txt: "I've been hooking up with my lecturer's son for the past 4 months and he has no idea it's me.", userId: userIds[2] },
    { txt: "I walked into my exam hall wearing nothing but boxers under my gown because I was late and didn't have time to put on trousers.", userId: userIds[3] },
  ];
  let done = 0;
  confs.forEach((c) => {
    db.run('INSERT OR IGNORE INTO confessions (txt, userId) VALUES (?, ?)',
      [c.txt, c.userId],
      () => { done++; if (done === confs.length) seedMemes(userIds, resolve); }
    );
  });
  if (confs.length === 0) seedMemes(userIds, resolve);
}

function seedMemes(userIds, resolve) {
  const memes = [
    { ico: 'R', cap: 'This whole elections were rigged', url: 'https://media4.giphy.com/media/8rT2k19HNjhImz6bwP/giphy.gif', userId: userIds[0] },
    { ico: 'M', cap: 'abeg so we no get social director??', url: 'https://media0.giphy.com/media/ouEIsl1nsBjUpMbfxm/giphy.gif', userId: userIds[1] },
    { ico: 'V', cap: 'How do you lose an unopposed election', url: 'https://media1.giphy.com/media/DmCq5rJEk6phhv4WSz/giphy.gif', userId: userIds[2] },
    { ico: 'C', cap: 'So after everything Angel no win Gensec', url: 'https://media4.giphy.com/media/4QA4DlNNe6NHMSNqrO/giphy.gif', userId: userIds[3] },
    { ico: 'K', cap: 'Me at 11:59PM submitting a 3,000-word essay I started at 11:30PM', url: 'https://media4.giphy.com/media/gwhneLWxsHkaCyRj4n/giphy.gif', userId: userIds[4] },
  ];
  let done = 0;
  memes.forEach((m) => {
    db.run('INSERT OR IGNORE INTO memes_t (ico, cap, url, userId) VALUES (?, ?, ?, ?)',
      [m.ico, m.cap, m.url, m.userId],
      () => { done++; if (done === memes.length) seedPolls(resolve); }
    );
  });
  if (memes.length === 0) seedPolls(resolve);
}

function seedPolls(resolve) {
  const polls = [
    { q: 'Best Busa shop?', opts: ['Big Meals', 'Flakky Ventures', 'Busa House', 'All busa food are ass'] },
    { q: 'Best Babcock TikToker?', opts: ['Aliana', 'Mazi Abraham', 'Valentino', 'Caris'] },
    { q: 'Favourite Kiss Spot?', opts: ['Amphitheater', 'SAT', 'Queen Esther', 'Busa Hut'] },
  ];
  let done = 0;
  polls.forEach((p) => {
    db.run('INSERT OR IGNORE INTO polls_t (q, userId) VALUES (?, ?)', [p.q, 1], function () {
      const pollId = this.lastID;
      let optDone = 0;
      p.opts.forEach((l) => {
        db.run('INSERT OR IGNORE INTO poll_options (pollId, l, v) VALUES (?, ?, ?)',
          [pollId, l, Math.floor(Math.random() * 100 + 50)],
          () => { optDone++; if (optDone === p.opts.length) { done++; if (done === polls.length) seedChats(resolve); } }
        );
      });
    });
  });
  if (polls.length === 0) seedChats(resolve);
}

function seedChats(resolve) {
  db.run('INSERT OR IGNORE INTO chats (nm, ico, grp, grad, online) VALUES (?, ?, ?, ?, ?)',
    ['CS Dept Group', 'C', 1, 'linear-gradient(135deg,#4f7fff,#34d399)', '12 online'], function () {
      seedMessages(1, resolve);
    });
}

function seedMessages(chatId, resolve) {
  const msgs = [
    { senderId: 2, senderName: 'Seun', txt: 'Did anyone get the assignment?', t: '2:30 PM' },
    { senderId: 3, senderName: 'Dapo', txt: 'Yeah check the portal', t: '2:31 PM' },
  ];
  let done = 0;
  msgs.forEach((m) => {
    db.run('INSERT OR IGNORE INTO messages (chatId, senderId, senderName, txt, t) VALUES (?, ?, ?, ?, ?)',
      [chatId, m.senderId, m.senderName, m.txt, m.t],
      () => { done++; if (done === msgs.length) resolve(); }
    );
  });
  if (msgs.length === 0) resolve();
}

function getUser(email, password, callback) {
  db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email.toLowerCase(), password], callback);
}

function findUserByEmail(email, callback) {
  db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()], callback);
}

function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function createUser(name, email, dept, lvl, hostel, password, callback) {
  const code = generateVerificationCode();
  db.run(
    'INSERT INTO users (name, email, dept, lvl, hostel, password, verified, verificationToken) VALUES (?, ?, ?, ?, ?, ?, 0, ?)',
    [name, email.toLowerCase(), dept, lvl, hostel, password, code],
    function(err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { id: this.lastID, name, email: email.toLowerCase(), dept, lvl, hostel, verificationToken: code });
      }
    }
  );
}

function findUserByToken(token, callback) {
  db.get('SELECT * FROM users WHERE verificationToken = ?', [token], callback);
}

function findUserByVerificationCode(code, callback) {
  db.get('SELECT * FROM users WHERE verificationToken = ? AND verified = 0', [code], callback);
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
              ? `${msgs[msgs.length - 1].senderName}: ${msgs[msgs.length - 1].txt.slice(0, 28)}${msgs[msgs.length - 1].txt.length > 28 ? 'ΓÇª' : ''}`
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

// ΓöÇΓöÇ Stories ΓöÇΓöÇ
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

// ΓöÇΓöÇ Groups ΓöÇΓöÇ
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

// ΓöÇΓöÇ Events ΓöÇΓöÇ
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

// ΓöÇΓöÇ Confessions ΓöÇΓöÇ
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

// ΓöÇΓöÇ Memes ΓöÇΓöÇ
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
        if (err) { callback(err, null); return; }
        db.run('UPDATE memes_t SET likes = MAX(0, likes - 1) WHERE id = ?', [memeId], function(err) {
          callback(err, { liked: false });
        });
      });
    } else {
      db.run('INSERT INTO meme_likes (memeId, userId) VALUES (?, ?)', [memeId, userId], function(err) {
        if (err) { callback(err, null); return; }
        db.run('UPDATE memes_t SET likes = likes + 1 WHERE id = ?', [memeId], function(err) {
          callback(err, { liked: true });
        });
      });
    }
  });
}

// ΓöÇΓöÇ Polls ΓöÇΓöÇ
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

// ΓöÇΓöÇ Notifications ΓöÇΓöÇ
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
  findUserByVerificationCode,
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

