import React, { useState, useEffect, useCallback } from 'react';
import { getEmployeesApi, createEmployeeApi, updateEmployeeApi } from '../services/api';
import { UserPlus, Search, Edit3, User } from 'lucide-react';
import Pagination from '../components/Pagination';
import ModalEmployee from '../components/ModalEmployee';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState(null);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    isEdit: false,
    initialData: null,
  });

  const getPhotoSrc = (src) => {
    if (!src) return null;
    if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }
    return `http://localhost:3000${src}`;
  };

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getEmployeesApi(page, limit);
      setEmployees(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const openAddModal = () => {
    setModalConfig({
      isOpen: true,
      isEdit: false,
      initialData: null,
    });
  };

  const openEditModal = (emp) => {
    setModalConfig({
      isOpen: true,
      isEdit: true,
      initialData: emp,
    });
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const handleModalSubmit = async ({ formData, photoFile, photoValue }) => {
    if (modalConfig.isEdit) {
      await updateEmployeeApi(modalConfig.initialData.id, {
        fullName: formData.fullName,
        phone: formData.phone,
        position: formData.position,
        ...(photoFile ? { photo: photoValue } : {}),
      });
    } else {
      await createEmployeeApi({
        ...formData,
        photo: photoValue || undefined,
      });
    }
    fetchEmployees();
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="toolbar">
        <div className="search-box">
          <Search size={18} color="var(--text-dim)" />
          <input
            type="text"
            placeholder="Search by name, code, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="btn-primary" onClick={openAddModal}>
          <UserPlus size={18} />
          <span>Add New Employee</span>
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="glass-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Employee Name</th>
                <th>Email</th>
                <th>Position</th>
                <th>Phone</th>
                <th>Photo</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Loading employees...</td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>No employees found.</td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <span className="badge badge-primary">{emp.employeeCode}</span>
                    </td>
                    <td><strong>{emp.fullName}</strong></td>
                    <td>{emp.email}</td>
                    <td>{emp.position || '-'}</td>
                    <td>{emp.phone || '-'}</td>
                    <td>
                      {emp.photo ? (
                        <img
                          src={getPhotoSrc(emp.photo)}
                          alt={emp.fullName}
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                      ) : (
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={18} color="var(--text-dim)" />
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                        onClick={() => openEditModal(emp)}
                      >
                        <Edit3 size={14} style={{ marginRight: '6px' }} />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          meta={meta}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      </div>

      <ModalEmployee
        isOpen={modalConfig.isOpen}
        isEdit={modalConfig.isEdit}
        initialData={modalConfig.initialData}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}
