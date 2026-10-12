import React from 'react';

const priorityIcons = {
  LOW: 'bi-dash-circle',
  MEDIUM: 'bi-exclamation-circle',
  HIGH: 'bi-exclamation-triangle-fill',
  URGENT: 'bi-lightning-charge-fill',
};

const PriorityBadge = ({ priority }) => {
  const icon = priorityIcons[priority] || 'bi-circle';

  return (
    <span className={`badge-priority badge-priority-${priority}`}>
      <i className={`bi ${icon} me-1`}></i>
      {priority}
    </span>
  );
};

export default PriorityBadge;
