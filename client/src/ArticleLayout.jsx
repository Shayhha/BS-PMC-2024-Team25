// src/ArticleLayout.js
import React from 'react';
import './ArticleLayout.css'; // Assuming you will style it separately

function ArticleLayout() {
  return (
        <div className="Article_Layout_container">
            <main className="Article_Layout_main-content">
                <div className="Article_Layout_code-image">
                    <img src="https://via.placeholder.com/450x350" alt="Code Snippet" />
                </div>
                <div className="Article_Layout_description">
                    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Reprehenderit repellat tenetur eos a tempora velit ipsa dolore error nihil, blanditiis debitis expedita repudiandae praesentium! Mollitia aut fuga laborum repudiandae enim.</p>
                </div>
            </main>
        </div>
  );
};

export default ArticleLayout;
