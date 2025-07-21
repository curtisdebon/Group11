import React from 'react';
import ReviewCard from './ReviewCard'; 
import { useUser } from './UserContext'; 




function ProfilePage() {
  const { currentUser } = useUser(); 
  console.log("Current user from context:", currentUser);

  const allReviews = [
    {
      id: 1,
      title: 'Excellent Service',
      content: 'Staff was quick to respond, great service',
      user: 'Ruben',
      replies: [
        { id: 1, user: 'Company A', content: 'Thank you for your feedback!' },
      ],
    },
    {
      id: 2,
      title: 'Late Delivery',
      content: 'It arrived 3 days late.',
      user: 'Gerald',
      replies: [],
    },
    {
      id: 3,
      title: 'Not What I Expected',
      content: 'Did not match the listing.',
      user: 'Pete',
      replies: [],
    },
  ];

  // Filter reviews created by current user
  const userReviews = allReviews.filter(
    (review) => review.user === currentUser?.name
  );

  if (!currentUser) {
    return <p style={{ padding: '2rem' }}>Please log in to view your profile.</p>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>{currentUser.name}'s Profile</h1>
      <p><strong>Email:</strong> {currentUser.email}</p>

      <h2>Your Reviews</h2>
      {userReviews.length > 0 ? (
        userReviews.map((review) => (
          <ReviewCard
            key={review.id}
            id={review.id}
            title={review.title}
            content={review.content}
            user={review.user}
            replies={review.replies}
            onReplySubmit={() => {}}
          />
        ))
      ) : (
        <p>No reviews yet.</p>
      )}
    </div>
  );
}

export default ProfilePage;
