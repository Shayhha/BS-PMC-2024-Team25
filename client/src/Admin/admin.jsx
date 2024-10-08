import React, { useState, useEffect, useCallback } from 'react';
import './admin.css';
import { FaSearch } from 'react-icons/fa';
import BugItem from '../BugItem';
import axios from 'axios';

function Admin() {
    const [bugArray, setBugArray] = useState([]);
    const [searchResult, setSearchResult] = useState("");
    const [coders, setCoders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sortOption, setSortOption] = useState('newest');
    const [filterOption, setFilterOption] = useState('Functionality');

    const categoryOptions = ["Ui", "Functionality", "Performance", "Usability", "Security"]; // Options for category dropdown

    // Function to parse date string
    const parseDate = (dateStr) => {
        const [day, month, year] = dateStr.split('/').map(num => parseInt(num, 10));
        return new Date(year, month - 1, day);
    };

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

    const retryFetch = async (fetchFunction, retries = 3) => {
        let lastError = null;

        for (let i = 0; i < retries; i++) {
            try {
                const result = await fetchFunction();
                return result;
            } catch (error) {
                lastError = error;
                console.log(`Retrying... (${retries - i - 1} attempts left)`);
            }
        }

        throw lastError; // Throw the last error after all retries
    };

    const fetchBugs = useCallback(async () => {
        const fetchFunction = async (attempt = 0) => {
            try {
                const response = await axios.get('http://127.0.0.1:8090/homePage/getBugs');
                
                if (Array.isArray(response.data)) {
                    return response.data;
                } else {
                    throw new Error('Response is not an array');
                }
            } catch (error) {
                if (attempt < 2) { // Retry a couple of times before failing
                    console.log(`Retrying... (${2 - attempt} attempts left)`);
                    return fetchFunction(attempt + 1); // Retry
                } else {
                    throw error; // Throw the last error after retries
                }
            }
        };

        setLoading(true);
        try {
            const bugs = await fetchFunction(); // Fetch bugs with retry

            // Sort bugs based on the selected sort option
            const sortedBugs = [...bugs].sort((a, b) => {
                const dateA = parseDate(a.creationDate);
                const dateB = parseDate(b.creationDate);

                if (sortOption === 'newest') {
                    return dateB - dateA;
                } else if (sortOption === 'oldest') {
                    return dateA - dateB;
                } else if (sortOption === 'priority') {
                    return b.priority - a.priority;
                } else if (sortOption === 'importance') {
                    return b.importance - a.importance;
                }
      
            });

            setBugArray(sortedBugs);
            setError(null); // Clear error on success
        } catch (error) {
            console.error('Error fetching bugs:', error);
            setBugArray([]);
            setError('Failed to fetch bugs after multiple attempts.');
        } finally {
            setLoading(false);
        }
    }, [sortOption]);

    const fetchCoderUsers = useCallback(async () => {
        const fetchFunction = async () => {
            const response = await axios.get('http://127.0.0.1:8090/bug/getAllCoders');
            if (response.data.error) {
                setCoders([]);
                throw new Error('Failed to fetch coders.');
            } else {
                setCoders(response.data);
            }
        };

        setLoading(true);
        try {
            await retryFetch(fetchFunction);
            setError(null); // Clear error on success
        } catch (error) {
            console.error('Error fetching users:', error);
            setCoders([]);
            setError('Failed to fetch coders.');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSearchChange = useCallback((e) => {
        setSearchResult(e.target.value);
    }, []);

    const handleSearch = useCallback(async (e) => {
        e.preventDefault();
        setLoading(true);
        if (searchResult === "") {
            setLoading(false);
            return;
        }
        try {
            const response = await axios.post('http://localhost:8090/homePage/search', { searchResult });            
            if (Array.isArray(response.data)) {
                setBugArray(response.data);
            } else {
                console.error('Response is not an array:', response.data);
                setBugArray([]);
            }
        } catch (error) {
            console.error('Error searching bugs:', error);
            setBugArray([]);
            setError('Failed to search bugs.');
        } finally {
            setLoading(false);
        }
    }, [searchResult]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await fetchBugs();
            await fetchCoderUsers();
        };
        fetchData();
    }, [fetchBugs, fetchCoderUsers]);

    return (
        <div className="admin">
            <div className='admin_search_and_sort_area'>
                <form className="admin_search_container" onSubmit={handleSearch}>
                    <input 
                        type="text" 
                        className="admin_search_input" 
                        placeholder="Search..." 
                        value={searchResult} 
                        onChange={handleSearchChange} 
                    />
                    <button type="submit" className="admin_search_button">
                        <FaSearch className="coder_search_icon" alt="Search" />
                    </button>
                </form>

                <div className='admin_sort_and_filter_container'>
                    <select 
                        className="admin_sort_select" 
                        value={sortOption} 
                        onChange={(e) => setSortOption(e.target.value)}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="priority">Priority</option>
                        <option value="importance">Importance</option>
                    </select>
                
                    <select 
                        className="admin_filter_select"
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

            {loading && <div>Loading...</div>}
            {error && <div className="error">{error}</div>}

            {!loading && !error && (
                <div className="admin_inner_container">
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
                            isAdmin={true}
                            isCoder={false}
                            listOfCoders={coders}
                            update_counter={bug.updateCounter}  
                            update_dates={bug.updateDates} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Admin;
