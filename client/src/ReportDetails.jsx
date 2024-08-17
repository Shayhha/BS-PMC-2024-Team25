import React from 'react';
import './ReportDetails.css';

function ReportDetails({ report, onClose }) {

    if (!report) {
        return <div>Loading...</div>;
    }

    return (
        <div className="report-details-modal">
            <h2>Report  #{report.reportId}  Details</h2>
            <p><strong>Creation Date:</strong> {report.creationDate}</p>
            <p><strong>Creaton Time:</strong> {report.creationTime}</p>
            <p><strong>Open Bugs:</strong> {report.openBugs}</p>
            <p><strong>Closed Bugs:</strong> {report.closedBugs}</p>
            <p><strong>High Priority Bugs:</strong> {report.priorityBugs}</p>
            <p><strong>High Importance Bugs:</strong> {report.importanceBugs}</p>
            <button onClick={onClose}>Close</button>
        </div>
    );
}

export default ReportDetails;
