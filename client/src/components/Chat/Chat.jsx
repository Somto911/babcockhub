import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ini, grad } from '../../utils/helpers';

export default function Chat() {
  const { chatList, activeChat, selectChat, sendMessage, user, friends, startDm, showToast } = useApp();
  const [msg, setMsg] = useState('');
  const [showNewMsg, setShowNewMsg] = useState(false);
  const msgsEndRef = useRef(null);

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.msgs]);

  const handleSend = () => {
    if (!msg.trim()) return;
    sendMessage(msg.trim());
    setMsg('');
  };

  const handleSelectFriend = (friend) => {
    startDm(friend);
    setShowNewMsg(false);
  };

  return (
    <div className="pg on" id="pg-chat">
      <div className="chat-wrap">
        <div className="cl-panel">
          <div className="cl-head">
            <span>Messages</span>
            <button className="cl-new" onClick={() => setShowNewMsg(!showNewMsg)} title="New message">+</button>
          </div>
          {showNewMsg && (
            <div className="cl-new-panel">
              <div className="cl-new-title">Select a friend to message</div>
              {friends.length === 0 && <div className="cl-new-empty">No friends yet. Follow each other to start chatting!</div>}
              {friends.map((f) => (
                <div key={f.id} className="cl-new-friend" onClick={() => handleSelectFriend(f)}>
                  <div className="cli-av" style={{ background: grad(f.name) }}>{ini(f.name)}</div>
                  <div className="cli-nfo">
                    <div className="cli-nm">{f.name}</div>
                    <div className="cli-pr">{f.dept}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="cl-list">
            {chatList.map((c) => (
              <div key={c.id} className={`cli${activeChat?.id === c.id ? ' on' : ''}`} onClick={() => selectChat(c.id)}>
                <div className="cli-av" style={{ background: c.grad || '#4f7fff' }}>{c.ico || '💬'}</div>
                <div className="cli-nfo">
                  <div className="cli-nm">{c.nm}</div>
                  <div className="cli-pr">{c.preview || 'No messages yet'}</div>
                </div>
                <div className="cli-rt">
                  <div className="cli-t">{c.t || ''}</div>
                  {c.badge ? <div className="cbadge">{c.badge}</div> : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-win">
          {!activeChat ? (
            <div className="empty-messages" style={{ minHeight: 'auto', flex: 1 }}>
              <div className="empty-ico">💬</div>
              <div className="empty-title">Select a chat</div>
              <div className="empty-desc">Choose a conversation or click + to start a new message</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flex: 1, flexDirection: 'column', height: '100%' }}>
              <div className="chat-hd">
                <div className="chd-av" style={{ background: activeChat.grad || '#4f7fff' }}>{activeChat.ico || '💬'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="chd-nm">{activeChat.nm}</div>
                  <div className="chd-st">{activeChat.online || '1 online'}</div>
                </div>
              </div>
              <div className="chat-msgs">
                {(activeChat.msgs || []).map((m, i) => {
                  const isOwn = m.own || (user && m.senderId === user.id);
                  return (
                    <div key={i} className={`msg-r${isOwn ? ' own' : ''}`}>
                      {!isOwn && <div className="msg-av2" style={{ background: grad(m.senderName) || '#4f7fff' }}>{ini(m.senderName)}</div>}
                      <div className="bubble">
                        {!isOwn && <div className="msg-nm">{m.senderName}</div>}
                        {m.txt}
                        <div className="msg-time">{m.t || ''}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={msgsEndRef} />
              </div>
              <div className="chat-inp-bar">
                <input className="chat-inp" type="text" placeholder="Type a message..." value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
                <button className="send-btn" onClick={handleSend}>➤</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
