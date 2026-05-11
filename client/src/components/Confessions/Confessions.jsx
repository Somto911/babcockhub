import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function Confessions() {
  const { confs, showToast } = useApp();
  const [text, setText] = useState('');

  const toggleLike = (id) => {
    showToast('❤️ Liked!');
  };

  const submit = () => {
    if (!text.trim()) return showToast('⚠️ Write something!');
    if (text.trim().length < 20) return showToast('⚠️ Confession too short!');
    showToast('👻 Confession posted anonymously!');
    setText('');
  };

  return (
    <div className="pg on" id="pg-conf">
      <div className="pg-hd"><div className="pg-title">👻 Confession Wall</div></div>
      <div className="conf-composer">
        <div className="conf-note">👻 Your identity is hidden — post anonymously</div>
        <textarea className="comp-ta" placeholder="Confess your campus secrets… 👻" rows={3} style={{ borderColor: 'rgba(139,92,246,.2)' }} value={text} onChange={(e) => setText(e.target.value)} />
        <div style={{ marginTop: 8, display: 'flex' }}>
          <button className="comp-sub" style={{ background: 'var(--purple)', boxShadow: '0 4px 18px var(--purple-dim)' }} onClick={submit}>Confess 👻</button>
        </div>
      </div>
      <div id="conf-list">
        {confs.map((c) => (
          <div className="conf" key={c.id}>
            <div className="conf-hd">
              <div className="ghost-av">👻</div>
              <div>
                <div className="conf-nm">Anonymous Student</div>
                <div className="conf-t">{c.t}</div>
              </div>
              <div className="more-btn" style={{ marginLeft: 'auto' }}>⚑</div>
            </div>
            <div className="conf-body">{c.txt}</div>
            <div className="post-ft" style={{ padding: 0 }}>
              <div className={`pact${c.liked ? ' liked' : ''}`} onClick={() => toggleLike(c.id)}>
                {c.liked ? '❤️' : '🤍'}<span>{c.likes}</span>
              </div>
              <div className="pact" onClick={() => showToast('💬 Reply coming soon!')}>💬 Reply</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
