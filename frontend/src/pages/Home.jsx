import { Link } from "react-router-dom";
import CourseCard from "../components/CourseCard";
import { Loader, ErrorBox, Empty, useLoad } from "../components/UI";
import { api } from "../api";
import { useAuth } from "../AuthContext";

export default function Home() {
  const { user } = useAuth();
  const { data, loading, error } = useLoad(() => api("/courses"));
  const featured = (data?.courses || []).slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Learn at your pace. Show your progress.</h1>
          <p>
            Enroll in structured courses, work through modules, submit
            assignments and see exactly how far you have come.
          </p>
          <div className="row">
            {user ? (
              <Link
                className="btn btn-accent"
                to={user.role === "admin" ? "/admin" : "/dashboard"}
              >
                Go to your dashboard
              </Link>
            ) : (
              <>
                <Link className="btn btn-accent" to="/register">
                  Create a free account
                </Link>
                <Link className="btn btn-light" to="/courses">
                  Browse courses
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="container section">
        <h2>How it works</h2>
        <div className="features">
          <div className="panel feature">
            <h3>Enroll</h3>
            <p className="muted">
              Pick a course and enroll in one click. Your enrollment date and
              progress are tracked automatically.
            </p>
          </div>
          <div className="panel feature">
            <h3>Study module by module</h3>
            <p className="muted">
              Each course is split into ordered modules with notes, videos,
              PDFs, references and practice links.
            </p>
          </div>
          <div className="panel feature">
            <h3>Submit and get feedback</h3>
            <p className="muted">
              Hand in text, a GitHub or Drive link, or a file. Instructors reply
              with marks and feedback.
            </p>
          </div>
        </div>
      </section>

      <section className="container section" style={{ paddingTop: 0 }}>
        <div className="row row-between" style={{ marginBottom: "1rem" }}>
          <h2 style={{ margin: 0 }}>Latest courses</h2>
          <Link to="/courses">See all courses</Link>
        </div>
        {loading && <Loader />}
        <ErrorBox message={error} />
        {!loading && !error && featured.length === 0 && (
          <Empty title="No courses yet">
            Courses will appear here once an instructor publishes them.
          </Empty>
        )}
        <div className="grid grid-3">
          {featured.map((c) => (
            <CourseCard key={c._id} course={c} />
          ))}
        </div>
      </section>
    </>
  );
}
