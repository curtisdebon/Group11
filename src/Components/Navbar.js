import { Link, useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import './NavBar.css';

function Navbar() {
  const { currentUser, setCurrentUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link to="/">Home</Link>

        {!currentUser && <Link to="/login">Login</Link>}

        {currentUser && (
          <>
            <Link to="/profile">Profile</Link>
            {currentUser.role === 'moderator' && (
              <Link to="/moderator">Moderator Panel</Link>
            )}
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
