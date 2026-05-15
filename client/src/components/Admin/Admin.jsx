import { useApp } from '../../context/AppContext';

export default function Admin() {
  const { modQueue, showToast } = useApp();

  const modAct = (id, action) => {
    showToast(action === 'ok' ? 'Content approved & kept' : 'Content removed');
  };

  return (
    <div className="pg on" id="pg-admin">
      <div className="pg-hd">
        <div className="pg-title">🛡️ Admin Dashboard</div>
        <span style={{ fontSize: '11px', color: 'var(--text2)', background: 'var(--surface2)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
          MODERATOR VIEW
        </span>
      </div>
      <div className="stat-grid">
        {[
          { v: '2,841', l: 'Total Students', d: '↑ +124 this week', cls: 'up' },
          { v: '18,392', l: 'Posts Today', d: '↑ +12% vs yesterday', cls: 'up' },
          { v: '7', l: 'Reports Pending', d: '⚠ 2 new today', cls: 'down' },
          { v: '99.2%', l: 'Safety Score', d: '↑ Above threshold', cls: 'up' },
        ].map((s, i) => (
          <div className="stat-c" key={i}>
            <div className="stat-v">{s.v}</div>
            <div className="stat-l">{s.l}</div>
            <div className={`stat-d ${s.cls}`}>{s.d}</div>
          </div>
        ))}
      </div>
      <div className="sec-hd">Content Flagged for Review</div>
      <div id="mod-q">
        {modQueue.map((m) => (
          <div className="mod-item" key={m.id}>
            <div className="mod-flag-ico">🚩</div>
            <div className="mod-bd">
              <div className="mod-txt">{m.txt}</div>
              <div className="mod-meta">{m.rep} · <b style={{ color: 'var(--red)' }}>{m.type}</b></div>
            </div>
            <div className="mod-acts">
              <button className="mbtn ok" onClick={() => modAct(m.id, 'ok')}>✓ Keep</button>
              <button className="mbtn rm" onClick={() => modAct(m.id, 'rm')}>✕ Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
