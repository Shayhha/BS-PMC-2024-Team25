import React, { useState, useEffect } from 'react';
import './BugItem.css';
import trashIcon from './assets/trashIcon.png';
import axios from 'axios';

function BugItem({
    bugId, title, description, status, assignedUserId, assignedUsername, 
    priority, importance, creationDate, openDate, closeDate, isAdmin, onSave, 
    listOfCoders
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedBug, setEditedBug] = useState({
        bugId, bugName: title, bugDesc: description, status, assignedId: assignedUserId,
        assignedName: assignedUsername, priority, importance, creationDate, openDate, closeDate,
        isDescChanged: '0'
    });
    const [assignedToCoder, setAssignedToCoder] = useState({ uid: 0, uname: "" });
    const [notificationSent, setNotificationSent] = useState(false);

    const statusOptions = ["In Progress", "New", "Done"];

    useEffect(() => {
        const checkAndNotify = async () => {
            if (closeDate && assignedUserId !== 0) {
                // Get today's date without time
                const today = new Date();
                today.setHours(0, 0, 0, 0);
    
                // Get the close date and reset time
                const closeDateObject = new Date(closeDate);
                closeDateObject.setHours(0, 0, 0, 0);
    
                // Compare dates
                if (today.getTime() === closeDateObject.getTime()) {
                    const lastNotificationDateStr = localStorage.getItem('lastNotificationDate');
                    const lastNotificationDate = lastNotificationDateStr ? new Date(lastNotificationDateStr) : null;
    
                    // Check if notification has already been sent today
                    if (!lastNotificationDate || today.getTime() !== new Date(lastNotificationDate).getTime()) {
                        const notificationMessage = `The deadline is today for the bug: ${title}!!!`;
                        try {
                            await pushNotification(assignedUserId, notificationMessage);
                            setNotificationSent(true);
                            localStorage.setItem('lastNotificationDate', today.toISOString());
                        } catch (error) {
                            console.error('Error pushing notification:', error);
                        }
                    }
                }
            }
        };
    
        checkAndNotify();
    }, [closeDate, assignedUserId, title]);

    const pushNotification = async (user_id, notification_message) => {
        try {
            const response = await axios.post('http://localhost:8090/notifications/pushNotificationToUser', {
                userId: user_id, message: notification_message
            });
            if (response.data.error) {
                console.error('Error pushing notification to user:', response.data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDeleteBug = async () => {
        if (status !== "Done") return;
        if (!window.confirm("Are you sure you want to delete this bug?")) return;
        try {
            await axios.post('http://localhost:8090/homePage/removeBug', { bugId });
            window.location.reload();
        } catch (error) {
            alert(`Error removing the bug: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleEditClick = () => setIsEditing(true);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedBug(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveClick = async () => {
        setIsEditing(false);
        editedBug.isDescChanged = editedBug.bugDesc !== description ? '1' : '0';

        try {
            editedBug.assignedName = assignedToCoder.uname;
            editedBug.assignedId = assignedToCoder.uid || null;

            const response = await axios.post('http://localhost:8090/homePage/updateBug', editedBug);
            if (!response.data.error) {
                response.data.assignedUsername = editedBug.assignedName;
                response.data.assignedId = editedBug.assignedId || 0;
                onSave(response.data);
                console.log('Bug updated successfully');
                await pushNotificationsToAllUsers(`The following bug has been updated: ${title}`);
            } else {
                console.error('Failed to update bug on backend:', response.data.error);
            }
        } catch (error) {
            console.error('Failed to update bug:', error);
        }
    };

    const pushNotificationsToAllUsers = async (notification_message) => {
        try {
            const response = await axios.post('http://localhost:8090/notifications/pushNotificationsToAllUsers', {
                message: notification_message
            });
            if (response.data.error) {
                console.error('Error pushing notification to all users:', response.data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleCancelClick = () => setIsEditing(false);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Done': return 'green';
            case 'In Progress': return 'yellow';
            case 'New': return 'red';
            default: return 'gray';
        }
    };

    const getPriorityAndImportanceColor = (value) => {
        if (value <= 4) return 'green';
        if (value <= 7) return 'orange';
        return 'red';
    };

    const parseAssignedUserString = (assignedUserString) => {
        if (assignedUserString === "Unassigned") return { selected_username: "Unassigned", selected_userid: null };
        const [username, userIdString] = assignedUserString.split(' - ');
        return { selected_username: username.trim(), selected_userid: parseInt(userIdString, 10) };
    };

    const handleAssignmentChange = async (event) => {
        const { selected_username, selected_userid } = parseAssignedUserString(event.target.value);
        await handleDatabaseUpdates(selected_userid);
        setAssignedToCoder({ uid: selected_userid, uname: selected_username });
    };

    const handleDatabaseUpdates = async (userId) => {
        await assignUserInDatabase(userId);
        await pushNotification(userId, `You have been assigned to the following bug: ${title}`);
    };

    const assignUserInDatabase = async (userId) => {
        try {
            const response = await axios.post('http://localhost:8090/bug/assignUserToBug', {
                selectedUserId: userId, bugId
            });
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
                    <div className="bug-item-row">
                        <div className="bug-item-label">Deadline:</div>
                        <p className="bug-item-creation-date">{closeDate}</p>
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
                                {listOfCoders.map(user => (
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
                        <p className="bug-item-priority"  style={{ color: getPriorityAndImportanceColor(priority) }}>{priority}</p>
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
                        <div className="bug-item-label">Deadline:</div>
                        <p className="bug-item-open-date">{closeDate}</p>
                    </div>
                    {(isAdmin && (status === "Done")) ? (
                        <img src={trashIcon} className="bug-item-remove-button" onClick={handleDeleteBug} alt="Remove Bug Icon" />
                    ) : (
                        <button onClick={handleEditClick} className="bug-item-edit-button">Edit</button>
                    )}
                </div>
            )}
        </div>
    );
}

export default BugItem;
