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

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:8090/homepage/register', formData);

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
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <label htmlFor="email">Email address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <label htmlFor="lastname">Lastname</label>
                    <input
                        type="text"
                        id="lastname"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                        required
                    />
                    <label htmlFor="userType">Worker Type</label>
                    <select
                        id="userType"
                        name="userType"
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
