import { useApp } from '../../context/AppContext';
import { GRADS } from '../../utils/helpers';

export default function Events() {
  const { events, showToast } = useApp();

  const attend = (id) => {
    const e = events.find((x) => x.id === id);
    if (!e) return;
    showToast(e.going ? '👋 Removed from attendees' : '🎉 Going!');
  };

  return (
    <div className="pg on" id="pg-events">
      <div className="pg-hd">
        <div className="pg-title">📅 Campus Events</div>
        <button className="btn-out" onClick={() => showToast('📅 Create event — coming!')}>+ Create Event</button>
      </div>
      <div className="chips">
        {['Upcoming', 'This Week', 'Academic', 'Social', 'Sports'].map((l) => (
          <div key={l} className={`chip${l === 'Upcoming' ? ' on' : ''}`}>{l}</div>
        ))}
      </div>
      <div id="ev-list">
        {events.map((e) => (
          <div className="ev" key={e.id}>
            <div className="ev-banner" style={{ background: e.grad }}>
              {e.ico}
              <div className="ev-date">
                <div className="ev-day">{e.day}</div>
                <div className="ev-mon">{e.mon}</div>
              </div>
            </div>
            <div className="ev-body">
              <div className="ev-title">{e.title} {e.remindSet ? '🔔' : ''}</div>
              <div className="ev-info">
                <div className="ev-meta">🕐 {e.time}</div>
                <div className="ev-meta">📍 {e.loc}</div>
              </div>
              <div className="ev-desc">{e.desc}</div>
              <div className="ev-ft">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="pip" style={{ background: GRADS[0] }} />
                  <div className="pip" style={{ background: GRADS[1] }} />
                  <div className="pip" style={{ background: GRADS[2] }} />
                  <div className="ev-cnt">{e.att} going</div>
                </div>
                <button className={`att-btn${e.going ? ' go' : ''}`} onClick={() => attend(e.id)}>
                  {e.going ? '✓ Going' : 'Attend →'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EventsModal({ onClose }) {
  const { events, showToast } = useApp();

  return (
    <div className="overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '600px' }}>
        <div className="modal-hd">
          <div className="modal-title">📅 Campus Events</div>
          <div className="modal-x" onClick={onClose}>✕</div>
        </div>
        <div id="ev-list">
          {events.map((e) => (
            <div className="ev" key={e.id}>
              <div className="ev-banner" style={{ background: e.grad }}>
                {e.ico}
                <div className="ev-date">
                  <div className="ev-day">{e.day}</div>
                  <div className="ev-mon">{e.mon}</div>
                </div>
              </div>
              <div className="ev-body">
                <div className="ev-title">{e.title}</div>
                <div className="ev-info">
                  <div className="ev-meta">🕐 {e.time}</div>
                  <div className="ev-meta">📍 {e.loc}</div>
                </div>
                <div className="ev-desc">{e.desc}</div>
                <div className="ev-ft">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="pip" style={{ background: GRADS[0] }} />
                    <div className="pip" style={{ background: GRADS[1] }} />
                    <div className="pip" style={{ background: GRADS[2] }} />
                    <div className="ev-cnt">{e.att} going</div>
                  </div>
                  <button className={`att-btn${e.going ? ' go' : ''}`}>
                    {e.going ? '✓ Going' : 'Attend →'}
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
