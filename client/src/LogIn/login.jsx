// src/LogIn/Login.jsx

import React from 'react';
import './login.css'; // Make sure to adjust the path to your CSS file

function Login() {
  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">Welcome</h1>
        <form className="login-form">
          <label htmlFor="email">Email address</label>
          <input type="email" id="email" placeholder="you@yourcompany.com" />
          <label htmlFor="password">Password</label>
          <input type="password" id="password" placeholder="****************" />
          <div className="login-form-footer">
            <a href="#forgot-password" className="login-forgot-password">Forgot your password?</a>
            <button type="submit" className="login-button">Sign in</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
