import { useState, useEffect, useRef } from 'react';
import { X, Camera } from 'lucide-react';

export default function ModalEmployee({ isOpen, onClose, onSubmit, initialData = null, isEdit = false }) {
  const [formData, setFormData] = useState({
    employeeCode: '',
    fullName: '',
    email: '',
    phone: '',
    position: '',
    password: '',
    role: 'employee',
    photo: '',
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');


  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        setFormData({
          employeeCode: initialData.employeeCode || '',
          fullName: initialData.fullName || '',
          email: initialData.email || '',
          phone: initialData.phone || '',
          position: initialData.position || '',
          password: '',
          role: initialData.role || 'employee',
          photo: initialData.photo || '',
        });
        setPhotoPreview(initialData.photo || null);
      } else {
        setFormData({
          employeeCode: '',
          fullName: '',
          email: '',
          phone: '',
          position: '',
          password: '',
          role: 'employee',
          photo: '',
        });
        setPhotoPreview(null);
      }
      setPhotoFile(null);
      setFormError('');
      setFormSuccess('');
      setFormLoading(false);
    }
  }, [isOpen, isEdit, initialData]);

  if (!isOpen) return null;

  const getPhotoSrc = (src) => {
    if (!src) return null;
    if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }
    return `http://localhost:3000${src}`;
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('File harus berupa gambar (JPG, PNG, WEBP, dll).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFormError('Ukuran foto maksimal 2 MB.');
      return;
    }

    setFormError('');
    setPhotoFile(file);

    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);

    setFormData((prev) => ({ ...prev, photo: file.name }));
  };

  const handleRemovePhoto = (e) => {
    e?.stopPropagation();
    setPhotoPreview(null);
    setPhotoFile(null);
    setFormData((prev) => ({ ...prev, photo: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormLoading(true);

    try {
      let photoValue = formData.photo;
      if (photoFile) {
        photoValue = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target.result);
          reader.onerror = reject;
          reader.readAsDataURL(photoFile);
        });
      }

      await onSubmit({
        formData,
        photoFile,
        photoValue: photoFile ? photoValue : formData.photo,
      });

      setFormSuccess(isEdit ? '✓ Data karyawan berhasil diperbarui!' : '✓ Karyawan baru berhasil ditambahkan!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setFormError(err.message || `Failed to ${isEdit ? 'update' : 'add'} employee`);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{isEdit ? 'Update Employee Details' : 'Add New Employee'}</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {formError && <div className="alert-error">{formError}</div>}
        {formSuccess && <div className="alert-success">{formSuccess}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
            <div
              onClick={handlePhotoClick}
              style={{
                position: 'relative',
                width: 90,
                height: 90,
                borderRadius: '50%',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '2px dashed rgba(99,102,241,0.5)',
                background: 'rgba(15,22,38,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              {photoPreview ? (
                <img
                  src={getPhotoSrc(photoPreview)}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <Camera size={26} color="var(--primary)" />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 600 }}>Upload</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={handlePhotoClick}
                style={{
                  fontSize: '0.75rem', color: 'var(--primary)',
                  background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
                  borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                }}
              >
                📷 Choose Photo
              </button>
              {photoPreview && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  style={{
                    fontSize: '0.75rem', color: '#f43f5e',
                    background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
                    borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                  }}
                >
                  🗑 Remove
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
            />
          </div>

          <div className="form-group">
            <label>Employee Code {isEdit ? '' : '*'}</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. EMP001"
              value={formData.employeeCode}
              onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
              disabled={isEdit}
              style={isEdit ? { opacity: 0.6 } : {}}
              required={!isEdit}
            />
          </div>

          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. John Doe"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address {isEdit ? '' : '*'}</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. john@dexagroup.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isEdit}
              style={isEdit ? { opacity: 0.6 } : {}}
              required={!isEdit}
            />
          </div>

          {!isEdit && (
            <div className="form-group">
              <label>Auth Password *</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Position</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Software Engineer"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. +62812345678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={formLoading}>
              {formLoading ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Employee')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
