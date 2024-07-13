import React from 'react';
import './BugItem.css';
import trashIcon from './assets/trashIcon.png';
import axios from 'axios';

function BugItem({ bugId, title, description, status, assignedTo, priority, importance, creationDate, openDate, isAdmin }) {

    const handleDeleteBug = async () => {
        try {
            const response = await axios.post('http://localhost:8090/homePage/removeBug', {bugId : bugId});
            window.location.reload(); // refresh the page after successful deletion to see the updated list of bugs
        } catch (error) {
            alert(`Error removing the bug, ${error.response.data.error}`);
        }
    };

    return (
        isAdmin ? (
            <div className="bug_item_div">
                <img src={trashIcon} className="bug_item_remove_button" onClick={handleDeleteBug} alt="Remove Bug Icon" ></img>
                <p className="bug_item_title">{title}</p>
                <p className="bug_item_description">{description}</p>
                <p className="bug_item_status">{status}</p>
                <p className="bug_item_assigned_to">{assignedTo}</p>
                <p className="bug_item_priority">{priority}</p>
                <p className="bug_item_importance">{importance}</p>
                <p className="bug_item_creation_date">{creationDate}</p>
                <p className="bug_item_open_date">{openDate}</p>
            </div>
        ) :
        (
            <div className="bug_item_div">
                <p className="bug_item_title">{title}</p>
                <p className="bug_item_description">{description}</p>
                <p className="bug_item_status">{status}</p>
                <p className="bug_item_assigned_to">{assignedTo}</p>
                <p className="bug_item_priority">{priority}</p>
                <p className="bug_item_importance">{importance}</p>
                <p className="bug_item_creation_date">{creationDate}</p>
                <p className="bug_item_open_date">{openDate}</p>
            </div>
        )
        
    );
}


export default BugItem