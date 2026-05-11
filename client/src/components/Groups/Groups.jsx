import { useApp } from '../../context/AppContext';

export default function Groups() {
  const { groups, showToast } = useApp();

  const toggleJoin = (id) => {
    const g = groups.find((x) => x.id === id);
    if (!g) return;
    showToast(g.joined ? `👋 Left ${g.nm}` : `✅ Joined ${g.nm}`);
  };

  return (
    <div className="pg on" id="pg-groups">
      <div className="pg-hd">
        <div className="pg-title">👥 Groups</div>
        <button className="btn-out" onClick={() => showToast('🌟 Create group — coming soon!')}>+ Create Group</button>
      </div>
      <div className="chips">
        {['All Groups', 'Departments', 'Hostels', 'Clubs', 'Courses'].map((l) => (
          <div key={l} className={`chip${l === 'All Groups' ? ' on' : ''}`}>{l}</div>
        ))}
      </div>
      <div id="grp-list">
        {groups.map((g) => (
          <div className="grp" key={g.id}>
            <div className="grp-banner" style={{ background: g.grad }}>{g.ico}</div>
            <div className="grp-body">
              <div className="grp-ico" style={{ background: g.grad }}>{g.ico}</div>
              <div className="grp-type">{g.type}</div>
              <div className="grp-nm">{g.nm}</div>
              <div className="grp-desc">{g.desc}</div>
              <div className="grp-ft">
                <div className="grp-mem">👥 {g.mem.toLocaleString()} members</div>
                <button className={`join-btn${g.joined ? ' jd' : ''}`} onClick={() => toggleJoin(g.id)}>
                  {g.joined ? '✓ Joined' : 'Join'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GroupsModal({ onClose }) {
  const { groups, showToast } = useApp();

  const toggleJoin = (id) => {
    const g = groups.find((x) => x.id === id);
    if (!g) return;
    showToast(g.joined ? `👋 Left ${g.nm}` : `✅ Joined ${g.nm}`);
  };

  return (
    <div className="overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '600px' }}>
        <div className="modal-hd">
          <div className="modal-title">👥 Groups</div>
          <div className="modal-x" onClick={onClose}>✕</div>
        </div>
        <div id="grp-list">
          {groups.map((g) => (
            <div className="grp" key={g.id}>
              <div className="grp-banner" style={{ background: g.grad }}>{g.ico}</div>
              <div className="grp-body" style={{ cursor: 'default' }}>
                <div className="grp-ico" style={{ background: g.grad }}>{g.ico}</div>
                <div className="grp-type">{g.type}</div>
                <div className="grp-nm">{g.nm}</div>
                <div className="grp-desc">{g.desc}</div>
                <div className="grp-ft">
                  <div className="grp-mem">👥 {g.mem.toLocaleString()} members</div>
                  <button className={`join-btn${g.joined ? ' jd' : ''}`} onClick={() => toggleJoin(g.id)}>
                    {g.joined ? '✓ Joined' : 'Join'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
