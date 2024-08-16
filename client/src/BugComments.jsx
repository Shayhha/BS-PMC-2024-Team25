import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './BugComments.css';
import axios from 'axios';

const BugComments = () => {
    const location = useLocation();
    const { bug } = location.state || { bug: {} };  // Destructure the passed state
    const [bugId, setBugId] = useState(null);

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');

    useEffect(() => {
        if (bug?.id) {
            setBugId(bug.id);
            const fetchFunction = async (bugId) => {
                await fetchBugCommentsById(bugId); // get the comments for this bug
                await fetchUserInfo(); // get the current user information
            }
            fetchFunction(bugId);
        }
    }, [bug]);

    // Function for getting all the comments for a bug given the bug id
    const fetchBugCommentsById = async () => {
        try {
            const response = await axios.post('http://localhost:8090/bugComments/getBugCommentsById', { bug_Id: bug.id });
            if (response.data.error) {
                console.error('Error fetching comments:', response.data.error);
            }
            console.log(response.data);
            setComments(response.data);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Function for getting info line userName and userId of the current connected user from the database
    const fetchUserInfo = async () => {
        try {
            const response = await axios.get('http://localhost:8090/userSettings/getUser');
            if (response.data) {
                const data = response.data
                setUserName(data.userName);
                setUserId(data.userId);
            } else {
                console.error('Failed to fetch user info');
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };

    // Function for adding a comment to the database and then to the list of comments on screen
    const handleAddComment = async () => {
        if (newComment.trim()) { // if the input is empty then the following code will not run
            try {
                const response = await axios.post('http://localhost:8090/bugComments/addCommentToBug', { bugId: bug.id, userId: userId, commentInfo: newComment });
                if (response.data.error) {
                    console.error('Error adding comment:', response.data.error);
                }
                setComments([...comments, { commentId: comments.length + 1, bugId: bug.bugId, userId: userName, commentInfo: newComment }]);
                setNewComment('');
            }
            catch (error) {
                console.error('Error:', error);
            }
        }
    };

    return (
        <div className="bug_comments_page">
            <div className="bug_comments_info">
                <h1>{bug.title}</h1>
                <p><strong>Description</strong>: {bug.description}</p>
                <p><strong>Suggestion</strong>: {bug.suggestion}</p>

                <div className="bug_comments_stats">
                    <span><strong>Category</strong>: {bug.category}</span>
                    <span><strong>Close Date</strong>: {bug.closeDate}</span>
                    <span><strong>Assigned To</strong>: {bug.assignedUsername}</span>
                </div>

                <div className="bug_comments_stats">
                    <span><strong>Priority</strong>: {bug.priority}</span>
                    <span><strong>Importance</strong>: {bug.importance}</span>
                    <span><strong>Status</strong>: {bug.status}</span>
                </div>
            </div>

            <div className="bug_comments_comments_section">
                <h2>Comments</h2>
                <ul className="bug_comments_comments_list">
                    {(comments != []) && (comments.map(comment => (
                        <li key={comment.commentId}>
                        <strong>{comment.userId}</strong>: {comment.commentInfo}
                        </li>
                    )))}
                </ul>

                {/* Only 'Coder' type users can see the add comment, edit comment and delete comment buttons */}
                {bug.isCoder &&
                    <div className="bug_comments_add_comment">
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <button onClick={handleAddComment}>Add Comment</button>
                    </div>
                }
            </div>
        </div>
    );
};

export default BugComments;
