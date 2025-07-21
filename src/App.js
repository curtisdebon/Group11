import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './Pages/HomePage';
import LoginPage from './Pages/LoginPage';
import Navbar from './Components/Navbar';
import ProfilePage from './Components/ProfilePage';
import ModeratorPanel from './Components/ModeratorPanel'; 

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/moderator" element={<ModeratorPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
