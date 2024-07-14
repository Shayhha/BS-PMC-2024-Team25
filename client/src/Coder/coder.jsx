import React, { useState, useEffect } from 'react';
import './coder.css';
import searchIcon from '../assets/searchIcon.png';
import BugItem from '../BugItem';
import axios from 'axios';

function Coder() {
    const [bugArray, setBugArray] = useState([]);
    const [searchResult, setSearchResult] = useState("");

    useEffect(() => {
        fetchBugs();
    }, []);

    const fetchBugs = async () => {
        try {
            const response = await axios.get('http://localhost:8090/homePage/getBugs');
            setBugArray(response.data);
        } catch (error) {
            console.error('Error fetching bugs:', error);
        }
    };

    const handleSearchChange = (e) => {
        setSearchResult(e.target.value);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8090/homePage/search', { searchResult });
            setBugArray(response.data);
            console.log('Data sent successfully:', response.data);
        } catch (error) {
            console.error('Error sending data:', error);
        }
    };

    const handleSave = async (updatedBug) => {
        try {
            const response = await axios.post('http://localhost:8090/homePage/updateBug', updatedBug);
            setBugArray(bugArray.map(bug => (bug.bugId === updatedBug.bugId ? updatedBug : bug)));
            console.log('Bug updated successfully');
        } catch (error) {
            console.error('Failed to update bug on backend:', error);
        }
    };

    return (
        <div className="coder">
            <div className="coder_search_container">
                <input 
                    type="text" 
                    className="coder_search_input" 
                    placeholder="Search..." 
                    value={searchResult} 
                    onChange={handleSearchChange}
                />
                <img 
                    src={searchIcon} 
                    className="coder_search_icon" 
                    alt="Search" 
                    onClick={handleSearch} 
                />
            </div>

            <div className="coder_inner_container">
                {bugArray.map(bug => (
                    <BugItem
                        key={bug.bugId}
                        bugId={bug.bugId}
                        title={bug.bugName}
                        description={bug.bugDesc}
                        status={bug.status}
                        assignedTo={bug.assignedId}
                        priority={bug.priority}
                        importance={bug.importance}
                        creationDate={bug.creationDate}
                        openDate={bug.openDate}
                        isAdmin={true} // Adjust this based on actual admin check
                        onSave={handleSave}
                    />
                ))}
            </div>
        </div>
    );
}

export default Coder;
