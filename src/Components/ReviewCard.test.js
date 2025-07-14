import { render, screen, fireEvent } from '@testing-library/react';
import ReviewCard from './ReviewCard';
import '@testing-library/jest-dom';

test('flags a review when "Flag" is clicked', () => {
  render(
    <ReviewCard
      title="Fake Review"
      content="This is fake."
      user="JohnDoe"
    />
  );

  // Check that "Flag" button is visible
  expect(screen.getByText('Flag')).toBeInTheDocument();

  // Click it
  fireEvent.click(screen.getByText('Flag'));

  // Check that it's flagged
  expect(screen.getByText('Flagged as inappropriate')).toBeInTheDocument();
});

