import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav style={{ padding: '1rem', backgroundColor: '#f2f2f2' }}>
      <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
      <Link to="/login">Login</Link>
    </nav>
  );
}

export default Navbar;
