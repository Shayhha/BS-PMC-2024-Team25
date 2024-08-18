import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Chat.css';
import { useLocation } from 'react-router-dom';

function Chat() {
    const location = useLocation();
    const { userId } = location.state || {};
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8090/get_users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };
    
    const fetchMessages = async () => {
        try {
            const response = await axios.post('http://localhost:8090/chat/get_messages', {
                userId: userId 
            });
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const loadAllData = async () => {
        await fetchUsers();
        await fetchMessages();
    };

    useEffect(() => {
        loadAllData();
    }, [userId]);

    const handleSendMessage = async () => {
        if (message && selectedUser) {
            try {
                const response = await axios.post('http://localhost:8090/chat/send_message', {
                    sender_id: userId,
                    receiver_id: selectedUser,
                    message: message,
                });

                setMessages([...messages, {
                    senderName: response.data.senderName,
                    messageInfo: message
                }]);

                setMessage(''); 
                setFeedbackMessage('Message sent successfully!'); // Add success feedback
                setTimeout(() => setFeedbackMessage(''), 3000); // Clear feedback after 3 seconds
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-section receive-messages">
                <h2>Received Messages</h2>
                <div className="chat-messages">
                    {messages.length > 0 ? (
                        messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.senderType}`}>
                                <strong>{msg.senderName}:</strong> {msg.messageInfo}
                            </div>
                        ))
                    ) : (
                        <div className="no-messages">No messages yet.</div>
                    )}
                </div>
            </div>
    
            <div className="chat-section send-message">
                <h2>Send a Message</h2>
                <select 
                    value={selectedUser} 
                    onChange={(e) => setSelectedUser(e.target.value)}
                >
                    <option value="">Select a user</option>
                    {users
                        .filter(user => user.userId !== userId)
                        .map(user => (
                            <option key={user.userId} value={user.userId}>
                                {user.userName} - {user.userType}
                            </option>
                        ))}
                </select>
                <div className="chat-input">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        rows="4"
                        disabled={!selectedUser}
                    />
                    <button onClick={handleSendMessage} disabled={!selectedUser || !message.trim()}>Send</button>
                </div>
                {feedbackMessage && <div className="feedback-message">{feedbackMessage}</div>} {/* Display feedback */}
            </div>
        </div>
    );
}

export default Chat;
