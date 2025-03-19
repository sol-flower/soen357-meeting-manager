import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { doSignOut } from '../../firebase/auth';

const Header = () => {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();
  const logoPath = require('../../components/header/syncup.png');

  return (
    <>
    <nav
      className="flex flex-row gap-x-6 w-full z-20 fixed top-0 left-0 h-16 border-b place-content-between items-center px-6 py-4"
      style={{
        backgroundColor: 'rgb(248, 242, 235)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        borderBottom: '2px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
      }}
    >
     
      <div className="flex items-center gap-x-3">
          <img
            src={logoPath}
            alt="Logo"
            className="w-8 h-8"
          />
           <Link to="/" className="text-2xl font-bold text-gray-800 hover:text-white transition-colors">
        SyncUp
      </Link>
        </div>

      <div className="flex gap-x-6">
        {userLoggedIn ? (
          <button
            onClick={() => {
              doSignOut().then(() => {
                navigate('/login');
              });
            }}
            className="text-sm text-black font-semibold hover:text-red-500 transition-colors"
          >
            Logout
          </button>
        ) : (
          <>
            <Link
              className="custom-link text-sm transition-colors"
              to="/login"
            >
              Login
            </Link>
            <Link
              className="custom-link text-sm transition-colors"
              to="/register"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
    <div className="pt-20">
    </div>
    </>
  );
};

export default Header;
