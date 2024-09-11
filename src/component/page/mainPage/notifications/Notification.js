import React from 'react';

const Notification = ({ notification }) => {
  if (!notification) return null;

  const notificationStyle = {
    padding: '10px',
    backgroundColor: notification.type === 'overdue' ? 'red' : 'yellow',
    color: 'black',
    position: 'fixed',
    top: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    borderRadius: '5px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  };

  return (
    <div style={notificationStyle}>
      {notification.message}
    </div>
  );
};

export default Notification;

