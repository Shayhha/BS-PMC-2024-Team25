import React, { useState, useEffect } from 'react';
import './HomePage.css';
import { FaPlus } from 'react-icons/fa';
import { FaSearch } from 'react-icons/fa';
import BugItem from './BugItem';
import axios from 'axios';

function HomePage() {
    const [searchResult, setSearchResult] = useState("");


    const handleSearchChange = (e) => {
        setSearchResult(e.target.value);
    };
    
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const handleImageClick = () => {
        setIsPopupVisible(true);
    };

    const handleCloseClick = () => {
        setIsPopupVisible(false);
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

    const handleSearch = async (e) => { 
        e.preventDefault();
        if (searchResult === "") 
            return;
        try {
            const response = await axios.post('http://localhost:8090/homePage/search', {searchResult : searchResult});
            setBugArray(response.data);
            console.log('Data sent successfully:', response.data);
        }
        catch (error) {
            console.error('Error sending data:', error);
        }
    };
    
    return (
        <div className="home_page">

        <div className="home_page_search_container">
            <input type="text" className="home_page_search_input" placeholder="Search..." value={searchResult} onChange={handleSearchChange}/>
            <button onClick={handleSearch} type="submit" className="homepage_search_button">
                    <FaSearch className="home_page_search_icon" alt="Search"/>
            </button>
        </div>

            <button onClick={handleImageClick} className='home_page_add_new_bug_button'>
                <FaPlus style={{ fontSize: '40px', marginRight: '0px'}}/>
            </button>

            <div className="home_page_inner_container">                
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

            {isPopupVisible && (
                <div className="home_page_popup_overlay">
                    <div className="home_page_popup">
                        <span className="home_page_close_button" onClick={handleCloseClick}>&times;</span>
                        <h2>New Bug</h2>
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
                                    <option value="option1">New</option>
                                    <option value="option2">In Progress</option>
                                    <option value="option3">Done</option>
                                </select>
                            </label>
                            <label>
                                Assigned To:
                                <select name="assigned-to"  value={formData.assignedTo} onChange={handleChange} required>
                                    <option value="option1">None</option>
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
                            <button type="submit" className="home_page_popup_submit_button">Submit</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HomePage