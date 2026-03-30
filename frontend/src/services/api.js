const API_BASE = import.meta.env.VITE_API_URL || 'http://192.168.1.81:5000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Error en la solicitud');
  }

  return data;
}

export function getUsuarios() {
  return request('/usuarios');
}

export function getTiposPrestamo() {
  return request('/tipos-prestamo');
}

export function getPrestamos() {
  return request('/prestamos');
}

export function getPrestamosResumen() {
  return request('/prestamos/resumen');
}

export function createPrestamo(payload) {
  return request('/prestamos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updatePrestamo(id, payload) {
  return request(`/prestamos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deletePrestamo(id) {
  return request(`/prestamos/${id}`, {
    method: 'DELETE',
  });
}

export function createPagoPrestamo(id, payload) {
  return request(`/prestamos/${id}/pagos`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
