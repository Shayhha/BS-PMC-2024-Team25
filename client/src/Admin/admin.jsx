import React, { useState, useEffect } from 'react';
import './admin.css';
import searchIcon from '../assets/searchIcon.png';
import BugItem from '../BugItem';
import axios from 'axios';

function Admin() {

    const [bugArray, setBugArray] = useState([]);

    const fetchBugs = async () => {
      const response = await axios.get('http://localhost:8090/homePage/getBugs');
      setBugArray(response.data);
    };
  
    useEffect(() => {
        fetchBugs();
    }, []);

    return (
        <div className="admin">

            <div className="admin_search_container">
                <input type="text" className="admin_search_input" placeholder="Search..." />
                <img src={searchIcon} className="admin_search_icon" alt="Search" />
            </div>

            <div className="admin_inner_container">
                {bugArray.map(bug => (
                    <BugItem
                        key={bug.bugId}
                        title={bug.bugName}
                        description={bug.bugDesc}
                        status={bug.status}
                        assignedTo={bug.assignedId}
                        priority={bug.priority}
                        importance={bug.importance}
                        creationDate={bug.creationDate}
                        openDate={bug.openDate}
                    />
                ))}
            </div>
        </div>
    );
}

export default Admin;
