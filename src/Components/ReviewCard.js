import React, { useState } from 'react';

function ReviewCard(props) {
  const [flagged, setFlagged] = useState(false);

  const handleFlag = () => {
    setFlagged(true);
  };

  return (
    <div>
      <h3>{props.title}</h3>
      <p>{props.content}</p>
      <p><strong>By:</strong> {props.user}</p>
      {!flagged ? (
        <button onClick={handleFlag}>Flag</button>
      ) : (
        <p>Flagged as inappropriate</p>
      )}
    </div>
  );
}

export default ReviewCard;
