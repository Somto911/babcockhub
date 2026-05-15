import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function Polls() {
  const { polls, showToast, submitPoll, votePoll } = useApp();
  const [creating, setCreating] = useState(false);
  const [q, setQ] = useState('');
  const [opts, setOpts] = useState(['', '']);

  const vote = (pid, optId) => {
    const p = polls.find(x => x.id === pid);
    if (!p || p.voted !== null) return showToast('Already voted!');
    votePoll(pid, optId);
    showToast('Vote recorded!');
  };

  const addOpt = () => { if (opts.length < 6) setOpts([...opts, '']); };

  const removeOpt = (i) => { if (opts.length > 2) setOpts(opts.filter((_, idx) => idx !== i)); };

  const handleCreate = () => {
    if (!q.trim()) return showToast('Enter a question!');
    const valid = opts.filter((o) => o.trim());
    if (valid.length < 2) return showToast('At least 2 options!');
    submitPoll(q.trim(), valid.map((o) => o.trim()));
    setQ('');
    setOpts(['', '']);
    setCreating(false);
    showToast('Poll created!');
  };

  return (
    <div className="pg on" id="pg-polls">
      <div className="pg-hd">
        <div className="pg-title">Polls & Trends</div>
        <button className="btn-out" onClick={() => setCreating(!creating)}>{creating ? 'Cancel' : '+ New Poll'}</button>
      </div>
      {creating && (
        <div className="poll-creator">
          <input className="inp" placeholder="Ask a question..." value={q} onChange={(e) => setQ(e.target.value)} />
          {opts.map((o, i) => (
            <div className="poll-opt-row" key={i}>
              <input className="inp" placeholder={`Option ${i + 1}`} value={o} onChange={(e) => { const n = [...opts]; n[i] = e.target.value; setOpts(n); }} />
              {opts.length > 2 && <button className="poll-rm" onClick={() => removeOpt(i)}>x</button>}
            </div>
          ))}
          <div className="poll-creator-acts">
            {opts.length < 6 && <button className="btn-out" onClick={addOpt} style={{ padding: '6px 14px', fontSize: '12px' }}>+ Add option</button>}
            <button className="btn-main" onClick={handleCreate} style={{ padding: '8px 20px', width: 'auto' }}>Create Poll</button>
          </div>
        </div>
      )}
      <div id="polls-wrap">
        {polls.map((p) => {
          const tot = p.opts.reduce((s, o) => s + o.v, 0);
          const voted = p.voted;
          return (
            <div className="poll" key={p.id}>
              <div className="poll-q">{p.q}</div>
              {p.opts.map((o) => {
                const pct = tot ? Math.round(o.v / tot * 100) : 0;
                return (
                  <div className="poll-opt" key={o.id} onClick={() => vote(p.id, o.id)}>
                    <div className={'pbar' + (voted === o.id ? ' voted' : '')}>
                      <div className="pbar-fill" style={{ width: voted !== null ? pct + '%' : '0%' }} />
                      <div className="pbar-lbl">{o.l}</div>
                      {voted !== null && <div className="pbar-pct">{pct}%</div>}
                    </div>
                  </div>
                );
              })}
              <div className="poll-foot">{tot.toLocaleString()} votes{voted !== null ? ' · You voted' : ''}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
