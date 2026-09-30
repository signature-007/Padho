const BASE = import.meta.env.VITE_API_URL || '/api';
const ORIGIN = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : '';

export const fileUrl = (p) => `${ORIGIN}/${p}`;

export async function api(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  const token = localStorage.getItem('lms_token');
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form; // FormData: browser sets the multipart boundary
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: payload });
  } catch {
    throw new Error('Cannot reach the server. Check that the backend is running.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) window.dispatchEvent(new Event('lms:unauthorized'));
    const err = new Error(data.message || 'Something went wrong');
    err.status = res.status;
    throw err;
  }
  return data;
}
