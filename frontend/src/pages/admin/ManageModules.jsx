import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../api";
import {
  Loader,
  ErrorBox,
  Empty,
  PageHeader,
  useLoad,
} from "../../components/UI";

const TYPES = [
  "notes",
  "pdf",
  "video",
  "reference",
  "code",
  "exercise",
  "link",
];
const blank = {
  title: "",
  description: "",
  notes: "",
  order: "",
  resources: [],
};

export default function ManageModules() {
  const [params, setParams] = useSearchParams();
  const courseId = params.get("course") || "";
  const courses = useLoad(() => api("/courses"));
  const mods = useLoad(
    () =>
      courseId ? api(`/courses/${courseId}/modules`) : Promise.resolve(null),
    [courseId],
  );
  const [editing, setEditing] = useState(null); // null | 'new' | module id
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!courseId && courses.data?.courses.length)
      setParams({ course: courses.data.courses[0]._id }, { replace: true });
  }, [courses.data, courseId, setParams]);

  const open = (m) => {
    setError("");
    if (m) {
      setEditing(m._id);
      setForm({
        title: m.title,
        description: m.description,
        notes: m.notes,
        order: m.order,
        resources: m.resources.map(({ label, type, url }) => ({
          label,
          type,
          url,
        })),
      });
    } else {
      setEditing("new");
      setForm({ ...blank, order: (mods.data?.modules.length || 0) + 1 });
    }
  };
  const setRes = (i, k, v) =>
    setForm({
      ...form,
      resources: form.resources.map((r, j) => (j === i ? { ...r, [k]: v } : r)),
    });

  const save = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) return setError("Module title is required");
    for (const r of form.resources) {
      if (
        (r.label || r.url) &&
        !(r.label.trim() && /^https?:\/\//i.test(r.url.trim()))
      )
        return setError(
          "Each resource needs a label and a link starting with http:// or https://",
        );
    }
    setBusy(true);
    try {
      if (editing === "new")
        await api(`/courses/${courseId}/modules`, {
          method: "POST",
          body: form,
        });
      else await api(`/modules/${editing}`, { method: "PUT", body: form });
      setEditing(null);
      mods.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (m) => {
    if (
      !window.confirm(
        `Delete module "${m.title}"? Student progress will be recalculated.`,
      )
    )
      return;
    try {
      await api(`/modules/${m._id}`, { method: "DELETE" });
      mods.reload();
    } catch (e) {
      setError(e.message);
    }
  };

  if (courses.loading) return <Loader />;
  if (!courses.data?.courses.length)
    return (
      <Empty title="Create a course first">Modules belong to a course.</Empty>
    );

  return (
    <>
      <PageHeader
        title="Modules"
        subtitle="Add and order the content of a course."
      >
        {!editing && courseId && (
          <button className="btn btn-primary" onClick={() => open(null)}>
            Add module
          </button>
        )}
      </PageHeader>
      <div className="filters">
        <select
          value={courseId}
          onChange={(e) => {
            setEditing(null);
            setParams({ course: e.target.value });
          }}
          aria-label="Course"
        >
          {courses.data.courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>
      <ErrorBox message={error && !editing ? error : mods.error} />

      {editing && (
        <form className="panel form" onSubmit={save} noValidate>
          <h2 style={{ margin: 0 }}>
            {editing === "new" ? "New module" : "Edit module"}
          </h2>
          <ErrorBox message={error} />
          <div className="form-2">
            <div className="field">
              <label htmlFor="mt">Title</label>
              <input
                id="mt"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="mo">Order</label>
              <input
                id="mo"
                type="number"
                min="1"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="md">Description</label>
            <textarea
              id="md"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label htmlFor="mn">Notes</label>
            <textarea
              id="mn"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div>
            <strong>Learning materials</strong>
            <div className="stack" style={{ marginTop: ".5rem" }}>
              {form.resources.map((r, i) => (
                <div className="resource-row" key={i}>
                  <input
                    placeholder="Label"
                    aria-label="Resource label"
                    value={r.label}
                    onChange={(e) => setRes(i, "label", e.target.value)}
                  />
                  <select
                    aria-label="Resource type"
                    value={r.type}
                    onChange={(e) => setRes(i, "type", e.target.value)}
                  >
                    {TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  <input
                    placeholder="https://…"
                    aria-label="Resource link"
                    value={r.url}
                    onChange={(e) => setRes(i, "url", e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() =>
                      setForm({
                        ...form,
                        resources: form.resources.filter((_, j) => j !== i),
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() =>
                  setForm({
                    ...form,
                    resources: [
                      ...form.resources,
                      { label: "", type: "link", url: "" },
                    ],
                  })
                }
              >
                Add resource
              </button>
            </div>
          </div>
          <div className="row">
            <button className="btn btn-primary" disabled={busy}>
              {busy ? "Saving…" : "Save module"}
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

      {mods.loading ? (
        <Loader />
      ) : (
        !editing &&
        (mods.data?.modules.length === 0 ? (
          <Empty title="No modules in this course yet">
            Use "Add module" to create the first one.
          </Empty>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 70 }}>Order</th>
                  <th>Module</th>
                  <th>Resources</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(mods.data?.modules || []).map((m) => (
                  <tr key={m._id}>
                    <td>{m.order}</td>
                    <td>
                      <strong>{m.title}</strong>
                      <br />
                      <small>{m.description}</small>
                    </td>
                    <td>{m.resources.length}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => open(m)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => remove(m)}
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
        ))
      )}
    </>
  );
}
