import React from 'react';
import { useNavigate } from 'react-router-dom';

const Toolbar = ({ onLogout, authToken }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login'); // Navigate to login after logout
  };

  return (
    <div className="toolbar">
      <button onClick={() => navigate('/')}>Home</button>
      <button onClick={() => navigate('/settings')}>Settings</button>
      {authToken ? (
        <button onClick={handleLogoutClick}>Logout</button>
      ) : (
        <>
          <button onClick={() => navigate('/login')}>Login</button>
          <button onClick={() => navigate('/register')}>Register</button>
        </>
      )}
    </div>
  );
};

export default Toolbar;


