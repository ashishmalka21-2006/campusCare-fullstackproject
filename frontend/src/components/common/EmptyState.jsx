import React from 'react';

const EmptyState = ({ icon = 'bi-inbox', title = 'No data found', description = 'There are no records matching your criteria.', actionText, onAction }) => {
  return (
    <div className="text-center py-5 px-3 bg-white rounded-3 border border-light-subtle">
      <div className="d-inline-flex align-items-center justify-content-center bg-light rounded-circle p-3 mb-3 text-secondary" style={{ width: '64px', height: '64px', fontSize: '1.8rem' }}>
        <i className={`bi ${icon}`}></i>
      </div>
      <h5 className="fw-semibold text-dark mb-1">{title}</h5>
      <p className="text-muted small mb-3 max-w-sm mx-auto" style={{ maxWidth: '380px' }}>{description}</p>
      {actionText && onAction && (
        <button className="btn btn-primary-navy btn-sm px-3 py-2" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
