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
import UsersListPage from './UsersListPage.jsx';
import Chat from './Chat/Chat.jsx'; // ייבוא הקומפוננטה של הצ'אט
import Reports from './Reports.jsx';
import BugComments from './BugComments.jsx';

function App() {

  return (
    <div className='app_main_div'>
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
          <Route path="/removeUser" element={<UsersListPage />} />
          <Route path="/chat" element={<Chat />} /> {/* נתיב לצ'אט */}
          <Route path="/reports" element={<Reports />} />
          <Route path="/bugComments" element={<BugComments />} />
          {/* Add more routes as needed */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
