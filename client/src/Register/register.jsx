import React, { useState } from 'react';
import axios from 'axios';
import './register.css';

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        name: '',
        lastname: '',
        userType: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // this is for error messages //
    const [userNameError, setUserNameError] = useState('');
    const [fNameError, setFNameError] = useState('');
    const [lNameError, setLNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));

        //validate the input as the user types
        switch (name) {
            case 'username':
                if (/^[a-zA-Z0-9]*$/.test(value)) {
                    setUserNameError('');
                } else {
                    setUserNameError('Username must contain only letters and numbers.');
                }
                break;
            case 'password':
                if (/^(?=.*[A-Z])[^\s'=]{6,24}$/.test(value)) {
                    setPasswordError('');
                } else {
                    setPasswordError('Invalid password format, password should include at least 6 characters and at least one capital letter.');
                }
                break;
            case 'email':
                if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
                    setEmailError('');
                } else {
                    setEmailError('Invalid email format.');
                }
                break;
            case 'name':
                if (/^[a-zA-Z]*$/.test(value)) {
                    setFNameError('');
                } else {
                    setFNameError('First name must contain only letters.');
                }
                break;
            case 'lastname':
                if (/^[a-zA-Z]*$/.test(value)) {
                    setLNameError('');
                } else {
                    setLNameError('Last name must contain only letters.');
                }
                break;
            default:
                break;
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        
        if (userNameError !== '' || emailError !== '' || fNameError !== '' || lNameError !== '' || passwordError !== '') {
            console.log('Invalid user info parameters.');
            alert(`Invalid user info parameters.`);
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:8090/homepage/register', formData);

            if (response.data.error) {
                let errorMessage = 'An unexpected error occurred. Please try again.';

                // Directly handle specific error messages
                if (response.data.error.includes('User with this email already exists')) {
                    errorMessage = 'The email address you have entered is already in use. Please try another one.';
                } else if (response.data.error.includes('Missing fields')) {
                    errorMessage = 'Please fill in all required fields.';
                } else {
                    errorMessage = response.data.error;
                }

                setError(errorMessage);
                setSuccess(''); // Clear any previous success message
                // Show popup message
                alert(errorMessage);

            } else {
                console.log('Registration successful:', response.data);
                setError(''); // Clear any previous error
                setSuccess('Registration successful! Redirecting...'); // Set success message

                // Show popup message
                alert('Signed up successfully');

                // Redirect to login page after a short delay
                setTimeout(() => {
                    window.location.href = '/login'; // Redirect to login page
                }, 1000); // Delay of 1 second before redirecting
            }
        } catch (error) {
            let errorMessage = 'An unexpected error occurred. Please try again.';

            // Handle cases where error.response is not available
            if (error.response && error.response.data && error.response.data.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }

            setError(errorMessage);
            setSuccess(''); // Clear any previous success message

            // Show popup message for unexpected errors
            alert(errorMessage);
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <h1 className="register-title">Register</h1>
                <form className="register-form" onSubmit={handleSubmit}>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        data-testid="cypress-register-username-input"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                    {userNameError && <span style={{ color: 'red' }}>{userNameError}</span>}
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        data-testid="cypress-register-password-input"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    {passwordError && <span style={{ color: 'red' }}>{passwordError}</span>}
                    <label htmlFor="email">Email address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        data-testid="cypress-register-email-input"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    {emailError && <span style={{ color: 'red' }}>{emailError}</span>}
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        data-testid="cypress-register-name-input"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    {fNameError && <span style={{ color: 'red' }}>{fNameError}</span>}
                    <label htmlFor="lastname">Lastname</label>
                    <input
                        type="text"
                        id="lastname"
                        name="lastname"
                        data-testid="cypress-register-lastname-input"
                        value={formData.lastname}
                        onChange={handleChange}
                        required
                    />
                    {lNameError && <span style={{ color: 'red' }}>{lNameError}</span>}
                    <label htmlFor="userType">Worker Type</label>
                    <select
                        id="userType"
                        name="userType"
                        data-testid="cypress-register-worker-type-select"
                        value={formData.userType}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Worker Type</option>
                        <option value="Coder">Coder</option>
                        <option value="Tester">Tester</option>
                        <option value="Manager">Manager</option>
                    </select>
                    {error && <div className="register-error">{error}</div>}
                    {success && <div className="register-success">{success}</div>}
                    <div className="register-form-footer">
                        <button type="submit" className="register-button">Register</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;
