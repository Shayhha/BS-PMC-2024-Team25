import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaPlus } from 'react-icons/fa';
import ReportDetails from './ReportDetails'; 
import './Reports.css';

function Reports() {
    const [reportArray, setReportArray] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null); 

    const fetchReports = async () => {
        try {
            const response = await axios.get('http://localhost:8090/reports/getReports');
            setReportArray(response.data);
        } catch (error) {
            alert(`Error: ${error.response.data.error}`);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const showReport = (report) => {
        setSelectedReport(report); // Set the entire report object
    };

    const closeReportDetails = () => {
        setSelectedReport(null);
    };

    const createReport = async () => {
        try {
            const response = await axios.get('http://localhost:8090/reports/createReport');
            await fetchReports();
            alert("Created a new report successfully!");
        } catch (error) {
            alert(`Error: ${error.response.data.error}`);
        }
    }

    return (
        <div className="reports-list-page">
            <div className="reports-list-container">
                <h1 className="reports-list-title">Reports</h1>
                {reportArray.map(report => (
                <div className="reports-list-reports-item" key={report.reportId}>
                    <div className="reports-list-reports-info" onClick={() => showReport(report)}>
                            <p className="reports-list-reports-name">Report no. {report.reportId}, created on: {report.creationDate} - {report.creationTime}</p>
                    </div >
                </div>
                ))}
            </div>
            {selectedReport && (
                 <div className="reports_popup_overlay">
                    <ReportDetails 
                    report={selectedReport} 
                    onClose={closeReportDetails} 
                />
                </div>
            )}
            <button onClick={createReport} className='report_add_new_report_button'>
                <FaPlus style={{ fontSize: '40px', marginRight: '0px' }}/>
            </button>
        </div>
    );
}

export default Reports;
