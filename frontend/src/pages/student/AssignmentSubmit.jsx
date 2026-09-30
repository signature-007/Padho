import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, fileUrl } from '../../api';
import { fmtDate, fmtDateTime, isPast } from '../../utils';
import { Loader, ErrorBox, Notice, PageHeader, StatusBadge, useLoad } from '../../components/UI';

export default function AssignmentSubmit() {
  const { id } = useParams();
  const { data, loading, error, reload } = useLoad(() => api(`/assignments/${id}`), [id]);
  const [form, setForm] = useState({ text: '', link: '', linkType: 'github' });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  const sub = data?.submission;
  useEffect(() => {
    if (sub) setForm({ text: sub.text || '', link: sub.link || '', linkType: sub.linkType || 'github' });
  }, [sub]);

  if (loading) return <Loader />;
  if (error) return <ErrorBox message={error} />;
  const { assignment } = data;
  const locked = sub?.status === 'graded';

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setOk('');
    if (!form.text.trim() && !form.link.trim() && !file) return setErr('Add text, a link or a file before submitting');
    if (form.link.trim() && !/^https?:\/\//i.test(form.link.trim())) return setErr('The link must start with http:// or https://');
    const fd = new FormData();
    fd.append('text', form.text);
    fd.append('link', form.link.trim());
    fd.append('linkType', form.linkType);
    if (file) fd.append('file', file);
    setBusy(true);
    try {
      await api(`/assignments/${id}/submissions`, { method: 'POST', form: fd });
      setOk(sub ? 'Submission updated.' : 'Assignment submitted.');
      setFile(null);
      e.target.reset();
      reload();
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title={assignment.title} subtitle={assignment.course.title}>
        <Link className="btn btn-outline" to="/assignments">All assignments</Link>
      </PageHeader>

      <div className="panel">
        <div className="row row-between">
          <span>Deadline: <strong>{fmtDateTime(assignment.deadline)}</strong> {isPast(assignment.deadline) && <span className="badge badge-late">Deadline passed</span>}</span>
          <span>Maximum marks: <strong>{assignment.maxMarks}</strong></span>
        </div>
        {assignment.description && <p style={{ marginTop: '.8rem' }}>{assignment.description}</p>}
        {assignment.instructions && (<><h3>Instructions</h3><p style={{ whiteSpace: 'pre-line', marginBottom: 0 }}>{assignment.instructions}</p></>)}
      </div>

      {sub && (
        <div className="panel">
          <div className="row row-between"><h2 style={{ margin: 0 }}>Your submission</h2><span className="row"><StatusBadge status={sub.status} />{sub.isLate && <span className="badge badge-late">Late</span>}</span></div>
          <p className="muted">Submitted {fmtDateTime(sub.submissionDate)}</p>
          {sub.link && <p>Link: <a href={sub.link} target="_blank" rel="noreferrer noopener">{sub.link}</a></p>}
          {sub.file?.path && <p>File: <a href={fileUrl(sub.file.path)} target="_blank" rel="noreferrer noopener">{sub.file.originalName}</a></p>}
          {sub.status === 'graded' && (
            <div className="alert alert-ok">
              <strong>Marks: {sub.marks} / {assignment.maxMarks}</strong>
              {sub.feedback && <div style={{ marginTop: '.3rem' }}>Feedback: {sub.feedback}</div>}
            </div>
          )}
          {sub.status !== 'graded' && sub.feedback && <p>Instructor note: {sub.feedback}</p>}
        </div>
      )}

      <form className="panel form" onSubmit={submit}>
        <h2 style={{ margin: 0 }}>{sub ? 'Update your submission' : 'Submit your work'}</h2>
        {locked && <div className="alert alert-ok">This submission has been graded and can no longer be changed.</div>}
        <ErrorBox message={err} />
        <Notice message={ok} />
        <fieldset disabled={locked} style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: '.9rem' }}>
          <div className="field"><label htmlFor="text">Answer or notes</label><textarea id="text" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} /></div>
          <div className="form-2">
            <div className="field"><label htmlFor="link">Link</label><input id="link" type="url" placeholder="https://github.com/you/project" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} /></div>
            <div className="field"><label htmlFor="lt">Link type</label>
              <select id="lt" value={form.linkType} onChange={(e) => setForm({ ...form, linkType: e.target.value })}>
                <option value="github">GitHub</option><option value="drive">Google Drive</option><option value="project">Project URL</option><option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="field"><label htmlFor="file">File (optional)</label><input id="file" type="file" onChange={(e) => setFile(e.target.files[0] || null)} /><span className="hint">PDF, Word, PowerPoint, ZIP, image, TXT or MD — up to 5 MB.{sub?.file?.path ? ' Choosing a new file replaces the current one.' : ''}</span></div>
          <div><button className="btn btn-primary" disabled={busy}>{busy ? 'Submitting…' : sub ? 'Update submission' : 'Submit assignment'}</button></div>
        </fieldset>
      </form>
    </>
  );
}
