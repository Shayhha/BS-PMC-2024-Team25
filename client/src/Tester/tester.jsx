import React, { useState, useEffect } from 'react';
import './tester.css';
import { FaPlus } from 'react-icons/fa';
import { FaSearch } from 'react-icons/fa';
import BugItem from '../BugItem';
import axios from 'axios';

function Tester() {
    // Get today's date in YYYY-MM-DD format
    const todaysDate = new Date().toISOString().split('T')[0];

    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [bugArray, setBugArray] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'New',
        category: 'Functionality',
        assignedTo: 'None',
        priority: '',
        importance: '',
        creationDate: todaysDate,
        openDate: todaysDate,
        closeDate:todaysDate,
        bugSuggest: ''
    });
    const [searchResult, setSearchResult] = useState("");
    const [sortOption, setSortOption] = useState('newest');
    const [filterOption, setFilterOption] = useState('Functionality');
    const [oldestDate, setOldestDate] = useState(null);
    const [newestDate, setNewestDate] = useState(null);
    const [bugDateStatus, setBugDateStatus] = useState({});

    const categoryOptions = ["Ui", "Functionality", "Performance", "Usability", "Security"]; // Options for category dropdown

    // Function to parse date string
    const parseDate = (dateStr) => {
        const [year, month, day] = dateStr.split('/').map(num => parseInt(num, 10));
        return new Date(year, month - 1, day);
    };

    // Function to calculate date extremes
    const calculateDateExtremes = () => {
        if (!Array.isArray(bugArray) || bugArray.length === 0) return;

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

    // Function to fetch and sort bugs
    const fetchBugs = async () => {
        try {
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
                } else if (sortOption === 'importance') {
                    return b.importance - a.importance;
                } 

            });

            setBugArray(sortedBugs);
            calculateDateExtremes(); // Recalculate date extremes after sorting
        } catch (error) {
            console.error('Error fetching bugs:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await fetchBugs();
            await fetchCoderUsers();
        };
        fetchData();
    }, [sortOption]);

    const handleImageClick = () => {
        setIsPopupVisible(true);
    };

    const handleCloseClick = () => {
        setIsPopupVisible(false);
        setFormData({
            title: '',
            description: '',
            status: 'New',
            category: 'Functionality',
            assignedTo: 'None',
            priority: '',
            importance: '',
            creationDate: todaysDate,
            openDate: todaysDate,
            closeDate: todaysDate, 
            bugSuggest: ''
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const formatDate = (date) => {
        const [year, month, day] = date.split('-');
        return `${day}/${month}/${year}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let assignedToSelection = formData.assignedTo;
        let selected_userid = null; 

        if (assignedToSelection !== 'None') {
            const { selected_username, selected_userid: extractedUserId } = parseAssignedUserString(assignedToSelection);
            selected_userid = extractedUserId;
        }

        const formattedData = {
            ...formData,
            creationDate: formData.creationDate ? formatDate(formData.creationDate) : '',
            openDate: formData.openDate ? formatDate(formData.openDate) : '',
            closeDate: formData.closeDate ? formatDate(formData.closeDate) : '',

            assignedId: selected_userid
        };

        console.log(formattedData);
        try {
            setButtonBackgroundColor("tester_popup_submit_button", "orange");
            const response = await axios.post('http://127.0.0.1:8090/homePage/addBug', formattedData);
            await pushNotificationsToAllUsers("New bug was added to the system: " + formData.title);
            await pushNotificationToAssignedUser(formattedData.assignedId, "You have been assign to a new bug: " + formData.title);
            setFormData({
                title: '',
                description: '',
                status: 'New',
                category: 'Functionality',
                assignedTo: 'None',
                priority: '',
                importance: '',
                creationDate: todaysDate,
                openDate: todaysDate,
                closeDate: todaysDate,
                bugSuggest: ''
            });
            window.location.reload(); // Refresh the page
        } catch (error) {
            console.error('Error submitting bug:', error);
            alert(`Error: ${error.response ? error.response.data.error : 'Unknown error occurred'}`);
        } finally {
            setButtonBackgroundColor("tester_popup_submit_button", "#007bff");
        }
    };

    const pushNotificationsToAllUsers = async (notification_message) => {
        try {
            const response = await axios.post('http://127.0.0.1:8090/notifications/pushNotificationsToAllUsers', { message: notification_message });
            if (response.data.error) {
                console.error('Error pushing notification to all users:', response.data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const pushNotificationToAssignedUser = async (user_id, notification_message) => {
        try {
            const response = await axios.post('http://127.0.0.1:8090/notifications/pushNotificationToUser', { userId: user_id, message: notification_message });
            if (response.data.error) {
                console.error('Error pushing notification to assigned user:', response.data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    function setButtonBackgroundColor(selector, color) {
        // Get all elements matching the specified selector
        const elements = document.querySelectorAll(`.${selector}`);
        
        // Iterate through the elements and set their background color
        elements.forEach(element => {
            element.style.backgroundColor = color;
        });
    }

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
        } catch (error) {
            console.error('Error searching bugs:', error);
        }
    };

    const handleSave = async (updatedBug) => {
        console.log(updatedBug.suggestion);
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

    //helper function for splitting a string on the '-' character to get the username and userId on separate variables
    const parseAssignedUserString = (assignedUserString) => {
        const [username, userIdString] = assignedUserString.split(' - ');
        const userId = parseInt(userIdString, 10); // Convert userId to an integer
        return { selected_username: username.trim(), selected_userid: userId };
    };

    return (
        <div className="tester">
            <div className='tester_search_and_sort_area'>
                <form className="tester_search_container" onSubmit={handleSearch}>
                    <input 
                        type="text" 
                        className="tester_search_input" 
                        placeholder="Search..." 
                        value={searchResult} 
                        onChange={handleSearchChange} 
                    />
                    <button type="submit" className="tester_search_button">
                        <FaSearch className="coder_search_icon" alt="Search" />
                    </button>
                </form>

                <div className='tester_sort_and_filter_container'>
                    <select 
                        className="tester_sort_select" 
                        value={sortOption} 
                        onChange={(e) => setSortOption(e.target.value)}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="priority">Priority</option>
                        <option value="importance">Importance</option>
                    </select>
                
                    <select 
                        className="tester_filter_select"
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
            
            <button onClick={handleImageClick} className='tester_add_new_bug_button' data-testid="cypress-add-bug-button">
                <FaPlus style={{ fontSize: '40px', marginRight: '0px'}} />
            </button>

            <div className="tester_inner_container">
                {Array.isArray(bugArray) && bugArray.map(bug => (
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
                        isCoder={false}
                        onSave={handleSave}
                        dateStatus={bugDateStatus[bug.bugId]} // Pass the date status
                        listOfCoders={coders}
                        update_counter={bug.updateCounter}       
                        update_dates={bug.updateDates}  
                    />
                ))}
           </div>

            {isPopupVisible && (
                <div className="tester_popup_overlay" data-testid="cypress-add-bug-popup">
                    <div className="tester_popup">
                        <span className="tester_close_button" onClick={handleCloseClick}>&times;</span>
                        <h2 className="tester_popup_header">New Bug</h2>
                        <form onSubmit={handleSubmit}>
                            <label>
                                Title:
                                <input type="text" name="title" value={formData.title} onChange={handleChange} data-testid="cypress-add-bug-title-input" required/>
                            </label>
                            <label>
                                Description:
                                <textarea name="description" value={formData.description} onChange={handleChange} data-testid="cypress-add-bug-description-input" required></textarea>
                            </label>
                            <label>
                                Status:
                                <select name="status" value={formData.status} onChange={handleChange} data-testid="cypress-add-bug-status-select" required>
                                    <option value="New">New</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Done</option>
                                </select>
                            </label>
                            <label>
                                Category:
                                <select 
                                    id="category" 
                                    name="category" 
                                    value={formData.category} 
                                    onChange={handleChange}  
                                    data-testid="cypress-add-bug-category-select" 
                                    required
                                >
                                    {categoryOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Assigned To:
                                <select name="assignedTo" value={formData.assignedTo} onChange={handleChange} data-testid="cypress-add-bug-assigned-to-select" required>
                                    <option value="None">None</option>
                                    {Array.isArray(coders) && coders.map(user => (
                                        <option key={user.userId} value={`${user.userName} - ${user.userId}`}>{`${user.userName} - ${user.userId}`}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Creation Date:
                                <input type="date" name="creationDate" value={formData.creationDate} onChange={handleChange} readOnly/>
                            </label>
                            <label>
                                Open Date:
                                <input type="date" name="openDate" value={formData.openDate} onChange={handleChange} min={formData.creationDate} data-testid="cypress-add-bug-opendate-input" required />
                            </label>
                            <label>
                                Deadline:
                                <input type="date" name="closeDate" value={formData.closeDate} onChange={handleChange} min={formData.creationDate} data-testid="cypress-add-bug-closedate-input" required />
                            </label>
                            <button type="submit" className="tester_popup_submit_button" data-testid="cypress-add-bug-submit-button">Submit</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Tester;
