import { useState } from 'react';
import { ini, grad } from '../../utils/helpers';
import Icon from '../Common/Icon';

const REACTIONS = ['❤️', '😂', '😮', '😢', '🔥', '👏'];
const VERIFIED_NAMES = ['somto', 'Somto', 'admin', 'Admin'];

const compact = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
};

// Deterministic pseudo-stats from post id so numbers are stable & realistic
const pseudo = (id, salt, base) => {
  const h = Math.abs(String(id).split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 7) + salt);
  return base + (h % (base / 2));
};

export default function Post({ post, onLike, onReact, onRepost, onProfile, showToast, addComment, deleteComment, currentUser }) {
  const [showComments, setShowComments] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const cats = { general: '', academics: 'academics', hostel: 'hostel', gist: 'gist', events: 'events', confession: 'confession', meme: 'meme', sports: 'sports' };
  const commentList = post.comments || [];
  const commentCount = commentList.length;
  const likeBase = pseudo(post.id, 7, 180);
  const likeCount = (Array.isArray(post.likes) ? post.likes.length : post.likes) + likeBase;
  const repostCount = (post.reposts || 0) + pseudo(post.id, 29, 40);
  const views = pseudo(post.id, 13, 1200);
  const verified = post.verified || (currentUser?.name === post.author) || VERIFIED_NAMES.includes(post.author) || (post.cat === 'events');

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
          <div className="post-meta-row">
            <span className="post-nm" onClick={() => onProfile(post.author)}>
              {post.author}
              {verified && <span className="post-check" title="Verified">✓</span>}
            </span>
            <span className="post-sub">
              <span className="post-handle">@{post.author.replace(/\s+/g, '').toLowerCase()}</span>
              <span className="post-dot">·</span>
              <span className="post-time">{post.t}</span>
            </span>
          </div>
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
      {post.quote && (
        <div className="quote-box">
          <div className="quote-hd">
            <div className="quote-av" style={{ background: grad(post.quote.author) }}>{ini(post.quote.author)}</div>
            <div className="quote-meta">
              <span className="quote-nm">{post.quote.author}</span>
              <span className="quote-handle">@{post.quote.author.replace(/\s+/g, '').toLowerCase()} · {post.quote.t || post.t}</span>
            </div>
          </div>
          <div className="quote-txt">{post.quote.txt}</div>
          {post.quote.imageUrl && <img className="quote-img" src={post.quote.imageUrl} alt="Quoted content" />}
        </div>
      )}
      <div className="post-ft">
        <div className="pact" onClick={() => setShowComments(!showComments)} title="Reply">
          <Icon name="message" size={17} /><span>{compact(commentCount)}</span>
        </div>
        <div className={`pact${post.reposted ? ' reposted' : ''}`} onClick={() => onRepost(post.id)} title="Repost">
          <Icon name="repost" size={16} /><span>{compact(repostCount)}</span>
        </div>
        <div className="react-wrap">
          <div className={`pact${post.liked ? ' liked' : ''}${post.myReaction ? ' reacted' : ''}`} onClick={() => onLike(post.id)} title="Like">
            {post.myReaction ? <span className="react-emoji">{post.myReaction}</span> : <Icon name={post.liked ? 'heartFilled' : 'heart'} size={17} />}<span>{compact(likeCount)}</span>
          </div>
          <div className="react-bar">
            {REACTIONS.map((r) => (
              <div key={r} className={`react-opt${post.myReaction === r ? ' on' : ''}`} onClick={() => onReact(post.id, r)}>
                {r}
              </div>
            ))}
          </div>
        </div>
        <div className="pact" title="Views">
          <Icon name="eye" size={17} /><span>{compact(views)}</span>
        </div>
        <div className={`pact${bookmarked ? ' bookmarked' : ''}`} onClick={() => { setBookmarked(!bookmarked); showToast(bookmarked ? 'Removed from bookmarks' : 'Added to bookmarks'); }} title="Bookmark">
          <Icon name="bookmark" size={16} />
        </div>
        <div className="pact" onClick={() => showToast('Link copied!')} title="Share"><Icon name="share" size={16} /></div>
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