import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css'; // Make sure NavBar.css exists and contains necessary styles
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'; // Import icons

function NavBar() {
    const [loginDropdownVisible, setLoginDropdownVisible] = useState(false);
    const [settingsDropdownVisible, setSettingsDropdownVisible] = useState(false);
    const [logoutDropdownVisible, setLogoutDropdownVisible] = useState(false);
    const [showEditUser, setShowEditUser] = useState(false);
    const [userName, setUserName] = useState('');
    const [userType, setUserType] = useState(''); 
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const profileRef = useRef(null);
    const settingsRef = useRef(null);
    const logoutRef = useRef(null);
    const location = useLocation();

    const toggleLoginDropdown = () => {
        setLoginDropdownVisible((prevState) => !prevState);
        setLogoutDropdownVisible(false); // Ensure logout dropdown is closed
    };

    const toggleSettingsDropdown = () => {
        setSettingsDropdownVisible((prevState) => !prevState);
        setLogoutDropdownVisible(false); // Ensure logout dropdown is closed
    };

    const toggleLogoutDropdown = () => {
        setLogoutDropdownVisible((prevState) => !prevState);
        setLoginDropdownVisible(false); // Ensure login dropdown is closed
        setSettingsDropdownVisible(false); // Ensure settings dropdown is closed
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:5000/homepage/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // You can include a body if necessary
                // body: JSON.stringify({}),
            });
            if (response.ok) {
                setIsLoggedIn(false);
                setLogoutDropdownVisible(false);
                // Redirect to login page or handle UI changes
                window.location.href = '/login';
            } else {
                console.error('Failed to logout:', response.statusText);
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await fetch('http://localhost:8090/userSettings/getUser', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (response.status === 204) {
                    setShowEditUser(false);
                    setIsLoggedIn(false);
                    //console.log('No content to display');
                } else if (response.ok) {
                    const data = await response.json();
                    setUserName(data.userName);
                    setUserType(data.userType); 
                    setShowEditUser(true);
                    setIsLoggedIn(true);
                } else {
                    console.error('Failed to fetch user info');
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        };

        fetchUserInfo();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target) &&
                settingsRef.current &&
                !settingsRef.current.contains(event.target) &&
                logoutRef.current &&
                !logoutRef.current.contains(event.target)
            ) {
                setLoginDropdownVisible(false);
                setSettingsDropdownVisible(false);
                setLogoutDropdownVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="navbar_header">
            <div className="navbar_logo">
                <span>BugFixer</span>
            </div>
            {isLoggedIn && location.pathname !== '/login' && location.pathname !== '/register' && (
                <span className="navbar_welcome">Welcome, {userName}</span>
            )}

            <nav className="navbar_nav">
                <a href="#solutions">Solutions</a>
                <a href="#community">Community</a>
                <a href="#resources">Resources</a>
                <a href="#contact">Contact</a>
            </nav>

            <div className="navbar_profile">
                <div className="navbar_profile-icons">
                    {(location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/') && (
                        <div
                            className="navbar_profile-icon"
                            onClick={toggleLoginDropdown}
                            ref={profileRef}
                            aria-haspopup="true"
                        >
                            <FontAwesomeIcon icon={faUser} className="hero-image" />
                            {loginDropdownVisible && (
                                <div className="navbar_dropdown" role="menu">
                                    <Link to="/login" className="navbar_dropdown-button" role="menuitem">
                                        Login
                                    </Link>
                                    <Link to="/register" className="navbar_dropdown-button" role="menuitem">
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                    {isLoggedIn && location.pathname !== '/login' && location.pathname !== '/register' &&  location.pathname !== '/' && (
                        <>
                            <div
                                className="navbar_profile-icon"
                                onClick={toggleSettingsDropdown}
                                ref={settingsRef}
                                aria-haspopup="true"
                            >
                                <FontAwesomeIcon icon={faCog} className="settings-icon" />
                                {settingsDropdownVisible && (
                                    <div className="navbar_dropdown" role="menu">
                                        {showEditUser && (
                                            <Link to="/edituser" className="navbar_dropdown-button" role="menuitem">
                                                Edit User
                                            </Link>
                                        )}
                                        {userType === 'Manager' && (
                                            <Link to="/removeUser" className="navbar_dropdown-button" role="menuitem">
                                                Remove User
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div
                                className="navbar_profile-icon"
                                onClick={toggleLogoutDropdown}
                                ref={logoutRef}
                                aria-haspopup="true"
                            >
                                <FontAwesomeIcon
                                    icon={faSignOutAlt}
                                    className="logout-icon"
                                />
                                {logoutDropdownVisible && (
                                    <div className="navbar_dropdown" role="menu">
                                        <a
                                            href="/login" // Use anchor tag for direct navigation
                                            className="navbar_dropdown-button"
                                            role="menuitem"
                                            onClick={handleLogout} // Call handleLogout on click
                                        >
                                            Logout
                                        </a>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

export default NavBar;
