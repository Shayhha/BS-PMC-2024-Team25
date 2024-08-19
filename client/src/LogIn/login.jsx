import React, { useState } from 'react';
import axios from 'axios';
import './login.css'; 

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting login request'); 
      const response = await axios.post('http://127.0.0.1:8090/homepage/login', { email, password });
      if (response.data.error) {
        setError(response.data.error);
        setSuccess(''); // Clear any previous success message
      } else {
        // Handle successful login, e.g., save user data, redirect, etc.
        console.log('Login successful:', response.data);
        setError(''); // Clear any previous error
        setSuccess('Login successful! Redirecting...'); // Set success message
        
        // Redirect based on userType after a short delay
        const userType = response.data.userType;
        setTimeout(() => {
          if (userType === 'Manager') {
            window.location.href = '/admin'; // Redirect to admin page
          } else if (userType === 'Coder') {
            window.location.href = '/coder'; // Redirect to coder page inside Coder folder
          } else if (userType === 'Tester') {
            window.location.href = '/tester'; // Redirect to tester page inside Tester folder
          }
        }, 1000); // Delay of 1 second before redirecting
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setSuccess(''); // Clear any previous success message
      console.error('Login error:', err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">Login</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <input 
            type="email" 
            id="email" 
            placeholder="you@yourcompany.com" 
            data-testid="cypress-login-email-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password" 
            placeholder="••••••••••••••" 
            data-testid="cypress-login-password-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="login-error">{error}</div>}
          {success && <div className="login-success">{success}</div>}
          <div className="login-form-footer">
            <button type="submit" className="login-button">Sign in</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
