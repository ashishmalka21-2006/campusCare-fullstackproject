import React from 'react';

const Modal = ({ show, title, onClose, children, footer, size = 'md' }) => {
  if (!show) return null;

  return (
    <>
      <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 1060 }}>
        <div className={`modal-dialog modal-dialog-centered modal-${size}`} role="document">
          <div className="modal-content shadow-lg border-0" style={{ borderRadius: '16px' }}>
            <div className="modal-header border-bottom py-3 px-4">
              <h5 className="modal-title fw-bold text-dark mb-0">{title}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
            </div>
            <div className="modal-body p-4">
              {children}
            </div>
            {footer && (
              <div className="modal-footer border-top bg-light py-3 px-4" style={{ borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
