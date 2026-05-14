export const initialStories = [
  { id: 1, name: 'Pioneer Chapel', icon: '🕊️', img: '/images/campus-view.jpg', seen: false },
  { id: 2, name: 'International Sabbath', icon: '✝️', img: '/images/international-sabbath.jpg', seen: false },
  { id: 3, name: 'Campus Life', icon: '⛪', img: '/images/pioneer-interior.jpg', seen: true },
  { id: 4, name: 'Sports Complex', icon: '⚽', img: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400&h=600&fit=crop', seen: false },
  { id: 5, name: 'Library', icon: '📚', img: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop', seen: false },
  { id: 6, name: 'Graduation Hall', icon: '🎓', img: 'https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=400&h=600&fit=crop', seen: false },
];

export const initialPosts = [
  { id: 1, author: 'Olawuyi Oluwaseun', dept: 'IT · 300L', t: '2 min ago', cat: 'sports', txt: "PSG please 😭 the world is behind you right now… if you lose this UCL final I'm going to be sad fr fr 🏆⚽", likes: 412, liked: false, reposts: 0, reposted: false, repostedBy: [], imageUrl: '', comments: [
    { id: 101, author: 'Fagboy', text: 'PSG no get chance bro 😂', time: '1 min ago', userId: 2 },
    { id: 102, author: 'Ogunsola Dapo', text: 'Mbappe on his way to Madrid already 💀', time: 'Just now', userId: 3 },
  ] },
  { id: 2, author: 'Fagboy', dept: 'Mass Comm · 200L', t: '1 hr ago', cat: 'sports', txt: "If Arsenal win the UCL just kill me 💀 I cannot survive seeing it happen. I've suffered since 2020 and I'm not ready for this 😭❤️", likes: 567, liked: false, reposts: 0, reposted: false, repostedBy: [], imageUrl: '', comments: [
    { id: 103, author: 'Olawuyi Oluwaseun', text: 'Arsenal fans been suffering since 2004 😭', time: '55 min ago', userId: 1 },
  ] },
  { id: 3, author: 'Ogunsola Dapo', dept: 'Engineering · 200L', t: '2 hrs ago', cat: 'gist', txt: 'The BUSA elections are looking wild 😂 UZOMA4SPORTS really came with the energy this year. What y\'all think?', likes: 218, liked: false, reposts: 0, reposted: false, repostedBy: [], imageUrl: '', comments: [] },
  { id: 4, author: 'Osakioduwa Elisha', dept: 'Software Engineering · 400L', t: '3 hrs ago', cat: 'hostel', txt: "⚡ Winslow HALL UPDATE: Power is BACK in Block C! It's been 3 days, the gen is finally fixed. Update your assignments fam — we move!", likes: 189, liked: false, reposts: 0, reposted: false, repostedBy: [], imageUrl: '', comments: [
    { id: 104, author: 'Ememanka Chiemela', text: 'Finally! Block C residents can charge their phones again ⚡', time: '2 hrs ago', userId: 5 },
    { id: 105, author: 'Precious Ugo', text: 'What about Block A? Still in darkness? 😤', time: '1 hr ago', userId: 7 },
  ] },
  { id: 5, author: 'Ememanka Chiemela', dept: 'Unknown · 300L', t: '5 hrs ago', cat: 'events', txt: '🏥 Free medical outreach this sunday in front of Caf ! Blood pressure check, and health counselling. Bring your people! #BabcockMed', likes: 312, liked: false, reposts: 0, reposted: false, repostedBy: [], imageUrl: '', comments: [] },
  { id: 6, author: 'Emmanuel Ewedu', dept: 'Economics · 200L', t: '6 hrs ago', cat: 'academics', txt: 'Does anyone have the Linux tutorial notes from last semester? Lecturer just announced a test for next week 😰 Please help a guy out 🙏', likes: 8, liked: false, reposts: 0, reposted: false, repostedBy: [], imageUrl: '', comments: [
    { id: 106, author: 'Fagboy', text: 'I have them! DM me your WhatsApp number', time: '5 hrs ago', userId: 2 },
  ] },
  { id: 7, author: 'precious ugo', dept: 'Business Admin · 400L', t: '8 hrs ago', cat: 'academics', txt: '🎓 JUST FINISHED MY FINAL YEAR PROJECT! 4 years of stress, tears, and late nights. WE MADE IT! To every 400L student still grinding — you\'re almost there 💪', likes: 644, liked: false, reposts: 0, reposted: false, repostedBy: [], imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=600&h=400&fit=crop', comments: [
    { id: 107, author: 'Ogunsola Dapo', text: 'Congratulations!! 🎉 Well done', time: '7 hrs ago', userId: 3 },
    { id: 108, author: 'Olawuyi Oluwaseun', text: 'Proud of you! 🎓', time: '6 hrs ago', userId: 1 },
    { id: 109, author: 'Ememanka Chiemela', text: 'Almost there myself, this is motivation 🙏', time: '6 hrs ago', userId: 5 },
  ] },
];

export const initialGroups = [
  { id: 1, nm: 'Computer Science Dept 🖥️', type: 'Department', desc: 'Official dept group for all CS students. Announcements, resources, and academic discussions.', mem: 842, ico: '🖥️', joined: true, grad: 'linear-gradient(135deg,rgba(26,86,255,.5),rgba(0,194,122,.35))' },
  { id: 2, nm: 'winslow Hall 🏠', type: 'Hostel', desc: 'Residents of winslow Hall. Power updates, lost & found, hostel life discussions.', mem: 213, ico: '🏠', joined: true, grad: 'linear-gradient(135deg,rgba(240,64,64,.5),rgba(245,149,0,.35))' },
  { id: 3, nm: 'BUCC ⚡', type: 'Club', desc: 'Building, shipping, learning together. Weekly hackathons, tech talks, and industry links.', mem: 156, ico: '⚡', joined: true, grad: 'linear-gradient(135deg,rgba(139,92,246,.5),rgba(6,182,212,.35))' },
  { id: 4, nm: 'Law Students Forum ⚖️', type: 'Department', desc: 'For all Law students. Moot court updates, case study discussions, and career advice.', mem: 601, ico: '⚖️', joined: false, grad: 'linear-gradient(135deg,rgba(0,194,122,.5),rgba(26,86,255,.35))' },
  { id: 5, nm: 'CS 300 Study Group 📚', type: 'Course', desc: 'Notes, study sessions, and exam prep for all CSC 300 level students.', mem: 98, ico: '📚', joined: true, grad: 'linear-gradient(135deg,rgba(245,149,0,.5),rgba(240,64,64,.35))' },
  { id: 6, nm: 'Babcock Chess Club ♟️', type: 'Club', desc: 'Weekly chess sessions at the student centre. All skill levels welcome!', mem: 47, ico: '♟️', joined: false, grad: 'linear-gradient(135deg,rgba(6,182,212,.5),rgba(139,92,246,.35))' },
];

export const initialEvents = [
  { id: 1, title: 'BU Hackathon 💻', ico: '💻', day: '15', mon: 'JUN', time: '9:00 AM', loc: 'Tech Hub Building', desc: '24-hour coding marathon. Build, deploy, and win amazing prizes. Free meals provided!', att: 340, going: false, grad: 'linear-gradient(135deg,rgba(26,86,255,.5),rgba(0,194,122,.35))', remind24h: false, remindDay: false, remindSet: false },
  { id: 2, title: 'Freshers Fair 🎉', ico: '🎉', day: '20', mon: 'SEP', time: '4:00 PM', loc: 'University Stadium', desc: 'Welcome to Babcock! Meet clubs, societies, and campus organizations. Food, music, and games!', att: 890, going: true, grad: 'linear-gradient(135deg,rgba(245,149,0,.5),rgba(240,64,64,.3))', remind24h: false, remindDay: false, remindSet: false },
  { id: 3, title: 'Graduation Day 🎓', ico: '🎓', day: '12', mon: 'OCT', time: '10:00 AM', loc: 'The Amphitheatre', desc: 'Celebrating our graduating class. Gowns, speeches, and new beginnings for the future leaders.', att: 1250, going: false, grad: 'linear-gradient(135deg,rgba(139,92,246,.5),rgba(6,182,212,.35))', remind24h: false, remindDay: false, remindSet: false },
  { id: 4, title: 'Best of 200L Final ⚽', ico: '⚽', day: '28', mon: 'MAY', time: '3:00 PM', loc: 'University Stadium', desc: 'The ultimate intramural showdown! Who will be crowned the best department in 200L?', att: 420, going: false, grad: 'linear-gradient(135deg,rgba(0,194,122,.5),rgba(26,86,255,.3))', cat: 'sports', remind24h: false, remindDay: false, remindSet: false },
];

export const initialConfs = [
  { id: 1, t: '15 min ago', txt: 'I have been attending the wrong tutorial class for 3 weeks. I thought I was getting smarter — turns out I was studying a completely different course 💀', likes: 312, liked: false },
  { id: 2, t: '1 hr ago', txt: "There is someone in my department whose voice I have been in love with for 2 entire years and we have never once spoken. Every time they answer questions in class I lose all focus on the lecture.", likes: 187, liked: false },
  { id: 3, t: '3 hrs ago', txt: "The jollof rice in Elijah Hall on Thursdays is genuinely top 5 meals of my life. I go there even though I don't live there. I am not ashamed and I will not apologise.", likes: 445, liked: false },
  { id: 4, t: '5 hrs ago', txt: 'I failed my first exam in 100L and cried for 2 straight days. Then I made the Dean\'s List in 200L. If you are struggling right now — it does not stay this way. Keep going.', likes: 892, liked: false },
];

export const initialMemes = [
  { ico: '😡', cap: 'This whole elections were rigged', likes: 2847, url: 'https://media4.giphy.com/media/8rT2k19HNjhImz6bwP/giphy.gif' },
  { ico: '🎤', cap: 'abeg so we no get social director?? 😂😂', likes: 1923, url: 'https://media0.giphy.com/media/ouEIsl1nsBjUpMbfxm/giphy.gif' },
  { ico: '📋', cap: 'How do you lose an unopposed election 😂💀', likes: 3102, url: 'https://media1.giphy.com/media/DmCq5rJEk6phhv4WSz/giphy.gif' },
  { ico: '😭', cap: 'So after everything Angel no win Gensec', likes: 2456, url: 'https://media4.giphy.com/media/4QA4DlNNe6NHMSNqrO/giphy.gif' },
  { ico: '⌨️', cap: 'Me at 11:59PM submitting a 3,000-word essay I started at 11:30PM', likes: 832, url: 'https://media4.giphy.com/media/gwhneLWxsHkaCyRj4n/giphy.gif' },
  { ico: '🍚', cap: 'Me when I hear jollof rice is on the menu at the dining hall', likes: 1024, url: 'https://media4.giphy.com/media/FP7pLBvhnV3jBvUW7j/giphy.gif' },
  { ico: '💡', cap: 'NEPA taking light during my 4-hour exam-prep study marathon', likes: 743, url: 'https://media2.giphy.com/media/F7MTsSTtFx17fQHlrN/giphy.gif' },
  { ico: '🙏', cap: 'Me explaining to God exactly why that carryover needs to disappear', likes: 567, url: 'https://media4.giphy.com/media/QXp6l0FH4QOUYfXIH1/giphy.gif' },
  { ico: '😴', cap: 'When lecturer finally says "you can go" after a 3-hour lecture', likes: 921, url: 'https://media1.giphy.com/media/MlpBNQVcc5GX9RhyFP/giphy.gif' },
  { ico: '📝', cap: 'When you realize the test is TODAY and not NEXT WEEK', likes: 756, url: 'https://media3.giphy.com/media/iiIpe7ejuBbAfgyMPl/giphy.gif' },
  { ico: '📱', cap: 'Group project: 1 person does the work, 10 people say "nice one guys"', likes: 678, url: 'https://media4.giphy.com/media/2d400VBPJbxaU/giphy.gif' },
  { ico: '🎓', cap: 'When you finally pass that course you failed 3 times', likes: 1456, url: 'https://media4.giphy.com/media/f2PSqb4ZkIWYZGp0ZY/giphy.gif' },
];

export const initialPolls = [
  { id: 1, q: 'Best Busa shop?', opts: [{ l: 'Big Meals', v: 412 }, { l: 'Flakky Ventures', v: 318 }, { l: 'Busa House', v: 234 }, { l: 'All busa food are ass', v: 189 }], voted: null },
  { id: 2, q: 'Best Babcock TikToker?', opts: [{ l: 'Aliana', v: 534 }, { l: 'Mazi Abraham', v: 421 }, { l: 'Valentino', v: 289 }, { l: 'Caris', v: 156 }], voted: null },
  { id: 3, q: 'Favourite Kiss Spot?', opts: [{ l: 'Amphitheater', v: 312 }, { l: 'SAT', v: 201 }, { l: 'Queen Esther', v: 178 }, { l: 'Busa Hut', v: 145 }], voted: null },
];

export const initialChats = [
  { id: 1, nm: 'CS Dept Group', ico: '🖥️', grad: 'linear-gradient(135deg,#4f7fff,#34d399)', t: '2 min ago', preview: 'Seun: Did anyone get the assignment?', msgs: [
    { senderId: 2, senderName: 'Seun', txt: 'Did anyone get the assignment?', t: '2:30 PM', own: false },
    { senderId: 3, senderName: 'Dapo', txt: 'Yeah check the portal', t: '2:31 PM', own: false },
    { senderId: 0, senderName: 'You', txt: 'Thanks!', t: '2:32 PM', own: true },
  ], online: '12 online' },
  { id: 2, nm: 'winslow Hall', ico: '🏠', grad: 'linear-gradient(135deg,#f87171,#fbbf24)', t: '1 hr ago', preview: 'Chiemela: Power is back in Block C!', msgs: [
    { senderId: 4, senderName: 'Chiemela', txt: 'Power is back in Block C!', t: '1:00 PM', own: false },
    { senderId: 3, senderName: 'Dapo', txt: 'Finally 😭', t: '1:05 PM', own: false },
  ], online: '5 online' },
  { id: 3, nm: 'BUCC Tech', ico: '⚡', grad: 'linear-gradient(135deg,#a78bfa,#22d3ee)', t: '3 hrs ago', preview: 'You: When\'s the next hackathon?', msgs: [
    { senderId: 0, senderName: 'You', txt: 'When\'s the next hackathon?', t: '11:00 AM', own: true },
    { senderId: 5, senderName: 'Excel', txt: 'Next Saturday at Tech Hub', t: '11:30 AM', own: false },
  ], online: '3 online' },
  { id: 4, nm: '400L Study Room', ico: '📚', grad: 'linear-gradient(135deg,#34d399,#4f7fff)', t: '1 day ago', preview: 'Favour: Who has the project slides?', msgs: [
    { senderId: 6, senderName: 'Favour', txt: 'Who has the project slides?', t: 'Yesterday', own: false },
  ], online: '7 online' },
];

export const trending = [
  { tag: '#BUSA Elections 🗳️', cnt: '1.2K posts' }, { tag: '#UZOMA4SPORTS ⚽', cnt: '847 posts' },
  { tag: '#UCL Final 🏆', cnt: '634 posts' }, { tag: '#RIGGED 🚨', cnt: '521 posts' },
];

export const suggs = [
  { nm: 'Odiakaose Itohan', dept: 'Public Health · 300L', flw: false },
  { nm: 'Gbadebo Oluwamisimi', dept: 'Software Engineering · 400L', flw: false },
  { nm: 'Irondi Excel', dept: ' Software Engineering · 400L', flw: false },
];

export const initialNotifications = [
  { id: 1, type: 'like', message: 'Ogunsola Dapo liked your post', read: false, time: '2 min ago', userId: 3, postId: 4 },
  { id: 2, type: 'comment', message: 'Fagboy commented on your post', read: false, time: '15 min ago', userId: 2, postId: 1 },
  { id: 3, type: 'like', message: 'Ememanka Chiemela liked your post', read: false, time: '1 hr ago', userId: 5, postId: 7 },
  { id: 4, type: 'follow', message: 'Precious Ugo started following you', read: true, time: '3 hrs ago', userId: 7 },
  { id: 5, type: 'comment', message: 'Olawuyi Oluwaseun replied to your comment', read: true, time: '5 hrs ago', userId: 1, postId: 2 },
];

export const modItems = [
  { id: 1, txt: 'Post contains targeted language against a named student…', rep: 'Reported by 4 users', type: 'Hate Speech' },
  { id: 2, txt: 'Anonymous post may contain identifiable info about another student…', rep: 'Auto-flagged by content filter', type: 'Privacy Concern' },
  { id: 3, txt: 'Unauthorized commercial promotion disguised as an event post…', rep: 'Reported by 2 users', type: 'Spam / Commercial' },
];
