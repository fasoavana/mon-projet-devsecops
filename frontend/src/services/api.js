const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${path}`, { ...options, headers });
    
    // Handle 401 Unauthorized globally
    if (response.status === 401 && !path.includes('/login')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return { ok: false, error: 'Session expirée' };
    }

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

export const login = async (email, password) => {
  const body = new URLSearchParams();
  body.append('username', email);
  body.append('password', password);

  return await request('/login/access-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });
};

export const register = async (userData) => {
  return await request('/users/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
};

export const getMe = () => request('/me');

export const getReservations = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/reservations/?${query}`);
};

export const createReservation = (data) => request('/reservations/', {
  method: 'POST',
  body: JSON.stringify(data)
});

export const updateReservation = (id, data) => request(`/reservations/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data)
});

export const deleteReservation = (id) => request(`/reservations/${id}`, {
  method: 'DELETE'
});
