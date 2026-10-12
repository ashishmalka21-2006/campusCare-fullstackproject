import React from 'react';

const statusIcons = {
  SUBMITTED: 'bi-inbox',
  ASSIGNED: 'bi-person-check',
  IN_PROGRESS: 'bi-hourglass-split',
  RESOLVED: 'bi-check-circle-fill',
  REOPENED: 'bi-arrow-repeat',
  CLOSED: 'bi-archive-fill',
};

const statusLabels = {
  SUBMITTED: 'Submitted',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  REOPENED: 'Reopened',
  CLOSED: 'Closed',
};

const StatusBadge = ({ status }) => {
  const icon = statusIcons[status] || 'bi-circle';
  const label = statusLabels[status] || status;

  return (
    <span className={`badge-status badge-status-${status}`}>
      <i className={`bi ${icon}`}></i>
      <span>{label}</span>
    </span>
  );
};

export default StatusBadge;
