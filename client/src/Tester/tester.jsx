import React, { useState, useEffect } from 'react';
import './tester.css';
import plusIcon from '../assets/plusIcon.png';
import searchIcon from '../assets/searchIcon.png';
import BugItem from '../BugItem';
import axios from 'axios';

function Tester() {

    const [isPopupVisible, setIsPopupVisible] = useState(false);

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


    const [bugArray, setBugArray] = useState([]);

    const fetchBugs = async () => {
      const response = await axios.get('http://localhost:8090/homePage/getBugs');
      setBugArray(response.data);
    };
  
    useEffect(() => {
        fetchBugs();
    }, []);


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
        
        console.log(formattedData)

        try {
            const response = await axios.post('http://localhost:8090/homePage/addBug', formattedData);
            console.log('Success:', response.data);
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
                // Server responded with a status code outside of the 2xx range
                console.log('Error data:', error.response.data);
                console.log('Error status:', error.response.status);
            } else if (error.request) {
                // Request was made but no response was received
                console.log('Error request:', error.request);
            } else {
                // Sodmething happened in setting up the request that triggered an error
                console.log('Error message:', error.message);
            }
        
            // Show error message to the user
            alert(`Error: ${error.response ? error.response.data.error : 'Unknown error occurred'}`);
        }
    };


    const [searchResult, setSearchResult] = useState("");

    const handleSearchChange = (e) => {
        setSearchResult(e.target.value);
    };

    const handleSearch = async (e) => { 
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8090/homePage/search', {searchResult : searchResult});
            setBugArray(response.data);
            console.log('Data sent successfully:', response.data);
        }
        catch (error) {
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
        <div className="tester">

            <div className="tester_search_container">
                <input type="text" className="tester_search_input" placeholder="Search..." value={searchResult} onChange={handleSearchChange}/>
                <img src={searchIcon} className="tester_search_icon" alt="Search" onClick={handleSearch}/>
            </div>

            <div className="tester_inner_container">
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
                                <input type="text" name="title"  value={formData.title} onChange={handleChange} required/>
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
                                <select name="assigned-to"  value={formData.assignedTo} onChange={handleChange} required>
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
