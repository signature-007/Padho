import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api';
import { fmtDate, isPast } from '../../utils';
import { Loader, ErrorBox, Empty, PageHeader, ProgressBar, StatusBadge, useLoad } from '../../components/UI';

function ModuleItem({ module, index, done, open, onToggleOpen, onToggleDone, busy }) {
  return (
    <div className={`module ${done ? 'done' : ''}`}>
      <div className="module-head" onClick={onToggleOpen} role="button" tabIndex={0} aria-expanded={open} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onToggleOpen())}>
        <span className="module-num">{done ? '✓' : index + 1}</span>
        <h3>{module.title}</h3>
        <span className="muted">{open ? 'Hide' : 'Open'}</span>
      </div>
      {open && (
        <div className="module-body">
          {module.description && <p>{module.description}</p>}
          {module.notes && (<><strong>Notes</strong><pre>{module.notes}</pre></>)}
          {module.resources.length > 0 && (
            <>
              <strong>Learning materials</strong>
              <ul className="res-list">
                {module.resources.map((r) => (
                  <li key={r._id}><span className="res-type">{r.type}</span><a href={r.url} target="_blank" rel="noreferrer noopener">{r.label}</a></li>
                ))}
              </ul>
            </>
          )}
          <button className={`btn btn-sm ${done ? 'btn-outline' : 'btn-primary'}`} disabled={busy} onClick={onToggleDone}>
            {done ? 'Mark as not done' : 'Mark as complete'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function CourseLearn() {
  const { courseId } = useParams();
  const mods = useLoad(() => api(`/courses/${courseId}/modules`), [courseId]);
  const asg = useLoad(() => api(`/courses/${courseId}/assignments`), [courseId]);
  const [tab, setTab] = useState('modules');
  const [enrollment, setEnrollment] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (mods.data) {
      setEnrollment(mods.data.enrollment);
      setOpenId((cur) => cur ?? mods.data.modules[0]?._id ?? null);
    }
  }, [mods.data]);

  if (mods.loading) return <Loader />;
  if (mods.error) return (
    <>
      <ErrorBox message={mods.error} />
      <Link to={`/courses/${courseId}`}>View course page to enroll</Link>
    </>
  );

  const { course, modules } = mods.data;
  const done = new Set((enrollment?.completedModules || []).map(String));

  const toggle = async (id) => {
    setBusy(true);
    setErr('');
    try {
      const d = await api(`/modules/${id}/toggle-complete`, { method: 'POST' });
      setEnrollment(d.enrollment);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title={course.title} subtitle={`${course.instructor} · ${course.difficulty}`}>
        <Link className="btn btn-outline" to="/my-courses">Back to my courses</Link>
      </PageHeader>
      <div className="panel">
        <div className="row row-between"><strong>Course progress</strong><StatusBadge status={enrollment?.status || 'active'} /></div>
        <ProgressBar value={enrollment?.progress || 0} />
        <small className="muted">{done.size} of {modules.length} modules completed</small>
      </div>
      <ErrorBox message={err} />

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'modules'} className={tab === 'modules' ? 'on' : ''} onClick={() => setTab('modules')}>Modules ({modules.length})</button>
        <button role="tab" aria-selected={tab === 'assignments'} className={tab === 'assignments' ? 'on' : ''} onClick={() => setTab('assignments')}>Assignments ({asg.data?.assignments.length ?? '…'})</button>
      </div>

      {tab === 'modules' && (
        modules.length === 0 ? <Empty title="No modules yet">Your instructor has not added modules to this course.</Empty> :
        modules.map((m, i) => (
          <ModuleItem key={m._id} module={m} index={i} done={done.has(String(m._id))} open={openId === m._id}
            onToggleOpen={() => setOpenId(openId === m._id ? null : m._id)} onToggleDone={() => toggle(m._id)} busy={busy} />
        ))
      )}

      {tab === 'assignments' && (
        asg.loading ? <Loader /> :
        <>
          <ErrorBox message={asg.error} />
          {asg.data?.assignments.length === 0 && <Empty title="No assignments">Nothing has been assigned for this course yet.</Empty>}
          <ul className="list panel">
            {(asg.data?.assignments || []).map((a) => (
              <li key={a._id}>
                <span>
                  <Link to={`/assignments/${a._id}`}><strong>{a.title}</strong></Link><br />
                  <small>Due {fmtDate(a.deadline)} · {a.maxMarks} marks</small>
                </span>
                <span className="row">
                  {a.submission ? <StatusBadge status={a.submission.status} /> : isPast(a.deadline) ? <span className="badge badge-late">Overdue</span> : <span className="badge">Not submitted</span>}
                  {a.submission?.status === 'graded' && <strong>{a.submission.marks}/{a.maxMarks}</strong>}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
