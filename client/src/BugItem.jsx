import React, { useState, useEffect } from 'react';
import './BugItem.css';
import trashIcon from './assets/trashIcon.png';
import axios from 'axios';

function BugItem({bugId, title, description, status, assignedUserId, assignedUsername, priority, importance, creationDate, openDate, isAdmin, onSave, listOfCoders, update_counter, update_dates}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedBug, setEditedBug] = useState({
        bugId,
        bugName: title,
        bugDesc: description,
        status,
        assignedId: assignedUserId,
        assignedName: assignedUsername,
        priority,
        importance,
        creationDate,
        openDate, 
        isDescChanged: '0'
    });

    const [updateCounter, setUpdateCounter] = useState(update_counter || 0);
    const [updateDates, setUpdateDates] = useState(update_dates || []);

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

        if (editedBug.bugDesc !== description) 
            editedBug.isDescChanged = '1'; 
        else
            editedBug.isDescChanged = '0'; 

        try {
            editedBug['assignedName'] = assignedToCoder.uname;
            editedBug['assignedId'] = assignedToCoder.uid === 0 ? null : assignedToCoder.uid;
            
            editedBug.update_counter = updateCounter + 1;
            editedBug.update_dates = [...updateDates, new Date().toISOString()];

            const response = await axios.post('http://localhost:8090/homePage/updateBug', editedBug);
            if (!response.data.error) {
                response.data['assignedUsername'] = editedBug['assignedName'];
                response.data['assignedId'] = editedBug['assignedId'] === null ? 0 : assignedToCoder.uid;
                onSave(response.data); 
                setUpdateCounter(updateCounter + 1);
                setUpdateDates([...updateDates, new Date().toISOString()]);
                console.log('Bug updated successfully');
            } else {
                console.error('Failed to update bug on backend');
            }
            pushNotificationsToAllUsers("The following bug has been updated: " + title);
        } catch (error) {
            console.error('Failed to update bug:', error);
        }
    };

    const pushNotificationsToAllUsers = async (notification_message) => {
        try {
            const response = await axios.post('http://localhost:8090/notifications/pushNotificationsToAllUsers', { message: notification_message });
            if (response.data.error) {
                console.error('Error pushing notification to all users:', response.data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleCancelClick = () => {
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

    const getPriorityAndImportanceColor = (value) => {
        if (value <= 4) {
            return 'green';
        } else if (value >= 5 && value <= 7) {
            return 'orange';
        } else if (value >= 8) {
            return 'red';
        } else {
            return 'black'; // Default color if value is out of range
        }
    };

    const [assignedToCoder, setAssignedToCoder] = useState({
        uid: 0,
        uname: ""
    });

    useEffect(() => {
        if (assignedToCoder.uname === "" && listOfCoders) {
            setAssignedToCoder({
                uid: assignedUserId,
                uname: assignedUsername
            });
        }
    }, [assignedUserId, assignedUsername, listOfCoders]);

    const parseAssignedUserString = (assignedUserString) => {
        if (assignedUserString === "Unassigned") 
            return { selected_username: "Unassigned", selected_userid: null };
        
        const [username, userIdString] = assignedUserString.split(' - ');
        const userId = parseInt(userIdString, 10);
        return { selected_username: username.trim(), selected_userid: userId };
    };

    const handleAssignmentChange = (event) => {
        const { selected_username, selected_userid } = parseAssignedUserString(event.target.value);
        handleDatabaseUpdates(selected_userid);
        setAssignedToCoder({
            uid: selected_userid,
            uname: selected_username
        });
    };

    const handleDatabaseUpdates = async (userId) => {
        await assignUserInDatabase(userId);
        await pushNotification(userId, "You have been assigned to the following bug: " + title);
        return true;
    }

    const assignUserInDatabase = async (userId) => {
        try {
            const response = await axios.post('http://localhost:8090/bug/assignUserToBug', { selectedUserId: userId, bugId });
            if (response.data.error) {
                console.error('Error assigning user:', response.data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const pushNotification = async (user_id, notification_message) => {
        try {
            const response = await axios.post('http://localhost:8090/notifications/pushNotificationToUser', { userId: user_id, message: notification_message });
            if (response.data.error) {
                console.error('Error pushing notification to user:', response.data.error);
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
                            className="bug-item-select">
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
                            className="bug-item-input" />
                    </div>
                    <div className="bug-item-row">
                        <label htmlFor="importance">Importance:</label>
                        <input 
                            type="text" 
                            id="importance" 
                            name="importance" 
                            value={editedBug.importance} 
                            onChange={handleInputChange} 
                            className="bug-item-input" />
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

                    {(isAdmin && listOfCoders) ? (
                        <div className="bug-item-info"> 
                            <div className="bug-item-label">Assigned To:</div>
                            <select name="assignedTo" className="bug-item-assigned-combobox" value={`${assignedToCoder.uname} - ${assignedToCoder.uid}`} onChange={handleAssignmentChange} required>
                                <option value="Unassigned">Unassigned</option>
                                {Array.isArray(listOfCoders) && listOfCoders.map(user => (
                                    <option key={user.userId} value={`${user.userName} - ${user.userId}`}>{`${user.userName} - ${user.userId}`}</option>
                                ))}
                            </select>
                        </div>  
                    ) : (
                        <div className="bug-item-info"> 
                            <div className="bug-item-label">Assigned To:</div>
                            <p className="bug-item-assigned-p">{assignedUserId === 0 ? `${assignedUsername}` : `${assignedUsername} - ${assignedUserId}`}</p>
                        </div> 
                    )}
    
                    <div className="bug-item-info">
                        <div className="bug-item-label">Priority:</div>
                        <p className="bug-item-priority" style={{ color: getPriorityAndImportanceColor(priority) }}>{priority}</p>
                    </div>
                    <div className="bug-item-info">
                        <div className="bug-item-label">Importance:</div>
                        <p className="bug-item-importance" style={{ color: getPriorityAndImportanceColor(importance) }}>{importance}</p>
                    </div>
                    <div className="bug-item-info">
                        <div className="bug-item-label">Creation Date:</div>
                        <p className="bug-item-creation-date">{creationDate}</p>
                    </div>
                    <div className="bug-item-info">
                        <div className="bug-item-label">Open Date:</div>
                        <p className="bug-item-open-date">{openDate}</p>
                    </div>
                    <div className="bug-item-info">
                        <div className="bug-item-label">Update Count:</div>
                        <p>{updateCounter}</p>
                    </div>
                    <div className="bug-item-info">
                        <div className="bug-item-label">Update Dates:</div>
                        <ul>
                            {updateDates.slice(-5).map((date, index) => (
                                <li key={index}>{new Date(date).toLocaleString()}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="button-container">
                        {(isAdmin && (status === "Done")) ? (
                            <img src={trashIcon} className="bug-item-remove-button" onClick={handleDeleteBug} alt="Remove Bug Icon" ></img>
                        ) : (
                            <button onClick={handleEditClick} className="bug-item-edit-button">Edit</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default BugItem;
