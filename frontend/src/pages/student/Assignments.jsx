import { Link } from 'react-router-dom';
import { api } from '../../api';
import { fmtDate, isPast } from '../../utils';
import { Loader, ErrorBox, Empty, PageHeader, StatusBadge, useLoad } from '../../components/UI';

export default function Assignments() {
  const { data, loading, error } = useLoad(() => api('/assignments/mine'));
  if (loading) return <Loader />;
  const list = data?.assignments || [];
  return (
    <>
      <PageHeader title="Assignments" subtitle="Requirements, deadlines, marks and feedback for all your courses." />
      <ErrorBox message={error} />
      {list.length === 0 && !error && <Empty title="No assignments yet">Assignments appear here after you enroll in a course that has them.</Empty>}
      {list.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Assignment</th><th>Course</th><th>Deadline</th><th>Status</th><th>Marks</th><th /></tr></thead>
            <tbody>
              {list.map((a) => (
                <tr key={a._id}>
                  <td><strong>{a.title}</strong></td>
                  <td>{a.course.title}</td>
                  <td>{fmtDate(a.deadline)} {!a.submission && isPast(a.deadline) && <span className="badge badge-late">Overdue</span>}</td>
                  <td>{a.submission ? <StatusBadge status={a.submission.status} /> : <span className="badge">Not submitted</span>}</td>
                  <td>{a.submission?.status === 'graded' ? `${a.submission.marks} / ${a.maxMarks}` : `— / ${a.maxMarks}`}</td>
                  <td><Link className="btn btn-outline btn-sm" to={`/assignments/${a._id}`}>{a.submission ? 'View' : 'Submit'}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
