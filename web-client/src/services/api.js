const API_BASE_URL = 'http://localhost:3000';

function getAuthHeaders() {
  const token = localStorage.getItem('wc_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function loginApi(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Login gagal. Periksa email dan password Anda.');
  }

  return response.json();
}

export async function checkinApi(employeeId, attendanceDate, checkIn) {
  const response = await fetch(`${API_BASE_URL}/api/attendance/checkin`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ employeeId, attendanceDate, checkIn }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Gagal melakukan absen masuk.');
  }

  return response.json();
}

export async function checkoutApi(employeeId, attendanceDate, checkIn) {
  const response = await fetch(`${API_BASE_URL}/api/attendance/checkout`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ employeeId, attendanceDate, checkIn }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Gagal melakukan absen pulang.');
  }

  return response.json();
}

export async function getAttendanceHistoryApi(page = 1, limit = 10, dateFrom, dateTo) {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  if (dateFrom) params.append('dateFrom', dateFrom);
  if (dateTo) params.append('dateTo', dateTo);

  const response = await fetch(`${API_BASE_URL}/api/attendance/history?${params.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Gagal memuat riwayat absensi.');
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

export async function getEmployeeApi(id) {
  const response = await fetch(`${API_BASE_URL}/api/employee/${id}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update employee');
  }

  return response.json();
}
