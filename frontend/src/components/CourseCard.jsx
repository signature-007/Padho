import { Link } from "react-router-dom";
import { hueFor } from "../utils";

export function CourseBanner({ course, tall }) {
  const hue = hueFor(course.category);
  return course.image ? (
    <img
      className={`banner ${tall ? "banner-tall" : ""}`}
      src={course.image}
      alt=""
      loading="lazy"
    />
  ) : (
    <div
      className={`banner ${tall ? "banner-tall" : ""}`}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 45% 28%), hsl(${(hue + 40) % 360} 55% 42%))`,
      }}
    >
      <span>
        {course.title
          .split(" ")
          .map((w) => w[0])
          .slice(0, 3)
          .join("")}
      </span>
    </div>
  );
}

export default function CourseCard({ course }) {
  return (
    <article className="course-card">
      <CourseBanner course={course} />
      <div className="course-body">
        <div className="meta-row">
          <span className="chip">{course.category}</span>
          <span className="chip chip-plain">{course.difficulty}</span>
        </div>
        <h3>{course.title}</h3>
        <p className="clamp">{course.description}</p>
        <div className="course-foot">
          <small className="muted">
            {course.instructor} · {course.moduleCount ?? 0} modules
            {course.duration ? ` · ${course.duration}` : ""}
          </small>
          <Link
            className="btn btn-primary btn-sm"
            to={`/courses/${course._id}`}
          >
            View course
          </Link>
        </div>
      </div>
    </article>
  );
}
