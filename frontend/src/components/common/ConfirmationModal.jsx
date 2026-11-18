import React from 'react';

export default function ConfirmationModal({
  isOpen, onClose, onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: '#ffe4e6', iconColor: '#f43f5e', icon: 'bi-exclamation-triangle-fill',
      btnBg: 'linear-gradient(135deg,#f43f5e,#e11d48)', btnShadow: '0 4px 14px rgba(244,63,94,0.4)',
    },
    warning: {
      iconBg: '#fef3c7', iconColor: '#f59e0b', icon: 'bi-exclamation-circle-fill',
      btnBg: 'linear-gradient(135deg,#f59e0b,#d97706)', btnShadow: '0 4px 14px rgba(245,158,11,0.4)',
    },
    primary: {
      iconBg: '#eef2ff', iconColor: '#6366f1', icon: 'bi-info-circle-fill',
      btnBg: 'linear-gradient(135deg,#6366f1,#4f46e5)', btnShadow: '0 4px 14px rgba(99,102,241,0.4)',
    },
  };
  const vs = variantStyles[variant] || variantStyles.danger;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040, backdropFilter: 'blur(4px)', background: 'rgba(15,23,42,0.4)' }} />
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }} role="dialog">
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 440 }}>
          <div className="modal-content border-0" style={{ borderRadius: 20, boxShadow: '0 25px 60px -10px rgba(0,0,0,0.25)' }}>
            <div className="modal-body p-5 text-center">
              {/* Icon */}
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: vs.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}>
                <i className={`bi ${vs.icon}`} style={{ fontSize: '1.75rem', color: vs.iconColor }}></i>
              </div>

              <h5 className="fw-bold mb-2" style={{ fontSize: '1.125rem', color: '#0f172a' }}>{title}</h5>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.75rem', lineHeight: 1.6 }}>{message}</p>

              <div className="d-flex gap-3 justify-content-center">
                <button
                  className="btn btn-outline-secondary px-4"
                  style={{ borderRadius: 10, fontWeight: 600 }}
                  onClick={onClose}
                  disabled={loading}
                >
                  {cancelText}
                </button>
                <button
                  className="btn px-4 text-white d-flex align-items-center gap-2"
                  style={{
                    background: vs.btnBg,
                    border: 'none',
                    borderRadius: 10,
                    fontWeight: 600,
                    boxShadow: vs.btnShadow,
                  }}
                  onClick={onConfirm}
                  disabled={loading}
                >
                  {loading && <span className="spinner-border spinner-border-sm" />}
                  {confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
