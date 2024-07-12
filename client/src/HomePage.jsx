import React, { useState, useEffect } from 'react';
import './HomePage.css';
import plusIcon from './assets/plusIcon.png';
import searchIcon from './assets/searchIcon.png';
import BugItem from './BugItem';
import axios from 'axios';

function HomePage() {
    
    const [isPopupVisible, setIsPopupVisible] = useState(false);

    const handleImageClick = () => {
        setIsPopupVisible(true);
    };

    const handleCloseClick = () => {
        setIsPopupVisible(false);
    };

    const [searchResult, setSearchResult] = useState("");

    const [bugArray, setBugArray] = useState([]);

    const fetchBugs = async () => {
      const response = await axios.get('http://localhost:8090/api/get_bugs');
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

    const handleSearchChange = (e) => {
        setSearchResult(e.target.value);
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
            const response = await axios.post('http://localhost:8090/api/add_bug', formattedData);
            console.log('Data sent successfully:', response.data);
            // Reset form after successful submission if needed
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
            console.error('Error sending data:', error);
        }
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

    return (
        <div className="home_page">

        <div className="home_page_search_container">
            <input type="text" className="home_page_search_input" placeholder="Search..." value={searchResult} onChange={handleSearchChange}/>
            <img src={searchIcon} className="home_page_search_icon" alt="Search" onClick={handleSearch}/>
        </div>
            <div className="home_page_inner_container">
                <img
                    src={plusIcon}
                    className="home_page_add_new_bug_button"
                    alt="Add New Bug"
                    onClick={handleImageClick}
                />
                
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
                                <input type="text" name="title"  value={formData.title} onChange={handleChange}/>
                            </label>
                            <label>
                                Description:
                                <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
                            </label>
                            <label>
                                Status:
                                <select name="status" value={formData.status} onChange={handleChange}>
                                    <option value="option1">New</option>
                                    <option value="option2">In Progress</option>
                                    <option value="option3">Done</option>
                                </select>
                            </label>
                            <label>
                                Assigned To:
                                <select name="assigned-to"  value={formData.assignedTo} onChange={handleChange}>
                                    <option value="option1">None</option>
                                    <option value="option2">Option 2</option>
                                    <option value="option3">Option 3</option>
                                </select>
                            </label>
                            <label>
                                Priority:
                                <input type="text" name="priority" value={formData.priority} onChange={handleChange} />
                            </label>
                            <label>
                                Importance:
                                <input type="text" name="importance" value={formData.importance} onChange={handleChange} />
                            </label>
                            <label>
                                Creation Date:
                                <input type="date" name="creationDate" value={formData.creationDate} onChange={handleChange} />
                            </label>
                            <label>
                                Open Date:
                                <input type="date" name="openDate" value={formData.openDate} onChange={handleChange} />
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