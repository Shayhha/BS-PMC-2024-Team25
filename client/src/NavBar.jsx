import React, { useState } from 'react';
import './NavBar.css';
import userIcon from './assets/userIcon.png';

function NavBar() {
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    return (
        <header className="header">
            <div className="logo">BugFixer</div>
            <nav className="nav">
                <a href="#solutions">Solutions</a>
                <a href="#community">Community</a>
                <a href="#resources">Resources</a>
                <a href="#contact">Contact</a>
            </nav>
            <div className="profile-icon" onClick={toggleDropdown}>
                <img className="hero-image" src={userIcon} alt="Profile Icon" />
                {dropdownVisible && (
                    <div className="dropdown">
                        <button className="dropdown-button">Login</button>
                        <button className="dropdown-button">Register</button>
                    </div>
                )}
            </div>
        </header>
    );
}

export default NavBar