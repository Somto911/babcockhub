import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ini, grad } from '../../utils/helpers';

export default function Profile() {
  const { user, posts, profileTarget, setActivePage, updateProfile, showToast } = useApp();
  const [editing, setEditing] = useState(false);
  const [edit, setEdit] = useState({
    name: user?.name || '',
    dept: user?.dept || '',
    lvl: user?.lvl || '',
    hostel: user?.hostel || '',
    bio: user?.bio || '',
  });

  const targetName = profileTarget || user?.name;
  const targetPosts = posts.filter((p) => p.author === targetName || p.repostedBy?.includes(targetName));
  const isMe = targetName === user?.name;

  const handleSave = () => {
    if (!edit.name.trim()) return showToast('⚠️ Name cannot be empty');
    updateProfile(edit);
    setEditing(false);
    showToast('✅ Profile updated!');
  };

  const handleCancel = () => {
    setEdit({ name: user?.name || '', dept: user?.dept || '', lvl: user?.lvl || '', hostel: user?.hostel || '', bio: user?.bio || '' });
    setEditing(false);
  };

  return (
    <div className="pg on" id="pg-profile">
      <div className="prof-card">
        <div className="prof-banner" style={{ background: 'linear-gradient(135deg,rgba(26,86,255,.35),rgba(0,194,122,.25))' }}>🎓</div>
        <div className="prof-bd">
          <div className="prof-av" style={{ background: grad(targetName) }}>{ini(targetName)}</div>
          {editing && isMe ? (
            <div className="prof-edit-form">
              <input className="inp" placeholder="Full name" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
              <div className="row2">
                <input className="inp" placeholder="Department" value={edit.dept} onChange={(e) => setEdit({ ...edit, dept: e.target.value })} />
                <input className="inp" placeholder="Level (e.g. 300)" value={edit.lvl} onChange={(e) => setEdit({ ...edit, lvl: e.target.value })} />
              </div>
              <div className="row2">
                <input className="inp" placeholder="Hostel" value={edit.hostel} onChange={(e) => setEdit({ ...edit, hostel: e.target.value })} />
              </div>
              <textarea className="inp prof-edit-bio" placeholder="Bio" rows={3} value={edit.bio} onChange={(e) => setEdit({ ...edit, bio: e.target.value })} />
              <div className="prof-edit-acts">
                <button className="btn-main" style={{ flex: 1 }} onClick={handleSave}>Save</button>
                <button className="btn-out" onClick={handleCancel} style={{ flex: 1, textAlign: 'center' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="prof-nm">{targetName}</div>
              <div className="prof-dept">{user?.dept || ''} · {user?.lvl || ''} Level{user?.hostel ? ` · ${user.hostel}` : ''}</div>
              <div className="prof-bio">{user?.bio || `${targetName} — ${user?.dept || ''} student`}</div>
              <div className="prof-acts">
                {isMe ? (
                  <button className="btn-out" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
                ) : (
                  <button className="btn-main" style={{ width: 'auto', padding: '7px 18px' }} onClick={() => showToast('➕ Followed!')}>➕ Follow</button>
                )}
              </div>
            </>
          )}
          <div className="prof-stats">
            <div className="ps"><div className="ps-n">{targetPosts.length}</div><div className="ps-l">Posts</div></div>
            <div className="ps"><div className="ps-n">612</div><div className="ps-l">Followers</div></div>
            <div className="ps"><div className="ps-n">248</div><div className="ps-l">Following</div></div>
            <div className="ps"><div className="ps-n">7</div><div className="ps-l">Groups</div></div>
          </div>
          <div className="prof-tags">
            <span className="ptag">#CSC300</span>
            <span className="ptag">#Winslow Hall</span>
            <span className="ptag">#TechClub</span>
            <span className="ptag">#Babcock26</span>
          </div>
        </div>
      </div>
      <div className="sec-hd">My Posts</div>
      {targetPosts.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text2)' }}>No posts yet</div>}
      {targetPosts.map((p) => (
        <div className={`post${p.repostedBy?.includes(targetName) ? ' reposted-post' : ''}`} key={p.id}>
          {p.repostedBy?.includes(targetName) && <div className="repost-label">🔁 Reposted</div>}
          <div className="post-hd">
            <div className="post-av" style={{ background: grad(p.author) }}>{ini(p.author)}</div>
            <div className="post-meta">
              <div className="post-nm">{p.author}</div>
              <div className="post-sub"><span>{p.dept}</span>·<span>{p.t}</span></div>
            </div>
          </div>
          <div className="post-body">{p.txt}</div>
          <div className="post-ft">
            <div className="pact">🤍<span>{p.likes}</span></div>
            <div className="pact">💬<span>{p.comments}</span></div>
            <div className="pact">🔁<span>{p.reposts || 0}</span></div>
          </div>
        </div>
      ))}
    </div>
  );
}
