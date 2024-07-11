// src/Register/register.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Import Axios for HTTP requests
import './register.css';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    lastname: '',
    workerType: '', // New field for worker type
  });

  // Function to handle input changes in the form
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Function to handle form submission
  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8090/api/register', formData);

      if (!response.data.success) {
        throw new Error('Failed to register');
      }

      console.log('Registration successful:', response.data);
      // Optionally, redirect to login page or show success message
    } catch (error) {
      console.error('Error registering user:', error.message);
      // Handle error - show error message to user or retry registration
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastname">Lastname</label>
          <input
            type="text"
            id="lastname"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="workerType">Worker Type</label>
          <select
            id="workerType"
            name="workerType"
            value={formData.workerType}
            onChange={handleChange}
            required
          >
            <option value="">Select Worker Type</option>
            <option value="admin">Admin</option>
            <option value="softwareEngineer">Software Engineer</option>
            <option value="softwareTester">Software Tester</option>
          </select>
        </div>

        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}

export default Register;
