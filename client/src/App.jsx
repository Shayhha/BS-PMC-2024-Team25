// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import axios from 'axios';
import NavBar from './NavBar.jsx';
import LandingPage from './LandingPage.jsx';
import HomePage from './HomePage.jsx';
import Login from './LogIn/login.jsx';
import Register from './Register/register.jsx'; // Ensure this path is correct

function App() {
  const [array, setArray] = useState([]);

  const fetchAPI = async () => {
    const response = await axios.get('http://localhost:8090/api/users');
    setArray(response.data.users);
  };

  useEffect(() => {
    fetchAPI();
  }, []);

  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
<<<<<<< HEAD
        <Route path="/register" element={<Register />} />
=======
        <Route path="/homepage" element={<HomePage />} />
>>>>>>> f9c5aa15a0bf65d4f911c6feaa1ee801739708aa
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
