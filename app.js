let user = null;
let socket = null;

async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
    ...opts,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || res.statusText || 'Request failed');
  }
  return data;
}

function initSocket() {
  if (!window.io || socket) return;
  socket = io();

  socket.on('connect', () => {
    if (user) {
      socket.emit('join', { id: user.id, name: user.name, email: user.email });
    }
  });

  socket.on('chat:message', (data) => {
    if (activeChat && data.chatId === activeChat.id) {
      const msg = { ...data.msg, own: data.msg.senderId === user?.id };
      if (!activeChat.msgs) activeChat.msgs = [];
      activeChat.msgs.push(msg);
      renderMessages(activeChat);
    }
    // Update chat list preview
    const chat = chatList.find(c => c.id === data.chatId);
    if (chat) {
      chat.preview = `${data.msg?.senderName || 'Someone'}: ${(data.msg?.txt || '').slice(0, 28)}${data.msg?.txt?.length > 28 ? '…' : ''}`;
      chat.t = 'Just now';
      renderChatList();
    }
    if (!activeChat || data.chatId !== activeChat.id) {
      toast(`📩 New message: ${data.msg?.senderName || 'Someone'}`);
    }
  });

  socket.on('chat:error', (err) => {
    toast(`⚠️ ${err?.message || 'Chat error'}`);
  });
}

let activeChat = null;
let chatList = [];

async function loadChatData() {
  try {
    const data = await api('/api/chats');
    chatList = data.chats || [];
    renderChatList();
  } catch (e) {
    console.error('[CHAT] Failed to load:', e);
  }
}

function renderChatList() {
  const el = document.getElementById('chat-list');
  if (!el) return;
  el.innerHTML = chatList.map(c => `
    <div class="cli${activeChat && activeChat.id === c.id ? ' on' : ''}" onclick="selectChat(${c.id})">
      <div class="cli-av" style="background:${c.grad || '#4f7fff'}">${c.ico || '💬'}</div>
      <div class="cli-nfo">
        <div class="cli-nm">${c.nm}</div>
        <div class="cli-pr">${c.preview || 'No messages yet'}</div>
      </div>
      <div class="cli-rt">
        <div class="cli-t">${c.t || ''}</div>
        ${c.badge ? `<div class="cbadge">${c.badge}</div>` : ''}
      </div>
    </div>`).join('');
}

function selectChat(chatId) {
  const chat = chatList.find(c => c.id === chatId);
  if (!chat) return;

  if (activeChat && socket) {
    socket.emit('chat:leave', { chatId: activeChat.id });
  }

  activeChat = chat;
  renderChatList();

  document.getElementById('chat-placeholder').style.display = 'none';
  const active = document.getElementById('chat-active');
  active.style.display = 'flex';

  document.getElementById('chd-av').textContent = chat.ico || '💬';
  document.getElementById('chd-av').style.background = chat.grad || '#4f7fff';
  document.getElementById('chd-nm').textContent = chat.nm;
  document.getElementById('chd-st').textContent = chat.online || '1 online';

  renderMessages(chat);

  if (socket) {
    socket.emit('chat:join', { chatId: chat.id });
  }

  document.getElementById('chat-inp').focus();
}

function renderMessages(chat) {
  const el = document.getElementById('chat-msgs');
  if (!el) return;
  el.innerHTML = (chat.msgs || []).map(m => {
    const isOwn = m.own || (user && m.senderId === user.id);
    return `
      <div class="msg-r${isOwn ? ' own' : ''}">
        ${!isOwn ? `<div class="msg-av2" style="background:${grad(m.senderName) || '#4f7fff'}">${ini(m.senderName)}</div>` : ''}
        <div class="bubble">
          ${!isOwn ? `<div class="msg-nm">${m.senderName}</div>` : ''}
          ${m.txt}
          <div class="msg-time">${m.t || ''}</div>
        </div>
      </div>`;
  }).join('');
  el.scrollTop = el.scrollHeight;
}

function sendMessage() {
  const inp = document.getElementById('chat-inp');
  const txt = inp.value.trim();
  if (!txt || !activeChat || !socket) return;

  socket.emit('chat:message', { chatId: activeChat.id, msg: { txt } });

  const optimistic = {
    senderId: user?.id || 0,
    senderName: user?.name || 'You',
    txt,
    t: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    own: true,
  };

  if (!activeChat.msgs) activeChat.msgs = [];
  activeChat.msgs.push(optimistic);
  renderMessages(activeChat);
  inp.value = '';
}

const GRADS = [
  'linear-gradient(135deg,#1a56ff,#5b7fff)',
  'linear-gradient(135deg,#f04040,#f59500)',
  'linear-gradient(135deg,#8b5cf6,#06b6d4)',
  'linear-gradient(135deg,#00c27a,#1a56ff)',
  'linear-gradient(135deg,#f59500,#f04040)',
  'linear-gradient(135deg,#06b6d4,#8b5cf6)',
];
const grad = n => { let h=0; for(let c of n) h=(h*31+c.charCodeAt(0))%GRADS.length; return GRADS[h]; };
const ini = n => n.split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase();

const DB = {
posts:[
  {id:1,author:'Olawuyi Oluwaseun',dept:'IT · 300L',t:'2 min ago',cat:'sports',txt:'PSG please 😭 the world is behind you right now… if you lose this UCL final I\'m going to be sad fr fr 🏆⚽',likes:412,comments:89,liked:false,reposts:0,reposted:false,repostedBy:[]},
  {id:2,author:'Fagboy',dept:'Mass Comm · 200L',t:'1 hr ago',cat:'sports',txt:'If Arsenal win the UCL just kill me 💀 I cannot survive seeing it happen. I\'ve suffered since 2020 and I\'m not ready for this 😭❤️',likes:567,comments:134,liked:false,reposts:0,reposted:false,repostedBy:[]},
  {id:3,author:'Ogunsola Dapo',dept:'Engineering · 200L',t:'2 hrs ago',cat:'gist',txt:'The BUSA elections are looking wild 😂 UZOMA4SPORTS really came with the energy this year. What y\'all think?',likes:218,comments:67,liked:false,reposts:0,reposted:false,repostedBy:[]},
  {id:4,author:'Osakioduwa Elisha',dept:'Software Engineering · 400L',t:'3 hrs ago',cat:'hostel',txt:'⚡ Winslow HALL UPDATE: Power is BACK in Block C! It\'s been 3 days, the gen is finally fixed. Update your assignments fam — we move!',likes:189,comments:43,liked:false,reposts:0,reposted:false,repostedBy:[]},
  {id:5,author:'Ememanka Chiemela',dept:'Unknown · 300L',t:'5 hrs ago',cat:'events',txt:'🏥 Free medical outreach this sunday in front of Caf ! Blood pressure check,  and health counselling. Bring your people! #BabcockMed',likes:312,comments:28,liked:false,reposts:0,reposted:false,repostedBy:[]},
  {id:6,author:'Emmanuel Ewedu',dept:'Economics · 200L',t:'6 hrs ago',cat:'academics',txt:'Does anyone have the Linux tutorial notes from last semester? Lecturer just announced a test for next week 😰 Please help a guy out 🙏',likes:8,comments:34,liked:false,reposts:0,reposted:false,repostedBy:[]},
  {id:7,author:'precious ugo',dept:'Business Admin · 400L',t:'8 hrs ago',cat:'academics',txt:'🎓 JUST FINISHED MY FINAL YEAR PROJECT! 4 years of stress, tears, and late nights. WE MADE IT! To every 400L student still grinding — you\'re almost there 💪',likes:644,comments:91,liked:false,reposts:0,reposted:false,repostedBy:[]},
],
groups:[
  {id:1,nm:'Computer Science Dept 🖥️',type:'Department',desc:'Official dept group for all CS students. Announcements, resources, and academic discussions.',mem:842,ico:'🖥️',joined:true,grad:'linear-gradient(135deg,rgba(26,86,255,.5),rgba(0,194,122,.35))'},
  {id:2,nm:'winslow Hall 🏠',type:'Hostel',desc:'Residents of winslow Hall. Power updates, lost & found, hostel life discussions.',mem:213,ico:'🏠',joined:true,grad:'linear-gradient(135deg,rgba(240,64,64,.5),rgba(245,149,0,.35))'},
  {id:3,nm:'BUCC ⚡',type:'Club',desc:'Building, shipping, learning together. Weekly hackathons, tech talks, and industry links.',mem:156,ico:'⚡',joined:true,grad:'linear-gradient(135deg,rgba(139,92,246,.5),rgba(6,182,212,.35))'},
  {id:4,nm:'Law Students Forum ⚖️',type:'Department',desc:'For all Law students. Moot court updates, case study discussions, and career advice.',mem:601,ico:'⚖️',joined:false,grad:'linear-gradient(135deg,rgba(0,194,122,.5),rgba(26,86,255,.35))'},
  {id:5,nm:'CS 300 Study Group 📚',type:'Course',desc:'Notes, study sessions, and exam prep for all CSC 300 level students.',mem:98,ico:'📚',joined:true,grad:'linear-gradient(135deg,rgba(245,149,0,.5),rgba(240,64,64,.35))'},
  {id:6,nm:'Babcock Chess Club ♟️',type:'Club',desc:'Weekly chess sessions at the student centre. All skill levels welcome!',mem:47,ico:'♟️',joined:false,grad:'linear-gradient(135deg,rgba(6,182,212,.5),rgba(139,92,246,.35))'},
],
events:[
  {id:1,title:'BU Hackathon 💻',ico:'💻',day:'15',mon:'JUN',time:'9:00 AM',loc:'Tech Hub Building',desc:'24-hour coding marathon. Build, deploy, and win amazing prizes. Free meals provided!',att:340,going:false,grad:'linear-gradient(135deg,rgba(26,86,255,.5),rgba(0,194,122,.35))',remind24h:false,remindDay:false,remindSet:false},
  {id:2,title:'Freshers Fair 🎉',ico:'🎉',day:'20',mon:'SEP',time:'4:00 PM',loc:'University Stadium',desc:'Welcome to Babcock! Meet clubs, societies, and campus organizations. Food, music, and games!',att:890,going:true,grad:'linear-gradient(135deg,rgba(245,149,0,.5),rgba(240,64,64,.3))',remind24h:false,remindDay:false,remindSet:false},
  {id:3,title:'Graduation Day 🎓',ico:'🎓',day:'12',mon:'OCT',time:'10:00 AM',loc:'The Amphitheatre',desc:'Celebrating our graduating class. Gowns, speeches, and new beginnings for the future leaders.',att:1250,going:false,grad:'linear-gradient(135deg,rgba(139,92,246,.5),rgba(6,182,212,.35))',remind24h:false,remindDay:false,remindSet:false},
  {id:4,title:'Best of 200L Final ⚽',ico:'⚽',day:'28',mon:'MAY',time:'3:00 PM',loc:'University Stadium',desc:'The ultimate intramural showdown! Who will be crowned the best department in 200L?',att:420,going:false,grad:'linear-gradient(135deg,rgba(0,194,122,.5),rgba(26,86,255,.3))',cat:'sports',remind24h:false,remindDay:false,remindSet:false},
],
chats:[
  {id:0,nm:'CSC 300 Group 🖥️',ico:'🖥️',preview:'Temi: Anyone have the ML notes?',t:'2m',badge:4,grp:true,grad:'linear-gradient(135deg,#1a56ff,#00c27a)',online:'12 online',
    msgs:[
      {s:'Temitope',txt:'Good morning! Anyone have the ML lecture slides?',t:'8:02 AM',own:false},
      {s:'Chidera',txt:'Think Adeyinka has them',t:'8:10 AM',own:false},
      {s:'You',txt:'Yeah I have them, uploading now 📎',t:'8:12 AM',own:true},
      {s:'Temitope',txt:'You are an absolute legend ❤️',t:'8:13 AM',own:false},
      {s:'Emmanuel',txt:'Test is confirmed for next Thursday btw — Dr. Eze just posted',t:'9:45 AM',own:false},
      {s:'You',txt:'Next THURSDAY?? I thought it was the week after 😭',t:'9:46 AM',own:true},
      {s:'Chidera',txt:'Library study session? 4PM today?',t:'10:02 AM',own:false},
    ]
  },
  {id:1,nm:'Chidera Okonkwo',ico:'⚖️',preview:'You: See you at chapel!',t:'1h',badge:0,grp:false,grad:'linear-gradient(135deg,#f04040,#f59500)',online:'● Online',
    msgs:[
      {s:'Chidera',txt:'Are you coming to the moot court prep session today?',t:'11:00 AM',own:false},
      {s:'You',txt:"Can't make it — I have a lab session clash 😬",t:'11:05 AM',own:true},
      {s:'Chidera',txt:"No worries! I'll share the notes after",t:'11:07 AM',own:false},
      {s:'You',txt:'See you at chapel! ✝️',t:'12:30 PM',own:true},
    ]
  },
  {id:2,nm:'Winslow Hall 🏠',ico:'🏠',preview:'Light is out in block C 😭',t:'3h',badge:12,grp:true,grad:'linear-gradient(135deg,#8b5cf6,#06b6d4)',online:'38 online',
    msgs:[
      {s:'Block C Rep',txt:'POWER OUT in Block C 😭 Contacting facilities now',t:'7:30 AM',own:false},
      {s:'Hall Coord.',txt:'Aware. Generator team has been notified.',t:'8:00 AM',own:false},
      {s:'You',txt:"It's been 2 days now — this needs escalation",t:'9:00 AM',own:true},
      {s:'Hall Coord.',txt:'⚡ UPDATE: Power restored as of 2PM. Report any issues.',t:'2:05 PM',own:false},
    ]
  },
  {id:3,nm:'BUCC Execs ⚡',ico:'⚡',preview:'Meeting moved to Friday 5PM',t:'Tue',badge:0,grp:true,grad:'linear-gradient(135deg,#00c27a,#1a56ff)',online:'5 online',
    msgs:[
      {s:'President',txt:'Tech Night planning — this Saturday?',t:'Mon 3PM',own:false},
      {s:'You',txt:'Saturday works for me!',t:'Mon 3:30PM',own:true},
      {s:'VP',txt:'Same. What time?',t:'Mon 4PM',own:false},
      {s:'President',txt:"Let's do Friday 5PM — avoids clash with social night",t:'Tue 9AM',own:false},
    ]
  },
],
confs:[
  {id:1,t:'15 min ago',txt:"I have been attending the wrong tutorial class for 3 weeks. I thought I was getting smarter — turns out I was studying a completely different course 💀",likes:312,liked:false},
  {id:2,t:'1 hr ago',txt:"There is someone in my department whose voice I have been in love with for 2 entire years and we have never once spoken. Every time they answer questions in class I lose all focus on the lecture.",likes:187,liked:false},
  {id:3,t:'3 hrs ago',txt:"The jollof rice in Elijah Hall on Thursdays is genuinely top 5 meals of my life. I go there even though I don't live there. I am not ashamed and I will not apologise.",likes:445,liked:false},
  {id:4,t:'5 hrs ago',txt:"I failed my first exam in 100L and cried for 2 straight days. Then I made the Dean's List in 200L. If you are struggling right now — it does not stay this way. Keep going.",likes:892,liked:false},
],
memes:[
  {ico:'😡',cap:'This whole elections were rigged',likes:2847,type:'gif',url:'https://media4.giphy.com/media/8rT2k19HNjhImz6bwP/giphy.gif'},
  {ico:'🎤',cap:'abeg so we no get social director?? 😂😂',likes:1923,type:'gif',url:'https://media0.giphy.com/media/ouEIsl1nsBjUpMbfxm/giphy.gif'},
  {ico:'📋',cap:'How do you lose an unopposed election 😂💀',likes:3102,type:'gif',url:'https://media1.giphy.com/media/DmCq5rJEk6phhv4WSz/giphy.gif'},
  {ico:'😭',cap:'So after everything Angel no win Gensec',likes:2456,type:'gif',url:'https://media4.giphy.com/media/4QA4DlNNe6NHMSNqrO/giphy.gif'},
  {ico:'⌨️',cap:'Me at 11:59PM submitting a 3,000-word essay I started at 11:30PM',likes:832,type:'gif',url:'https://media4.giphy.com/media/gwhneLWxsHkaCyRj4n/giphy.gif'},
  {ico:'🍚',cap:'Me when I hear jollof rice is on the menu at the dining hall',likes:1024,type:'gif',url:'https://media4.giphy.com/media/FP7pLBvhnV3jBvUW7j/giphy.gif'},
  {ico:'💡',cap:'NEPA taking light during my 4-hour exam-prep study marathon',likes:743,type:'gif',url:'https://media2.giphy.com/media/F7MTsSTtFx17fQHlrN/giphy.gif'},
  {ico:'🙏',cap:'Me explaining to God exactly why that carryover needs to disappear',likes:567,type:'gif',url:'https://media4.giphy.com/media/QXp6l0FH4QOUYfXIH1/giphy.gif'},
  {ico:'😴',cap:'When lecturer finally says "you can go" after a 3-hour lecture',likes:921,type:'gif',url:'https://media1.giphy.com/media/MlpBNQVcc5GX9RhyFP/giphy.gif'},
  {ico:'📝',cap:'When you realize the test is TODAY and not NEXT WEEK',likes:756,type:'gif',url:'https://media3.giphy.com/media/iiIpe7ejuBbAfgyMPl/giphy.gif'},
  {ico:'📱',cap:'Group project: 1 person does the work, 10 people say "nice one guys"',likes:678,type:'gif',url:'https://media4.giphy.com/media/2d400VBPJbxaU/giphy.gif'},
  {ico:'🎓',cap:'When you finally pass that course you failed 3 times',likes:1456,type:'gif',url:'https://media4.giphy.com/media/f2PSqb4ZkIWYZGp0ZY/giphy.gif'},
],
polls:[
  {id:1,q:'Best Busa shop?',opts:[{l:'Big Meals',v:412},{l:'Flakky Ventures',v:318},{l:'Busa House',v:234},{l:'All busa food are ass',v:189}],voted:null},
  {id:2,q:'Best Babcock TikToker?',opts:[{l:'Aliana',v:534},{l:'Mazi Abraham',v:421},{l:'Valentino',v:289},{l:'Caris',v:156}],voted:null},
  {id:3,q:'Favourite Kiss Spot?',opts:[{l:'Amphitheater',v:312},{l:'SAT',v:201},{l:'Queen Esther',v:178},{l:'Busa Hut',v:145}],voted:null},
],
trending:[
  {tag:'#BUSA Elections 🗳️',cnt:'1.2K posts'},{tag:'#UZOMA4SPORTS ⚽',cnt:'847 posts'},
  {tag:'#UCL Final 🏆',cnt:'634 posts'},{tag:'#RIGGED 🚨',cnt:'521 posts'},
],
suggs:[
  {nm:'Odiakaose Itohan',dept:'Public Health · 300L',flw:false},
  {nm:'Gbadebo Oluwamisimi',dept:'Software Engineering · 400L',flw:false},
  {nm:'Irondi Excel',dept:' Software Engineering · 400L',flw:false},
],
mod:[
  {id:1,txt:'Post contains targeted language against a named student…',rep:'Reported by 4 users',type:'Hate Speech'},
  {id:2,txt:'Confession may contain identifiable info about another student…',rep:'Auto-flagged by content filter',type:'Privacy Concern'},
  {id:3,txt:'Unauthorized commercial promotion disguised as an event post…',rep:'Reported by 2 users',type:'Spam / Commercial'},
],
};

function switchTab(t){
  document.getElementById('t-login').classList.toggle('on',t==='login');
  document.getElementById('t-reg').classList.toggle('on',t==='reg');
  document.getElementById('f-login').style.display=t==='login'?'block':'none';
  document.getElementById('f-reg').style.display=t==='reg'?'block':'none';
}
async function doLogin(){
  const em=document.getElementById('l-email').value.trim();
  const pw=document.getElementById('l-pass').value;
  if(!em||!pw){toast('⚠️ Fill in all fields');return}
  if(!em.includes('@')){toast('❌ Enter a valid email');return}
  try {
    const data = await api('/api/login',{method:'POST',body:JSON.stringify({email:em,password:pw})});
    user = data.user;
    boot();
  } catch (error) {
    toast(`❌ ${error.message}`);
  }
}
function doRegister(){
  const nm=document.getElementById('r-name').value.trim();
  const em=document.getElementById('r-email').value.trim();
  const dept=document.getElementById('r-dept').value;
  const lvl=document.getElementById('r-lvl').value;
  const pw=document.getElementById('r-pass').value;
  if(!nm||!em||!dept||!lvl||!pw){toast('⚠️ Fill in all required fields');return}
  if(!em.includes('@student.babcock.edu.ng')){toast('❌ Only @student.babcock.edu.ng emails allowed');return}
  api('/api/register',{method:'POST',body:JSON.stringify({name:nm,email:em,dept:dept,lvl:lvl,hostel:document.getElementById('r-hostel').value||'Off Campus',password:pw})})
    .then((data)=>{
      user=data.user;
      toast('🎉 Account created! Logging in now...');
      boot();
    })
    .catch((error)=>toast(`❌ ${error.message}`));
}
function doLogout(){
  user=null;
  if(socket){ socket.disconnect(); socket=null; }
  document.getElementById('auth').style.display='flex';
  document.getElementById('app').style.display='none';
}
function boot(){
  document.getElementById('auth').style.display='none';
  document.getElementById('app').style.display='block';
  const av=ini(user.name);
  ['tb-av','sm-av','comp-av','prof-av'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=av});
  document.getElementById('sm-name').textContent=user.name;
  document.getElementById('sm-dept').textContent=`${user.dept.split(' ')[0]} · ${user.lvl}L`;
  document.getElementById('prof-nm').textContent=user.name;
  document.getElementById('prof-dept').textContent=`${user.dept} · ${user.lvl} Level · ${user.hostel}`;
  const bioEl=document.getElementById('prof-bio');
  if(bioEl)bioEl.textContent=`${user.name} — ${user.dept} student | Babcock '26`;
  if(user.email==='admin.babcock.edu.ng'){
    document.getElementById('n-admin').style.display='';
  }else{
    document.getElementById('n-admin').style.display='none';
  }
  const hour=new Date().getHours();
  const greet=hour<12?`Good morning, ${user.name.split(' ')[0]}`:hour<17?`Good afternoon, ${user.name.split(' ')[0]}`:`Good evening, ${user.name.split(' ')[0]}`;
  const greetEl=document.getElementById('greeting-bar');
  if(greetEl){
    greetEl.innerHTML=`<div class="greet-text">${greet} ✨</div><div class="greet-sub">Here's what's happening on campus today</div>`;
  }
  renderAll();startCD();go('feed');
  initSocket();
  loadChatData();
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMemeModal()});
  scheduleReminders();
  if(typeof applyEmojis==='function')setTimeout(applyEmojis,100);
  setTimeout(()=>{
    document.querySelectorAll('#feed-posts .post').forEach((p,i)=>{
      p.style.opacity='0';p.style.transform='translateY(8px)';
      setTimeout(()=>{p.style.transition='all .35s cubic-bezier(.22,.61,.36,1)';p.style.opacity='1';p.style.transform='translateY(0)'},i*60);
    });
  },100);
}

function go(pg,data){
  if(pg==='admin'&&user.email!=='admin.babcock.edu.ng'){toast('🚫 Access denied');return;}
  document.querySelectorAll('.pg').forEach(p=>p.classList.remove('on'));
  document.querySelectorAll('.nav').forEach(n=>n.classList.remove('on'));
  const p=document.getElementById('pg-'+pg);if(p)p.classList.add('on');
  const n=document.getElementById('n-'+pg);if(n)n.classList.add('on');
  if(pg==='profile'&&data)openProfile(data);
}

function openMyProfile(){
  go('profile',{name:user.name,dept:`${user.dept} · ${user.lvl} Level · ${user.hostel}`,bio:`${user.name} — ${user.dept} student | Babcock '26`});
}

function openProfileFromPost(el){
  const name=el.getAttribute('data-author');
  const dept=el.getAttribute('data-dept');
  openProfile({name,dept});
}

function getUserPosts(name){
  return DB.posts.filter(p=>p.author===name||p.repostedBy?.includes(name));
}

function openProfile(u){
  const isMe=user&&u.name===user.name;
  const av=ini(u.name);
  document.getElementById('prof-av').textContent=av;
  document.getElementById('prof-av').style.background=grad(u.name);
  document.getElementById('prof-nm').textContent=u.name;
  document.getElementById('prof-dept').textContent=u.dept||'';
  const bioEl=document.getElementById('prof-bio');
  if(bioEl)bioEl.textContent=u.bio||`${u.name} — Babcock University`;
  const posts=getUserPosts(u.name);
  document.getElementById('p-posts').textContent=posts.length;
  renderProfPostsForUser(posts,u.name);
  const editBtn=document.getElementById('prof-edit-btn');
  if(editBtn){
    editBtn.textContent=isMe?'✏️ Edit Profile':'➕ Follow';
    editBtn.onclick=isMe?()=>toast('✏️ Edit profile — coming soon!'):()=>toast(`👤 Following ${u.name}!`);
  }
  go('profile');
}

function renderProfPostsForUser(posts,profileName){
  const ct=document.getElementById('prof-posts');if(!ct)return;
  ct.innerHTML=posts.length?posts.map(p=>{
    const isRepost=p.repostedBy?.includes(profileName);
    return `
    <div class="post${isRepost?' reposted-post':''}" id="post-${p.id}">
      ${isRepost?`<div class="repost-label">🔁 Reposted</div>`:''}
      <div class="post-hd">
        <div class="post-av" style="background:${grad(p.author)}" data-author="${p.author}" data-dept="${p.dept}" onclick="openProfileFromPost(this)">${ini(p.author)}</div>
        <div class="post-meta">
          <div class="post-nm" data-author="${p.author}" data-dept="${p.dept}" onclick="openProfileFromPost(this)">${p.author}</div>
          <div class="post-sub"><span>${p.dept}</span>·<span>${p.t}</span></div>
        </div>
      </div>
      <div class="post-body">${p.txt}</div>
      <div class="post-ft">
        <div class="pact${p.liked?' liked':''}" onclick="likePost(${p.id})">
          ${p.liked?'❤️':'🤍'}<span>${p.likes}</span>
        </div>
        <div class="pact" onclick="toast('💬 Comments')">💬<span>${p.comments}</span></div>
        <div class="pact${p.reposted?' reposted':''}" onclick="repostPost(${p.id})">🔁<span>${p.reposts||0}</span></div>
        <div class="pact" onclick="toast('🔗 Link copied!')">🔗 Share</div>
      </div>
    </div>`;
  }).join(''):'<div style="text-align:center;padding:40px;color:var(--sub)">No posts yet</div>';
}

function renderAll(){
  renderStories();renderFeed(DB.posts);renderProfPosts();
  renderGroups();renderEvents();
  renderConfs();renderMemes();renderPolls();
  renderTrending();renderSuggs();renderAdmin();renderPulse();
  if(typeof applyEmojis==='function')setTimeout(applyEmojis,50);
}

function updateHallOptions(){
  const g=document.getElementById('r-gender')?.value;
  const h=document.getElementById('r-hostel');
  h.innerHTML='<option value="">Select hostel...</option>';
  const male=['Winslow','Neal Wilson','Samuel Akande','Gideon Troopers','Bethel Splendor','Nelson Mandela'];
  const female=['Queen Esther','Crystal Hall','Diamond Hall','Platinum Hall','Sapphire Hall','Havillah Gold'];
  (g==='Male'?male:g==='Female'?female:[]).forEach(n=>{
    const o=document.createElement('option');o.value=n;o.textContent=n;h.appendChild(o);
  });
}
function renderStories(){
  const stories=[
    {nm:'Add yours',ico:'➕',add:true},
    {nm:'TechClub',ico:'⚡',img:'https://babcock.edu.ng/storage/media/ef9f8e34-6a38-4362-b664-45095ae61f79.jpg',seen:false},
    {nm:'Chapel',ico:'✝️',img:'https://babcock.edu.ng/storage/media/63e16067-cdb8-4c97-80eb-1fad80a68d9f.jpg',seen:false},
    {nm:'Events',ico:'📅',img:'https://babcock.edu.ng/storage/media/international-sabbath.jpg',seen:true},
  ];
  document.getElementById('story-row').innerHTML=stories.map(s=>{
    if(s.add) return `<div class="story" onclick="toast('📸 Stories — Phase 3!')">
      <div class="story-add"><div class="plus">+</div><div class="plus-label">Add Story</div></div>
    </div>`;
    return `<div class="story${s.seen?' seen':''}" onclick="toast('📸 Viewing ${s.nm} story…')">
      <div class="story-bg">
        <div class="story-gradient" style="background-image:url('${s.img}');background-size:cover;background-position:center"></div>
        <div class="story-overlay"></div>
      </div>
      <div class="story-icon">${s.ico}</div>
      <div class="story-label">${s.nm}</div>
    </div>`;
  }).join('');
}

function renderFeed(posts){renderPostList(posts,'feed-posts')}
function renderProfPosts(){renderPostList(DB.posts.slice(0,3),'prof-posts')}
function renderPostList(posts,cid){
  const ct=document.getElementById(cid);if(!ct)return;
  const cats={general:'',academics:'academics',hostel:'hostel',gist:'gist',events:'events',confession:'confession',meme:'meme',sports:'sports'};
  ct.innerHTML=posts.map(p=>`
    <div class="post" id="post-${p.id}">
      <div class="post-hd">
        <div class="post-av" style="background:${grad(p.author)}" data-author="${p.author}" data-dept="${p.dept}" onclick="openProfileFromPost(this)">${ini(p.author)}</div>
        <div class="post-meta">
          <div class="post-nm" data-author="${p.author}" data-dept="${p.dept}" onclick="openProfileFromPost(this)">${p.author}</div>
          <div class="post-sub">
            <span>${p.dept}</span>·<span>${p.t}</span>
            ${p.cat!=='general'?`<span class="cat-tag ${cats[p.cat]||''}">${p.cat}</span>`:''}
          </div>
        </div>
        <div class="more-btn" onclick="toast('🚩 Report/block options')">···</div>
      </div>
      <div class="post-body">${p.txt}</div>
      <div class="post-ft">
        <div class="pact${p.liked?' liked':''}" onclick="likePost(${p.id})">
          ${p.liked?'❤️':'🤍'}<span id="lc-${p.id}">${p.likes}</span>
        </div>
        <div class="pact" onclick="toast('💬 Comments — coming soon!')">💬<span>${p.comments}</span></div>
        <div class="pact${p.reposted?' reposted':''}" onclick="repostPost(${p.id})">🔁<span>${(p.reposts||0)+(p.reposted?1:0)}</span></div>
        <div class="pact" onclick="toast('🔗 Link copied!')">🔗 Share</div>
        <div class="pact${p.saved?' saved':''}" onclick="toast('🔖 Saved!')">🔖</div>
      </div>
    </div>`).join('');
  setTimeout(()=>{if(typeof applyEmojis==='function')applyEmojis()},80);
}
function likePost(id){
  const p=DB.posts.find(x=>x.id===id);if(!p)return;
  p.liked=!p.liked;p.likes+=p.liked?1:-1;
  document.querySelectorAll(`#post-${id} .pact:first-child`).forEach(el=>{
    el.className=`pact${p.liked?' liked':''}`;
    el.innerHTML=`${p.liked?'❤️':'🤍'}<span id="lc-${id}">${p.likes}</span>`;
    el.onclick=()=>likePost(id);
    if(p.liked){el.classList.add('anim');setTimeout(()=>el.classList.remove('anim'),300)}
  });
  if(p.liked)toast('❤️ Liked!');
  if(typeof applyEmojis==='function')setTimeout(applyEmojis,80);
}

function repostPost(id){
  const p=DB.posts.find(x=>x.id===id);if(!p)return;
  const uname=user?.name||'You';
  if(!p.repostedBy)p.repostedBy=[];
  const idx=p.repostedBy.indexOf(uname);
  if(idx>=0){p.repostedBy.splice(idx,1);p.reposts=p.repostedBy.length;p.reposted=false;toast('↩️ Repost removed!');}
  else{p.repostedBy.push(uname);p.reposts=p.repostedBy.length;p.reposted=true;toast('🔁 Reposted!');}
  renderFeed(DB.posts);
  const curProfile=document.getElementById('prof-nm')?.textContent;
  if(curProfile)renderProfPostsForUser(getUserPosts(curProfile),curProfile);
}
function filterPosts(el,cat){
  document.querySelectorAll('#feed-chips .chip').forEach(c=>c.classList.remove('on'));
  el.classList.add('on');
  renderFeed(cat==='all'?DB.posts:DB.posts.filter(p=>p.cat===cat));
}
function submitPost(){
  const ta=document.getElementById('post-ta');
  const txt=ta.value.trim();if(!txt){toast('⚠️ Write something!');return}
  const cat=document.getElementById('post-cat').value;
  DB.posts.unshift({id:Date.now(),author:user?.name||'You',dept:`${user?.dept?.split(' ')[0]||'Student'} · ${user?.lvl||'300'}L`,t:'Just now',cat,txt,likes:0,comments:0,liked:false,reposts:0,reposted:false,repostedBy:[]});
  ta.value='';renderFeed(DB.posts);renderProfPosts();
  const pEl=document.getElementById('p-posts');if(pEl)pEl.textContent=parseInt(pEl.textContent)+1;
  toast('🚀 Posted!');
}

function renderGroups(){
  document.getElementById('grp-list').innerHTML=DB.groups.map(g=>`
    <div class="grp">
      <div class="grp-banner" style="background:${g.grad}">${g.ico}</div>
      <div class="grp-body">
        <div class="grp-ico" style="background:${g.grad}">${g.ico}</div>
        <div class="grp-type">${g.type}</div>
        <div class="grp-nm">${g.nm}</div>
        <div class="grp-desc">${g.desc}</div>
        <div class="grp-ft">
          <div class="grp-mem">👥 ${g.mem.toLocaleString()} members</div>
          <button class="join-btn${g.joined?' jd':''}" onclick="joinGrp(${g.id},this)">
            ${g.joined?'✓ Joined':'Join'}
          </button>
        </div>
      </div>
    </div>`).join('');
}
function joinGrp(id,btn){
  const g=DB.groups.find(x=>x.id===id);if(!g)return;
  g.joined=!g.joined;g.mem+=g.joined?1:-1;
  btn.textContent=g.joined?'✓ Joined':'Join';
  btn.className='join-btn'+(g.joined?' jd':'');
  toast(g.joined?`✅ Joined ${g.nm}`:`👋 Left ${g.nm}`);
}
function createGroup(){
  const nm=document.getElementById('ng-nm').value.trim();
  if(!nm){toast('⚠️ Enter a name');return}
  DB.groups.unshift({id:Date.now(),nm,type:document.getElementById('ng-type').value,
    desc:document.getElementById('ng-desc').value||'A new campus group.',
    mem:1,ico:'🌟',joined:true,grad:GRADS[DB.groups.length%GRADS.length]});
  closeModal('m-grp');renderGroups();toast(`✅ Group "${nm}" created!`);
}

function renderEvents(){
  document.getElementById('ev-list').innerHTML=DB.events.map(e=>`
    <div class="ev">
      <div class="ev-banner" style="background:${e.grad}">
        ${e.ico}
        <div class="ev-date"><div class="ev-day">${e.day}</div><div class="ev-mon">${e.mon}</div></div>
      </div>
      <div class="ev-body">
        <div class="ev-title">${e.title} ${e.remindSet?'🔔':''}</div>
        <div class="ev-info">
          <div class="ev-meta">🕐 ${e.time}</div>
          <div class="ev-meta">📍 ${e.loc}</div>
        </div>
        <div class="ev-desc">${e.desc}</div>
        <div class="ev-ft">
          <div style="display:flex;align-items:center">
            <div class="pip" style="background:${GRADS[0]}"></div>
            <div class="pip" style="background:${GRADS[1]}"></div>
            <div class="pip" style="background:${GRADS[2]}"></div>
            <div class="ev-cnt">${e.att} going</div>
          </div>
          <button class="att-btn${e.going?' go':''}" onclick="attend(${e.id},this)">
            ${e.going?'✓ Going':'Attend →'}
          </button>
        </div>
      </div>
    </div>`).join('');
}
function attend(id,btn){
  const e=DB.events.find(x=>x.id===id);if(!e)return;
  e.going=!e.going;e.att+=e.going?1:-1;
  btn.textContent=e.going?'✓ Going':'Attend →';
  btn.className='att-btn'+(e.going?' go':'');
  if(e.going){
    showReminderModal(id);
  } else {
    e.remind24h=false;e.remindDay=false;e.remindSet=false;
    toast('👋 Removed from attendees');
  }
  renderEvents();
}
function showReminderModal(id){
  const e=DB.events.find(x=>x.id===id);if(!e)return;
  const m=document.createElement('div');
  m.className='overlay';m.style.display='block';
  m.innerHTML=`<div class="reminder-modal">
    <div class="reminder-header">
      <div class="reminder-title">🔔 Set Reminder for ${e.title}</div>
      <div class="reminder-x" onclick="this.closest('.overlay').remove()">✕</div>
    </div>
    <div class="reminder-body">
      <p>Get notified when this event is close!</p>
      <label class="reminder-option">
        <input type="checkbox" id="rem-24h" ${e.remind24h?'checked':''}>
        <span>📅 24 hours before</span>
      </label>
      <label class="reminder-option">
        <input type="checkbox" id="rem-day" ${e.remindDay?'checked':''}>
        <span>☀️ On the day of event</span>
      </label>
    </div>
    <button class="reminder-save" onclick="saveReminder(${e.id})">Save Reminders</button>
  </div>`;
  m.onclick=ev=>{if(ev.target===m)m.remove()};
  document.body.appendChild(m);
}
function saveReminder(id){
  const e=DB.events.find(x=>x.id===id);if(!e)return;
  e.remind24h=document.getElementById('rem-24h')?.checked||false;
  e.remindDay=document.getElementById('rem-day')?.checked||false;
  e.remindSet=e.remind24h||e.remindDay;
  const modal=document.querySelector('.reminder-modal')?.closest('.overlay');
  if(modal)modal.remove();
  renderEvents();
  toast(e.remindSet?'🔔 Reminder set!':'📌 No reminders set');
  scheduleReminders();
}
function scheduleReminders(){
  DB.events.forEach(e=>{
    if(!e.remindSet)return;
    const evDate=new Date();
    const months={JAN:0,FEB:1,MAR:2,APR:3,MAY:4,JUN:5,JUL:6,AUG:7,SEP:8,OCT:9,NOV:10,DEC:11};
    evDate.setMonth(months[e.mon]||0);
    evDate.setDate(parseInt(e.day)||1);
    evDate.setHours(parseInt(e.time)||0,0,0,0);
    if(e.remind24h&&!e._remind24hFired){
      const d24=new Date(evDate);d24.setHours(d24.getHours()-24);
      const diff=d24-Date.now();
      if(diff<=0&&diff>-86400000){toast(`🔔 Reminder: ${e.title} is tomorrow!`);e._remind24hFired=true;}
    }
    if(e.remindDay&&!e._remindDayFired){
      const today=new Date();
      if(today.getMonth()===evDate.getMonth()&&today.getDate()===evDate.getDate()){
        toast(`☀️ Reminder: ${e.title} is TODAY at ${e.time}!`);e._remindDayFired=true;
      }
    }
  });
}
function createEvent(){
  const t=document.getElementById('ne-title').value.trim();
  if(!t){toast('⚠️ Enter a title');return}
  const now=new Date();
  DB.events.unshift({id:Date.now(),title:t,ico:'🌟',
    day:String(now.getDate()+7).padStart(2,'0'),
    mon:now.toLocaleString('default',{month:'short'}).toUpperCase(),
    time:'5:00 PM',loc:document.getElementById('ne-loc').value||'TBD',
    desc:document.getElementById('ne-desc').value||'Details coming soon.',
    att:1,going:true,grad:'linear-gradient(135deg,rgba(26,86,255,.5),rgba(139,92,246,.35))'});
  closeModal('m-ev');renderEvents();toast('🎉 Event created!');
}


function renderConfs(){
  document.getElementById('conf-list').innerHTML=DB.confs.map(c=>`
    <div class="conf">
      <div class="conf-hd">
        <div class="ghost-av">👻</div>
        <div><div class="conf-nm">Anonymous Student</div><div class="conf-t">${c.t}</div></div>
        <div class="more-btn" style="margin-left:auto" onclick="toast('🚩 Reported for review')">⚑</div>
      </div>
      <div class="conf-body">${c.txt}</div>
      <div class="post-ft" style="padding:0">
        <div class="pact${c.liked?' liked':''}" onclick="likeConf(${c.id},this)">
          ${c.liked?'❤️':'🤍'}<span>${c.likes}</span>
        </div>
        <div class="pact" onclick="toast('💬 Reply coming soon!')">💬 Reply</div>
      </div>
    </div>`).join('');
}
function likeConf(id,btn){
  const c=DB.confs.find(x=>x.id===id);if(!c)return;
  c.liked=!c.liked;c.likes+=c.liked?1:-1;
  btn.className=`pact${c.liked?' liked':''}`;
  btn.innerHTML=`${c.liked?'❤️':'🤍'}<span>${c.likes}</span>`;
  btn.onclick=()=>likeConf(id,btn);
}
function submitConf(){
  const ta=document.getElementById('conf-ta');
  const txt=ta.value.trim();
  if(!txt){toast('⚠️ Write something!');return}
  if(txt.length<20){toast('⚠️ Confession too short!');return}
  DB.confs.unshift({id:Date.now(),t:'Just now',txt,likes:0,liked:false});
  ta.value='';renderConfs();toast('👻 Confession posted anonymously!');
}

function renderMemes(){
  document.getElementById('meme-grid').innerHTML=DB.memes.map((m,i)=>`
    <div class="meme-card" onclick="openMemeModal(${i})">
      <div class="meme-img meme-gif"><img src="${m.url}" alt="${m.cap}" loading="lazy" onerror="this.parentElement.innerHTML='${m.ico}'"></div>
      <div class="meme-bd">
        <div class="meme-cap">${m.cap}</div>
        <div class="meme-acts">
          <div class="mact" onclick="event.stopPropagation();toast('😂 Meme liked!')">😂 ${m.likes.toLocaleString()}</div>
          <div class="mact" onclick="event.stopPropagation();toast('🔗 Link copied!')">🔗</div>
          <div class="mact" onclick="event.stopPropagation();toast('🔖 Saved!')">🔖</div>
        </div>
      </div>
    </div>`).join('');
}

function openMemeModal(i){
  const m=DB.memes[i];if(!m)return;
  document.getElementById('meme-full-img').src=m.url;
  document.getElementById('meme-full-cap').textContent=m.cap;
  document.getElementById('meme-full-likes').textContent=m.likes.toLocaleString();
  document.getElementById('m-meme').classList.add('open');
  document.body.style.overflow='hidden';
}

function closeMemeModal(){
  document.getElementById('m-meme').classList.remove('open');
  document.body.style.overflow='';
}

function renderPolls(){
  document.getElementById('polls-wrap').innerHTML=DB.polls.map(p=>{
    const tot=p.opts.reduce((s,o)=>s+o.v,0);
    return `<div class="poll">
      <div class="poll-q">${p.q}</div>
      ${p.opts.map((o,i)=>{
        const pct=tot?Math.round(o.v/tot*100):0;
        return `<div class="poll-opt" onclick="vote(${p.id},${i})">
          <div class="pbar${p.voted===i?' voted':''}">
            <div class="pbar-fill" style="width:${p.voted!==null?pct:0}%"></div>
            <div class="pbar-lbl">${o.l}</div>
            ${p.voted!==null?`<div class="pbar-pct">${pct}%</div>`:''}
          </div>
        </div>`;
      }).join('')}
      <div class="poll-foot">${tot.toLocaleString()} votes${p.voted!==null?' · You voted':''}</div>
    </div>`;
  }).join('');
}
function vote(pid,oi){
  const p=DB.polls.find(x=>x.id===pid);
  if(!p||p.voted!==null){toast('⚠️ Already voted!');return}
  p.voted=oi;p.opts[oi].v++;renderPolls();toast('✅ Vote recorded!');
}

function renderTrending(){
  document.getElementById('trending').innerHTML=DB.trending.map((t,i)=>`
    <div class="trend" onclick="toast('🔍 Trending: ${t.tag}')">
      <div class="trend-n">${i+1}</div>
      <div style="flex:1"><div class="trend-tag">${t.tag}</div><div class="trend-cnt">${t.cnt}</div></div>
    </div>`).join('');
}
function renderSuggs(){
  document.getElementById('suggs').innerHTML=DB.suggs.map((s,i)=>`
    <div class="sug">
      <div class="sug-av" style="background:${grad(s.nm)}" data-author="${s.nm}" data-dept="${s.dept}" onclick="openProfileFromPost(this)">${ini(s.nm)}</div>
      <div style="flex:1;min-width:0" data-author="${s.nm}" data-dept="${s.dept}" onclick="openProfileFromPost(this)"><div class="sug-nm">${s.nm}</div><div class="sug-dept">${s.dept}</div></div>
      <div class="flw${s.flw?' fld':''}" onclick="follow(${i},this)">${s.flw?'Following':'Follow'}</div>
    </div>`).join('');
}
function follow(i,btn){
  DB.suggs[i].flw=!DB.suggs[i].flw;
  btn.textContent=DB.suggs[i].flw?'Following':'Follow';
  btn.className='flw'+(DB.suggs[i].flw?' fld':'');
  toast(DB.suggs[i].flw?`✅ Following ${DB.suggs[i].nm}`:'👋 Unfollowed');
}

function renderAdmin(){
  document.getElementById('stat-grid').innerHTML=`
    <div class="stat-c"><div class="stat-v">2,841</div><div class="stat-l">Total Students</div><div class="stat-d up">↑ +124 this week</div></div>
    <div class="stat-c"><div class="stat-v">18,392</div><div class="stat-l">Posts Today</div><div class="stat-d up">↑ +12% vs yesterday</div></div>
    <div class="stat-c"><div class="stat-v">7</div><div class="stat-l">Reports Pending</div><div class="stat-d down">⚠ 2 new today</div></div>
    <div class="stat-c"><div class="stat-v">99.2%</div><div class="stat-l">Safety Score</div><div class="stat-d up">↑ Above threshold</div></div>`;
  document.getElementById('mod-q').innerHTML=DB.mod.map(m=>`
    <div class="mod-item" id="mi-${m.id}">
      <div class="mod-flag-ico">🚩</div>
      <div class="mod-bd">
        <div class="mod-txt">${m.txt}</div>
        <div class="mod-meta">${m.rep} · <b style="color:var(--red)">${m.type}</b></div>
      </div>
      <div class="mod-acts">
        <button class="mbtn ok" onclick="modAct(${m.id},'ok')">✓ Keep</button>
        <button class="mbtn rm" onclick="modAct(${m.id},'rm')">✕ Remove</button>
      </div>
    </div>`).join('');
}
function modAct(id,a){
  const el=document.getElementById('mi-'+id);
  if(el){el.style.opacity='.4';el.style.pointerEvents='none';setTimeout(()=>el.remove(),400)}
  DB.mod=DB.mod.filter(m=>m.id!==id);
  toast(a==='ok'?'✅ Content approved & kept':'🗑️ Content removed');
}

function renderPulse(){
  const msgs=[
    '📚 3 study groups created in the last hour',
    '🔥 #TechNight is trending — 284 posts today',
    '🏠 Goodluck Hall power restored 2 hours ago',
    '🎉 612 students are currently active on campus',
    '📊 New poll: 78% prefer jollof over fried rice',
  ];
  document.getElementById('pulse-txt').textContent=msgs[Math.floor(Math.random()*msgs.length)];
  setInterval(()=>{
    const el=document.getElementById('pulse-txt');
    if(el) el.textContent=msgs[Math.floor(Math.random()*msgs.length)];
  },6000);
}

function handleSearch(q){
  if(!q.trim()){renderFeed(DB.posts);return}
  const lq=q.toLowerCase();
  const res=DB.posts.filter(p=>p.txt.toLowerCase().includes(lq)||p.author.toLowerCase().includes(lq)||p.cat.includes(lq));
  if(document.getElementById('pg-feed').classList.contains('on')) renderFeed(res);
}

function startCD(){
  const tgt=new Date();tgt.setDate(tgt.getDate()+42);
  const upd=()=>{
    const diff=tgt-new Date();
    if(diff<0)return;
    const d=Math.floor(diff/86400000);
    const h=Math.floor((diff%86400000)/3600000);
    const m=Math.floor((diff%3600000)/60000);
    const s=Math.floor((diff%60000)/1000);
    const el=document.getElementById('cd-grid');
    if(el) el.innerHTML=[['DAYS',d],['HRS',h],['MIN',m],['SEC',s]].map(([l,n])=>
      `<div class="cd-box"><div class="cd-n">${String(n).padStart(2,'0')}</div><div class="cd-l">${l}</div></div>`).join('');
  };
  upd();setInterval(upd,1000);
}

let toastTmr;
function toast(msg){
  clearTimeout(toastTmr);
  const el=document.getElementById('toast');
  const ico=msg.match(/^([\u{1F300}-\u{1FFFF}⚠✅❌🔥🎉👻🔗🔖💬❤️📅🏠🎭😂📊🛡️])/u);
  document.getElementById('toast-ico').textContent=ico?ico[0]:'✅';
  document.getElementById('toast-msg').textContent=ico?msg.slice([...ico[0]].length).trim():msg;
  el.classList.add('show');
  toastTmr=setTimeout(()=>el.classList.remove('show'),3000);
  if(typeof applyEmojis==='function')setTimeout(applyEmojis,100);
}

function openModal(id){document.getElementById(id).classList.add('open')}
function closeModal(id){document.getElementById(id).classList.remove('open')}
document.querySelectorAll('.overlay').forEach(o=>o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('open')}));

function initAuthAnimations(){
  const taglines=[
    'Your campus. Your community.',
    'Where Babcock vibes live online',
    'Connect. Gist. Belong.',
    'From hostel life to campus fame',
    'The real Babcock experience',
    'Gist, polls & campus vibes',
    'Your people are here',
    'Stay in the loop. Always.'
  ];
  let ti=0;
  const el=document.getElementById('tagline-text');
  if(el){
    setInterval(()=>{
      ti=(ti+1)%taglines.length;
      el.style.opacity=0;
      setTimeout(()=>{el.textContent=taglines[ti];el.style.opacity=1},300);
    },3500);
    el.style.transition='opacity .3s ease';
  }
}

updateHallOptions();
initAuthAnimations();
