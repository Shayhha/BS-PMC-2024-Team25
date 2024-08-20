// src/LandingPage.jsx
import React from 'react';
import './LandingPage.css';
import ArticleLayout from './ArticleLayout';
import NavBar from './NavBar';
import Footer from './Footer';

// Import images
import landingPageImage1 from './assets/landingPageImage1.jpg'; // Adjust the path as needed , landingPageImage2, landingPageImage3, landingPageImage4
import landingPageImage2 from './assets/landingPageImage2.jpg';
import landingPageImage3 from './assets/landingPageImage3.jpg';
import landingPageImage4 from './assets/landingPageImage4.jpg';

function LandingPage() {
    // Data for articles with image and text
    const articles = [
        { 
            id: 1,
            text: "Effortlessly manage bug records by adding titles, descriptions, and other crucial details. Our web app provides a centralized platform for developers to keep track of known bugs, ensuring your team has all the necessary information to tackle each issue effectively.",
            image: landingPageImage1
        },
        { 
            id: 2,
            text: "Harness the power of Groq, an advanced AI tool, to automatically determine the priority and importance of each bug. By focusing on the most critical issues first, your team can optimize the bug resolution process and enhance overall productivity.",
            image: landingPageImage2
        },
        { 
            id: 3,
            text: "Assign bugs to specific team members, ensuring accountability and effective teamwork. With built-in notifications, users stay informed of any updates or changes, keeping everyone aligned throughout the bug-fixing process.",
            image: landingPageImage3
        },
        { 
            id: 4,
            text: "Utilize our detailed commenting system on each bug entry to provide context, suggest solutions, or document progress. This collaborative environment ensures all relevant information is easily accessible, helping developers make informed decisions.",
            image: landingPageImage4
        },
    ];

    return (
        <div className="landing-page">
            <NavBar /> {/* Assuming NavBar component handles navigation */}
            <div className="article-container">
                {articles.map(article => (
                    <ArticleLayout
                        key={article.id}
                        image={article.image}
                        text={article.text}
                    />
                ))}
            </div>
            <Footer/>
        </div>
    );
}

export default LandingPage;
