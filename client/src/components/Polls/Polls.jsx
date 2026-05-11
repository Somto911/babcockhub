import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function Polls() {
  const { polls, showToast } = useApp();
  const [votes, setVotes] = useState({});

  const vote = (pid, oi) => {
    if (votes[pid] !== undefined) return showToast('⚠️ Already voted!');
    setVotes((prev) => ({ ...prev, [pid]: oi }));
    showToast('✅ Vote recorded!');
  };

  return (
    <div className="pg on" id="pg-polls">
      <div className="pg-hd">
        <div className="pg-title">📊 Polls & Trending</div>
        <button className="btn-out" onClick={() => showToast('📊 Create poll — coming!')}>+ New Poll</button>
      </div>
      <div id="polls-wrap">
        {polls.map((p) => {
          const tot = p.opts.reduce((s, o) => s + o.v, 0);
          const voted = votes[p.id] !== undefined ? votes[p.id] : p.voted;
          return (
            <div className="poll" key={p.id}>
              <div className="poll-q">{p.q}</div>
              {p.opts.map((o, i) => {
                const pct = tot ? Math.round(o.v / tot * 100) : 0;
                return (
                  <div className="poll-opt" key={i} onClick={() => vote(p.id, i)}>
                    <div className={`pbar${voted === i ? ' voted' : ''}`}>
                      <div className="pbar-fill" style={{ width: voted !== null ? `${pct}%` : '0%' }} />
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
