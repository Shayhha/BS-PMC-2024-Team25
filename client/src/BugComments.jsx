import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './BugComments.css';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

const BugComments = () => {
    const location = useLocation();
    const { bug } = location.state || { bug: {} };  // Destructure the passed state
    const [bugId, setBugId] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);  // Tracks the comment being edited
    const [editedCommentText, setEditedCommentText] = useState('');  // Stores the new text for the comment


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

    // Function for editing a comment in the database 
    const handleEditComment = async (commentId) => {
        if (editedCommentText.trim()) { // if the input is empty then the following code will not run
            try {
                // Send the updated comment to the backend API
                const response = await axios.post('http://localhost:8090/bugComments/editCommentOnBug', {
                    commentId: commentId,
                    commentInfo: editedCommentText
                });

                if (response.data.error) {
                    console.error('Error editing comment:', response.data.error);
                } else {
                    // Update the comments list in the UI by updating the commentInfo for the matching bugId
                    const updatedComments = comments.map(comment =>
                        comment.commentId === commentId
                            ? { ...comment, commentInfo: editedCommentText }
                            : comment
                    );

                    // Update the state with the new comments array
                    setComments(updatedComments);
                    
                    // Exit edit mode
                    handleCancelEdit();
                }
            }
            catch (error) {
                console.error('Error:', error);
            }
        }
    };

    // Function to handle clicking the Edit button
    const handleEditButtonClick = (commentId, commentText) => {
        setEditingCommentId(commentId);  // Set the comment ID to be edited
        setEditedCommentText(commentText);  // Set the initial value of the input to the current comment text
    };

    // Function to handle canceling the edit
    const handleCancelEdit = () => {
        setEditingCommentId(null);  // Exit edit mode
        setEditedCommentText('');  // Clear the edited comment text
    };

    return (
        <div className="bug_comments_page">
            <div className="bug_comments_content">
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
                        {comments.map(comment => (
                            <li key={comment.commentId}>
                                <div className='bug_comments_comments_list_item'>
                                    {comment.userId !== userName ? (
                                        <p className='bug_comments_comments_list_item_text'>
                                            <strong>{comment.userId}</strong>: {comment.commentInfo}
                                        </p>
                                    ) : (
                                        <>
                                            {editingCommentId === comment.commentId ? (
                                                <input
                                                    type="text"
                                                    value={editedCommentText}
                                                    onChange={(e) => setEditedCommentText(e.target.value)}
                                                    className="bug_comments_edit_input"
                                                />
                                            ) : (
                                                <p className='bug_comments_comments_list_item_text'>
                                                    <strong>{comment.userId}</strong>: {comment.commentInfo}
                                                </p>
                                            )}
                                            <div className='bug_comments_comments_list_item_buttons'>
                                                {editingCommentId === comment.commentId ? (
                                                    <>
                                                        <button className="bug_comments_comments_list_save_button" onClick={() => handleEditComment(comment.commentId)}>
                                                            <FontAwesomeIcon icon={faSave} /> Save
                                                        </button>
                                                        <button className="bug_comments_comments_list_cancel_button" onClick={handleCancelEdit}>
                                                            <FontAwesomeIcon icon={faTimes} /> Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button className="bug_comments_comments_list_edit_button" onClick={() => handleEditButtonClick(comment.commentId, comment.commentInfo)}>
                                                            <FontAwesomeIcon icon={faPen} /> Edit
                                                        </button>
                                                        <button className="bug_comments_comments_list_delete_button" style={{ display: editingCommentId === comment.commentId ? 'none' : 'block' }}>
                                                            <FontAwesomeIcon icon={faTrash} /> Delete
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

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
