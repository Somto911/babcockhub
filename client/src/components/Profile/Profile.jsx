import { useApp } from '../../context/AppContext';
import { ini, grad } from '../../utils/helpers';

export default function Profile() {
  const { user, posts, profileTarget, setActivePage } = useApp();
  const targetName = profileTarget || user?.name;
  const targetPosts = posts.filter((p) => p.author === targetName || p.repostedBy?.includes(targetName));
  const isMe = targetName === user?.name;

  return (
    <div className="pg on" id="pg-profile">
      <div className="prof-card">
        <div className="prof-banner" style={{ background: 'linear-gradient(135deg,rgba(26,86,255,.35),rgba(0,194,122,.25))' }}>🎓</div>
        <div className="prof-bd">
          <div className="prof-av" style={{ background: grad(targetName) }}>{ini(targetName)}</div>
          <div className="prof-nm">{targetName}</div>
          <div className="prof-dept">{user?.dept || ''} · {user?.lvl || ''} Level · {user?.hostel || ''}</div>
          <div className="prof-bio">{targetName} — {user?.dept || ''} student | Babcock '26</div>
          <div className="prof-acts">
            <button className="btn-out" onClick={() => {}}>
              {isMe ? '✏️ Edit Profile' : '➕ Follow'}
            </button>
          </div>
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
