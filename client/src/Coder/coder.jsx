import React, { useState, useEffect } from 'react';
import './coder.css';
import searchIcon from '../assets/searchIcon.png';
import BugItem from '../BugItem';
import axios from 'axios';

function Coder() {
    const [bugArray, setBugArray] = useState([]);
    const [searchResult, setSearchResult] = useState("");
    const [sortOption, setSortOption] = useState('newest');
    const [oldestDate, setOldestDate] = useState(null);
    const [newestDate, setNewestDate] = useState(null);
    const [bugDateStatus, setBugDateStatus] = useState({});

    useEffect(() => {
        fetchBugs();
    }, []);

    useEffect(() => {
        calculateDateExtremes();
    }, [bugArray]);

    const fetchBugs = async () => {
        try {
            const response = await axios.get('http://localhost:8090/homePage/getBugs');
            setBugArray(response.data);
        } catch (error) {
            console.error('Error fetching bugs:', error);
        }
    };

    const calculateDateExtremes = () => {
        if (bugArray.length === 0) return;

        const dates = bugArray.map(bug => parseDate(bug.creationDate));
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));

        setOldestDate(minDate);
        setNewestDate(maxDate);

        const statusMap = {};
        for (const bug of bugArray) {
            const bugDate = parseDate(bug.creationDate);
            if (oldestDate && newestDate) {
                if (bugDate.getTime() === oldestDate.getTime()) {
                    statusMap[bug.bugId] = 'oldest';
                } else if (bugDate.getTime() === newestDate.getTime()) {
                    statusMap[bug.bugId] = 'newest';
                } else {
                    statusMap[bug.bugId] = 'none';
                }
            }
        }
        setBugDateStatus(statusMap);
    };

    const parseDate = (dateStr) => {
        // Convert DD/MM/YYYY to YYYY-MM-DD
        const [day, month, year] = dateStr.split('/').map(num => parseInt(num, 10));
        return new Date(year, month - 1, day);
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

    const sortedBugs = [...bugArray].sort((a, b) => {
        const dateA = parseDate(a.creationDate);
        const dateB = parseDate(b.creationDate);

        if (sortOption === 'newest') {
            return dateB - dateA;
        } else {
            return dateA - dateB;
        }
    });

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
                
                <select 
                    className="coder_sort_select" 
                    value={sortOption} 
                    onChange={(e) => setSortOption(e.target.value)}
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                </select>
                
            </div>

            <div className="coder_inner_container">
                {sortedBugs.map(bug => (
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
                        isAdmin={false} // Adjust this based on actual admin check
                        onSave={handleSave}
                        dateStatus={bugDateStatus[bug.bugId] || 'none'}
                    />
                ))}
            </div>
        </div>
    );
}

export default Coder;
