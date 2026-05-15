import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function Memes() {
  const { memes, showToast, submitMeme, toggleMemeLike } = useApp();
  const [fullMeme, setFullMeme] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [memeCap, setMemeCap] = useState('');
  const [memeUrl, setMemeUrl] = useState('');

  const handleUpload = () => {
    if (!memeCap.trim() || !memeUrl.trim()) return showToast('Enter caption and URL!');
    submitMeme('😂', memeCap.trim(), memeUrl.trim());
    setMemeCap('');
    setMemeUrl('');
    setShowUpload(false);
    showToast('Meme uploaded!');
  };

  return (
    <div className="pg on" id="pg-memes">
      <div className="pg-hd">
        <div className="pg-title">Meme Hub</div>
        <button className="btn-out" onClick={() => setShowUpload(true)}>+ Upload Meme</button>
      </div>
      {showUpload && (
        <div className="overlay open" onClick={() => setShowUpload(false)}>
          <div className="modal" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-hd">
              <div className="modal-title">Upload Meme</div>
              <div className="modal-x" onClick={() => setShowUpload(false)}>X</div>
            </div>
            <input className="inp" placeholder="Caption..." value={memeCap} onChange={(e) => setMemeCap(e.target.value)} />
            <input className="inp" placeholder="Image/GIF URL..." value={memeUrl} onChange={(e) => setMemeUrl(e.target.value)} />
            <button className="btn-main" onClick={handleUpload}>Upload</button>
          </div>
        </div>
      )}
      <div className="meme-grid">
        {memes.map((m, i) => (
          <div className="meme-card" key={m.id || i} onClick={() => setFullMeme(m)}>
            <div className="meme-img meme-gif">
              <img src={m.url} alt={m.cap} loading="lazy" />
            </div>
            <div className="meme-bd">
              <div className="meme-cap">{m.cap}</div>
              <div className="meme-acts">
                <div className="mact" onClick={(e) => { e.stopPropagation(); toggleMemeLike(m.id); }}>Likes {m.likes.toLocaleString()}</div>
                <div className="mact" onClick={(e) => { e.stopPropagation(); showToast('Link copied!'); }}>Share</div>
                <div className="mact" onClick={(e) => { e.stopPropagation(); showToast('Saved!'); }}>Save</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {fullMeme && (
        <div className="overlay open" onClick={() => setFullMeme(null)}>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--r3)', overflow: 'hidden', maxWidth: '520px', width: '92%', margin: 'auto', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <div className="meme-modal-x" onClick={() => setFullMeme(null)}>X</div>
            <img src={fullMeme.url} alt="" style={{ width: '100%', maxHeight: '65vh', objectFit: 'contain', display: 'block', background: 'rgba(0,0,0,.4)' }} />
            <div className="meme-modal-bd">
              <div className="meme-full-cap">{fullMeme.cap}</div>
              <div className="meme-full-acts">
                <div className="mact-big" onClick={(e) => { e.stopPropagation(); toggleMemeLike(fullMeme.id); }}>Likes {fullMeme.likes.toLocaleString()}</div>
                <div className="mact-big" onClick={() => showToast('Link copied!')}>Share</div>
                <div className="mact-big" onClick={() => showToast('Saved!')}>Save</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
