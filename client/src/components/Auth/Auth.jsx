import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { taglines } from '../../utils/helpers';

export default function Auth() {
  const { login, register, showToast } = useApp();
  const [tab, setTab] = useState('login');
  const [taglineIdx, setTaglineIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');

  const hostelMap = {
    Male: ['Winslow', 'Neal Wilson', 'Samuel Akande', 'Gideon Troopers', 'Bethel Splendor', 'Nelson Mandela'],
    Female: ['Queen Esther', 'Crystal Hall', 'Diamond Hall', 'Platinum Hall', 'Sapphire Hall', 'Havillah Gold'],
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIdx((i) => (i + 1) % taglines.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.target);
    const email = fd.get('email')?.trim();
    const password = fd.get('password');
    if (!email || !password) { setError('⚠️ Fill in all fields'); return; }
    if (!email.includes('@')) { setError('❌ Enter a valid email address'); return; }
    if (!email.endsWith('@student.babcock.edu.ng')) { setError('❌ Only @student.babcock.edu.ng emails are allowed'); return; }
    setLoading(true);
    try {
      await login(email, password);
      showToast('🎉 Welcome back!');
    } catch (err) {
      setError(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.target);
    const name = fd.get('name')?.trim();
    const email = fd.get('email')?.trim();
    const dept = fd.get('dept');
    const lvl = fd.get('lvl');
    const password = fd.get('password');
    const hostel = fd.get('hostel') || 'Off Campus';
    if (!name || !email || !dept || !lvl || !password) { setError('⚠️ Fill in all required fields'); return; }
    if (!email.endsWith('@student.babcock.edu.ng')) { setError('❌ Only @student.babcock.edu.ng emails allowed'); return; }
    setLoading(true);
    try {
      await register({ name, email, dept, lvl, hostel, password });
      showToast('🎉 Account created!');
    } catch (err) {
      setError(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth">
      <div className="auth-noise" />
      <div className="auth-grid" />
      <div className="auth-wrap">
        <div className="auth-brand">
          <div className="brand-icon">
            <span className="brand-icon-inner">Bu</span>
            <div className="brand-ring" />
          </div>
          <h1>BuSocial</h1>
          <p className="auth-tagline">
            <span>{taglines[taglineIdx]}</span>
            <span className="tagline-cursor">|</span>
          </p>
          <div className="auth-vibe">
            <span className="vibe-dot" /><span className="vibe-dot" /><span className="vibe-dot" />
          </div>
        </div>

        <div className="tab-row">
          <div className={`tab${tab === 'login' ? ' on' : ''}`} onClick={() => setTab('login')}>
            <span className="tab-ico">👋</span><span>Sign In</span>
          </div>
          <div className={`tab${tab === 'reg' ? ' on' : ''}`} onClick={() => setTab('reg')}>
            <span className="tab-ico">🚀</span><span>Create Account</span>
          </div>
        </div>

        {tab === 'login' && (
          <form id="f-login" onSubmit={handleLogin}>
            <div className="auth-welcome">Welcome back!</div>
            <label className="lbl">University Email</label>
            <input className="inp" type="email" name="email" placeholder="yourname@student.babcock.edu.ng" />
            <label className="lbl">Password</label>
            <input className="inp" type="password" name="password" placeholder="Enter your password" />
            <button className="btn-main" type="submit" disabled={loading}>
              <span className="btn-text">{loading ? 'Signing in...' : 'Sign In to BuSocial'}</span>
              <span className="btn-arrow">→</span>
            </button>
            {error && <div className="auth-error">{error}</div>}
            <div className="auth-note">Secured · University-verified · <b>Babcock only</b></div>
          </form>
        )}

        {tab === 'reg' && (
          <form id="f-reg" onSubmit={handleRegister}>
            <div className="auth-welcome">Join the squad!</div>
            <div className="row2">
              <div>
                <label className="lbl">Full Name</label>
                <input className="inp" type="text" name="name" placeholder="Your full name" />
              </div>
              <div>
                <label className="lbl">Gender</label>
                <select className="inp" name="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="">Select...</option>
                  <option>Male</option><option>Female</option>
                </select>
              </div>
            </div>
            <label className="lbl">University Email</label>
            <input className="inp" type="email" name="email" placeholder="yourname@student.babcock.edu.ng" />
            <div className="row2">
              <div>
                <label className="lbl">Department</label>
                <select className="inp" name="dept">
                  <option value="">Select...</option>
                  <option>Computer Science</option><option>Mass Communication</option>
                  <option>Business Administration</option><option>Medicine & Surgery</option>
                  <option>Law</option><option>Accounting</option><option>Engineering</option>
                  <option>Nursing Science</option><option>Psychology</option><option>Economics</option>
                </select>
              </div>
              <div>
                <label className="lbl">Level</label>
                <select className="inp" name="lvl">
                  <option value="">Level</option>
                  <option>100</option><option>200</option><option>300</option><option>400</option><option>500</option>
                </select>
              </div>
            </div>
            <label className="lbl">Hostel</label>
            <select className="inp" name="hostel">
              <option value="">Select hostel...</option>
              {(hostelMap[gender] || []).map((h) => <option key={h}>{h}</option>)}
            </select>
            <label className="lbl">Password</label>
            <input className="inp" type="password" name="password" placeholder="Create a strong password" />
            <button className="btn-main" type="submit" disabled={loading}>
              <span className="btn-text">{loading ? 'Creating...' : 'Create My Account'}</span>
              <span className="btn-arrow">→</span>
            </button>
            {error && <div className="auth-error">{error}</div>}
            <div className="auth-note">Only <b>@student.babcock.edu.ng</b> emails accepted</div>
          </form>
        )}
      </div>
    </div>
  );
}
