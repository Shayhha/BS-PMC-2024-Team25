import React, { useState } from 'react';
import './BugItem.css';

function BugItem({ title, description, status, assignedTo, priority, importance, creationDate, openDate }) {
    return (
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
    );
}


export default BugItem