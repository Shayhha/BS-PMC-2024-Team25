// src/ArticleLayout.jsx
import React from 'react';
import './ArticleLayout.css'; // Ensure you have this CSS file for styling

function ArticleLayout({ image, text }) {
  return (
    <div className="Article_Layout_container">
      <main className="Article_Layout_main-content">
        <div className="Article_Layout_code-image">
          <img src={image} alt="Article" />
        </div>
        <div className="Article_Layout_description">
          <p>{text}</p>
        </div>
      </main>
    </div>
  );
}

export default ArticleLayout;
