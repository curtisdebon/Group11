import React, { useState } from 'react';

function ReviewForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [user, setUser] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, content, user });
    setTitle('');
    setContent('');
    setUser('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Submit a Review</h2>

      <input
        type="text"
        placeholder="Review title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        data-testid="title-input"
      />

      <textarea
        placeholder="Write your review..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        data-testid="content-input"
      />

      <input
        type="text"
        placeholder="Your name"
        value={user}
        onChange={(e) => setUser(e.target.value)}
        data-testid="user-input"
      />

      <button type="submit" data-testid="submit-button">
        Submit
      </button>
    </form>
  );
}

export default ReviewForm;
