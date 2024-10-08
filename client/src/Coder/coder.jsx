import React, { useState, useEffect } from 'react';
import './coder.css';
import { FaSearch } from 'react-icons/fa';
import BugItem from '../BugItem';
import axios from 'axios';

function Coder() {
    const [bugArray, setBugArray] = useState([]);
    const [searchResult, setSearchResult] = useState("");
    const [sortOption, setSortOption] = useState('newest');
    const [filterOption, setFilterOption] = useState('Functionality');
    const [oldestDate, setOldestDate] = useState(null);
    const [newestDate, setNewestDate] = useState(null);
    const [bugDateStatus, setBugDateStatus] = useState({});
    
    const categoryOptions = ["Ui", "Functionality", "Performance", "Usability", "Security"]; // Options for category dropdown

    const filterBugs = async (newValue) => {
        setFilterOption(newValue);
        await fetchBugs();
        // Update the bug array state based on the new filter option
        setBugArray(prevBugArray => {
            // Filter based on the new filter option
            return newValue && categoryOptions.includes(newValue)
                ? prevBugArray.filter(bug => bug.category === newValue)
                : prevBugArray;
        });
    }

    // Function to parse date string
    const parseDate = (dateStr) => {
        const [day, month, year] = dateStr.split('/').map(num => parseInt(num, 10));
        return new Date(year, month - 1, day);
    };

    // Function to calculate date extremes
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

    // Function to fetch and sort bugs
    const fetchBugs = async () => {
        const response = await axios.get('http://127.0.0.1:8090/homePage/getBugs');
        const sortedBugs = [...response.data].sort((a, b) => {
            const dateA = parseDate(a.creationDate);
            const dateB = parseDate(b.creationDate);

            if (sortOption === 'newest') {
                return dateB - dateA;
            } else if (sortOption === 'oldest') {
                return dateA - dateB;
            } else if (sortOption === 'priority') {
                return b.priority - a.priority;
            }
            else if (sortOption === 'importance') {
                return b.importance - a.importance;
            }
        });

        setBugArray(sortedBugs);
        calculateDateExtremes(); // Recalculate date extremes after sorting
    };

    useEffect(() => {
        const fetchData = async () => {
            await fetchBugs();
            await fetchCoderUsers();
        };
        fetchData();
    }, [sortOption]);

    const handleSearchChange = (e) => {
        setSearchResult(e.target.value);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (searchResult === "") 
            return;
        try {
            const response = await axios.post('http://127.0.0.1:8090/homePage/search', { searchResult });
            setBugArray(response.data);
            console.log('Data sent successfully:', response.data);
        } catch (error) {
            console.error('Error sending data:', error);
        }
    };

    const handleSave = async (updatedBug) => {
        try {
            setBugArray(bugArray.map(bug => (bug.bugId === updatedBug.bugId ? updatedBug : bug)));
        } catch (error) {
            console.error('Failed to update bug on backend:', error);
        }
    };

    const [coders, setCoders] = useState([]);

    //gets all users of type Coder from the database to later display their names on bugs where they are assigned
    const fetchCoderUsers = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8090/bug/getAllCoders');
            if (!response.data.error) {
                setCoders(response.data);
            } else {
                console.error('Error fetching users:', response.data.message);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    return (
        <div className="coder">
            <div className='coder_search_and_sort_area'>
                <form className="coder_search_container" onSubmit={handleSearch}>
                    <input 
                        type="text" 
                        className="coder_search_input" 
                        placeholder="Search..." 
                        value={searchResult} 
                        onChange={handleSearchChange} 
                    />
                    <button type="submit" className="coder_search_button">
                        <FaSearch className="coder_search_icon" alt="Search" />
                    </button>
                </form>

                <div className='coder_sort_and_filter_container'>
                    <select 
                        className="coder_sort_select" 
                        value={sortOption} 
                        onChange={(e) => setSortOption(e.target.value)}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="priority">Priority</option>
                        <option value="importance">Importance</option>
                    </select>
                
                    <select 
                        className="coder_filter_select"
                        value={filterOption} 
                        onChange={(e) => filterBugs(e.target.value)}
                    >
                        <option value="Ui">Ui</option>
                        <option value="Functionality">Functionality</option>
                        <option value="Performance">Performance</option>
                        <option value="Usability">Usability</option>
                        <option value="Security">Security</option>
                    </select>
                </div> 
            </div>

            <div className="coder_inner_container">
                {bugArray.map(bug => (
                    <BugItem
                        key={bug.bugId}
                        bugId={bug.bugId}
                        title={bug.bugName}
                        description={bug.bugDesc}
                        suggestion={bug.bugSuggest}
                        status={bug.status}
                        category={bug.category}
                        assignedUserId={bug.assignedId} 
                        assignedUsername={bug.assignedUsername} 
                        priority={bug.priority}
                        importance={bug.importance}
                        creationDate={bug.creationDate}
                        openDate={bug.openDate}
                        closeDate={bug.closeDate}
                        isAdmin={false} // Adjust this based on actual admin check
                        isCoder={true} 
                        onSave={handleSave}
                        dateStatus={bugDateStatus[bug.bugId]}
                        listOfCoders={coders}
                        update_counter={bug.updateCounter}       
                        update_dates={bug.updateDates} 
                    />
                ))}
            </div>
        </div>
    );
}

export default Coder;
