const API_BASE_URL = 'http://localhost:3000';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function loginApi(username, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Login failed. Please check credentials.');
  }

  return response.json();
}

export async function getEmployeesApi(page = 1, limit = 10) {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));

  const response = await fetch(`${API_BASE_URL}/api/employee?${params.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch employees');
  }

  return response.json();
}

export async function createEmployeeApi(data) {
  const response = await fetch(`${API_BASE_URL}/api/employee`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create employee');
  }

  return response.json();
}

export async function updateEmployeeApi(id, data) {
  const response = await fetch(`${API_BASE_URL}/api/employee/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update employee');
  }

  return response.json();
}

export async function getAdminAttendanceHistoryApi(dateFrom, dateTo, page = 1, limit = 10, search = '') {
  const params = new URLSearchParams();
  if (dateFrom) params.append('dateFrom', dateFrom);
  if (dateTo) params.append('dateTo', dateTo);
  if (search) params.append('search', search);
  params.append('page', String(page));
  params.append('limit', String(limit));

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${API_BASE_URL}/api/attendance/admin/history${queryString}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch attendance history');
  }

  return response.json();
}
