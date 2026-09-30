import { useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { CourseBanner } from "../components/CourseCard";
import { Loader, ErrorBox, ProgressBar, useLoad } from "../components/UI";

export default function CourseDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data, loading, error, reload } = useLoad(
    () => api(`/courses/${id}`),
    [id, user?._id],
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const enroll = async () => {
    if (!user)
      return navigate("/login", { state: { from: location.pathname } });
    setBusy(true);
    setErr("");
    try {
      await api("/enrollments", { method: "POST", body: { courseId: id } });
      navigate(`/learn/${id}`);
    } catch (e) {
      setErr(e.message);
      if (e.status === 409) reload();
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader />;
  if (error)
    return (
      <main className="container page">
        <ErrorBox message={error} />
      </main>
    );
  const { course, modules, enrollment } = data;

  return (
    <main className="container page">
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          alignItems: "start",
        }}
      >
        <div>
          <CourseBanner course={course} tall />
        </div>
        <div>
          <div className="meta-row" style={{ marginBottom: ".5rem" }}>
            <span className="chip">{course.category}</span>
            <span className="chip chip-plain">{course.difficulty}</span>
            {course.duration && (
              <span className="chip chip-plain">{course.duration}</span>
            )}
          </div>
          <h1>{course.title}</h1>
          <p className="muted">
            Instructor: {course.instructor} · {modules.length} modules ·{" "}
            {course.assignmentCount} assignments · {course.enrollmentCount}{" "}
            enrolled
          </p>
          <ErrorBox message={err} />
          {enrollment ? (
            <div className="stack">
              <ProgressBar value={enrollment.progress} />
              <Link className="btn btn-primary" to={`/learn/${course._id}`}>
                {enrollment.progress ? "Continue learning" : "Start learning"}
              </Link>
            </div>
          ) : user?.role === "admin" ? (
            <Link
              className="btn btn-outline"
              to={`/admin/courses/${course._id}/edit`}
            >
              Edit this course
            </Link>
          ) : (
            <button
              className="btn btn-primary"
              onClick={enroll}
              disabled={busy}
            >
              {busy
                ? "Enrolling…"
                : user
                  ? "Enroll in this course"
                  : "Log in to enroll"}
            </button>
          )}
        </div>
      </div>

      <div className="panel" style={{ marginTop: "1.5rem" }}>
        <h2>About this course</h2>
        <p style={{ whiteSpace: "pre-line" }}>{course.description}</p>
      </div>
      <div className="panel">
        <h2>Modules</h2>
        {modules.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            Modules have not been added yet.
          </p>
        ) : (
          <ol className="list" style={{ paddingLeft: 0 }}>
            {modules.map((m, i) => (
              <li key={m._id}>
                <span>
                  {i + 1}. {m.title}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}
