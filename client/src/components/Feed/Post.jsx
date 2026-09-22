import { useState } from 'react';
import { ini, grad } from '../../utils/helpers';
import Icon from '../Common/Icon';

const REACTIONS = ['❤️', '😂', '😮', '😢', '🔥', '👏'];

export default function Post({ post, onLike, onReact, onRepost, onProfile, showToast, addComment, deleteComment, currentUser }) {
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

  const likeCount = Array.isArray(post.likes) ? post.likes.length : post.likes;

  return (
    <div className="post" id={`post-${post.id}`}>
      <div className="post-hd">
        <div className="post-av" style={{ background: grad(post.author) }} onClick={() => onProfile(post.author)}>
          {ini(post.author)}
        </div>
        <div className="post-meta">
          <span className="post-nm" onClick={() => onProfile(post.author)}>
            {post.author}
            {post.verified && <span className="post-check" title="Verified">✓</span>}
          </span>
          <span className="post-sub">@{post.author.replace(/\s+/g, '').toLowerCase()} · {post.t}</span>
          {post.cat && post.cat !== 'general' && <span className={`cat-tag ${cats[post.cat] || ''}`}>{post.cat}</span>}
        </div>
        <div className="more-btn" onClick={() => showToast('Report/block options')}>···</div>
      </div>
      <div className="post-body">{post.txt}</div>
      {post.imageUrl && (
        <div className="post-img-wrap">
          <img className="post-img" src={post.imageUrl} alt="Post content" />
        </div>
      )}
      <div className="post-ft">
        <div className="pact" onClick={() => setShowComments(!showComments)}>
          <Icon name="message" size={17} /><span>{commentCount}</span>
        </div>
        <div className={`pact${post.reposted ? ' reposted' : ''}`} onClick={() => onRepost(post.id)}>
          <Icon name="repost" size={16} /><span>{post.reposts}</span>
        </div>
        <div className="react-wrap">
          <div className={`pact${post.liked ? ' liked' : ''}${post.myReaction ? ' reacted' : ''}`} onClick={() => onLike(post.id)}>
            {post.myReaction ? <span className="react-emoji">{post.myReaction}</span> : <Icon name={post.liked ? 'heartFilled' : 'heart'} size={17} />}<span>{likeCount}</span>
          </div>
          <div className="react-bar">
            {REACTIONS.map((r) => (
              <div key={r} className={`react-opt${post.myReaction === r ? ' on' : ''}`} onClick={() => onReact(post.id, r)}>
                {r}
              </div>
            ))}
          </div>
        </div>
        <div className="pact" onClick={() => showToast('Link copied!')}><Icon name="share" size={16} /></div>
      </div>
      {showComments && (
        <div className="comments-panel">
          {commentList.length === 0 && <div className="comments-empty">No comments yet. Be the first!</div>}
          {commentList.map((c) => (
            <div key={c.id} className="comment-item">
              <div className="comment-av" style={{ background: grad(c.author) }}>{ini(c.author)}</div>
              <div className="comment-body">
                <div className="comment-author">{c.author}</div>
                <span className="comment-text">{c.text}</span>
                <div className="comment-time">{c.time}</div>
              </div>
              {(currentUser?.id === c.userId || currentUser?.name === c.author) && (
                <div className="comment-del" onClick={() => handleDeleteComment(c.id)} title="Delete">✕</div>
              )}
            </div>
          ))}
          <div className="comment-inp-row">
            <input className="comment-inp" type="text" placeholder="Write a comment…" value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddComment()} />
            <button className="comment-sub" onClick={handleAddComment}>Reply</button>
          </div>
        </div>
      )}
    </div>
  );
}
