import { Link } from "react-router-dom";
import { api } from "../../api";
import { fmtDate } from "../../utils";
import {
  Loader,
  ErrorBox,
  Empty,
  PageHeader,
  ProgressBar,
  useLoad,
} from "../../components/UI";

export default function AdminDashboard() {
  const { data, loading, error } = useLoad(() => api("/stats/admin"));
  if (loading) return <Loader />;
  if (error) return <ErrorBox message={error} />;
  const t = data.totals;
  const tiles = [
    ["Students", t.students, "/admin/students"],
    ["Courses", t.courses, "/admin/courses"],
    ["Modules", t.modules, "/admin/modules"],
    ["Assignments", t.assignments, "/admin/assignments"],
    ["Enrollments", t.enrollments, "/admin/progress"],
    ["Submissions", t.submissions, "/admin/submissions"],
  ];

  return (
    <>
      <PageHeader title="Admin dashboard" subtitle="Platform overview.">
        <Link className="btn btn-primary" to="/admin/courses/new">
          New course
        </Link>
        <Link className="btn btn-outline" to="/admin/submissions">
          Review submissions
        </Link>
      </PageHeader>

      <div className="stats">
        {tiles.map(([label, n, to]) => (
          <Link
            key={label}
            to={to}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="stat">
              <b>{n}</b>
              <span>{label}</span>
            </div>
          </Link>
        ))}
        <div className="stat warn">
          <b>{t.pendingReviews}</b>
          <span>Awaiting grading</span>
        </div>
        <div className="stat">
          <b>{data.averageProgress}%</b>
          <span>Average progress</span>
        </div>
      </div>

      <div className="grid grid-2">
        <section className="panel">
          <h2>Most popular courses</h2>
          {data.popularCourses.length === 0 ? (
            <Empty title="No enrollments yet" />
          ) : (
            <ul className="list">
              {data.popularCourses.map((c) => (
                <li key={c._id}>
                  <span style={{ flex: 1, minWidth: 180 }}>
                    <strong>{c.title}</strong>
                    <br />
                    <small>{c.enrolled} enrolled</small>
                  </span>
                  <ProgressBar value={c.avgProgress} />
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="panel">
          <h2>Recent submissions</h2>
          {data.recentSubmissions.length === 0 ? (
            <Empty title="No submissions yet" />
          ) : (
            <ul className="list">
              {data.recentSubmissions.map((s) => (
                <li key={s._id}>
                  <span>
                    <strong>{s.assignment.title}</strong>
                    <br />
                    <small>{s.student.name}</small>
                  </span>
                  <small>{fmtDate(s.submissionDate)}</small>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="panel">
        <h2>Recent enrollments</h2>
        {data.recentEnrollments.length === 0 ? (
          <Empty title="No enrollments yet" />
        ) : (
          <ul className="list">
            {data.recentEnrollments.map((e) => (
              <li key={e._id}>
                <span>
                  {e.student.name} enrolled in <strong>{e.course.title}</strong>
                </span>
                <small>{fmtDate(e.enrollmentDate)}</small>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
