import React, { useState } from 'react';
import './BugItem.css';
import trashIcon from './assets/trashIcon.png';
import axios from 'axios';

function BugItem({ 
    bugId, 
    title, 
    description, 
    status, 
    assignedTo, 
    priority, 
    importance, 
    creationDate, 
    openDate, 
    isAdmin, 
    onSave 
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedBug, setEditedBug] = useState({
        bugId,
        bugName: title,
        bugDesc: description,
        status,
        assignedId: assignedTo,
        priority,
        importance,
        creationDate,
        openDate,
    });

    const statusOptions = ["In Progress", "New", "Done"]; // Options for status dropdown

    const handleDeleteBug = async () => {
        try {
            await axios.post('http://localhost:8090/homePage/removeBug', { bugId });
            window.location.reload(); // refresh the page after successful deletion to see the updated list of bugs
        } catch (error) {
            alert(`Error removing the bug, ${error.response.data.error}`);
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedBug({
            ...editedBug,
            [name]: value,
        });
    };

    const handleSaveClick = async () => {
        setIsEditing(false);
        try {
            const response = await axios.post('http://localhost:8090/homePage/updateBug', editedBug);
            if (response.data.message === 'Bug updated successfully') {
                onSave(editedBug); // Update locally in the frontend if backend update was successful
                console.log('Bug updated successfully');
            } else {
                console.error('Failed to update bug on backend');
            }
        } catch (error) {
            console.error('Failed to update bug:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Done':
                return 'green';
            case 'In Progress':
                return 'yellow';
            case 'New':
                return 'red';
            default:
                return 'gray'; // Default or unknown status
        }
    };

    return (
        <div className="bug-item-div" style={{ borderColor: getStatusColor(status) }}>
           
            
            {isEditing ? (
                <div className="bug-item-editing">
                    <div className="bug-item-row">
                        <label htmlFor="bugDesc">Bug Description:</label>
                        <input 
                            type="text" 
                            id="bugDesc" 
                            name="bugDesc" 
                            value={editedBug.bugDesc} 
                            onChange={handleInputChange} 
                        />
                    </div>
                    <div className="bug-item-row">
                        <label htmlFor="status">Status:</label>
                        <select 
                            id="status" 
                            name="status" 
                            value={editedBug.status} 
                            onChange={handleInputChange} 
                        >
                            {statusOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    <div className="bug-item-row">
                        <label htmlFor="assignedId">Assigned To:</label>
                        <input 
                            type="text" 
                            id="assignedId" 
                            name="assignedId" 
                            value={editedBug.assignedId} 
                            onChange={handleInputChange} 
                        />
                    </div>
                    <div className="bug-item-row">
                        <label htmlFor="priority">Priority:</label>
                        <input 
                            type="text" 
                            id="priority" 
                            name="priority" 
                            value={editedBug.priority} 
                            onChange={handleInputChange} 
                        />
                    </div>
                    <div className="bug-item-row">
                        <label htmlFor="importance">Importance:</label>
                        <input 
                            type="text" 
                            id="importance" 
                            name="importance" 
                            value={editedBug.importance} 
                            onChange={handleInputChange} 
                        />
                    </div>
                    <div className="bug-item-row">
                        <div className="bug-item-label">Creation Date:</div>
                        <p className="bug-item-creation-date">{creationDate}</p>
                    </div>
                    <div className="bug-item-row">
                        <div className="bug-item-label">Open Date:</div>
                        <p className="bug-item-open-date">{openDate}</p>
                    </div>
                    <button onClick={handleSaveClick} className="bug-item-save-button">Save</button>
                </div>
            ) : (
                <div className="bug-item-view">
                    <div className="bug-item-info">
                        <p className="bug-item-title">{title}</p>
                    </div>
                    <div className="bug-item-info">
                        <p className="bug-item-description">{description}</p>
                    </div>
                    <div className="bug-item-info">
                        <p className="bug-item-status" style={{ backgroundColor: getStatusColor(status) }}>{status}</p>
                    </div>
                    <div className="bug-item-info">
                        <div className="bug-item-label">Assigned To:</div>
                        <p className="bug-item-assigned">{assignedTo}</p>
                    </div>
                    <div className="bug-item-info">
                        <div className="bug-item-label">Priority:</div>
                        <p className="bug-item-priority">{priority}</p>
                    </div>
                    <div className="bug-item-info">
                        <div className="bug-item-label">Importance:</div>
                        <p className="bug-item-importance">{importance}</p>
                    </div>
                    <div className="bug-item-info">
                        <div className="bug-item-label">Creation Date:</div>
                        <p className="bug-item-creation-date">{creationDate}</p>
                    </div>
                    <div className="bug-item-info">
                        <div className="bug-item-label">Open Date:</div>
                        <p className="bug-item-open-date">{openDate}</p>
                    </div>
                    {isAdmin && (
                        <button onClick={handleEditClick} className="bug-item-edit-button">Edit</button>
                    )}
                </div>
            )}
        </div>
    );
}

export default BugItem;
