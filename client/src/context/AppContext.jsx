import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { api } from '../utils/helpers';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [toast, setToast] = useState(null);
  const [activePage, setActivePage] = useState('feed');
  const [profileTarget, setProfileTarget] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);

  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [confs, setConfs] = useState([]);
  const [memes, setMemes] = useState([]);
  const [polls, setPolls] = useState([]);
  const [stories, setStories] = useState([]);
  const [modQueue, setModQueue] = useState([]);

  const [chatList, setChatList] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [friends, setFriends] = useState([]);
  const activeChatRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState('dark');
  const [activeUsers, setActiveUsers] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [followingMap, setFollowingMap] = useState({});
  const postPageRef = useRef(1);
  const [trending, setTrending] = useState([]);
  const [suggs, setSuggs] = useState([]);

  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadAllData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [storiesData, groupsData, eventsData, confsData, memesData, pollsData, notifsData] = await Promise.all([
        api('/api/stories'),
        api(`/api/groups?userId=${user.id}`),
        api(`/api/events?userId=${user.id}`),
        api('/api/confessions'),
        api('/api/memes'),
        api(`/api/polls?userId=${user.id}`),
        api(`/api/notifications/${user.id}`),
      ]);
      if (storiesData?.stories) setStories(storiesData.stories);
      if (groupsData?.groups) setGroups(groupsData.groups);
      if (eventsData?.events) setEvents(eventsData.events);
      if (confsData?.confessions) setConfs(confsData.confessions);
      if (memesData?.memes) setMemes(memesData.memes);
      if (pollsData?.polls) setPolls(pollsData.polls);
      if (notifsData?.notifications) setNotifications(notifsData.notifications);
    } catch (e) {
      console.error('[LOAD] Failed to load data:', e);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) loadAllData();
  }, [user, loadAllData]);

  useEffect(() => {
    const tagCounts = {};
    posts.forEach(p => {
      const tags = p.txt.match(/#\w+/g) || [];
      tags.forEach(t => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    });
    const top = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, cnt: `${count} posts` }));
    setTrending(top.length ? top : [
      { tag: '#BabcockVibes', cnt: '0 posts' },
      { tag: '#CampusLife', cnt: '0 posts' },
    ]);
  }, [posts]);

  useEffect(() => {
    if (!user?.id) return;
    api('/api/users/suggestions?userId=' + user.id).then(data => {
      if (data?.users) setSuggs(data.users);
    }).catch(() => {});
  }, [user?.id]);

  const initSocket = useCallback(() => {
    if (socket) return;
    const s = io();
    s.on('connect', () => {
      if (user) s.emit('join', { id: user.id, name: user.name, email: user.email });
    });
    s.on('users:online', (data) => {
      setActiveUsers(data?.count || 0);
    });
    s.on('post:new', (post) => {
      setPosts((prev) => prev.some((p) => p.id === post.id) ? prev : [post, ...prev]);
    });
    s.on('post:like', (data) => {
      if (data.userId === user?.id) return;
      setPosts((prev) => prev.map((p) => {
        if (p.id !== data.postId) return p;
        const curLikes = Array.isArray(p.likes) ? p.likes : [];
        return { ...p, likes: data.liked ? [...curLikes, data.userId] : curLikes.filter((id) => id !== data.userId) };
      }));
    });
    s.on('chat:message', (data) => {
      setChatList((prev) => {
        const updated = prev.map((c) => {
          if (c.id === data.chatId) {
            const msg = { ...data.msg, own: data.msg.senderId === user?.id };
            return {
              ...c,
              msgs: [...(c.msgs || []), msg],
              preview: `${data.msg?.senderName || 'Someone'}: ${(data.msg?.txt || '').slice(0, 28)}${data.msg?.txt?.length > 28 ? '…' : ''}`,
              t: 'Just now',
            };
          }
          return c;
        });
        return updated;
      });
      setActiveChat((prev) => {
        if (prev && data.chatId === prev.id) {
          const msg = { ...data.msg, own: data.msg.senderId === user?.id };
          return { ...prev, msgs: [...(prev.msgs || []), msg] };
        }
        return prev;
      });
      const ac = activeChatRef.current;
      if (!ac || data.chatId !== ac.id) {
        showToast('New message from ' + (data.msg?.senderName || 'Someone'));
      }
    });
    s.on('chat:error', (err) => showToast(err?.message || 'Chat error'));
    setSocket(s);
  }, [user, socket, showToast]);

  const login = useCallback(async (email, password) => {
    const data = await api('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (data) => {
    const result = await api('/api/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result;
  }, []);

  const logout = useCallback(() => {
    if (socket) { socket.disconnect(); setSocket(null); }
    setUser(null);
    setActivePage('feed');
    setActiveChat(null);
    setChatList([]);
    setGroups([]);
    setEvents([]);
    setConfs([]);
    setMemes([]);
    setPolls([]);
    setStories([]);
    setNotifications([]);
    setPosts([]);
  }, [socket]);

  const loadChats = useCallback(async () => {
    try {
      const data = await api('/api/chats');
      setChatList(data.chats || []);
    } catch (e) {
      console.error('[CHAT] Failed to load:', e);
    }
  }, []);

  const loadFriends = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await api(`/api/friends/${user.id}`);
      setFriends(data.friends || []);
    } catch (e) {
      console.error('[FRIENDS] Failed to load:', e);
    }
  }, [user?.id]);

  const selectChat = useCallback((chatId) => {
    const chat = chatList.find((c) => c.id === chatId);
    if (!chat) return;
    if (activeChat && socket) socket.emit('chat:leave', { chatId: activeChat.id });
    setActiveChat(chat);
    if (socket) socket.emit('chat:join', { chatId: chat.id });
  }, [chatList, activeChat, socket]);

  const startDm = useCallback(async (friend) => {
    if (!user?.id) return;
    const existing = chatList.find((c) => !c.grp && c.partnerId === friend.id);
    if (existing) { selectChat(existing.id); return; }
    const data = await api('/api/chats', {
      method: 'POST',
      body: JSON.stringify({
        nm: friend.name,
        ico: friend.name.charAt(0),
        grad: '#4f7fff',
        grp: false,
        participants: [user.id, friend.id],
      }),
    });
    if (data?.chat) {
      const newChat = { ...data.chat, partnerId: friend.id, online: '1 online', t: 'Just now', preview: 'No messages yet', badge: 0, msgs: [] };
      setChatList((prev) => [newChat, ...prev]);
      selectChat(newChat.id);
    }
  }, [user?.id, chatList, selectChat]);

  const sendMessage = useCallback((txt) => {
    if (!txt || !activeChat) return;
    if (socket) socket.emit('chat:message', { chatId: activeChat.id, msg: { txt } });
    const optimistic = {
      senderId: user?.id || 0,
      senderName: user?.name || 'You',
      txt,
      t: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      own: true,
    };
    setActiveChat((prev) => ({
      ...prev,
      msgs: [...(prev.msgs || []), optimistic],
    }));
    setChatList((prev) => prev.map((c) =>
      c.id === activeChat.id
        ? { ...c, msgs: [...(c.msgs || []), optimistic], preview: 'You: ' + txt.slice(0, 28) + (txt.length > 28 ? '…' : ''), t: 'Just now' }
        : c
    ));
  }, [activeChat, socket, user]);

  const likePost = useCallback((id) => {
    setPosts((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      const curLikes = Array.isArray(p.likes) ? p.likes : [];
      return { ...p, liked: !p.liked, likes: p.liked ? curLikes.filter((u) => u !== user?.id) : [...curLikes, user?.id] };
    }));
    api('/api/posts/' + id + '/like', {
      method: 'POST',
      body: JSON.stringify({ userId: user?.id || 0 }),
    }).catch(() => {});
  }, [user?.id]);

  const repostPost = useCallback((id) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const repostedBy = p.repostedBy || [];
        const idx = repostedBy.indexOf(user?.name || 'You');
        if (idx >= 0) {
          const newArr = [...repostedBy];
          newArr.splice(idx, 1);
          return { ...p, repostedBy: newArr, reposts: newArr.length, reposted: false };
        }
        const newArr = [...repostedBy, user?.name || 'You'];
        return { ...p, repostedBy: newArr, reposts: newArr.length, reposted: true };
      })
    );
  }, [user]);

  const updateProfile = useCallback((data) => {
    setUser((prev) => ({ ...prev, ...data }));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const viewStory = useCallback((id) => {
    setStories((prev) => prev.map((s) => s.id === id ? { ...s, seen: true } : s));
  }, []);

  const addComment = useCallback((postId, text, user) => {
    if (!text.trim()) return;
    const optimistic = {
      id: Date.now(),
      author: user?.name || 'You',
      text: text.trim(),
      time: 'Just now',
      userId: user?.id || 0,
    };
    setPosts((prev) => prev.map((p) =>
      p.id === postId ? { ...p, comments: [...(p.comments || []), optimistic] } : p
    ));
    api('/api/comments', {
      method: 'POST',
      body: JSON.stringify({ postId: String(postId), author: user?.name || 'You', text: text.trim(), userId: user?.id || 0 }),
    }).then((data) => {
      if (data?.comment) {
        setPosts((prev) => prev.map((p) =>
          p.id === postId ? { ...p, comments: (p.comments || []).map((c) => c.id === optimistic.id ? { ...c, id: data.comment.id } : c) } : p
        ));
      }
    }).catch(() => {});
  }, []);

  const deleteComment = useCallback((postId, commentId) => {
    setPosts((prev) => prev.map((p) =>
      p.id === postId ? { ...p, comments: (p.comments || []).filter((c) => c.id !== commentId) } : p
    ));
    api('/api/comments/' + commentId, {
      method: 'DELETE',
      body: JSON.stringify({ userId: user?.id || 0 }),
    }).catch(() => {});
  }, [user?.id]);

  const markNotifRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    api('/api/notifications/' + id + '/read', { method: 'POST' }).catch(() => {});
  }, []);

  const markAllNotifRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    api('/api/notifications/read-all', {
      method: 'POST',
      body: JSON.stringify({ userId: user?.id }),
    }).catch(() => {});
  }, [user?.id]);

  const addNotification = useCallback((type, message, userId, postId) => {
    const notif = { id: Date.now(), type, message, read: false, time: 'Just now', userId, postId };
    setNotifications((prev) => [notif, ...prev]);
    api('/api/notifications', {
      method: 'POST',
      body: JSON.stringify({ type, message, userId, postId }),
    }).catch(() => {});
  }, []);

  const submitPost = useCallback((txt, cat, imageUrl) => {
    const optimistic = {
      id: Date.now(),
      author: user?.name || 'You',
      dept: (user?.dept?.split(' ')[0] || 'Student') + ' · ' + (user?.lvl || '300') + 'L',
      t: 'Just now',
      cat: cat || 'general',
      txt,
      imageUrl: imageUrl || '',
      likes: 0, liked: false, reposts: 0, reposted: false, repostedBy: [], comments: [],
    };
    setPosts((prev) => [optimistic, ...prev]);
    api('/api/posts', {
      method: 'POST',
      body: JSON.stringify({
        author: user?.name || 'You',
        dept: (user?.dept?.split(' ')[0] || 'Student') + ' · ' + (user?.lvl || '300') + 'L',
        cat: cat || 'general',
        txt,
        imageUrl: imageUrl || '',
        userId: user?.id || 0,
      }),
    }).then((data) => {
      if (data?.post) {
        setPosts((prev) => prev.map((p) => p.id === optimistic.id ? { ...data.post, comments: [] } : p));
      }
    }).catch(() => {});
  }, [user]);

  const submitStory = useCallback((name, img, icon) => {
    const newStory = { id: Date.now(), name, icon: icon || name.charAt(0), img, seen: false };
    setStories((prev) => [newStory, ...prev]);
    api('/api/stories', {
      method: 'POST',
      body: JSON.stringify({ name, img, icon: icon || name.charAt(0), userId: user?.id }),
    }).then((data) => {
      if (data?.story) {
        setStories((prev) => prev.map((s) => s.id === newStory.id ? data.story : s));
      }
    }).catch(() => {});
  }, [user?.id]);

  const submitPoll = useCallback((question, options) => {
    const newPoll = { id: Date.now(), q: question, opts: options.map((l) => ({ l, v: 0 })), voted: null };
    setPolls((prev) => [newPoll, ...prev]);
    api('/api/polls', {
      method: 'POST',
      body: JSON.stringify({ q: question, options, userId: user?.id }),
    }).then((data) => {
      if (data?.poll) {
        setPolls((prev) => prev.map((p) => p.id === newPoll.id ? data.poll : p));
      }
    }).catch(() => {});
  }, [user?.id]);

  const votePoll = useCallback((pollId, optionId) => {
    setPolls((prev) => prev.map((p) => {
      if (p.id !== pollId) return p;
      const opts = p.opts.map((o) => o.id === optionId ? { ...o, v: o.v + 1 } : o);
      return { ...p, opts, voted: optionId };
    }));
    api('/api/polls/' + pollId + '/vote', {
      method: 'POST',
      body: JSON.stringify({ userId: user?.id, optionId }),
    }).catch(() => {});
  }, [user?.id]);

  const toggleFollow = useCallback((targetUserId) => {
    setFollowingMap((m) => {
      const updated = { ...m, [targetUserId]: !m[targetUserId] };
      api('/api/follow/' + targetUserId, {
        method: 'POST',
        body: JSON.stringify({ userId: user?.id }),
      }).then((data) => {
        setFollowingMap((prev) => ({ ...prev, [targetUserId]: data?.following }));
      }).catch(() => {
        setFollowingMap((prev) => ({ ...prev, [targetUserId]: m[targetUserId] }));
      });
      return updated;
    });
  }, [user?.id]);

  useEffect(() => {
    if (user) initSocket();
  }, [user, initSocket]);

  const loadMorePosts = useCallback(() => {
    if (loadingPosts || !hasMorePosts) return;
    setLoadingPosts(true);
    const nextPage = postPageRef.current + 1;
    api('/api/posts?page=' + nextPage + '&limit=10').then((data) => {
      if (data?.posts) {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newPosts = data.posts.filter((p) => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });
        postPageRef.current = nextPage;
        setHasMorePosts(!!data.hasMore);
      }
    }).catch(() => {}).finally(() => setLoadingPosts(false));
  }, [loadingPosts, hasMorePosts]);

  const loadInitialPosts = useCallback(() => {
    postPageRef.current = 1;
    api('/api/posts?page=1&limit=10').then((data) => {
      if (data?.posts) {
        setPosts(data.posts);
        setHasMorePosts(!!data.hasMore);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    loadInitialPosts();
    api('/api/active-count').then((data) => {
      if (data?.activeUsers != null) setActiveUsers(data.activeUsers);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) { loadChats(); loadFriends(); }
  }, [user, loadChats]);

  useEffect(() => {
    api('/api/comments').then((data) => {
      if (data?.comments) {
        const grouped = {};
        data.comments.forEach((c) => {
          if (!grouped[c.postId]) grouped[c.postId] = [];
          grouped[c.postId].push(c);
        });
        setPosts((prev) => prev.map((p) => ({
          ...p,
          comments: grouped[String(p.id)] || p.comments || [],
        })));
      }
    }).catch(() => {});
  }, []);

  const toggleGroupJoin = useCallback((groupId) => {
    setGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, joined: !g.joined } : g));
    api('/api/groups/' + groupId + '/join', {
      method: 'POST',
      body: JSON.stringify({ userId: user?.id }),
    }).catch(() => {});
  }, [user?.id]);

  const toggleEventAttend = useCallback((eventId, remindSet) => {
    setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, going: !e.going, remindSet: remindSet || false } : e));
    api('/api/events/' + eventId + '/attend', {
      method: 'POST',
      body: JSON.stringify({ userId: user?.id, remindSet }),
    }).catch(() => {});
  }, [user?.id]);

  const submitConfession = useCallback((txt) => {
    const optimistic = { id: Date.now(), t: 'Just now', txt, likes: [], liked: false };
    setConfs((prev) => [optimistic, ...prev]);
    api('/api/confessions', {
      method: 'POST',
      body: JSON.stringify({ txt, userId: user?.id }),
    }).then((data) => {
      if (data?.confession) {
        setConfs((prev) => prev.map((c) => c.id === optimistic.id ? data.confession : c));
      }
    }).catch(() => {});
  }, [user?.id]);

  const toggleConfessionLike = useCallback((id) => {
    setConfs((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      const curLikes = Array.isArray(c.likes) ? c.likes : [];
      return { ...c, liked: !c.liked, likes: c.liked ? curLikes.filter((u) => u !== user?.id) : [...curLikes, user?.id] };
    }));
    api('/api/confessions/' + id + '/like', {
      method: 'POST',
      body: JSON.stringify({ userId: user?.id || 0 }),
    }).catch(() => {});
  }, [user?.id]);

  const submitMeme = useCallback((ico, cap, url) => {
    const optimistic = { id: Date.now(), ico: ico || '😂', cap, likes: 0, url };
    setMemes((prev) => [optimistic, ...prev]);
    api('/api/memes', {
      method: 'POST',
      body: JSON.stringify({ ico: ico || '😂', cap, url, userId: user?.id }),
    }).then((data) => {
      if (data?.meme) {
        setMemes((prev) => prev.map((m) => m.id === optimistic.id ? data.meme : m));
      }
    }).catch(() => {});
  }, [user?.id]);

  const toggleMemeLike = useCallback((id) => {
    setMemes((prev) => prev.map((m) => m.id === id ? { ...m, likes: m.likes + 1 } : m));
    api('/api/memes/' + id + '/like', {
      method: 'POST',
      body: JSON.stringify({ userId: user?.id || 0 }),
    }).catch(() => {});
  }, [user?.id]);

  const value = {
    user, setUser, toast, showToast, updateProfile, theme, toggleTheme,
    activePage, setActivePage, profileTarget, setProfileTarget,
    posts, setPosts, likePost, repostPost, submitPost,
    groups, events, activeGroup, setActiveGroup,
    confs, memes, polls,
    stories, viewStory, submitStory,
    notifications, markNotifRead, markAllNotifRead, addNotification,
    modQueue, setModQueue,
    activeUsers, hasMorePosts, loadingPosts, loadMorePosts, loadInitialPosts,
    followingMap, toggleFollow, submitPoll, trending, suggs, login, register, logout,
    chatList, activeChat, selectChat, sendMessage, loadChats, socket, friends, loadFriends, startDm,
    addComment, deleteComment, searchQuery, setSearchQuery,
    toggleGroupJoin, toggleEventAttend, submitConfession, toggleConfessionLike,
    submitMeme, toggleMemeLike, votePoll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
