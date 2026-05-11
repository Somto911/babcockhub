import { ini, grad } from '../../utils/helpers';

export default function Post({ post, onLike, onRepost, onProfile, showToast }) {
  const cats = { general: '', academics: 'academics', hostel: 'hostel', gist: 'gist', events: 'events', confession: 'confession', meme: 'meme', sports: 'sports' };

  return (
    <div className="post" id={`post-${post.id}`}>
      <div className="post-hd">
        <div className="post-av" style={{ background: grad(post.author) }} onClick={() => onProfile(post.author)}>
          {ini(post.author)}
        </div>
        <div className="post-meta">
          <div className="post-nm" onClick={() => onProfile(post.author)}>{post.author}</div>
          <div className="post-sub">
            <span>{post.dept}</span>·<span>{post.t}</span>
            {post.cat && post.cat !== 'general' && <span className={`cat-tag ${cats[post.cat] || ''}`}>{post.cat}</span>}
          </div>
        </div>
        <div className="more-btn" onClick={() => showToast('🚩 Report/block options')}>···</div>
      </div>
      <div className="post-body">{post.txt}</div>
      <div className="post-ft">
        <div className={`pact${post.liked ? ' liked' : ''}`} onClick={() => onLike(post.id)}>
          {post.liked ? '❤️' : '🤍'}<span>{post.likes}</span>
        </div>
        <div className="pact" onClick={() => showToast('💬 Comments — coming soon!')}>💬<span>{post.comments}</span></div>
        <div className={`pact${post.reposted ? ' reposted' : ''}`} onClick={() => onRepost(post.id)}>
          🔁<span>{post.reposts}</span>
        </div>
        <div className="pact" onClick={() => showToast('🔗 Link copied!')}>🔗 Share</div>
      </div>
    </div>
  );
}
