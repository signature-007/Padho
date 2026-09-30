import { useState } from "react";
import { api } from "../../api";
import { fmtDate } from "../../utils";
import {
  Loader,
  ErrorBox,
  Empty,
  PageHeader,
  ProgressBar,
  StatusBadge,
  useLoad,
} from "../../components/UI";

export default function StudentProgress() {
  const courses = useLoad(() => api("/courses"));
  const [course, setCourse] = useState("");
  const { data, loading, error } = useLoad(
    () => api(`/enrollments${course ? `?course=${course}` : ""}`),
    [course],
  );
  const list = data?.enrollments || [];
  const avg = list.length
    ? Math.round(list.reduce((s, e) => s + e.progress, 0) / list.length)
    : 0;

  return (
    <>
      <PageHeader
        title="Student progress"
        subtitle={
          list.length
            ? `${list.length} enrollments · average ${avg}%`
            : "Track how students are doing."
        }
      />
      <div className="filters">
        <select
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          aria-label="Course"
        >
          <option value="">All courses</option>
          {(courses.data?.courses || []).map((c) => (
            <option key={c._id} value={c._id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>
      <ErrorBox message={error} />
      {loading ? (
        <Loader />
      ) : list.length === 0 ? (
        <Empty title="No enrollments yet" />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Modules done</th>
                <th style={{ width: 220 }}>Progress</th>
                <th>Status</th>
                <th>Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {list.map((e) => (
                <tr key={e._id}>
                  <td>
                    <strong>{e.student.name}</strong>
                    <br />
                    <small>{e.student.email}</small>
                  </td>
                  <td>{e.course.title}</td>
                  <td>{e.completedModules.length}</td>
                  <td>
                    <ProgressBar value={e.progress} />
                  </td>
                  <td>
                    <StatusBadge status={e.status} />
                  </td>
                  <td>{fmtDate(e.enrollmentDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
