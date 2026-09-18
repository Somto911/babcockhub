import { useMemo } from 'react';
import { useCountdown } from '../../hooks/useCountdown';

function nextTarget() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun ... 5=Fri
  let daysAhead = (5 - day + 7) % 7;
  if (daysAhead === 0 && now.getHours() >= 18) daysAhead = 7;
  const t = new Date(now);
  t.setDate(now.getDate() + daysAhead);
  t.setHours(18, 0, 0, 0);
  return t;
}

export default function Countdown() {
  const target = useMemo(() => nextTarget(), []);
  const { d, h, m, s } = useCountdown(target);
  const today = target.toDateString() === new Date().toDateString();

  return (
    <div className="widget cd-widget">
      <div className="w-title">✨ Friday Vespers</div>
      <div style={{ fontSize: '11.5px', color: 'var(--text2)', textAlign: 'center', marginBottom: '8px' }}>
        {today ? 'Sabbath is today — church at the Adventist Chapel!' : 'Sabbath worship · Adventist Chapel'}
      </div>
      <div className="cd-grid">
        {[['DAYS', d], ['HRS', h], ['MIN', m], ['SEC', s]].map(([l, n]) => (
          <div className="cd-box" key={l}>
            <div className="cd-n">{String(n).padStart(2, '0')}</div>
            <div className="cd-l">{l}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--brand)', textAlign: 'center', marginTop: '6px', fontWeight: 600 }}>
        See you there 🙏
      </div>
    </div>
  );
}