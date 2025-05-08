import React, { useContext, useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Layout() {
  const { userInfo, logout } = useContext(AuthContext);
  const [isLoggedIn,setIsLoggedIn]=useState(false);
  
  useEffect(() => {
    // Update the isLoggedIn state based on userInfo
    setIsLoggedIn(!!userInfo);
  }, [userInfo]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };
  
  return (
    <div className="app-container min-h-screen flex flex-col">
      <header className="bg-white shadow-md">
        <nav className="container mx-auto p-4 flex justify-between items-center">
          <div className="logo font-bold text-xl">DevCollab</div>
          <ul className="flex space-x-6">
          <li><Link to="/aboutus" className="hover:text-blue-500">Home</Link></li>
            {isLoggedIn ? (
              <>
                <li><Link to="/problems" className="hover:text-blue-500">Problems</Link></li>
                <li><Link to="/submit-problem" className="hover:text-blue-500">Submit Problem</Link></li>
                <li><Link to="/dashboard" className="hover:text-blue-500">Dashboard</Link></li>
                <li>
                  <button 
                    onClick={handleLogout}
                    className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                
                <li><Link to="/login" className="hover:text-blue-500">Login</Link></li>
                <li><Link to="/register" className="hover:text-blue-500">Register</Link></li>
              </>
            )}
          </ul>
        </nav>
      </header>
      <main className="container mx-auto p-4 flex-grow">
        <Outlet />
      </main>
      <footer className="bg-gray-100 p-4 text-center">
        <p>&copy; {new Date().getFullYear()} DevCollab Platform</p>
      </footer>
    </div>
  );
}

export default Layout;