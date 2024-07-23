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


    const [searchResult, setSearchResult] = useState("");

    const handleSearchChange = (e) => {
        setSearchResult(e.target.value);
    };

    const handleSearch = async (e) => { 
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8090/homePage/search', {searchResult : searchResult});
            setBugArray(response.data);
        }
        catch (error) {
            console.error('Error sending data:', error);
        }
    };


    const [coders, setCoders] = useState([]);

    //find all users that are of Coder type, they are needed because the admin needs to be able to choose which Coder to assign to which bug
    const fetchCoderUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8090/bug/getAllCoders');
            if (!response.data.error) {
                setCoders(response.data);
            } else {
                console.error('Error fetching users:', response.data.message);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

      
    useEffect(() => {
        // when the page loads fetch bugs and then fetch all Coder type users
        const fetchData = async () => {
            await fetchBugs();
            await fetchCoderUsers();
          };
          fetchData();
    }, []);

    return (
        <div className="admin">

            <div className="admin_search_container">
                <input type="text" className="admin_search_input" placeholder="Search..." value={searchResult} onChange={handleSearchChange}/>
                <img src={searchIcon} className="admin_search_icon" alt="Search" onClick={handleSearch}/>
            </div>

            <div className="admin_inner_container">
                {bugArray.map(bug => (
                    <BugItem
                        key={bug.bugId}
                        bugId={bug.bugId}
                        title={bug.bugName}
                        description={bug.bugDesc}
                        status={bug.status}
                        assignedUserId={bug.assignedId} 
                        assignedUsername={bug.assignedUsername}  
                        priority={bug.priority}
                        importance={bug.importance}
                        creationDate={bug.creationDate}
                        openDate={bug.openDate}
                        isAdmin={true}
                        listOfCoders={coders} //sending the list of Coder type users to the BugItem component to show it in the combobox
                    />
                ))}
            </div>
        </div>
    );
}

export default Admin;
