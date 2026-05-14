import { useState } from 'react';
import { ini, grad } from '../../utils/helpers';

export default function Post({ post, onLike, onRepost, onProfile, showToast, addComment, deleteComment, currentUser }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const cats = { general: '', academics: 'academics', hostel: 'hostel', gist: 'gist', events: 'events', confession: 'confession', meme: 'meme', sports: 'sports' };
  const commentList = post.comments || [];
  const commentCount = commentList.length;

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addComment(post.id, commentText, currentUser);
    setCommentText('');
  };

  const handleDeleteComment = (commentId) => {
    deleteComment(post.id, commentId);
  };

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
      {post.imageUrl && (
        <div className="post-img-wrap">
          <img className="post-img" src={post.imageUrl} alt="Post content" />
        </div>
      )}
      <div className="post-ft">
        <div className={`pact${post.liked ? ' liked' : ''}`} onClick={() => onLike(post.id)}>
          {post.liked ? '♥' : '♡'}<span>{Array.isArray(post.likes) ? post.likes.length : post.likes}</span>
        </div>
        <div className="pact" onClick={() => setShowComments(!showComments)}>
          💬<span>{commentCount}</span>
        </div>
        <div className={`pact${post.reposted ? ' reposted' : ''}`} onClick={() => onRepost(post.id)}>
          🔁<span>{post.reposts}</span>
        </div>
        <div className="pact" onClick={() => showToast('🔗 Link copied!')}>🔗 Share</div>
      </div>
      {showComments && (
        <div className="comments-panel">
          {commentList.length === 0 && <div className="comments-empty">No comments yet. Be the first!</div>}
          {commentList.map((c) => (
            <div key={c.id} className="comment-item">
              <div className="comment-av" style={{ background: grad(c.author) }}>{ini(c.author)}</div>
              <div className="comment-body">
                <div className="comment-author">{c.author}</div>
                <div className="comment-text">{c.text}</div>
                <div className="comment-time">{c.time}</div>
              </div>
              {(currentUser?.id === c.userId || currentUser?.name === c.author) && (
                <div className="comment-del" onClick={() => handleDeleteComment(c.id)} title="Delete">✕</div>
              )}
            </div>
          ))}
          <div className="comment-inp-row">
            <input className="comment-inp" type="text" placeholder="Write a comment…" value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddComment()} />
            <button className="comment-sub" onClick={handleAddComment}>Post</button>
          </div>
        </div>
      )}
    </div>
  );
}
