import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../AuthContext';
import { fmtDate, isPast } from '../../utils';
import { Loader, ErrorBox, Empty, PageHeader, ProgressBar, StatusBadge, useLoad } from '../../components/UI';

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading, error } = useLoad(() => api('/stats/student'));
  if (loading) return <Loader />;
  if (error) return <ErrorBox message={error} />;

  return (
    <>
      <PageHeader title={`Welcome back, ${user.name.split(' ')[0]}`} subtitle="Here is where you stand.">
        <Link className="btn btn-primary" to="/courses">Browse courses</Link>
      </PageHeader>

      <div className="stats">
        <div className="stat"><b>{data.enrolledCount}</b><span>Enrolled courses</span></div>
        <div className="stat"><b>{data.completedCount}</b><span>Completed courses</span></div>
        <div className="stat warn"><b>{data.pendingCount}</b><span>Pending assignments</span></div>
        <div className="stat"><b>{data.gradedCount}</b><span>Graded submissions</span></div>
        <div className="stat"><b>{data.overallProgress}%</b><span>Overall progress</span></div>
      </div>

      <div className="grid grid-2">
        <section className="panel">
          <h2>My courses</h2>
          {data.enrollments.length === 0 ? (
            <Empty title="You have not enrolled yet"><Link to="/courses">Find a course</Link> to get started.</Empty>
          ) : (
            <ul className="list">
              {data.enrollments.map((e) => (
                <li key={e._id}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <Link to={`/learn/${e.courseId}`}><strong>{e.title}</strong></Link>
                    <ProgressBar value={e.progress} />
                  </div>
                  <StatusBadge status={e.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <h2>Pending assignments</h2>
          {data.pendingAssignments.length === 0 ? (
            <Empty title="Nothing due">You have no pending assignments.</Empty>
          ) : (
            <ul className="list">
              {data.pendingAssignments.map((a) => (
                <li key={a._id}>
                  <span><Link to={`/assignments/${a._id}`}><strong>{a.title}</strong></Link><br /><small>{a.course}</small></span>
                  <span>{isPast(a.deadline) ? <span className="badge badge-late">Overdue</span> : null} <small>Due {fmtDate(a.deadline)}</small></span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="panel">
        <h2>Recent activity</h2>
        {data.recentActivity.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>Your activity will show up here.</p>
        ) : (
          <ul className="list">
            {data.recentActivity.map((a, i) => <li key={i}><span>{a.text}</span><small>{fmtDate(a.date)}</small></li>)}
          </ul>
        )}
      </section>
    </>
  );
}
