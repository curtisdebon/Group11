import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './Pages/HomePage';
import LoginPage from './Pages/LoginPage';
import Navbar from './Components/Navbar';

function App() {
  return (
  <BrowserRouter>
    <Navbar /> {/* Add the Navbar here */}
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  </BrowserRouter>
);
}

export default App;
