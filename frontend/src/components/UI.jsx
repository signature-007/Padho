import { useEffect, useState } from "react";
import { statusLabel } from "../utils";

export const Loader = ({ text = "Loading…" }) => (
  <div className="loader" role="status">
    {text}
  </div>
);

export const ErrorBox = ({ message }) =>
  message ? (
    <div className="alert alert-error" role="alert">
      {message}
    </div>
  ) : null;
export const Notice = ({ message }) =>
  message ? (
    <div className="alert alert-ok" role="status">
      {message}
    </div>
  ) : null;

export const Empty = ({ title, children }) => (
  <div className="empty">
    <strong>{title}</strong>
    {children && <p>{children}</p>}
  </div>
);

export const ProgressBar = ({ value = 0, label = true }) => (
  <div className="progress-wrap">
    <div
      className="progress"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <span style={{ width: `${value}%` }} />
    </div>
    {label && <small>{value}%</small>}
  </div>
);

export const StatusBadge = ({ status }) => (
  <span className={`badge badge-${status}`}>{statusLabel(status)}</span>
);

export const PageHeader = ({ title, subtitle, children }) => (
  <div className="page-header">
    <div>
      <h1>{title}</h1>
      {subtitle && <p className="muted">{subtitle}</p>}
    </div>
    {children && <div className="page-actions">{children}</div>}
  </div>
);

// Small hook: run an async loader, expose data/loading/error and a reload function.
export function useLoad(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: "" }));
    fn()
      .then((data) => alive && setState({ data, loading: false, error: "" }))
      .catch(
        (e) =>
          alive && setState({ data: null, loading: false, error: e.message }),
      );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return { ...state, reload: () => setTick((t) => t + 1) };
}
