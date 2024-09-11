import React, { useState, useRef, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import './NotificationIcon.css';

const NotificationIcon = ({ notifications }) => {
  const [isOpen, setIsOpen] = useState(false);
  const iconRef = useRef();

  const handleIconClick = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event) => {
    if (iconRef.current && !iconRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="notification-icon-container" ref={iconRef}>
      <div className="notification-icon" onClick={handleIconClick}>
        <FaBell />
        {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
      </div>
      {isOpen && (
        <div className="notification-dropdown">
          {notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            <ul>
              {notifications.map((notification, index) => (
                <li key={index}>{notification}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;
