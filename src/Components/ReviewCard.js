import React from 'react';

function ReviewCard(props) {
  return (
    <div style={{ border: '1px solid gray', padding: '1rem', marginBottom: '1rem' }}>
      <h3>{props.title}</h3>
      <p>{props.content}</p>
      <p><strong>By:</strong> {props.user}</p>
    </div>
  );
}

export default ReviewCard;
