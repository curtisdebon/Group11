import React, { useState } from 'react';
import { useUser } from './UserContext';

function ModeratorPanel() {
  const { currentUser } = useUser();

  const [reviews, setReviews] = useState([
    {
      id: 1,
      title: 'Fake Review',
      content: 'This is fake.',
      user: 'FakeGuy',
      flagged: true,
      approved: false,
      replies: [
        {
          id: 1,
          user: 'Company A',
          content: 'Noted.',
          flagged: true,
        },
        {
          id: 2,
          user: 'Company A',
          content: 'Thanks!',
          flagged: false,
        },
      ],
    },
    {
      id: 2,
      title: 'Spam Review',
      content: 'Buy cheap products now!',
      user: 'SPAM USER',
      flagged: true,
      approved: false,
      replies: [
        {
          id: 3,
          user: 'Company B',
          content: 'We will check this.',
          flagged: true,
        },
      ],
    },
  ]);

  if (!currentUser || currentUser.role !== 'moderator') {
    return <p style={{ padding: '2rem' }}>Access denied. Moderator only.</p>;
  }

  const approveFlag = (id) => {
    setReviews((prevReviews) =>
      prevReviews.map((r) =>
        r.id === id ? { ...r, approved: true } : r
      )
    );
  };

  const rejectFlag = (id) => {
    setReviews((prevReviews) =>
      prevReviews.filter((r) => r.id !== id)
    );
  };

  const toggleReplyFlag = (reviewId, replyId) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              replies: review.replies.map((reply) =>
                reply.id === replyId
                  ? { ...reply, flagged: !reply.flagged }
                  : reply
              ),
            }
          : review
      )
    );
  };

  const buttonStyle = {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  };

  const approveStyle = {
    ...buttonStyle,
    backgroundColor: '#4CAF50',
    color: 'white'
  };

  const rejectStyle = {
    ...buttonStyle,
    backgroundColor: '#f44336',
    color: 'white',
    marginLeft: '1rem'
  };

  const unflagStyle = {
    ...buttonStyle,
    backgroundColor: '#ff9800',
    color: 'white',
    marginTop: '0.5rem'
  };

  return (
  <div
    style={{
      padding: '2rem',
      maxWidth: '800px',
      margin: '2rem auto',
      backgroundColor: '#2c2f3a', // Dark GPT-like background
      color: 'white',             // Text color to white
      borderRadius: '8px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px'
    }}
  >
    <h2 style={{ borderBottom: '2px solid #444', paddingBottom: '0.5rem' }}>
      Flagged Reviews
    </h2>
    {reviews.map((review) =>
      review.flagged ? (
        <div
          key={review.id}
          style={{
            backgroundColor: '#3a3d4a', // Dark card
            color: 'white',
            padding: '1rem',
            marginBottom: '1.5rem',
            border: '1px solid #555',
            borderRadius: '6px'
          }}
        >
          <h3>{review.title}</h3>
          <p>{review.content}</p>
          <p>
            <strong>By:</strong> {review.user}
          </p>

          {review.approved ? (
            <p style={{ color: '#8BC34A' }}>Flag Approved</p>
          ) : (
            <>
              <button onClick={() => approveFlag(review.id)} style={approveStyle}>
                Approve Flag
              </button>
              <button
                onClick={() => rejectFlag(review.id)}
                style={rejectStyle}
              >
                Reject Flag
              </button>
            </>
          )}

          {review.replies?.some((reply) => reply.flagged) && (
            <div style={{ marginTop: '1rem' }}>
              <h4>Flagged Replies</h4>
              <ul style={{ paddingLeft: '1rem' }}>
                {review.replies
                  .filter((reply) => reply.flagged)
                  .map((reply) => (
                    <li key={reply.id} style={{ marginBottom: '0.5rem' }}>
                      <p>
                        <strong>{reply.user}:</strong> {reply.content}
                      </p>
                      <button
                        onClick={() => toggleReplyFlag(review.id, reply.id)}
                        style={unflagStyle}
                      >
                        Unflag Reply
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      ) : null
    )}
  </div>
);

}

export default ModeratorPanel;
