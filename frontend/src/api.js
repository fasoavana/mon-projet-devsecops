const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'\;

async function request(path, options = {}) {
  try {
    const response = await fetch(`${API_URL}${path}`, options);
    const payload = await response.json().catch(() => null);
    if (response.ok) {
      return { ok: true, data: payload };
    }
    return {
      ok: false,
      error: payload?.detail || payload?.message || response.statusText || 'Erreur inconnue'
    };
  } catch (error) {
    return { ok: false, error: 'Impossible de contacter le serveur' };
  }
}

export async function login(email, password) {
  const body = new URLSearchParams();
  body.append('username', email);
  body.append('password', password);
  return await request('/api/v1/login/access-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });
}

export async function register(email, password, full_name) {
  return await request('/api/v1/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name })
  });
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getMe() {
  return await request('/api/v1/me', { headers: getAuthHeaders() });
}

export async function getReservations() {
  return await request('/api/v1/reservations/', { headers: getAuthHeaders() });
}

export async function createReservation(reservationData) {
  return await request('/api/v1/reservations/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(reservationData)
  });
}

export async function updateReservation(id, reservationData) {
  return await request(`/api/v1/reservations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(reservationData)
  });
}

export async function deleteReservation(id) {
  return await request(`/api/v1/reservations/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
}
