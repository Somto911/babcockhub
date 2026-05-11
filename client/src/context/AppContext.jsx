import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { api } from '../utils/helpers';
import { initialPosts, initialGroups, initialEvents, initialConfs, initialMemes, initialPolls, initialStories, initialChats, trending, suggs, modItems } from '../data/initialData';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [toast, setToast] = useState(null);
  const [activePage, setActivePage] = useState('feed');
  const [profileTarget, setProfileTarget] = useState(null);

  const [posts, setPosts] = useState(initialPosts);
  const [groups, setGroups] = useState(initialGroups);
  const [events, setEvents] = useState(initialEvents);
  const [confs, setConfs] = useState(initialConfs);
  const [memes, setMemes] = useState(initialMemes);
  const [polls, setPolls] = useState(initialPolls);
  const [stories, setStories] = useState(initialStories);
  const [modQueue, setModQueue] = useState(modItems);

  const [chatList, setChatList] = useState(initialChats);
  const [activeChat, setActiveChat] = useState(null);
  const activeChatRef = useRef(null);

  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const initSocket = useCallback(() => {
    if (socket) return;
    const s = io();
    s.on('connect', () => {
      if (user) s.emit('join', { id: user.id, name: user.name, email: user.email });
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
        showToast(`📩 New message: ${data.msg?.senderName || 'Someone'}`);
      }
    });
    s.on('chat:error', (err) => showToast(`⚠️ ${err?.message || 'Chat error'}`));
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
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(() => {
    if (socket) { socket.disconnect(); setSocket(null); }
    setUser(null);
    setActivePage('feed');
    setActiveChat(null);
    setChatList([]);
  }, [socket]);

  const loadChats = useCallback(async () => {
    try {
      const data = await api('/api/chats');
      setChatList(data.chats || []);
    } catch (e) {
      console.error('[CHAT] Failed to load:', e);
    }
  }, []);

  const selectChat = useCallback((chatId) => {
    const chat = chatList.find((c) => c.id === chatId);
    if (!chat) return;
    if (activeChat && socket) socket.emit('chat:leave', { chatId: activeChat.id });
    setActiveChat(chat);
    if (socket) socket.emit('chat:join', { chatId: chat.id });
  }, [chatList, activeChat, socket]);

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
        ? { ...c, msgs: [...(c.msgs || []), optimistic], preview: `You: ${txt.slice(0, 28)}${txt.length > 28 ? '…' : ''}`, t: 'Just now' }
        : c
    ));
  }, [activeChat, socket, user]);

  const likePost = useCallback((id) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p)));
  }, []);

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

  const viewStory = useCallback((id) => {
    setStories((prev) => prev.map((s) => s.id === id ? { ...s, seen: true } : s));
  }, []);

  const submitPost = useCallback((txt, cat) => {
    setPosts((prev) => [
      { id: Date.now(), author: user?.name || 'You', dept: `${user?.dept?.split(' ')[0] || 'Student'} · ${user?.lvl || '300'}L`, t: 'Just now', cat: cat || 'general', txt, likes: 0, comments: 0, liked: false, reposts: 0, reposted: false, repostedBy: [] },
      ...prev,
    ]);
  }, [user]);

  useEffect(() => {
    if (user) initSocket();
  }, [user, initSocket]);

  useEffect(() => {
    if (user) loadChats();
  }, [user, loadChats]);

  const value = {
    user, setUser, toast, showToast,
    activePage, setActivePage, profileTarget, setProfileTarget,
    posts, setPosts, likePost, repostPost, submitPost,
    groups, setGroups, events, setEvents,
    confs, setConfs, memes, setMemes, polls, setPolls,
    stories, setStories, viewStory,
    modQueue, setModQueue,
    trending, suggs, login, register, logout,
    chatList, activeChat, selectChat, sendMessage, loadChats, socket,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
