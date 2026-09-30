import { useState } from "react";
import { api } from "../../api";
import { fmtDateTime, toInputDate } from "../../utils";
import {
  Loader,
  ErrorBox,
  Empty,
  PageHeader,
  useLoad,
} from "../../components/UI";

const blank = {
  course: "",
  title: "",
  description: "",
  instructions: "",
  deadline: "",
  maxMarks: 100,
};

export default function ManageAssignments() {
  const courses = useLoad(() => api("/courses"));
  const [filter, setFilter] = useState("");
  const list = useLoad(
    () => api(`/assignments${filter ? `?course=${filter}` : ""}`),
    [filter],
  );
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const open = (a) => {
    setError("");
    if (a) {
      setEditing(a._id);
      setForm({
        course: a.course._id,
        title: a.title,
        description: a.description,
        instructions: a.instructions,
        deadline: toInputDate(a.deadline),
        maxMarks: a.maxMarks,
      });
    } else {
      setEditing("new");
      setForm({
        ...blank,
        course: filter || courses.data?.courses[0]?._id || "",
      });
    }
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.course) return setError("Choose a course");
    if (!form.title.trim()) return setError("Title is required");
    if (!form.deadline) return setError("Set a deadline");
    if (!(Number(form.maxMarks) >= 1))
      return setError("Maximum marks must be at least 1");
    setBusy(true);
    try {
      const body = { ...form, deadline: new Date(form.deadline).toISOString() };
      if (editing === "new")
        await api(`/courses/${form.course}/assignments`, {
          method: "POST",
          body,
        });
      else await api(`/assignments/${editing}`, { method: "PUT", body });
      setEditing(null);
      list.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (a) => {
    if (
      !window.confirm(
        `Delete "${a.title}" and its ${a.submissionCount} submission(s)?`,
      )
    )
      return;
    try {
      await api(`/assignments/${a._id}`, { method: "DELETE" });
      list.reload();
    } catch (e) {
      setError(e.message);
    }
  };

  if (courses.loading) return <Loader />;
  const cs = courses.data?.courses || [];
  return (
    <>
      <PageHeader
        title="Assignments"
        subtitle="Create and manage course assignments."
      >
        {!editing && cs.length > 0 && (
          <button className="btn btn-primary" onClick={() => open(null)}>
            New assignment
          </button>
        )}
      </PageHeader>
      {cs.length === 0 && (
        <Empty title="Create a course first">
          Assignments belong to a course.
        </Empty>
      )}
      {!editing && cs.length > 0 && (
        <div className="filters">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter by course"
          >
            <option value="">All courses</option>
            {cs.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      )}
      <ErrorBox message={!editing ? error || list.error : ""} />

      {editing && (
        <form className="panel form" onSubmit={save} noValidate>
          <h2 style={{ margin: 0 }}>
            {editing === "new" ? "New assignment" : "Edit assignment"}
          </h2>
          <ErrorBox message={error} />
          <div className="form-2">
            <div className="field">
              <label htmlFor="ac">Course</label>
              <select
                id="ac"
                value={form.course}
                onChange={set("course")}
                disabled={editing !== "new"}
              >
                {cs.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="at">Title</label>
              <input id="at" value={form.title} onChange={set("title")} />
            </div>
            <div className="field">
              <label htmlFor="ad">Deadline</label>
              <input
                id="ad"
                type="datetime-local"
                value={form.deadline}
                onChange={set("deadline")}
              />
            </div>
            <div className="field">
              <label htmlFor="am">Maximum marks</label>
              <input
                id="am"
                type="number"
                min="1"
                value={form.maxMarks}
                onChange={set("maxMarks")}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="ade">Description</label>
            <textarea
              id="ade"
              value={form.description}
              onChange={set("description")}
            />
          </div>
          <div className="field">
            <label htmlFor="ai">Instructions</label>
            <textarea
              id="ai"
              value={form.instructions}
              onChange={set("instructions")}
            />
          </div>
          <div className="row">
            <button className="btn btn-primary" disabled={busy}>
              {busy ? "Saving…" : "Save assignment"}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!editing &&
        (list.loading ? (
          <Loader />
        ) : (list.data?.assignments.length ?? 0) === 0 ? (
          <Empty title="No assignments yet" />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Course</th>
                  <th>Deadline</th>
                  <th>Marks</th>
                  <th>Submissions</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.data.assignments.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <strong>{a.title}</strong>
                    </td>
                    <td>{a.course.title}</td>
                    <td>{fmtDateTime(a.deadline)}</td>
                    <td>{a.maxMarks}</td>
                    <td>{a.submissionCount}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => open(a)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => remove(a)}
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
        ))}
    </>
  );
}
