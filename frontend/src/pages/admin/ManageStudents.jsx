import { useState } from "react";
import { api } from "../../api";
import { fmtDate } from "../../utils";
import {
  Loader,
  ErrorBox,
  Empty,
  PageHeader,
  ProgressBar,
  useLoad,
} from "../../components/UI";

export default function ManageStudents() {
  const { data, loading, error, reload } = useLoad(() => api("/students"));
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");

  const remove = async (s) => {
    if (
      !window.confirm(
        `Remove ${s.name}? Their enrollments and submissions will be deleted.`,
      )
    )
      return;
    try {
      await api(`/students/${s._id}`, { method: "DELETE" });
      reload();
    } catch (e) {
      setErr(e.message);
    }
  };

  if (loading) return <Loader />;
  const list = (data?.students || []).filter((s) =>
    `${s.name} ${s.email}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="Students"
        subtitle={`${data?.students.length ?? 0} registered`}
      />
      <ErrorBox message={error || err} />
      <div className="filters">
        <input
          type="search"
          placeholder="Search by name or email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search students"
        />
      </div>
      {list.length === 0 ? (
        <Empty title="No students found" />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Courses</th>
                <th>Submissions</th>
                <th style={{ width: 180 }}>Avg. progress</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s._id}>
                  <td>
                    <strong>{s.name}</strong>
                  </td>
                  <td>{s.email}</td>
                  <td>{fmtDate(s.createdAt)}</td>
                  <td>{s.enrollments}</td>
                  <td>{s.submissions}</td>
                  <td>
                    <ProgressBar value={s.avgProgress} />
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => remove(s)}
                    >
                      Remove
                    </button>
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
