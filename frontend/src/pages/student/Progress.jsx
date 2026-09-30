import { Link } from 'react-router-dom';
import { api } from '../../api';
import { fmtDate } from '../../utils';
import { Loader, ErrorBox, Empty, PageHeader, ProgressBar, StatusBadge, useLoad } from '../../components/UI';

export default function Progress() {
  const { data, loading, error } = useLoad(() => api('/enrollments/me'));
  const subs = useLoad(() => api('/submissions/mine'));
  if (loading) return <Loader />;
  const list = data?.enrollments || [];

  return (
    <>
      <PageHeader title="Progress" subtitle="Course completion and graded work." />
      <ErrorBox message={error} />
      {list.length === 0 && !error && <Empty title="No progress to show">Enroll in a course to start tracking your progress.</Empty>}
      {list.length > 0 && (
        <div className="table-wrap" style={{ marginBottom: '1.25rem' }}>
          <table>
            <thead><tr><th>Course</th><th>Modules</th><th style={{ width: 220 }}>Progress</th><th>Status</th><th>Enrolled</th></tr></thead>
            <tbody>
              {list.map((e) => (
                <tr key={e._id}>
                  <td><Link to={`/learn/${e.course._id}`}><strong>{e.course.title}</strong></Link></td>
                  <td>{e.completedModules.length} / {e.moduleCount}</td>
                  <td><ProgressBar value={e.progress} /></td>
                  <td><StatusBadge status={e.status} /></td>
                  <td>{fmtDate(e.enrollmentDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2>Marks and feedback</h2>
      {subs.loading ? <Loader /> : (subs.data?.submissions.length ?? 0) === 0 ? (
        <Empty title="No submissions yet">Submitted assignments and their marks will appear here.</Empty>
      ) : (
        <ul className="list panel">
          {subs.data.submissions.map((s) => (
            <li key={s._id}>
              <span><strong>{s.assignment.title}</strong><br /><small>{s.course.title} · submitted {fmtDate(s.submissionDate)}</small>{s.feedback && <><br /><small>Feedback: {s.feedback}</small></>}</span>
              <span className="row"><StatusBadge status={s.status} />{s.status === 'graded' && <strong>{s.marks}/{s.assignment.maxMarks}</strong>}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
