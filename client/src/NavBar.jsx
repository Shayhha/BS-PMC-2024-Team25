// src/NavBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';
import userIcon from './assets/userIcon.png';

function NavBar() {
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const profileRef = useRef(null);

    const toggleDropdown = () => {
        setDropdownVisible(prevState => !prevState);
    };

    // Close dropdown if clicking outside
    useEffect(() => {
        const handleClickOutside = event => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setDropdownVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="navbar_header">
            <div className="navbar_logo">BugFixer</div>
            <nav className="navbar_nav">
                <a href="#solutions">Solutions</a>
                <a href="#community">Community</a>
                <a href="#resources">Resources</a>
                <a href="#contact">Contact</a>
            </nav>
            <div
                className="navbar_profile-icon"
                onClick={toggleDropdown}
                ref={profileRef}
                aria-haspopup="true"
            >
                <img className="hero-image" src={userIcon} alt="Profile Icon" />
                {dropdownVisible && (
                    <div className="navbar_dropdown" role="menu">
                        <Link to="/login" className="navbar_dropdown-button" role="menuitem">Login</Link>
                        <Link to="/register" className="navbar_dropdown-button" role="menuitem">Register</Link>
                    </div>
                )}
            </div>
        </header>
    );
}

export default NavBar;
