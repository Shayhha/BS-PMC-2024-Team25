// src/LandingPage.jsx
import React from 'react';
import './LandingPage.css';
import ArticleLayout from './ArticleLayout';
import NavBar from './NavBar';
import Footer from './Footer';

// Import images
import coderImage from './assets/coder.png'; // Adjust the path as needed

function LandingPage() {
    // Data for articles with image and text
    const articles = [
        { id: 1, image: coderImage, text: 'The Coder component is designed to provide an interactive interface for managing and viewing bugs within a software project. It integrates various functionalities to enhance the user experience for coders..' },
        { id: 2, image: coderImage, text: 'Second article description here.' },
        { id: 3, image: coderImage, text: 'Third article description here.' },
        { id: 4, image: coderImage, text: 'Fourth article description here.' },
        { id: 5, image: coderImage, text: 'Fifth article description here.' },
        { id: 6, image: coderImage, text: 'Sixth article description here.' },
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
