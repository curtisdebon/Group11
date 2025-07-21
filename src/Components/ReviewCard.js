import React, { useState } from 'react';
import './ReviewCard.css';

function ReviewCard(props) {
  const [flagged, setFlagged] = useState(false);
  const [reply, setReply] = useState('');
  const [replies, setReplies] = useState(props.replies || []); // initial replies

  const handleFlag = () => {
    setFlagged(true);
  };

  const handleReplySubmit = (e) => {
  e.preventDefault();
  if (!reply.trim()) return;

  const newReply = {
    id: Date.now(),
    user: "Company", // replace with role/user if available
    content: reply
  };

  // Local update for immediate UI feedback
  setReplies([...replies, newReply]);

  
  if (props.onReplySubmit) {
    props.onReplySubmit(props.id, reply); 
  }

  setReply('');
};

  return (
  <div className="review-card">
    <h3>{props.title}</h3>
    <p>{props.content}</p>
    <p><strong>By:</strong> {props.user}</p>

    {!flagged ? (
      <button onClick={handleFlag}>Flag</button>
    ) : (
      <p>Flagged as inappropriate</p>
    )}

    {/* Replies Section */}
    {replies.length > 0 && (
      <section className="replies">
        <h4>Replies:</h4>
        {replies.map((r) => (
          <div key={r.id} className="reply">
            <strong>{r.user}:</strong> {r.content}
          </div>
        ))}
      </section>
    )}

    {/* Reply Form */}
    <form onSubmit={handleReplySubmit}>
      <div className="reply-form">
        <input
          type="text"
          placeholder="Write a reply..."
          value={reply}
          onChange={(e) => setReply(e.target.value)}
        />
        <button type="submit">Reply</button>
      </div>
    </form>
  </div>
);
}

export default ReviewCard;
