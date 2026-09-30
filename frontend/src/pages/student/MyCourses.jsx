import { Link } from 'react-router-dom';
import { api } from '../../api';
import { fmtDate } from '../../utils';
import { CourseBanner } from '../../components/CourseCard';
import { Loader, ErrorBox, Empty, PageHeader, ProgressBar, StatusBadge, useLoad } from '../../components/UI';

export default function MyCourses() {
  const { data, loading, error } = useLoad(() => api('/enrollments/me'));
  if (loading) return <Loader />;
  return (
    <>
      <PageHeader title="My courses" subtitle="Everything you are enrolled in." />
      <ErrorBox message={error} />
      {data?.enrollments.length === 0 && <Empty title="No enrolled courses yet"><Link to="/courses">Browse the catalog</Link> and enroll to begin.</Empty>}
      <div className="grid grid-3">
        {(data?.enrollments || []).map((e) => (
          <article key={e._id} className="course-card">
            <CourseBanner course={e.course} />
            <div className="course-body">
              <div className="meta-row"><span className="chip">{e.course.category}</span><StatusBadge status={e.status} /></div>
              <h3>{e.course.title}</h3>
              <ProgressBar value={e.progress} />
              <small className="muted">{e.completedModules.length} of {e.moduleCount} modules done · enrolled {fmtDate(e.enrollmentDate)}</small>
              <div className="course-foot">
                <span />
                <Link className="btn btn-primary btn-sm" to={`/learn/${e.course._id}`}>{e.progress ? 'Continue' : 'Start'}</Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
