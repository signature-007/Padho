import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import {
  Loader,
  ErrorBox,
  Empty,
  PageHeader,
  useLoad,
} from "../../components/UI";

export default function ManageCourses() {
  const { data, loading, error, reload } = useLoad(() => api("/courses"));
  const [err, setErr] = useState("");

  const remove = async (c) => {
    if (
      !window.confirm(
        `Delete "${c.title}"? Its modules, assignments, submissions and enrollments will also be deleted.`,
      )
    )
      return;
    try {
      await api(`/courses/${c._id}`, { method: "DELETE" });
      reload();
    } catch (e) {
      setErr(e.message);
    }
  };

  if (loading) return <Loader />;
  const list = data?.courses || [];
  return (
    <>
      <PageHeader title="Courses" subtitle="Create, edit and delete courses.">
        <Link className="btn btn-primary" to="/admin/courses/new">
          New course
        </Link>
      </PageHeader>
      <ErrorBox message={error || err} />
      {list.length === 0 ? (
        <Empty title="No courses yet">
          <Link to="/admin/courses/new">Create your first course</Link>
        </Empty>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Level</th>
                <th>Duration</th>
                <th>Modules</th>
                <th>Enrolled</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c._id}>
                  <td>
                    <Link to={`/courses/${c._id}`}>
                      <strong>{c.title}</strong>
                    </Link>
                    <br />
                    <small>{c.instructor}</small>
                  </td>
                  <td>{c.category}</td>
                  <td>{c.difficulty}</td>
                  <td>{c.duration || "—"}</td>
                  <td>{c.moduleCount}</td>
                  <td>{c.enrollmentCount}</td>
                  <td>
                    <div className="actions">
                      <Link
                        className="btn btn-outline btn-sm"
                        to={`/admin/courses/${c._id}/edit`}
                      >
                        Edit
                      </Link>
                      <Link
                        className="btn btn-outline btn-sm"
                        to={`/admin/modules?course=${c._id}`}
                      >
                        Modules
                      </Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => remove(c)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
