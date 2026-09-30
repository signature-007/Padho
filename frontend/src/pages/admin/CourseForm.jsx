import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../AuthContext";
import { Loader, ErrorBox, PageHeader } from "../../components/UI";

export default function CourseForm() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    instructor: user.name,
    duration: "",
    difficulty: "Beginner",
    image: "",
  });
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    api(`/courses/${id}`)
      .then((d) =>
        setForm((f) => ({
          ...f,
          ...Object.fromEntries(
            Object.keys(f).map((k) => [k, d.course[k] ?? ""]),
          ),
        })),
      )
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    for (const [k, label] of [
      ["title", "Title"],
      ["description", "Description"],
      ["category", "Category"],
      ["instructor", "Instructor"],
    ]) {
      if (!form[k].trim()) return setError(`${label} is required`);
    }
    if (form.image.trim() && !/^https?:\/\//i.test(form.image.trim()))
      return setError("Image must be a link starting with http:// or https://");
    setBusy(true);
    try {
      await api(id ? `/courses/${id}` : "/courses", {
        method: id ? "PUT" : "POST",
        body: form,
      });
      navigate("/admin/courses");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  if (loading) return <Loader />;
  return (
    <div style={{ maxWidth: 720 }}>
      <PageHeader title={id ? "Edit course" : "New course"}>
        <Link className="btn btn-outline" to="/admin/courses">
          Cancel
        </Link>
      </PageHeader>
      <form className="panel form" onSubmit={submit} noValidate>
        <ErrorBox message={error} />
        <div className="field">
          <label htmlFor="t">Title</label>
          <input
            id="t"
            value={form.title}
            onChange={set("title")}
            maxLength={120}
          />
        </div>
        <div className="field">
          <label htmlFor="d">Description</label>
          <textarea
            id="d"
            value={form.description}
            onChange={set("description")}
          />
        </div>
        <div className="form-2">
          <div className="field">
            <label htmlFor="c">Category</label>
            <input
              id="c"
              value={form.category}
              onChange={set("category")}
              placeholder="e.g. Web Development"
            />
          </div>
          <div className="field">
            <label htmlFor="i">Instructor</label>
            <input
              id="i"
              value={form.instructor}
              onChange={set("instructor")}
            />
          </div>
          <div className="field">
            <label htmlFor="du">Duration</label>
            <input
              id="du"
              value={form.duration}
              onChange={set("duration")}
              placeholder="e.g. 6 weeks"
            />
          </div>
          <div className="field">
            <label htmlFor="df">Difficulty</label>
            <select
              id="df"
              value={form.difficulty}
              onChange={set("difficulty")}
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="im">Image URL (optional)</label>
          <input
            id="im"
            value={form.image}
            onChange={set("image")}
            placeholder="https://…"
          />
          <span className="hint">Leave blank to use a generated banner.</span>
        </div>
        <div>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Saving…" : id ? "Save changes" : "Create course"}
          </button>
        </div>
      </form>
    </div>
  );
}
