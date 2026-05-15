import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GRADS } from '../../utils/helpers';

export default function Events() {
  const { events, showToast, addNotification, toggleEventAttend } = useApp();
  const [remindEvent, setRemindEvent] = useState(null);

  const attend = (id) => {
    const e = events.find((x) => x.id === id);
    if (!e) return;
    if (e.going) {
      toggleEventAttend(id, false);
      showToast('Removed from attendees');
    } else {
      setRemindEvent(e);
    }
  };

  const confirmAttend = (sendReminder) => {
    if (!remindEvent) return;
    toggleEventAttend(remindEvent.id, sendReminder);
    if (sendReminder) {
      const dayName = remindEvent.mon + ' ' + remindEvent.day;
      addNotification('reminder', 'Reminder: ' + remindEvent.title + ' is happening on ' + dayName + '!', 0, null);
      showToast('Reminder set for ' + remindEvent.title);
    } else {
      showToast('Going to ' + remindEvent.title);
    }
    setRemindEvent(null);
  };

  return (
    <div className="pg on" id="pg-events">
      <div className="pg-hd">
        <div className="pg-title">Campus Events</div>
        <button className="btn-out" onClick={() => showToast('Create event feature coming soon!')}>+ Create Event</button>
      </div>
      <div className="chips">
        {['Upcoming', 'This Week', 'Academic', 'Social', 'Sports'].map((l) => (
          <div key={l} className={`chip${l === 'Upcoming' ? ' on' : ''}`}>{l}</div>
        ))}
      </div>
      {remindEvent && (
        <div className="overlay open" onClick={() => setRemindEvent(null)}>
          <div className="modal" style={{ maxWidth: '400px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-hd">
              <div className="modal-title">Attend Event</div>
              <div className="modal-x" onClick={() => setRemindEvent(null)}>X</div>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '18px' }}>{remindEvent.title} - {remindEvent.day} {remindEvent.mon}</p>
            <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '20px' }}>Do you want to send a reminder on the day of the event?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="btn-out" onClick={() => confirmAttend(false)} style={{ padding: '10px 20px' }}>No, just going</button>
              <button className="btn-main" onClick={() => confirmAttend(true)} style={{ padding: '10px 20px', width: 'auto' }}>Yes, remind me</button>
            </div>
          </div>
        </div>
      )}
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
              <div className="ev-title">{e.title}{e.remindSet ? ' 🔔' : ''}</div>
              <div className="ev-info">
                <div className="ev-meta">{e.time}</div>
                <div className="ev-meta">{e.loc}</div>
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
                  {e.going ? 'Going' : 'Attend'}
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
          <div className="modal-title">Campus Events</div>
          <div className="modal-x" onClick={onClose}>X</div>
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
                <div className="ev-meta">{e.time}</div>
                <div className="ev-meta">{e.loc}</div>
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
                    {e.going ? 'Going' : 'Attend'}
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
