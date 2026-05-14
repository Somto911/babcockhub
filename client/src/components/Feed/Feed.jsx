import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import Post from './Post';
import StoryViewer from '../Common/StoryViewer';
import { ini, grad } from '../../utils/helpers';

export default function Feed() {
  const { user, posts, stories, setActivePage, setProfileTarget, likePost, repostPost, submitPost, viewStory, showToast, addComment, deleteComment, searchQuery, hasMorePosts, loadingPosts, loadMorePosts, loadInitialPosts } = useApp();
  const [text, setText] = useState('');
  const [cat, setCat] = useState('general');
  const [filter, setFilter] = useState('all');
  const [storyIdx, setStoryIdx] = useState(null);
  const [viewerStories, setViewerStories] = useState([]);
  const sentinelRef = useRef(null);

  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasMorePosts && !loadingPosts) {
      loadMorePosts();
    }
  }, [hasMorePosts, loadingPosts, loadMorePosts]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, { rootMargin: '200px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  const filtered = posts
    .filter((p) => filter === 'all' || p.cat === filter)
    .filter((p) => !searchQuery || p.txt.toLowerCase().includes(searchQuery.toLowerCase()) || p.author.toLowerCase().includes(searchQuery.toLowerCase()));

  const hour = new Date().getHours();
  const greet = hour < 12 ? `Good morning, ${user?.name?.split(' ')[0] || ''}` : hour < 17 ? `Good afternoon, ${user?.name?.split(' ')[0] || ''}` : `Good evening, ${user?.name?.split(' ')[0] || ''}`;

  const handleSubmit = () => {
    if (!text.trim()) return showToast('⚠️ Write something!');
    submitPost(text.trim(), cat, '');
    setText('');
    showToast('🚀 Posted!');
  };

  return (
    <>
    <div className="pg on" id="pg-feed">
      <div className="stories">
        <div className="story" onClick={() => showToast('📸 Create a story feature coming soon!')}>
          <div className="story-add">
            <div className="plus">+</div>
            <div className="plus-label">Add Story</div>
          </div>
        </div>
        {stories.map((s, idx) => (
          <div className={`story${s.seen ? ' seen' : ''}`} key={s.id} onClick={() => { viewStory(s.id); setViewerStories(stories); setStoryIdx(idx); }}>
            <div className="story-bg">
              <img className="story-img" src={s.img} alt={s.name} />
              <div className="story-overlay" />
            </div>
            <div className="story-icon">{s.icon}</div>
            <div className="story-label">{s.name}</div>
          </div>
        ))}
      </div>

      <div className="greeting-bar">
        <div style={{ flex: 1 }}>
          <div className="greet-text">{greet} ✨</div>
          <div className="greet-sub">Here's what's happening on campus today</div>
        </div>
        <button className="refresh-btn" onClick={() => { loadInitialPosts(); showToast('Posts refreshed!'); }} title="Refresh posts">↻</button>
      </div>

      <div className="composer">
        <div className="comp-top">
          <div className="comp-av">{user ? ini(user.name) : '?'}</div>
          <textarea className="comp-ta" placeholder="What's happening on campus?" rows={2} value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div className="comp-bar">
          <select className="comp-sel" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="general">General</option>
            <option value="academics">Academics</option>
            <option value="hostel">Hostel Life</option>
            <option value="gist">Gist</option>
            <option value="events">Events</option>
          </select>
          <button className="comp-sub" onClick={handleSubmit}>Post →</button>
        </div>
      </div>

      <div className="chips">
        {[['all', '✨ All'], ['academics', '📚 Academics'], ['hostel', '🏠 Hostel'], ['gist', '☕ Gist'], ['events', '📅 Events'], ['sports', '⚽ Sports']].map(([key, label]) => (
          <div key={key} className={`chip${filter === key ? ' on' : ''}`} onClick={() => setFilter(key)}>{label}</div>
        ))}
      </div>

      <div id="feed-posts">
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text2)' }}>No posts found</div>}
        {filtered.map((p) => (
          <Post key={p.id} post={p} onLike={likePost} onRepost={repostPost} onProfile={(name) => { setProfileTarget(name); setActivePage('profile'); }} showToast={showToast} addComment={addComment} deleteComment={deleteComment} currentUser={user} />
        ))}
        {loadingPosts && <div className="feed-loader"><div className="spinner" /></div>}
        {hasMorePosts && !loadingPosts && <div ref={sentinelRef} className="feed-sentinel" />}
      </div>
    </div>
    {storyIdx != null && (
      <StoryViewer stories={viewerStories} activeIdx={storyIdx} onClose={() => { setStoryIdx(null); setViewerStories([]); }} onNext={() => setStoryIdx((i) => Math.min(i + 1, viewerStories.length - 1))} onPrev={() => setStoryIdx((i) => Math.max(i - 1, 0))} onMarkSeen={viewStory} />
    )}
    </>
  );
}
