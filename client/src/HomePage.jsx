import React, { useState } from 'react';
import './HomePage.css';
import plusIcon from './assets/plusIcon.png';
import BugItem from './BugItem';

function HomePage() {
    
    const [isPopupVisible, setIsPopupVisible] = useState(false);

    const handleImageClick = () => {
        setIsPopupVisible(true);
    };

    const handleCloseClick = () => {
        setIsPopupVisible(false);
    };

    /* Testing with fake data */
    const bugItems = [
        {
            id: 1,
            title: 'Bug 1',
            description: 'Description of Bug 1',
            status: 'Open',
            assignedTo: 'User A',
            priority: 'High',
            importance: 'Critical',
            creationDate: '2024-07-12',
            openDate: '2024-07-12'
        },
        {
            id: 2,
            title: 'Bug 2',
            description: 'Description of Bug 2',
            status: 'In Progress',
            assignedTo: 'User B',
            priority: 'Medium',
            importance: 'High',
            creationDate: '2024-07-13',
            openDate: '2024-07-14'
        },
        {
            id: 3,
            title: 'Bug 3',
            description: 'Description of Bug 3',
            status: 'Resolved',
            assignedTo: 'User C',
            priority: 'Low',
            importance: 'Low',
            creationDate: '2024-07-15',
            openDate: '2024-07-16'
        }
    ];
    

    return (
        <div className="home_page">
            <div className="home_page_inner_container">
                <img
                    src={plusIcon}
                    className="home_page_add_new_bug_button"
                    alt="Add New Bug"
                    onClick={handleImageClick}
                />
                
                    {bugItems.map(bug => (
                        <div className="home_page_bug_item_container">
                            <BugItem
                                key={bug.id}
                                title={bug.title}
                                description={bug.description}
                                status={bug.status}
                                assignedTo={bug.assignedTo}
                                priority={bug.priority}
                                importance={bug.importance}
                                creationDate={bug.creationDate}
                                openDate={bug.openDate}
                            />
                        </div>
                    ))}
                
            </div>

            {isPopupVisible && (
                <div className="home_page_popup_overlay">
                    <div className="home_page_popup">
                        <span className="home_page_close_button" onClick={handleCloseClick}>&times;</span>
                        <h2>New Bug</h2>
                        <form>
                            <label>
                                Title:
                                <input type="text" name="title" />
                            </label>
                            <label>
                                Description:
                                <textarea name="description"></textarea>
                            </label>
                            <label>
                                Status:
                                <select name="status">
                                    <option value="option1">New</option>
                                    <option value="option2">In Progress</option>
                                    <option value="option3">Done</option>
                                </select>
                            </label>
                            <label>
                                Assigned To:
                                <select name="assigned-to">
                                    <option value="option1">Option 1</option>
                                    <option value="option2">Option 2</option>
                                    <option value="option3">Option 3</option>
                                </select>
                            </label>
                            <label>
                                Priority:
                                <input type="text" name="priority" />
                            </label>
                            <label>
                                Importance:
                                <input type="text" name="importance" />
                            </label>
                            <label>
                                Creation Date:
                                <input type="date" name="creation date" />
                            </label>
                            <label>
                                Open Date:
                                <input type="date" name="open date" />
                            </label>
                            <button type="submit" className="home_page_popup_submit_button">Submit</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HomePage