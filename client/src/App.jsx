// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import axios from 'axios';
import NavBar from './NavBar.jsx';
import LandingPage from './LandingPage.jsx';
import HomePage from './HomePage.jsx';
import Login from './LogIn/login.jsx';
import Register from './Register/register.jsx'; 
import Admin from './Admin/admin.jsx'; 
import EditUser from './EditUser.jsx'; 
import Coder from './Coder/coder.jsx'; 
import Tester from './Tester/tester.jsx'; 

function App() {

  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/tester" element={<Tester />} />
        <Route path="/coder" element={<Coder />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/editUser" element={<EditUser />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
