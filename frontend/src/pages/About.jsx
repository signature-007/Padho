export default function About() {
  return (
    <main className="container page" style={{ maxWidth: 820 }}>
      <h1>About Padho</h1>
      <p>
        Padho is a learning management system that keeps courses, students and
        assignments in one place. Students learn and submit work; instructors
        publish content and review it.
      </p>
      <div className="panel">
        <h2>Student workflow</h2>
        <div className="flow">
          {[
            "Register",
            "Log in",
            "Browse courses",
            "Enroll",
            "Study modules",
            "Submit assignments",
            "Track progress",
          ].map((s, i, a) => (
            <span key={s}>
              {s}
              {i < a.length - 1 && <i> ›</i>}
            </span>
          ))}
        </div>
      </div>
      <div className="panel">
        <h2>Instructor workflow</h2>
        <div className="flow">
          {[
            "Log in",
            "Create course",
            "Add modules",
            "Publish assignments",
            "Monitor students",
            "Grade submissions",
          ].map((s, i, a) => (
            <span key={s}>
              {s}
              {i < a.length - 1 && <i> ›</i>}
            </span>
          ))}
        </div>
      </div>
      <div className="panel">
        <h2>Built with</h2>
        <p className="muted" style={{ margin: 0 }}>
          React, Node.js, Express, MongoDB and Mongoose. Passwords are hashed
          with bcrypt and sessions use JSON Web Tokens with role-based access
          control.
        </p>
      </div>
    </main>
  );
}
