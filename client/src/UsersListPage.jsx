import React, { useState, useEffect } from 'react';
import './UsersListPage.css';
import crossIcon from './assets/crossIcon.png';
import axios from 'axios';

function UsersListPage() {

    const [user, setUser] = useState({
        userName: '',
        fName: '',
        lName: '',
        email: '',
        userType: ''
    });

    const [userArray, setUserArray] = useState([]);

    const fetchUsers = async () => {
        try { 
            const response = await axios.get('http://localhost:8090/removeUsers/getUsers');
            setUserArray(response.data);
        } 
        catch (error) {
            alert(`Error: ${error.response.data.error}`);
        }
    };
    
    const deleteUser = async (userId) => { 
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            const response = await axios.post('http://localhost:8090/removeUsers/deleteUser', {id: userId});
            fetchUsers();
        } 
        catch (error) {
            alert(`Error deleting user: ${error.response.data.error}`);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);


    return (
        <div className="users-list-page">
            <div className="users-list-container">
                <h1 className="users-list-title">Users</h1>
                {userArray.map(user => (
                    <div className="users-list-user-item" key={user.userId}>
                        <div className="users-list-user-info">
                            <p className="users-list-user-name">{user.userName} - {user.userType}</p>
                        </div>
                        <img src={crossIcon} onClick={() => deleteUser(user.userId)} className="users-list-user-delete-button"></img>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UsersListPage