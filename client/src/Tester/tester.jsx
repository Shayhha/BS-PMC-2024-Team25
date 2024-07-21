import React, { useState, useEffect } from 'react';
import './tester.css';
import plusIcon from '../assets/plusIcon.png';
import searchIcon from '../assets/searchIcon.png';
import BugItem from '../BugItem';
import axios from 'axios';

function Tester() {
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [bugArray, setBugArray] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'New',
        assignedTo: '',
        priority: '',
        importance: '',
        creationDate: '',
        openDate: ''
    });
    const [searchResult, setSearchResult] = useState("");
    const [sortOption, setSortOption] = useState('newest');
    const [oldestDate, setOldestDate] = useState(null);
    const [newestDate, setNewestDate] = useState(null);
    const [bugDateStatus, setBugDateStatus] = useState({});

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
        const response = await axios.get('http://localhost:8090/homePage/getBugs');
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
        });

        setBugArray(sortedBugs);
        calculateDateExtremes(); // Recalculate date extremes after sorting
    };

    useEffect(() => {
        fetchBugs();
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
            assignedTo: 'None',
            priority: '',
            importance: '',
            creationDate: '',
            openDate: ''
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

        const formattedData = {
            ...formData,
            creationDate: formData.creationDate ? formatDate(formData.creationDate) : '',
            openDate: formData.openDate ? formatDate(formData.openDate) : ''
        };

        try {
            const response = await axios.post('http://localhost:8090/homePage/addBug', formattedData);
            setFormData({
                title: '',
                description: '',
                status: 'New',
                assignedTo: 'None',
                priority: '',
                importance: '',
                creationDate: '',
                openDate: ''
            });
            fetchBugs();
        } catch (error) {
            if (error.response) {
                console.log('Error data:', error.response.data);
                console.log('Error status:', error.response.status);
            } else if (error.request) {
                console.log('Error request:', error.request);
            } else {
                console.log('Error message:', error.message);
            }

            alert(`Error: ${error.response ? error.response.data.error : 'Unknown error occurred'}`);
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
        } catch (error) {
            console.error('Error sending data:', error);
        }
    };

    const handleSave = async (updatedBug) => {
        try {
            const response = await axios.post('http://localhost:8090/homePage/updateBug', updatedBug);
            setBugArray(bugArray.map(bug => (bug.bugId === updatedBug.bugId ? updatedBug : bug)));
        } catch (error) {
            console.error('Failed to update bug on backend:', error);
        }
    };

    return (
        <div className="tester">
            <div className="tester_search_container">
                <input type="text" className="tester_search_input" placeholder="Search..." value={searchResult} onChange={handleSearchChange}/>
                <img src={searchIcon} className="tester_search_icon" alt="Search" onClick={handleSearch}/>
            </div>

            <div className="tester_inner_container">
                {/* Combo Box for Sorting */}
                <select 
                    className="tester_sort_select" 
                    value={sortOption} 
                    onChange={(e) => setSortOption(e.target.value)}
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="priority">Priority</option>
                </select>

                <img
                    src={plusIcon}
                    className="tester_add_new_bug_button"
                    alt="Add New Bug"
                    onClick={handleImageClick}
                />
                
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
                        isAdmin={false} // Adjust this based on actual admin check
                        onSave={handleSave}
                        dateStatus={bugDateStatus[bug.bugId]} // Pass the date status
                    />
                ))}
            </div>

            {isPopupVisible && (
                <div className="tester_popup_overlay">
                    <div className="tester_popup">
                        <span className="tester_close_button" onClick={handleCloseClick}>&times;</span>
                        <h1>New Bug</h1>
                        <form onSubmit={handleSubmit}>
                            <label>
                                Title:
                                <input type="text" name="title" value={formData.title} onChange={handleChange} required/>
                            </label>
                            <label>
                                Description:
                                <textarea name="description" value={formData.description} onChange={handleChange} required></textarea>
                            </label>
                            <label>
                                Status:
                                <select name="status" value={formData.status} onChange={handleChange} required>
                                    <option value="New">New</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Done</option>
                                </select>
                            </label>
                            <label>
                                Assigned To:
                                <select name="assignedTo" value={formData.assignedTo} onChange={handleChange} required>
                                    <option value="None">None</option>
                                    <option value="option2">Option 2</option>
                                    <option value="option3">Option 3</option>
                                </select>
                            </label>
                            <label>
                                Priority:
                                <input type="text" name="priority" value={formData.priority} onChange={handleChange} required/>
                            </label>
                            <label>
                                Importance:
                                <input type="text" name="importance" value={formData.importance} onChange={handleChange} required/>
                            </label>
                            <label>
                                Creation Date:
                                <input type="date" name="creationDate" value={formData.creationDate} onChange={handleChange} required/>
                            </label>
                            <label>
                                Open Date:
                                <input type="date" name="openDate" value={formData.openDate} onChange={handleChange} required/>
                            </label>
                            <button type="submit" className="tester_popup_submit_button">Submit</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Tester;
