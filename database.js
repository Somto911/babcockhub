const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/babcockhub',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 5000,
});

function query(text, params) {
  return pool.query(text, params);
}

function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
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

async function initDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      dept TEXT NOT NULL,
      lvl TEXT NOT NULL,
      hostel TEXT DEFAULT 'Off Campus',
      password TEXT NOT NULL,
      verified BOOLEAN DEFAULT false,
      "verificationToken" TEXT,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS chats (
      id SERIAL PRIMARY KEY,
      nm TEXT NOT NULL,
      ico TEXT DEFAULT '💬',
      grp BOOLEAN DEFAULT false,
      grad TEXT,
      online TEXT DEFAULT '1 online',
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS chat_participants (
      "chatId" INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
      "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      PRIMARY KEY ("chatId", "userId")
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      author TEXT NOT NULL,
      dept TEXT DEFAULT '',
      cat TEXT DEFAULT 'general',
      txt TEXT NOT NULL,
      "imageUrl" TEXT DEFAULT '',
      "userId" INTEGER NOT NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS post_likes (
      "postId" INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      "userId" INTEGER NOT NULL,
      PRIMARY KEY ("postId", "userId")
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      "postId" TEXT NOT NULL,
      author TEXT NOT NULL,
      text TEXT NOT NULL,
      time TEXT DEFAULT 'Just now',
      "userId" INTEGER NOT NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS stories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT DEFAULT '',
      img TEXT NOT NULL,
      "userId" INTEGER NOT NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS groups_t (
      id SERIAL PRIMARY KEY,
      nm TEXT NOT NULL,
      type TEXT DEFAULT '',
      cat TEXT DEFAULT 'general',
      desc TEXT DEFAULT '',
      mem INTEGER DEFAULT 0,
      ico TEXT DEFAULT '',
      grad TEXT DEFAULT '',
      depts TEXT DEFAULT 'null',
      "userId" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS group_members (
      "groupId" INTEGER NOT NULL REFERENCES groups_t(id) ON DELETE CASCADE,
      "userId" INTEGER NOT NULL,
      PRIMARY KEY ("groupId", "userId")
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS events_t (
      id SERIAL PRIMARY KEY,
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
      "userId" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS event_attendees (
      "eventId" INTEGER NOT NULL REFERENCES events_t(id) ON DELETE CASCADE,
      "userId" INTEGER NOT NULL,
      "remindSet" BOOLEAN DEFAULT false,
      PRIMARY KEY ("eventId", "userId")
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS confessions (
      id SERIAL PRIMARY KEY,
      txt TEXT NOT NULL,
      "userId" INTEGER NOT NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS confession_likes (
      "confessionId" INTEGER NOT NULL,
      "userId" INTEGER NOT NULL,
      PRIMARY KEY ("confessionId", "userId")
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS memes_t (
      id SERIAL PRIMARY KEY,
      ico TEXT DEFAULT '',
      cap TEXT NOT NULL,
      url TEXT NOT NULL,
      likes INTEGER DEFAULT 0,
      "userId" INTEGER NOT NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS meme_likes (
      "memeId" INTEGER NOT NULL,
      "userId" INTEGER NOT NULL,
      PRIMARY KEY ("memeId", "userId")
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS polls_t (
      id SERIAL PRIMARY KEY,
      q TEXT NOT NULL,
      "userId" INTEGER NOT NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS poll_options (
      id SERIAL PRIMARY KEY,
      "pollId" INTEGER NOT NULL REFERENCES polls_t(id) ON DELETE CASCADE,
      l TEXT NOT NULL,
      v INTEGER DEFAULT 0
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS poll_votes (
      "pollId" INTEGER NOT NULL,
      "optionId" INTEGER NOT NULL,
      "userId" INTEGER NOT NULL,
      PRIMARY KEY ("pollId", "userId")
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      read BOOLEAN DEFAULT false,
      time TEXT DEFAULT 'Just now',
      "userId" INTEGER NOT NULL,
      "postId" INTEGER DEFAULT NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS follows (
      "followerId" INTEGER NOT NULL,
      "followingId" INTEGER NOT NULL,
      PRIMARY KEY ("followerId", "followingId")
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      "chatId" INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
      "senderId" INTEGER NOT NULL,
      "senderName" TEXT NOT NULL,
      txt TEXT NOT NULL,
      t TEXT DEFAULT '',
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✓ Database tables created');
}

function getUser(email, password, callback) {
  query('SELECT * FROM users WHERE email = $1 AND password = $2', [email.toLowerCase(), password])
    .then(r => callback(null, r.rows[0] || null))
    .catch(err => callback(err, null));
}

function findUserByEmail(email, callback) {
  query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()])
    .then(r => callback(null, r.rows[0] || null))
    .catch(err => callback(err, null));
}

function findUserByToken(token, callback) {
  query('SELECT * FROM users WHERE "verificationToken" = $1', [token])
    .then(r => callback(null, r.rows[0] || null))
    .catch(err => callback(err, null));
}

function findUserByVerificationCode(code, callback) {
  query('SELECT * FROM users WHERE "verificationToken" = $1 AND verified = false', [code])
    .then(r => callback(null, r.rows[0] || null))
    .catch(err => callback(err, null));
}

function createUser(name, email, dept, lvl, hostel, password, callback) {
  const code = generateVerificationCode();
  query(
    'INSERT INTO users (name, email, dept, lvl, hostel, password, verified, "verificationToken") VALUES ($1, $2, $3, $4, $5, $6, false, $7) RETURNING id',
    [name, email.toLowerCase(), dept, lvl, hostel, password, code]
  )
    .then(r => callback(null, { id: r.rows[0].id, name, email: email.toLowerCase(), dept, lvl, hostel, verificationToken: code }))
    .catch(err => callback(err, null));
}

function verifyUser(email, callback) {
  query('UPDATE users SET verified = true, "verificationToken" = NULL WHERE email = $1', [email.toLowerCase()])
    .then(r => callback(null, r.rowCount > 0))
    .catch(err => callback(err, false));
}

async function getChats(callback) {
  try {
    const chats = (await query('SELECT DISTINCT c.* FROM chats c ORDER BY c."createdAt" DESC')).rows;
    if (chats.length === 0) return callback(null, []);
    const results = [];
    for (const chat of chats) {
      const msgs = (await query('SELECT "senderId", "senderName", txt, t FROM messages WHERE "chatId" = $1 ORDER BY "createdAt" ASC', [chat.id])).rows;
      results.push({
        id: chat.id, nm: chat.nm, ico: chat.ico,
        preview: msgs.length > 0 ? `${msgs[msgs.length - 1].senderName}: ${msgs[msgs.length - 1].txt.slice(0, 28)}${msgs[msgs.length - 1].txt.length > 28 ? '…' : ''}` : 'No messages yet',
        t: msgs.length > 0 ? msgs[msgs.length - 1].t : 'Just now',
        badge: 0, grp: chat.grp, grad: chat.grad, online: chat.online,
        msgs: msgs.map(m => ({ ...m, own: false })),
      });
    }
    callback(null, results);
  } catch (err) {
    callback(err, []);
  }
}

function addMessage(chatId, senderId, senderName, txt, callback) {
  const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  query('INSERT INTO messages ("chatId", "senderId", "senderName", txt, t) VALUES ($1, $2, $3, $4, $5) RETURNING id', [chatId, senderId, senderName, txt, t])
    .then(() => callback(null, { senderId, senderName, txt, t }))
    .catch(err => callback(err, null));
}

async function getPosts(page = 1, limit = 10, callback) {
  if (typeof page === 'function') { callback = page; page = 1; limit = 10; }
  if (typeof limit === 'function') { callback = limit; limit = 10; }
  const offset = (page - 1) * limit;
  try {
    const posts = (await query('SELECT * FROM posts ORDER BY "createdAt" DESC LIMIT $1 OFFSET $2', [limit, offset])).rows;
    if (posts.length === 0) return callback(null, [], false, 0);
    const total = (await query('SELECT COUNT(*) as count FROM posts')).rows[0].count;
    const results = [];
    for (const post of posts) {
      const likes = (await query('SELECT "userId" FROM post_likes WHERE "postId" = $1', [post.id])).rows;
      const comments = (await query('SELECT * FROM comments WHERE "postId" = $1 ORDER BY "createdAt" ASC', [String(post.id)])).rows;
      results.push({
        id: post.id, author: post.author, dept: post.dept, cat: post.cat,
        txt: post.txt, imageUrl: post.imageUrl || '',
        likes: likes.map(l => l.userId), liked: false,
        reposts: 0, reposted: false, repostedBy: [], comments: comments || [],
        t: formatTimeAgo(post.createdAt),
      });
    }
    callback(null, results, offset + posts.length < total, total);
  } catch (err) {
    callback(err, []);
  }
}

function createPost(author, dept, cat, txt, imageUrl, userId, callback) {
  query('INSERT INTO posts (author, dept, cat, txt, "imageUrl", "userId") VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
    [author, dept, cat, txt, imageUrl || '', userId])
    .then(r => callback(null, {
      id: r.rows[0].id, author, dept, cat, txt, imageUrl: imageUrl || '', userId,
      likes: [], liked: false, reposts: 0, reposted: false, repostedBy: [], comments: [], t: 'Just now',
    }))
    .catch(err => callback(err, null));
}

function toggleLike(postId, userId, callback) {
  query('SELECT 1 FROM post_likes WHERE "postId" = $1 AND "userId" = $2', [postId, userId])
    .then(r => {
      if (r.rows.length > 0) {
        return query('DELETE FROM post_likes WHERE "postId" = $1 AND "userId" = $2', [postId, userId])
          .then(() => callback(null, { liked: false, userId }));
      } else {
        return query('INSERT INTO post_likes ("postId", "userId") VALUES ($1, $2)', [postId, userId])
          .then(() => callback(null, { liked: true, userId }));
      }
    })
    .catch(err => callback(err, null));
}

function getActivePostCount(callback) {
  query('SELECT COUNT(*) as count FROM posts')
    .then(r => callback(null, r.rows[0]?.count || 0))
    .catch(err => callback(err, 0));
}

function getComments(callback) {
  query('SELECT * FROM comments ORDER BY "createdAt" ASC')
    .then(r => callback(null, r.rows || []))
    .catch(err => callback(err, []));
}

function addComment(postId, author, text, userId, callback) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  query('INSERT INTO comments ("postId", author, text, time, "userId") VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [postId, author, text, time, userId])
    .then(r => callback(null, { id: r.rows[0].id, postId, author, text, time, userId }))
    .catch(err => callback(err, null));
}

function deleteComment(commentId, userId, callback) {
  query('DELETE FROM comments WHERE id = $1 AND "userId" = $2', [commentId, userId])
    .then(r => callback(null, r.rowCount > 0))
    .catch(err => callback(err, false));
}

function toggleFollow(followerId, followingId, callback) {
  query('SELECT 1 FROM follows WHERE "followerId" = $1 AND "followingId" = $2', [followerId, followingId])
    .then(r => {
      if (r.rows.length > 0) {
        return query('DELETE FROM follows WHERE "followerId" = $1 AND "followingId" = $2', [followerId, followingId])
          .then(() => callback(null, { following: false }));
      } else {
        return query('INSERT INTO follows ("followerId", "followingId") VALUES ($1, $2)', [followerId, followingId])
          .then(() => callback(null, { following: true }));
      }
    })
    .catch(err => callback(err, null));
}

function getFollowCounts(userId, callback) {
  Promise.all([
    query('SELECT COUNT(*) as count FROM follows WHERE "followingId" = $1', [userId]),
    query('SELECT COUNT(*) as count FROM follows WHERE "followerId" = $1', [userId]),
  ])
    .then(([followers, following]) => callback(null, { followers: followers.rows[0]?.count || 0, following: following.rows[0]?.count || 0 }))
    .catch(err => callback(err, { followers: 0, following: 0 }));
}

function isFollowing(followerId, followingId, callback) {
  query('SELECT 1 FROM follows WHERE "followerId" = $1 AND "followingId" = $2', [followerId, followingId])
    .then(r => callback(null, r.rows.length > 0))
    .catch(err => callback(err, false));
}

function findUserByName(name, callback) {
  query('SELECT id, name, dept, lvl, hostel FROM users WHERE name = $1', [name])
    .then(r => callback(null, r.rows[0] || null))
    .catch(err => callback(err, null));
}

function getMutualFollowers(userId, callback) {
  query(`
    SELECT DISTINCT u.id, u.name, u.dept, u.lvl, u.hostel
    FROM follows f1
    JOIN follows f2 ON f1."followerId" = f2."followingId" AND f1."followingId" = f2."followerId"
    JOIN users u ON u.id = f1."followingId"
    WHERE f1."followerId" = $1 AND f1."followingId" != $1
  `, [userId])
    .then(r => callback(null, r.rows || []))
    .catch(err => callback(err, []));
}

function createChat(nm, ico, grad, grp, callback) {
  query('INSERT INTO chats (nm, ico, grad, grp) VALUES ($1, $2, $3, $4) RETURNING id', [nm, ico, grad, grp])
    .then(r => callback(null, { id: r.rows[0].id, nm, ico, grad, grp: !!grp }))
    .catch(err => callback(err, null));
}

function addChatParticipant(chatId, userId, callback) {
  query('INSERT INTO chat_participants ("chatId", "userId") VALUES ($1, $2) ON CONFLICT DO NOTHING', [chatId, userId])
    .then(() => callback(null))
    .catch(err => callback(err));
}

function findDmChat(userId1, userId2, callback) {
  query(`
    SELECT cp1."chatId" FROM chat_participants cp1
    JOIN chat_participants cp2 ON cp1."chatId" = cp2."chatId"
    JOIN chats c ON c.id = cp1."chatId"
    WHERE cp1."userId" = $1 AND cp2."userId" = $2 AND c.grp = false
  `, [userId1, userId2])
    .then(r => callback(null, r.rows[0]?.chatId || null))
    .catch(err => callback(err, null));
}

// ── Stories ──

function getStories(callback) {
  query('SELECT * FROM stories ORDER BY "createdAt" DESC')
    .then(r => callback(null, r.rows.map(s => ({ id: s.id, name: s.name, icon: s.icon || s.name[0], img: s.img, seen: false }))))
    .catch(err => callback(err, []));
}

function createStory(name, img, icon, userId, callback) {
  query('INSERT INTO stories (name, icon, img, "userId") VALUES ($1, $2, $3, $4) RETURNING id',
    [name, icon || name[0], img, userId])
    .then(r => callback(null, { id: r.rows[0].id, name, icon: icon || name[0], img, seen: false }))
    .catch(err => callback(err, null));
}

// ── Groups ──

async function getGroups(userId, callback) {
  try {
    const rows = (await query('SELECT * FROM groups_t ORDER BY "createdAt" DESC')).rows;
    if (rows.length === 0) return callback(null, []);
    const results = [];
    for (const g of rows) {
      const memRow = await query('SELECT COUNT(*) as cnt FROM group_members WHERE "groupId" = $1', [g.id]);
      const joinedRow = await query('SELECT 1 FROM group_members WHERE "groupId" = $1 AND "userId" = $2', [g.id, userId]);
      let depts = null;
      try { depts = JSON.parse(g.depts); } catch(e) {}
      results.push({
        id: g.id, nm: g.nm, type: g.type, cat: g.cat, desc: g.desc,
        mem: memRow.rows[0]?.cnt || 0, ico: g.ico, joined: joinedRow.rows.length > 0,
        depts, grad: g.grad,
      });
    }
    callback(null, results);
  } catch (err) {
    callback(err, []);
  }
}

function createGroup(nm, type, cat, desc, ico, grad, depts, userId, callback) {
  query('INSERT INTO groups_t (nm, type, cat, desc, ico, grad, depts, "userId") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
    [nm, type, cat, desc, ico, grad, JSON.stringify(depts), userId])
    .then(async (r) => {
      const id = r.rows[0].id;
      await query('INSERT INTO group_members ("groupId", "userId") VALUES ($1, $2)', [id, userId]);
      callback(null, { id, nm, type, cat, desc, mem: 1, ico, joined: true, depts, grad });
    })
    .catch(err => callback(err, null));
}

function toggleGroupJoin(groupId, userId, callback) {
  query('SELECT 1 FROM group_members WHERE "groupId" = $1 AND "userId" = $2', [groupId, userId])
    .then(r => {
      if (r.rows.length > 0) {
        return query('DELETE FROM group_members WHERE "groupId" = $1 AND "userId" = $2', [groupId, userId])
          .then(() => callback(null, { joined: false }));
      } else {
        return query('INSERT INTO group_members ("groupId", "userId") VALUES ($1, $2)', [groupId, userId])
          .then(() => callback(null, { joined: true }));
      }
    })
    .catch(err => callback(err, null));
}

// ── Events ──

async function getEvents(userId, callback) {
  try {
    const rows = (await query('SELECT * FROM events_t ORDER BY "createdAt" DESC')).rows;
    if (rows.length === 0) return callback(null, []);
    const results = [];
    for (const e of rows) {
      const attRow = await query('SELECT COUNT(*) as cnt FROM event_attendees WHERE "eventId" = $1', [e.id]);
      const attendRow = await query('SELECT "remindSet" FROM event_attendees WHERE "eventId" = $1 AND "userId" = $2', [e.id, userId]);
      results.push({
        id: e.id, title: e.title, ico: e.ico, day: e.day, mon: e.mon,
        time: e.time, loc: e.loc, desc: e.desc, att: attRow.rows[0]?.cnt || 0,
        going: attendRow.rows.length > 0, grad: e.grad, cat: e.cat,
        remind24h: false, remindDay: false, remindSet: attendRow.rows.length > 0 ? !!attendRow.rows[0].remindSet : false,
      });
    }
    callback(null, results);
  } catch (err) {
    callback(err, []);
  }
}

function createEvent(title, ico, day, mon, time, loc, desc, grad, cat, userId, callback) {
  query('INSERT INTO events_t (title, ico, day, mon, time, loc, desc, grad, cat, "userId") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id',
    [title, ico, day, mon, time, loc, desc, grad, cat || 'general', userId])
    .then(r => callback(null, {
      id: r.rows[0].id, title, ico, day, mon, time, loc, desc,
      att: 0, going: false, grad, cat: cat || 'general',
      remind24h: false, remindDay: false, remindSet: false,
    }))
    .catch(err => callback(err, null));
}

function toggleEventAttend(eventId, userId, remindSet, callback) {
  query('SELECT 1 FROM event_attendees WHERE "eventId" = $1 AND "userId" = $2', [eventId, userId])
    .then(r => {
      if (r.rows.length > 0) {
        return query('DELETE FROM event_attendees WHERE "eventId" = $1 AND "userId" = $2', [eventId, userId])
          .then(() => callback(null, { going: false }));
      } else {
        return query('INSERT INTO event_attendees ("eventId", "userId", "remindSet") VALUES ($1, $2, $3)', [eventId, userId, remindSet ? true : false])
          .then(() => callback(null, { going: true, remindSet: !!remindSet }));
      }
    })
    .catch(err => callback(err, null));
}

// ── Confessions ──

async function getConfessions(callback) {
  try {
    const rows = (await query('SELECT * FROM confessions ORDER BY "createdAt" DESC')).rows;
    if (rows.length === 0) return callback(null, []);
    const results = [];
    for (const c of rows) {
      const likes = (await query('SELECT "userId" FROM confession_likes WHERE "confessionId" = $1', [c.id])).rows;
      results.push({
        id: c.id, t: formatTimeAgo(c.createdAt), txt: c.txt,
        likes: likes.map(l => l.userId), liked: false,
      });
    }
    callback(null, results);
  } catch (err) {
    callback(err, []);
  }
}

function createConfession(txt, userId, callback) {
  query('INSERT INTO confessions (txt, "userId") VALUES ($1, $2) RETURNING id', [txt, userId])
    .then(r => callback(null, { id: r.rows[0].id, t: 'Just now', txt, likes: [], liked: false }))
    .catch(err => callback(err, null));
}

function toggleConfessionLike(confessionId, userId, callback) {
  query('SELECT 1 FROM confession_likes WHERE "confessionId" = $1 AND "userId" = $2', [confessionId, userId])
    .then(r => {
      if (r.rows.length > 0) {
        return query('DELETE FROM confession_likes WHERE "confessionId" = $1 AND "userId" = $2', [confessionId, userId])
          .then(() => callback(null, { liked: false, userId }));
      } else {
        return query('INSERT INTO confession_likes ("confessionId", "userId") VALUES ($1, $2)', [confessionId, userId])
          .then(() => callback(null, { liked: true, userId }));
      }
    })
    .catch(err => callback(err, null));
}

// ── Memes ──

function getMemes(callback) {
  query('SELECT * FROM memes_t ORDER BY "createdAt" DESC')
    .then(r => callback(null, r.rows.map(m => ({ id: m.id, ico: m.ico, cap: m.cap, likes: m.likes, url: m.url }))))
    .catch(err => callback(err, []));
}

function createMeme(ico, cap, url, userId, callback) {
  query('INSERT INTO memes_t (ico, cap, url, "userId") VALUES ($1, $2, $3, $4) RETURNING id', [ico, cap, url, userId])
    .then(r => callback(null, { id: r.rows[0].id, ico, cap, likes: 0, url }))
    .catch(err => callback(err, null));
}

function toggleMemeLike(memeId, userId, callback) {
  query('SELECT 1 FROM meme_likes WHERE "memeId" = $1 AND "userId" = $2', [memeId, userId])
    .then(r => {
      if (r.rows.length > 0) {
        return query('DELETE FROM meme_likes WHERE "memeId" = $1 AND "userId" = $2', [memeId, userId])
          .then(() => query('UPDATE memes_t SET likes = GREATEST(0, likes - 1) WHERE id = $1', [memeId]))
          .then(() => callback(null, { liked: false }));
      } else {
        return query('INSERT INTO meme_likes ("memeId", "userId") VALUES ($1, $2)', [memeId, userId])
          .then(() => query('UPDATE memes_t SET likes = likes + 1 WHERE id = $1', [memeId]))
          .then(() => callback(null, { liked: true }));
      }
    })
    .catch(err => callback(err, null));
}

// ── Polls ──

async function getPolls(userId, callback) {
  try {
    const rows = (await query('SELECT * FROM polls_t ORDER BY "createdAt" DESC')).rows;
    if (rows.length === 0) return callback(null, []);
    const results = [];
    for (const p of rows) {
      const opts = (await query('SELECT * FROM poll_options WHERE "pollId" = $1 ORDER BY id ASC', [p.id])).rows;
      const voteRow = (await query('SELECT "optionId" FROM poll_votes WHERE "pollId" = $1 AND "userId" = $2', [p.id, userId])).rows;
      results.push({
        id: p.id, q: p.q,
        opts: opts.map(o => ({ id: o.id, l: o.l, v: o.v })),
        voted: voteRow.length > 0 ? voteRow[0].optionId : null,
      });
    }
    callback(null, results);
  } catch (err) {
    callback(err, []);
  }
}

function createPoll(q, options, userId, callback) {
  query('INSERT INTO polls_t (q, "userId") VALUES ($1, $2) RETURNING id', [q, userId])
    .then(async (r) => {
      const pollId = r.rows[0].id;
      const opts = [];
      for (const l of options) {
        const res = await query('INSERT INTO poll_options ("pollId", l, v) VALUES ($1, $2, 0) RETURNING id', [pollId, l]);
        opts.push({ id: res.rows[0].id, l, v: 0 });
      }
      callback(null, { id: pollId, q, opts, voted: null });
    })
    .catch(err => callback(err, null));
}

function votePoll(pollId, optionId, userId, callback) {
  query('SELECT 1 FROM poll_votes WHERE "pollId" = $1 AND "userId" = $2', [pollId, userId])
    .then(r => {
      if (r.rows.length > 0) {
        return callback(null, { voted: null, already: true });
      }
      return query('INSERT INTO poll_votes ("pollId", "optionId", "userId") VALUES ($1, $2, $3)', [pollId, optionId, userId])
        .then(() => query('UPDATE poll_options SET v = v + 1 WHERE id = $1', [optionId]))
        .then(() => callback(null, { voted: optionId }));
    })
    .catch(err => callback(err, null));
}

// ── Notifications ──

function getNotifications(userId, callback) {
  query('SELECT * FROM notifications WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 50', [userId])
    .then(r => callback(null, r.rows.map(n => ({
      id: n.id, type: n.type, message: n.message,
      read: n.read, time: formatTimeAgo(n.createdAt),
      userId: n.userId, postId: n.postId,
    }))))
    .catch(err => callback(err, []));
}

function createNotification(type, message, userId, postId, callback) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  query('INSERT INTO notifications (type, message, read, time, "userId", "postId") VALUES ($1, $2, false, $3, $4, $5) RETURNING id',
    [type, message, time, userId, postId || null])
    .then(r => callback(null, { id: r.rows[0].id, type, message, read: false, time, userId, postId }))
    .catch(err => callback(err, null));
}

function markNotifRead(notifId, callback) {
  query('UPDATE notifications SET read = true WHERE id = $1', [notifId])
    .then(() => callback(null))
    .catch(err => callback(err));
}

function markAllNotifRead(userId, callback) {
  query('UPDATE notifications SET read = true WHERE "userId" = $1', [userId])
    .then(() => callback(null))
    .catch(err => callback(err));
}

function sanitizeUser(user) {
  if (!user) return user;
  const copy = { ...user };
  delete copy.password;
  return copy;
}

module.exports = {
  db: pool,
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
