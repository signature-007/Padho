import { useState } from 'react';
import { api } from '../../api';
import { useAuth } from '../../AuthContext';
import { fmtDate } from '../../utils';
import { ErrorBox, Notice, PageHeader } from '../../components/UI';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setErr('');
    setOk('');
    if (!name.trim()) return setErr('Name cannot be empty');
    if (pw.newPassword && pw.newPassword.length < 6) return setErr('New password must be at least 6 characters');
    setBusy(true);
    try {
      const body = { name };
      if (pw.newPassword) Object.assign(body, pw);
      const d = await api('/auth/me', { method: 'PUT', body });
      setUser(d.user);
      setPw({ currentPassword: '', newPassword: '' });
      setOk('Profile saved.');
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <PageHeader title="Profile" subtitle={`${user.email} · ${user.role} · joined ${fmtDate(user.createdAt)}`} />
      <form className="panel form" onSubmit={save}>
        <ErrorBox message={err} />
        <Notice message={ok} />
        <div className="field"><label htmlFor="n">Full name</label><input id="n" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <h3 style={{ marginBottom: 0 }}>Change password</h3>
        <span className="hint">Leave blank to keep your current password.</span>
        <div className="field"><label htmlFor="cp">Current password</label><input id="cp" type="password" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></div>
        <div className="field"><label htmlFor="np">New password</label><input id="np" type="password" autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></div>
        <div><button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button></div>
      </form>
    </div>
  );
}
