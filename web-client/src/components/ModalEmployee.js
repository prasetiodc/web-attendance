import { X, Camera, User } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { updateEmployeeApi, getEmployeeApi } from '../services/api';

function ModalEmployee({ onClose, user, onUpdated }) {
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [fetchingDetail, setFetchingDetail] = useState(false);
    const [employeeDetails, setEmployeeDetails] = useState(null);
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        phone: user?.phone || '',
        position: user?.position || '',
        photo: user?.photo || '',
    });
    const [photoPreview, setPhotoPreview] = useState(user?.photo || null);
    const [photoFile, setPhotoFile] = useState(null);
    const [isEdit, setIsEdit] = useState(false);

    const fileInputRef = useRef(null);
    const empId = user?.employeeId || user?.id;

    const getPhotoSrc = (src) => {
        if (!src) return null;
        if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) {
            return src;
        }
        return `http://localhost:3000${src}`;
    };

    useEffect(() => {
        if (!empId) return;

        let isMounted = true;
        setFetchingDetail(true);

        getEmployeeApi(empId)
            .then((data) => {
                if (!isMounted) return;
                setEmployeeDetails(data);
                setFormData({
                    fullName: data.fullName || '',
                    phone: data.phone || '',
                    position: data.position || '',
                    photo: data.photo || '',
                });
                setPhotoPreview(data.photo || null);
            })
            .catch((err) => {
                if (!isMounted) return;
                setFormError(err.message || 'Gagal memuat detail karyawan.');
            })
            .finally(() => {
                if (isMounted) setFetchingDetail(false);
            });

        return () => {
            isMounted = false;
        };
    }, [empId]);

    const handlePhotoClick = () => {
        if (!isEdit) return;
        fileInputRef.current?.click();
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate type & size (max 2 MB)
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
        e.stopPropagation();
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

            await updateEmployeeApi(empId, {
                fullName: formData.fullName,
                phone: formData.phone,
                position: formData.position,
                photo: photoValue,
            });

            setFormSuccess('✓ Data profil berhasil diperbarui!');
            onUpdated?.();
            setTimeout(() => {
                setFormSuccess('');
                setIsEdit(false);
            }, 1200);
        } catch (err) {
            setFormError(err.message || 'Gagal mengupdate data karyawan.');
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{isEdit ? 'Edit Profile' : 'Profile Karyawan'}</h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {formError && <div className="alert alert-error">{formError}</div>}
                {formSuccess && <div className="alert alert-success">{formSuccess}</div>}

                <form onSubmit={handleSubmit}>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
                        <div
                            onClick={handlePhotoClick}
                            style={{
                                position: 'relative',
                                width: 100,
                                height: 100,
                                borderRadius: '50%',
                                overflow: 'hidden',
                                cursor: isEdit ? 'pointer' : 'default',
                                border: '3px solid rgba(99,102,241,0.4)',
                                background: 'rgba(15,22,38,0.8)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: isEdit ? '0 0 0 4px rgba(99,102,241,0.15)' : 'none',
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
                                <User size={40} color="#64748b" />
                            )}

                            {/* Overlay when in edit mode */}
                            {isEdit && (
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    background: 'rgba(0,0,0,0.45)',
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    gap: 4,
                                    opacity: 0,
                                    transition: 'opacity 0.2s',
                                }}
                                    className="photo-overlay"
                                >
                                    <Camera size={22} color="#fff" />
                                    <span style={{ fontSize: '0.65rem', color: '#fff', fontWeight: 700 }}>Upload</span>
                                </div>
                            )}
                        </div>

                        {isEdit && (
                            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                <button
                                    type="button"
                                    onClick={handlePhotoClick}
                                    style={{
                                        fontSize: '0.78rem', color: 'var(--primary)',
                                        background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
                                        borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                                    }}
                                >
                                    📷 Pilih Foto
                                </button>
                                {photoPreview && (
                                    <button
                                        type="button"
                                        onClick={handleRemovePhoto}
                                        style={{
                                            fontSize: '0.78rem', color: '#f43f5e',
                                            background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
                                            borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                                        }}
                                    >
                                        🗑 Hapus
                                    </button>
                                )}
                            </div>
                        )}

                        <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '6px' }}>
                            {isEdit ? 'JPG / PNG / WEBP · Maks 2 MB' : ''}
                        </p>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handlePhotoChange}
                        />
                    </div>

                    {/* Read-only fields */}
                    <div className="form-group">
                        <label>Employee Code</label>
                        <input
                            type="text"
                            className="form-input"
                            value={employeeDetails?.employeeCode || user?.employeeCode || ''}
                            disabled
                            style={{ opacity: 0.5 }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            value={employeeDetails?.email || user?.email || ''}
                            disabled
                            style={{ opacity: 0.5 }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. John Doe"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            disabled={!isEdit || fetchingDetail}
                            style={!isEdit ? { opacity: 0.7 } : {}}
                            required={isEdit}
                        />
                    </div>

                    {/* Read-only fields */}
                    <div className="form-group">
                        <label>Position</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Software Engineer"
                            value={formData.position}
                            disabled
                            style={{ opacity: 0.7 }}
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
                            disabled={!isEdit || fetchingDetail}
                            style={!isEdit ? { opacity: 0.7 } : {}}
                        />
                    </div>

                    <div className="form-actions">
                        {isEdit ? (
                            <>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => {
                                        setIsEdit(false);
                                        setFormError('');
                                        setFormData({
                                            fullName: employeeDetails?.fullName || user?.fullName || '',
                                            phone: employeeDetails?.phone || user?.phone || '',
                                            position: employeeDetails?.position || user?.position || '',
                                            photo: employeeDetails?.photo || user?.photo || '',
                                        });
                                        setPhotoPreview(employeeDetails?.photo || user?.photo || null);
                                        setPhotoFile(null);
                                    }}
                                    style={{ width: '100%', padding: '10px' }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={formLoading || fetchingDetail} style={{ width: '100%', padding: '10px' }}>
                                    {formLoading ? 'Menyimpan...' : 'Save'}
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                className="btn-primary"
                                style={{ width: '100%', padding: '10px' }}
                                onClick={() => setIsEdit(true)}
                                disabled={fetchingDetail}
                            >
                                {fetchingDetail ? 'Memuat Data...' : 'Edit'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ModalEmployee;