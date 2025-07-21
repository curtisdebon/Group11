import React, { useState, useContext } from 'react';
import ReviewCard from '../Components/ReviewCard';
import CompanyResponsePanel from '../Components/CompanyResponsePanel';
import { useUser } from '../Components/UserContext';

function HomePage() {
  const { currentUser: user } = useUser(); // get current user

  const [reviews, setReviews] = useState([
    {
      id: 1,
      title: "Excellent Service",
      content: "Staff was quick to respond, great service.",
      user: "Ruben",
      replies: [
        { id: 1, user: "Company A", content: "Thank you for your feedback!" }
      ]
    },
    {
      id: 2,
      title: "Not What I Expected",
      content: "Actual product did not match the description",
      user: "Anthony",
      replies: []
    }
  ]);

  // Handle individual replies
  const handleReplySubmit = (reviewId, replyContent) => {
    const newReply = {
      id: Date.now(),
      user: user?.name || "Company B", // dynamic fallback
      content: replyContent
    };

    setReviews(prev =>
      prev.map(review =>
        review.id === reviewId
          ? { ...review, replies: [...review.replies, newReply] }
          : review
      )
    );
  };

  // Handle Company Panel responses
  const handleCompanyResponse = (reviewId, responseText) => {
    const newResponse = {
      id: Date.now(),
      user: user?.name || "Company", // dynamic fallback
      content: responseText
    };

    setReviews(prev =>
      prev.map(review =>
        review.id === reviewId
          ? { ...review, replies: [...review.replies, newResponse] }
          : review
      )
    );
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome to the Review System</h1>

      {reviews.map((review) => (
  <div className="review-container" key={review.id}>
    <ReviewCard
      id={review.id}
      title={review.title}
      content={review.content}
      user={review.user}
      replies={review.replies}
      onReplySubmit={handleReplySubmit}
      onCompanyResponse={handleCompanyResponse}
      currentUser={user}
    />
  </div>
))}

      {/*    Company Panel*/}
      {user?.role === 'company' && (
        <div style={{ marginTop: '2rem', borderTop: '1px solid #ccc', paddingTop: '1rem' }}>
          <h2>Company Response Panel</h2>
          {reviews.map((review) => (
            <CompanyResponsePanel
              key={`panel-${review.id}`}
              review={review}
              onSubmit={(responseText) => handleCompanyResponse(review.id, responseText)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;
