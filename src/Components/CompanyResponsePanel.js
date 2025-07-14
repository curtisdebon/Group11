import React, { useState } from 'react';

function CompanyResponsePanel({ review }) {
  const [response, setResponse] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (response.trim()) {
      // Mock save
      setSubmitted(true);
    }
  };

  return (
    <div>
      <h3>{review.title}</h3>
      <p>{review.content}</p>
      <p><strong>By:</strong> {review.user}</p>

      {!submitted ? (
        <>
          <textarea
            placeholder="Write your response..."
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            data-testid="response-input"
          />
          <button onClick={handleSubmit}>Submit</button>
        </>
      ) : (
        <p data-testid="confirmation">Response saved successfully. Status: Active.</p>
      )}
    </div>
  );
}

export default CompanyResponsePanel;
