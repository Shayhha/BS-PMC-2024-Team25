import React, { useState, useEffect } from 'react';
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
        if (status !== "Done") return;
        if (!confirm("Are you sure you want to delete this bug?")) return;
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

    const handleCancelClick = async () => {
        setIsEditing(false);
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


    const [users, setUsers] = useState([]);
    const [assignedToCoder, setAssignedToCoder] = useState('');

    const fetchCoderUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8090/bug/getAllCoders');
            if (!response.data.error) {
                setUsers(response.data);
            } else {
                console.error('Error fetching users:', response.data.message);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        fetchCoderUsers();
        if (assignedToCoder === '')
            setAssignedToCoder(assignedTo)

    }, []);


    const handleAssignmentChange = (event) => {
        const newAssignedTo = event.target.value;
        setAssignedToCoder(newAssignedTo);
    
        assignUserInDatabase(newAssignedTo);
    };
    
    const assignUserInDatabase = async (newAssignedTo) => {
        const user = users.find(user => user['userName'] === newAssignedTo);
        const selectedUserId = user ? user.userId : null;
        try {
            const response = await axios.post('http://localhost:8090/bug/assignUserToBug', { selectedUserId: selectedUserId, bugId: bugId });
            if (response.data.error) {
                console.error('Error assigning user:', response.data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="bug-item-div" style={{ borderColor: getStatusColor(status) }}>
            {isEditing ? (
                <div className="bug-item-editing">
                    <div className="bug-item-row-textarea">
                        <label htmlFor="bugDesc">Bug Description:</label>
                        <textarea 
                            id="bugDesc" 
                            name="bugDesc"  
                            value={editedBug.bugDesc} 
                            onChange={handleInputChange} 
                            className="bug-item-textarea">
                        </textarea>
                    </div>
                    <div className="bug-item-row">
                        <label htmlFor="status">Status:</label>
                        <select 
                            id="status" 
                            name="status" 
                            value={editedBug.status} 
                            onChange={handleInputChange} 
                            className="bug-item-select" // Added className for consistent styling
                        >
                            {statusOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    <div className="bug-item-row">
                        <label htmlFor="priority">Priority:</label>
                        <input 
                            type="text" 
                            id="priority" 
                            name="priority" 
                            value={editedBug.priority} 
                            onChange={handleInputChange} 
                            className="bug-item-input" // Added className for consistent styling
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
                            className="bug-item-input" // Added className for consistent styling
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
                    <button onClick={handleCancelClick} className="bug-item-cancel-button">Cancel</button>
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

                    {isAdmin ? (
                        <div className="bug-item-info"> 
                            <div className="bug-item-label">Assigned To:</div>
                            <select name="assignedTo" className="bug-item-assigned-combobox" value={assignedToCoder} onChange={handleAssignmentChange} required>
                                {Array.isArray(users) && users.map(user => (
                                    <option key={user.userId} value={user.userName}>{user.userName}</option>
                                ))}
                            </select>
                        </div>  
                    ) : (
                        <div className="bug-item-info"> 
                            <div className="bug-item-label">Assigned To:</div>
                            <p className="bug-item-assigned-p">{assignedTo}</p>
                        </div> 
                    )}
    
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
                    {isAdmin ? (
                        <img src={trashIcon} className="bug-item-remove-button" onClick={handleDeleteBug} alt="Remove Bug Icon" ></img>
                    ) : (
                        <button onClick={handleEditClick} className="bug-item-edit-button">Edit</button>
                    )}
                </div>
            )}
        </div>
    );
}

export default BugItem;
