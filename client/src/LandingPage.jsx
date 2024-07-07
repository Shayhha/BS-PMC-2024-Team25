import React, { useState } from 'react';
import './LandingPage.css';
import ArticleLayout from './ArticleLayout';
import NavBar from './NavBar';
import Footer from './Footer';

function LandingPage() {
    // Dummy data for articles, you can replace with actual data
    const articles = [
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 },
        { id: 6 },
        // Add more articles as needed
    ];

    return (
        <div className="landing-page">
            <NavBar /> {/* Assuming NavBar component handles navigation */}
            <div className="article-container">
                {articles.map(article => (
                    <ArticleLayout key={article.id} />
                ))}
            </div>
            <Footer/>
        </div>
    );
}

export default LandingPage