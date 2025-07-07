import React from 'react';
import ReviewCard from '../Components/ReviewCard';

function HomePage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome to the Review System</h1>

      <ReviewCard 
        title="Excellent Service" 
        content="Staff was quick to respond, great service" 
        user="Ruben" 
      />

      <ReviewCard 
        title="Not What I Expected" 
        content="Actual product did not match the description" 
        user="Annie" 
      />
    </div>
  );
}

export default HomePage;
