import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function Memes() {
  const { memes, showToast } = useApp();
  const [fullMeme, setFullMeme] = useState(null);

  return (
    <div className="pg on" id="pg-memes">
      <div className="pg-hd">
        <div className="pg-title">Meme Hub</div>
        <button className="btn-out" onClick={() => showToast('Upload your meme!')}>+ Upload Meme</button>
      </div>
      <div className="meme-grid">
        {memes.map((m, i) => (
          <div className="meme-card" key={i} onClick={() => setFullMeme(m)}>
            <div className="meme-img meme-gif">
              <img src={m.url} alt={m.cap} loading="lazy" />
            </div>
            <div className="meme-bd">
              <div className="meme-cap">{m.cap}</div>
              <div className="meme-acts">
                <div className="mact" onClick={(e) => { e.stopPropagation(); showToast('Meme liked!'); }}>Likes {m.likes.toLocaleString()}</div>
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
                <div className="mact-big" onClick={() => showToast('Meme liked!')}>Likes {fullMeme.likes.toLocaleString()}</div>
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
