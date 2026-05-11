import { useCountdown } from '../../hooks/useCountdown';

export default function Countdown() {
  const target = new Date();
  target.setDate(target.getDate() + 42);
  const { d, h, m, s } = useCountdown(target);

  return (
    <div className="widget">
      <div className="w-title">⏰ Post Siwes Countdown</div>
      <div style={{ fontSize: '11px', color: 'var(--text2)', textAlign: 'center', marginBottom: '8px' }}>Back to hell</div>
      <div className="cd-grid">
        {[['DAYS', d], ['HRS', h], ['MIN', m], ['SEC', s]].map(([l, n]) => (
          <div className="cd-box" key={l}>
            <div className="cd-n">{String(n).padStart(2, '0')}</div>
            <div className="cd-l">{l}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text2)', textAlign: 'center', marginTop: '6px' }}>You are doomed</div>
    </div>
  );
}
