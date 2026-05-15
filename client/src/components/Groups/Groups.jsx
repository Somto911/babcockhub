import { useApp } from '../../context/AppContext';
import Post from '../Feed/Post';
import { ini, grad } from '../../utils/helpers';

export default function Groups() {
  const { groups, setGroups, posts, activeGroup, setActiveGroup, setActivePage, setProfileTarget, likePost, repostPost, showToast, addComment, deleteComment, user } = useApp();

  const userDept = user?.dept?.split(' ')[0] || '';
  const visibleGroups = groups.filter((g) => !g.depts || g.depts.some((d) => userDept.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(userDept.toLowerCase())));

  const toggleJoin = (id) => {
    const g = groups.find((x) => x.id === id);
    if (!g) return;
    setGroups((prev) => prev.map((x) => x.id === id ? { ...x, joined: !x.joined } : x));
    showToast(g.joined ? `Left ${g.nm}` : `Joined ${g.nm}`);
  };

  const openGroup = (g) => {
    setActiveGroup(g);
  };

  const closeGroup = () => {
    setActiveGroup(null);
  };

  if (activeGroup) {
    const groupPosts = posts.filter((p) => p.cat === activeGroup.cat || activeGroup.cat === 'general');
    return (
      <div className="pg on" id="pg-groups">
        <div className="grp-feed-hd">
          <button className="btn-out" onClick={closeGroup} style={{ padding: '5px 12px', fontSize: '12px' }}>← Back</button>
          <div className="grp-feed-info">
            <div className="grp-feed-ico" style={{ background: activeGroup.grad }}>{activeGroup.ico}</div>
            <div>
              <div className="grp-feed-nm">{activeGroup.nm}</div>
              <div className="grp-feed-type">{activeGroup.type} · {activeGroup.mem.toLocaleString()} members</div>
            </div>
          </div>
          <button className={`join-btn${activeGroup.joined ? ' jd' : ''}`} onClick={() => toggleJoin(activeGroup.id)} style={{ marginLeft: 'auto' }}>
            {activeGroup.joined ? 'Joined' : 'Join'}
          </button>
        </div>
        <div className="grp-feed-desc">{activeGroup.desc}</div>
        {groupPosts.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text2)' }}>No posts in this group yet</div>}
        {groupPosts.map((p) => (
          <Post key={p.id} post={p} onLike={likePost} onRepost={repostPost} onProfile={(name) => { setProfileTarget(name); setActivePage('profile'); }} showToast={showToast} addComment={addComment} deleteComment={deleteComment} currentUser={user} />
        ))}
      </div>
    );
  }

  return (
    <div className="pg on" id="pg-groups">
      <div className="pg-hd">
        <div className="pg-title">Groups</div>
        <button className="btn-out" onClick={() => showToast('Create group coming soon!')}>+ Create Group</button>
      </div>
      <div id="grp-list">
        {visibleGroups.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text2)' }}>No groups available for your department</div>}
        {visibleGroups.map((g) => (
          <div className="grp" key={g.id} style={{ cursor: 'pointer' }} onClick={() => openGroup(g)}>
            <div className="grp-banner" style={{ background: g.grad }}>{g.ico}</div>
            <div className="grp-body">
              <div className="grp-ico" style={{ background: g.grad }}>{g.ico}</div>
              <div className="grp-type">{g.type}</div>
              <div className="grp-nm">{g.nm}</div>
              <div className="grp-desc">{g.desc}</div>
              <div className="grp-ft">
                <div className="grp-mem">Members: {g.mem.toLocaleString()}</div>
                <button className={`join-btn${g.joined ? ' jd' : ''}`} onClick={(e) => { e.stopPropagation(); toggleJoin(g.id); }}>
                  {g.joined ? 'Joined' : 'Join'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
