export const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
export const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
// yyyy-MM-ddTHH:mm for <input type="datetime-local">
export const toInputDate = (d) => {
  if (!d) return "";
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 16);
};
export const isPast = (d) => new Date(d) < new Date();
export const hueFor = (s = "") =>
  [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
export const statusLabel = (s) =>
  ({
    submitted: "Submitted",
    under_review: "Under review",
    graded: "Graded",
    active: "In progress",
    completed: "Completed",
  })[s] || s;
