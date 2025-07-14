import React, { useState } from 'react';

function ModeratorPanel() {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      title: 'Fake Review',
      content: 'This is fake.',
      user: 'Adam Parker',
      flagged: true,
      approved: false
    }
  ]);

  const approveFlag = (id) => {
    setReviews((prevReviews) =>
      prevReviews.map((r) =>
        r.id === id ? { ...r, approved: true } : r
      )
    );
  };

  return (
    <div>
      <h2>Flagged Reviews</h2>
      {reviews.map((review) =>
        review.flagged && !review.approved ? (
          <div key={review.id}>
            <h3>{review.title}</h3>
            <p>{review.content}</p>
            <p><strong>By:</strong> {review.user}</p>
            <button onClick={() => approveFlag(review.id)}>Approve Flag</button>
          </div>
        ) : review.flagged && review.approved ? (
          <p key={review.id}>Flag Approved ✅</p>
        ) : null
      )}
    </div>
  );
}

export default ModeratorPanel;
