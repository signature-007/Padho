import { useState } from "react";
import { api, fileUrl } from "../../api";
import { fmtDateTime } from "../../utils";
import {
  Loader,
  ErrorBox,
  Notice,
  Empty,
  PageHeader,
  StatusBadge,
  useLoad,
} from "../../components/UI";

function GradeForm({ s, onSaved, onCancel }) {
  const [f, setF] = useState({
    marks: s.marks ?? "",
    feedback: s.feedback || "",
    status: s.status,
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setErr("");
    if (
      f.marks !== "" &&
      (Number(f.marks) < 0 || Number(f.marks) > s.assignment.maxMarks)
    )
      return setErr(`Marks must be between 0 and ${s.assignment.maxMarks}`);
    if (f.status === "graded" && f.marks === "")
      return setErr("Enter marks before marking as graded");
    setBusy(true);
    try {
      await api(`/submissions/${s._id}`, { method: "PUT", body: f });
      onSaved();
    } catch (e2) {
      setErr(e2.message);
      setBusy(false);
    }
  };

  return (
    <form className="form" onSubmit={save} style={{ padding: ".6rem 0" }}>
      <ErrorBox message={err} />
      <div className="form-2">
        <div className="field">
          <label>Marks (max {s.assignment.maxMarks})</label>
          <input
            type="number"
            min="0"
            max={s.assignment.maxMarks}
            value={f.marks}
            onChange={(e) => setF({ ...f, marks: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Status</label>
          <select
            value={f.status}
            onChange={(e) => setF({ ...f, status: e.target.value })}
          >
            <option value="submitted">Submitted</option>
            <option value="under_review">Under review</option>
            <option value="graded">Graded</option>
          </select>
        </div>
      </div>
      <div className="field">
        <label>Feedback</label>
        <textarea
          value={f.feedback}
          onChange={(e) => setF({ ...f, feedback: e.target.value })}
        />
      </div>
      <div className="row">
        <button className="btn btn-primary btn-sm" disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function ViewSubmissions() {
  const courses = useLoad(() => api("/courses"));
  const [course, setCourse] = useState("");
  const [status, setStatus] = useState("");
  const { data, loading, error, reload } = useLoad(() => {
    const p = new URLSearchParams();
    if (course) p.set("course", course);
    if (status) p.set("status", status);
    return api(`/submissions?${p}`);
  }, [course, status]);
  const [openId, setOpenId] = useState(null);
  const [ok, setOk] = useState("");

  return (
    <>
      <PageHeader
        title="Submissions"
        subtitle="Review work, then add marks and feedback."
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
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Status"
        >
          <option value="">Any status</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under review</option>
          <option value="graded">Graded</option>
        </select>
      </div>
      <ErrorBox message={error} />
      <Notice message={ok} />
      {loading ? (
        <Loader />
      ) : (data?.submissions.length ?? 0) === 0 ? (
        <Empty title="No submissions found" />
      ) : (
        <div className="stack">
          {data.submissions.map((s) => (
            <article className="panel" key={s._id} style={{ marginBottom: 0 }}>
              <div className="row row-between">
                <div>
                  <strong>{s.assignment.title}</strong>{" "}
                  <small>· {s.course.title}</small>
                  <br />
                  <small>
                    {s.student.name} ({s.student.email}) ·{" "}
                    {fmtDateTime(s.submissionDate)}
                  </small>
                </div>
                <div className="row">
                  {s.isLate && <span className="badge badge-late">Late</span>}
                  <StatusBadge status={s.status} />
                  {s.status === "graded" && (
                    <strong>
                      {s.marks}/{s.assignment.maxMarks}
                    </strong>
                  )}
                </div>
              </div>
              {s.text && (
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    font: "inherit",
                    background: "#f7faf9",
                    padding: ".6rem .8rem",
                    borderRadius: 6,
                    margin: ".7rem 0 0",
                  }}
                >
                  {s.text}
                </pre>
              )}
              {s.link && (
                <p style={{ margin: ".6rem 0 0" }}>
                  {s.linkType ? `${s.linkType}: ` : ""}
                  <a href={s.link} target="_blank" rel="noreferrer noopener">
                    {s.link}
                  </a>
                </p>
              )}
              {s.file?.path && (
                <p style={{ margin: ".6rem 0 0" }}>
                  File:{" "}
                  <a
                    href={fileUrl(s.file.path)}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {s.file.originalName}
                  </a>
                </p>
              )}
              {s.feedback && openId !== s._id && (
                <p style={{ margin: ".6rem 0 0" }}>
                  <small>Feedback: {s.feedback}</small>
                </p>
              )}
              {openId === s._id ? (
                <GradeForm
                  s={s}
                  onCancel={() => setOpenId(null)}
                  onSaved={() => {
                    setOpenId(null);
                    setOk("Saved.");
                    reload();
                  }}
                />
              ) : (
                <div style={{ marginTop: ".7rem" }}>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setOk("");
                      setOpenId(s._id);
                    }}
                  >
                    {s.status === "graded" ? "Edit grade" : "Grade"}
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
