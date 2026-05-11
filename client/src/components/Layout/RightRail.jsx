import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ini, grad, pulseMessages } from '../../utils/helpers';
import Countdown from '../Common/Countdown';

export default function RightRail() {
  const { trending: trendList, suggs: initialSuggs, setActivePage } = useApp();
  const [suggs, setSuggs] = useState(initialSuggs);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setPulse((i) => (i + 1) % pulseMessages.length), 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="rail">
      <Countdown />

      <div className="widget">
        <div className="w-title">🔥 Trending on Campus</div>
        {trendList.map((t, i) => (
          <div className="trend" key={i}>
            <div className="trend-n">{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div className="trend-tag">{t.tag}</div>
              <div className="trend-cnt">{t.cnt}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="widget">
        <div className="w-title">👥 People You May Know</div>
        {suggs.map((s, i) => (
          <div className="sug" key={i}>
            <div className="sug-av" style={{ background: grad(s.nm) }}>{ini(s.nm)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sug-nm">{s.nm}</div>
              <div className="sug-dept">{s.dept}</div>
            </div>
            <div
              className={`flw${s.flw ? ' fld' : ''}`}
              onClick={() => setSuggs((prev) => prev.map((x, j) => j === i ? { ...x, flw: !x.flw } : x))}
            >
              {s.flw ? 'Following' : 'Follow'}
            </div>
          </div>
        ))}
      </div>

      <div className="widget">
        <div className="w-title">⚡ Campus Pulse</div>
        <div style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: '1.6' }}>
          {pulseMessages[pulse]}
        </div>
      </div>
    </aside>
  );
}
