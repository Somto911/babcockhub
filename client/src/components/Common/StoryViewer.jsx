import { useState, useEffect, useCallback } from 'react';

export default function StoryViewer({ stories, activeIdx, onClose, onNext, onPrev, onMarkSeen }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (activeIdx == null) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [activeIdx]);

  useEffect(() => {
    if (progress >= 100 && activeIdx != null) onNext?.();
  }, [progress, activeIdx, onNext]);

  const handleClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.3) onPrev?.();
    else onNext?.();
  }, [onNext, onPrev]);

  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose?.();
    if (e.key === 'ArrowRight') onNext?.();
    if (e.key === 'ArrowLeft') onPrev?.();
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  if (activeIdx == null || !stories[activeIdx]) return null;

  const story = stories[activeIdx];

  return (
    <div className="story-viewer" onClick={handleClick}>
      <div className="sv-close" onClick={(e) => { e.stopPropagation(); onClose?.(); }}>✕</div>
      <div className="sv-progress">
        {stories.map((s, i) => (
          <div key={s.id} className={`sv-bar${i === activeIdx ? ' active' : ''}${i < activeIdx ? ' done' : ''}`}>
            {i === activeIdx && <div className="sv-fill" style={{ width: `${progress}%` }} />}
          </div>
        ))}
      </div>
      <div className="sv-info">
        <div className="sv-icon">{story.icon}</div>
        <div className="sv-name">{story.name}</div>
      </div>
      <img className="sv-img" src={story.img} alt={story.name} draggable={false} />
      <div className="sv-hint">Tap left/right to navigate</div>
    </div>
  );
}
